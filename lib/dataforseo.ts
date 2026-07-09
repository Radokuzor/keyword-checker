import type { DifficultyLabel, VolumeTrend } from "./types";

export interface DataForSEOResult {
  keyword: string;
  difficultyScore: number;
  difficultyLabel: DifficultyLabel;
  monthlyVolume: number;
  trend: VolumeTrend;
  cpcUsd: number;
}

function deriveDifficultyLabel(score: number): DifficultyLabel {
  if (score < 35) return "Easy";
  if (score < 60) return "Medium";
  if (score < 80) return "Hard";
  return "Very Hard";
}

function deriveTrend(
  monthly: Array<{ year: number; month: number; search_volume: number }>
): VolumeTrend {
  if (monthly.length < 6) return "Stable";
  const sorted = [...monthly].sort((a, b) =>
    a.year !== b.year ? a.year - b.year : a.month - b.month
  );
  const avg = (arr: typeof sorted) =>
    arr.reduce((s, m) => s + m.search_volume, 0) / arr.length;
  const last3 = avg(sorted.slice(-3));
  const prev3 = avg(sorted.slice(-6, -3));
  if (prev3 === 0) return "Stable";
  const change = (last3 - prev3) / prev3;
  if (change > 0.1) return "Growing";
  if (change < -0.1) return "Declining";
  return "Stable";
}

export async function fetchDataForSEO(
  keyword: string
): Promise<DataForSEOResult | null> {
  const login = process.env.DATAFORSEO_LOGIN;
  const password = process.env.DATAFORSEO_PASSWORD;
  if (!login || !password) return null;

  const auth = Buffer.from(`${login}:${password}`).toString("base64");
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Basic ${auth}`,
  };
  const body = JSON.stringify([
    { keywords: [keyword], location_code: 2840, language_code: "en" },
  ]);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const volumeRes = await fetch(
      "https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live",
      { method: "POST", headers, body, signal: controller.signal }
    );
    clearTimeout(timeout);

    if (!volumeRes.ok) return null;

    const volumeJson = await volumeRes.json();
    const item = volumeJson?.tasks?.[0]?.result?.[0];
    if (!item) return null;

    console.log("[dataforseo] raw item:", JSON.stringify(item, null, 2));

    const difficultyScore = Math.min(
      100,
      Math.max(0, Math.round(item.competition_index ?? 50))
    );

    return {
      keyword: item.keyword ?? keyword,
      difficultyScore,
      difficultyLabel: deriveDifficultyLabel(difficultyScore),
      monthlyVolume: item.search_volume ?? 0,
      trend: deriveTrend(item.monthly_searches ?? []),
      cpcUsd: Math.round((item.cpc ?? 0) * 100) / 100,
    };
  } catch (err) {
    console.error("[dataforseo]", err);
    return null;
  }
}
