import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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

export async function POST(req: NextRequest) {
  try {
    const { keyword, email } = await req.json();

    if (!keyword || typeof keyword !== "string" || keyword.trim().length === 0) {
      return NextResponse.json({ error: "keyword is required" }, { status: 400 });
    }

    // Server-side credit check for paid users
    if (email && typeof email === "string") {
      const { data: user } = await supabase
        .from("user_credits")
        .select("credits")
        .eq("email", email.toLowerCase().trim())
        .single();

      if (!user || user.credits <= 0) {
        return NextResponse.json({ error: "No credits remaining" }, { status: 402 });
      }

      // Deduct 1 credit before running the analysis
      await supabase
        .from("user_credits")
        .update({ credits: user.credits - 1, updated_at: new Date().toISOString() })
        .eq("email", email.toLowerCase().trim());
    }

    const trimmed = keyword.trim().slice(0, 200);

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

    const data = JSON.parse(raw);

    return NextResponse.json(data);
  } catch (err) {
    console.error("[analyze]", err);

    if (err instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { error: "Analysis failed. Please try again." },
      { status: 500 }
    );
  }
}
