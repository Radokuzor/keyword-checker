// DataForSEO stubs for URL analytics.
// Each function returns null until live credentials + plan are confirmed.
// To activate: implement the fetch calls using the DataForSEO Labs API
// (ranked_keywords/live, competitors_domain/live) and Backlinks API (summary/live).

export interface DFSRankedKeywordsResult {
  estimatedMonthlyTraffic: number;
  estimatedTrafficValue: number;
  top3: number;
  top10: number;
  top20: number;
  beyond20: number;
  total: number;
  topKeywords: string[];
}

export interface DFSCompetitorsResult {
  competitors: Array<{ domain: string; overlappingKeywords: number }>;
}

export interface DFSBacklinksResult {
  domainRank: number;
  totalBacklinks: number;
  referringDomains: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function fetchRankedKeywords(_url: string): Promise<DFSRankedKeywordsResult | null> {
  // TODO: POST to dataforseo_labs/google/ranked_keywords/live
  // Aggregate item.estimated_paid_traffic + CTR map for traffic value.
  // Group items by rank_absolute into position buckets.
  return null;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function fetchCompetitors(_domain: string): Promise<DFSCompetitorsResult | null> {
  // TODO: POST to dataforseo_labs/google/competitors_domain/live
  // Map result items to { domain, intersections } pairs.
  return null;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function fetchBacklinks(_domain: string): Promise<DFSBacklinksResult | null> {
  // TODO: POST to backlinks/summary/live with rank_scale: "one_hundred"
  return null;
}
