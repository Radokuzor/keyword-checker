import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { normalizeUrl } from "@/lib/isUrl";
import {
  fetchRankedKeywords,
  fetchCompetitors,
  fetchBacklinks,
} from "@/lib/dataforseo-url";
import type { UrlData } from "@/lib/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function extractJSON(text: string): string {
  return text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
}

// Full estimation prompt — used when DataForSEO data is unavailable
const FULL_ESTIMATE_PROMPT = `You are a senior SEO analyst. Given a URL, produce a realistic estimate of its organic search performance. Base your estimates on the domain's likely scale, niche, and content quality. A small blog post ranks very differently from a HubSpot pillar page.

Return ONLY valid JSON — no markdown, no explanation, no code fences. Match this exact shape:

{
  "url": "<the URL as provided>",
  "traffic": {
    "estimatedMonthly": <integer — realistic monthly organic visitors>,
    "estimatedValue": <integer — USD value of that traffic based on estimated CPC of ranking keywords>
  },
  "rankingDistribution": {
    "top3": <integer, keywords in positions 1–3>,
    "top10": <integer, keywords in positions 4–10>,
    "top20": <integer, keywords in positions 11–20>,
    "beyond20": <integer, keywords in positions 21–100>,
    "total": <sum of all four>
  },
  "authority": {
    "domainRank": <integer 0–100, realistic domain authority>,
    "totalBacklinks": <integer>,
    "referringDomains": <integer>
  },
  "competitors": [
    { "domain": "<competitor domain, no https://>", "overlappingKeywords": <integer> },
    { "domain": "<competitor domain>", "overlappingKeywords": <integer> },
    { "domain": "<competitor domain>", "overlappingKeywords": <integer> }
  ],
  "insights": {
    "intentCluster": "<2–3 sentences: what type of user is landing here and what are they really trying to accomplish? Be specific to this URL, not generic.>",
    "contentGap": "<2–3 sentences: the single biggest ranking opportunity — a near-miss keyword or topic gap that a targeted addition could push into the top 5. Be specific.>",
    "topKeywords": [<8–10 strings: the most likely keywords this URL ranks for, ordered by estimated traffic>]
  },
  "cta": {
    "advice": "<3–5 sentences: specific, actionable strategy to improve this page's rankings — content to add, structural change, backlink tactic, one fast win. Tie it to the specific URL.>",
    "timeToRank": "<realistic range like '2–4 months' or '6–12 months'>"
  },
  "relatedSites": [<5 competitor or related domain strings, no https://, just domain.com>],
  "dataSource": "estimated"
}`;

// Partial prompt — used when we have some real DataForSEO data; Claude fills in insights
const INSIGHTS_ONLY_PROMPT = `You are an SEO strategist. You have real data for a URL. Your job is to generate strategic insights and a ranking plan.

Return ONLY valid JSON — no markdown, no explanation, no code fences:

{
  "insights": {
    "intentCluster": "<2–3 sentences: what type of user is landing here and what are they really trying to accomplish? Be specific to the URL and keywords provided.>",
    "contentGap": "<2–3 sentences: the single biggest ranking opportunity based on the keyword list — a near-miss or topic gap that a targeted addition could push into the top 5. Be specific.>",
    "topKeywords": [<8–10 strings from the provided keywords, ordered by estimated traffic contribution>]
  },
  "cta": {
    "advice": "<3–5 sentences: specific, actionable strategy to improve this page's rankings — content to add, structural change, backlink tactic, one fast win.>",
    "timeToRank": "<realistic range like '2–4 months' or '6–12 months'>"
  },
  "relatedSites": [<5 competitor or related domain strings, no https://, just domain.com>]
}`;

export async function POST(req: NextRequest) {
  try {
    const { url, email, anonId } = await req.json();

    if (!url || typeof url !== "string" || url.trim().length === 0) {
      return NextResponse.json({ error: "url is required" }, { status: 400 });
    }

    const normalizedUrl = normalizeUrl(url.trim());
    const domain = new URL(normalizedUrl).hostname.replace(/^www\./, "");

    // Log non-blocking
    supabase
      .from("search_logs")
      .insert({
        email: email && typeof email === "string" ? email.toLowerCase().trim() : null,
        anon_id: !email && anonId && typeof anonId === "string" ? anonId : null,
        keyword: normalizedUrl,
      })
      .then(({ error }) => {
        if (error) console.error("[search_logs]", error.message);
      });

    // Try all DataForSEO calls in parallel — each returns null on failure
    const [dfsRanked, dfsCompetitors, dfsBacklinks] = await Promise.all([
      fetchRankedKeywords(normalizedUrl),
      fetchCompetitors(domain),
      fetchBacklinks(domain),
    ]);

    const hasLiveData = dfsRanked !== null || dfsCompetitors !== null || dfsBacklinks !== null;

    let finalData: UrlData;

    if (!hasLiveData) {
      // Full Claude estimation path
      const message = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        system: FULL_ESTIMATE_PROMPT,
        messages: [{ role: "user", content: `Analyze this URL: ${normalizedUrl}` }],
      });

      const raw = message.content[0].type === "text" ? message.content[0].text : "";
      finalData = JSON.parse(extractJSON(raw));
    } else {
      // Partial live data path — Claude fills in insights, we overlay real numbers
      const contextLines: string[] = [`URL: ${normalizedUrl}`];
      if (dfsRanked) {
        contextLines.push(`Top keywords: ${dfsRanked.topKeywords.join(", ")}`);
        contextLines.push(`Total ranking keywords: ${dfsRanked.total}`);
      }
      if (dfsCompetitors) {
        contextLines.push(
          `Competing domains: ${dfsCompetitors.competitors.map((c) => c.domain).join(", ")}`
        );
      }

      const message = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 768,
        system: INSIGHTS_ONLY_PROMPT,
        messages: [{ role: "user", content: contextLines.join("\n") }],
      });

      const raw = message.content[0].type === "text" ? message.content[0].text : "";
      const aiPart = JSON.parse(extractJSON(raw));

      finalData = {
        url: normalizedUrl,
        traffic: dfsRanked
          ? { estimatedMonthly: dfsRanked.estimatedMonthlyTraffic, estimatedValue: dfsRanked.estimatedTrafficValue }
          : { estimatedMonthly: 0, estimatedValue: 0 },
        rankingDistribution: dfsRanked
          ? { top3: dfsRanked.top3, top10: dfsRanked.top10, top20: dfsRanked.top20, beyond20: dfsRanked.beyond20, total: dfsRanked.total }
          : { top3: 0, top10: 0, top20: 0, beyond20: 0, total: 0 },
        authority: dfsBacklinks
          ? { domainRank: dfsBacklinks.domainRank, totalBacklinks: dfsBacklinks.totalBacklinks, referringDomains: dfsBacklinks.referringDomains }
          : { domainRank: 0, totalBacklinks: 0, referringDomains: 0 },
        competitors: dfsCompetitors?.competitors ?? [],
        insights: aiPart.insights,
        cta: aiPart.cta,
        relatedSites: aiPart.relatedSites ?? [],
        dataSource: "live",
      };
    }

    return NextResponse.json(finalData);
  } catch (err) {
    console.error("[analyze-url]", err);

    if (err instanceof SyntaxError) {
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 502 });
    }

    return NextResponse.json({ error: "Analysis failed. Please try again." }, { status: 500 });
  }
}
