import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { fetchDataForSEO } from "@/lib/dataforseo";
import type { KeywordData } from "@/lib/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function extractJSON(text: string): string {
  return text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
}

// Fallback prompt — Claude estimates everything when DataForSEO is unavailable
const SYSTEM_PROMPT = `You are a keyword research expert. When given a keyword or URL, return a JSON object with accurate SEO data. Be realistic and data-driven. Your estimates should reflect actual search landscape conditions.

Return ONLY valid JSON — no markdown, no explanation, no code fences. The JSON must exactly match this shape:

{
  "keyword": "the cleaned keyword or primary keyword extracted from the URL",
  "difficulty": {
    "score": <integer 0-100>,
    "label": <"Easy" | "Medium" | "Hard" | "Very Hard">
  },
  "volume": {
    "monthly": <integer, realistic monthly search volume>,
    "trend": <"Growing" | "Stable" | "Declining">
  },
  "intent": {
    "type": <"Informational" | "Commercial" | "Transactional" | "Navigational">,
    "explanation": <1-2 sentence explanation of WHY this intent, written for a non-expert>
  },
  "cpc": {
    "usd": <number with 2 decimal places, realistic average CPC in USD>
  },
  "cta": {
    "advice": <3-5 sentence actionable plan: what type of content to create, how to structure it, what to do for backlinks, and any quick wins. Be specific, not generic.>,
    "timeToRank": <realistic estimate like "3–6 months" or "12–18 months">
  },
  "recommended": [<5 closely related keywords as strings, ordered by relevance>]
}

Difficulty label rules: 0-34 = Easy, 35-59 = Medium, 60-79 = Hard, 80-100 = Very Hard.`;

// Focused prompt — used when real DataForSEO data is available; Claude handles intent, cta, and recommended keywords
const ANALYSIS_PROMPT = `You are an SEO strategist. You will be given a keyword and its real search data.
Return ONLY valid JSON — no markdown, no explanation, no code fences:

{
  "intent": {
    "type": <"Informational" | "Commercial" | "Transactional" | "Navigational">,
    "explanation": <1-2 sentence plain-English explanation of WHY this intent, for a non-expert>
  },
  "cta": {
    "advice": <3-5 sentences: content type to create, how to structure it, backlink approach, one quick win — specific to this keyword, not generic>,
    "timeToRank": <based on difficulty: 0-34 → "1–3 months", 35-59 → "3–6 months", 60-79 → "6–12 months", 80-100 → "12–24 months">
  },
  "recommended": [<5 closely related keywords as strings, ordered by relevance>]
}

Rules: High CPC signals commercial/transactional intent. Be specific — the user wants real advice.`;

export async function POST(req: NextRequest) {
  try {
    const { keyword, email, anonId } = await req.json();

    if (!keyword || typeof keyword !== "string" || keyword.trim().length === 0) {
      return NextResponse.json({ error: "keyword is required" }, { status: 400 });
    }

    const trimmed = keyword.trim().slice(0, 200);

    // Log search non-blocking — never fails the request
    supabase
      .from("search_logs")
      .insert({
        email: email && typeof email === "string" ? email.toLowerCase().trim() : null,
        anon_id: !email && anonId && typeof anonId === "string" ? anonId : null,
        keyword: trimmed,
      })
      .then(({ error }) => {
        if (error) console.error("[search_logs]", error.message);
      });

    // Try DataForSEO first for real metrics
    const dfsResult = await fetchDataForSEO(trimmed);

    let finalData: KeywordData;

    if (dfsResult) {
      // Real data path — Claude only determines intent and writes the action plan
      const message = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 512,
        system: ANALYSIS_PROMPT,
        messages: [
          {
            role: "user",
            content: `Keyword: "${trimmed}"\nMonthly searches: ${dfsResult.monthlyVolume.toLocaleString()}\nDifficulty: ${dfsResult.difficultyScore}/100\nCPC: $${dfsResult.cpcUsd.toFixed(2)}\nTrend: ${dfsResult.trend}\n\nAnalyze intent and write a specific ranking plan.`,
          },
        ],
      });

      const raw = message.content[0].type === "text" ? message.content[0].text : "";
      const analysis = JSON.parse(extractJSON(raw));

      finalData = {
        keyword: dfsResult.keyword,
        difficulty: { score: dfsResult.difficultyScore, label: dfsResult.difficultyLabel },
        volume: { monthly: dfsResult.monthlyVolume, trend: dfsResult.trend },
        cpc: { usd: dfsResult.cpcUsd },
        intent: analysis.intent,
        cta: analysis.cta,
        recommended: analysis.recommended ?? [],
      };
    } else {
      // Fallback — Claude estimates everything (DataForSEO unavailable or failed)
      const message = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `Analyze this keyword: "${trimmed}"`,
          },
        ],
      });

      const raw = message.content[0].type === "text" ? message.content[0].text : "";
      finalData = JSON.parse(extractJSON(raw));
    }

    return NextResponse.json(finalData);
  } catch (err) {
    console.error("[analyze]", err);

    if (err instanceof SyntaxError) {
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 502 });
    }

    return NextResponse.json(
      { error: "Analysis failed. Please try again." },
      { status: 500 }
    );
  }
}
