export type IntentType =
  | "Informational"
  | "Commercial"
  | "Transactional"
  | "Navigational";

export type DifficultyLabel = "Easy" | "Medium" | "Hard" | "Very Hard";

export type VolumeTrend = "Growing" | "Stable" | "Declining";

export interface KeywordData {
  keyword: string;
  difficulty: {
    score: number;
    label: DifficultyLabel;
  };
  volume: {
    monthly: number;
    trend: VolumeTrend;
  };
  intent: {
    type: IntentType;
    explanation: string;
  };
  cpc: {
    usd: number;
  };
  cta: {
    advice: string;
    timeToRank: string;
  };
  recommended: string[];
}
