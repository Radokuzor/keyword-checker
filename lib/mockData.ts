import type { KeywordData } from "./types";

export const MOCK_DATA: KeywordData = {
  keyword: "content marketing strategy",
  difficulty: {
    score: 67,
    label: "Hard",
  },
  volume: {
    monthly: 22000,
    trend: "Growing",
  },
  intent: {
    type: "Informational",
    explanation:
      "People searching this want to learn how to build or improve a content marketing plan — they're in research mode, not yet ready to buy.",
  },
  cpc: {
    usd: 4.8,
  },
  cta: {
    advice:
      "Create a comprehensive, long-form guide (3,000+ words) that covers strategy templates, real examples, and a step-by-step framework. Build topical authority by publishing 8–12 supporting articles around sub-topics like content calendars, distribution channels, and ROI measurement. Earn backlinks by pitching your guide to marketing newsletters.",
    timeToRank: "5–9 months",
  },
  recommended: [
    "content marketing examples",
    "content marketing plan",
    "content strategy template",
    "B2B content marketing",
    "content marketing ROI",
  ],
};
