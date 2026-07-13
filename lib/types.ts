export type IntentType =
  | "Informational"
  | "Commercial"
  | "Transactional"
  | "Navigational";

export type DifficultyLabel = "Easy" | "Medium" | "Hard" | "Very Hard";

export type VolumeTrend = "Growing" | "Stable" | "Declining";

export interface UrlData {
  url: string;
  traffic: {
    estimatedMonthly: number;
    estimatedValue: number;
  };
  rankingDistribution: {
    top3: number;
    top10: number;
    top20: number;
    beyond20: number;
    total: number;
  };
  authority: {
    domainRank: number;
    totalBacklinks: number;
    referringDomains: number;
  };
  competitors: Array<{
    domain: string;
    overlappingKeywords: number;
  }>;
  insights: {
    intentCluster: string;
    contentGap: string;
    topKeywords: string[];
  };
  cta: {
    advice: string;
    timeToRank: string;
  };
  relatedSites: string[];
  dataSource: "live" | "estimated";
}

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
