import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const ARTICLE_SYSTEM_PROMPT = `You are an expert SEO content writer. Write a comprehensive, well-structured SEO article based on the keyword and ranking strategy provided.

Requirements:
- 900–1200 words total
- One H1 title, multiple H2 sections, H3 sub-sections where appropriate
- Written in a helpful, authoritative, conversational tone
- Use the target keyword naturally throughout — in the title, intro, headings, and body
- Be specific and actionable, not generic filler content
- Include an intro paragraph and a conclusion

Return ONLY valid JSON — no markdown, no explanation, no code fences:
{
  "title": "<the H1 title>",
  "plain_text": "<full article as plain text — use '# Title', '## Heading', '### Subheading' format for structure>",
  "html": "<full article as semantic HTML — use h1, h2, h3, p, ul, li tags — no doctype, no html/body wrapper, content only>"
}`;

export async function POST(req: NextRequest) {
  try {
    const { keyword, advice, anonId, email } = await req.json();

    if (!keyword || typeof keyword !== "string") {
      return NextResponse.json({ error: "keyword is required" }, { status: 400 });
    }
    if (!advice || typeof advice !== "string") {
      return NextResponse.json({ error: "advice is required" }, { status: 400 });
    }

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      system: ARTICLE_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Target keyword: "${keyword.trim()}"\n\nRanking strategy to base the article on:\n${advice}\n\nWrite the full SEO article now.`,
        },
      ],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text : "";
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
    const parsed = JSON.parse(cleaned);

    const { data, error } = await supabase
      .from("articles")
      .insert({
        keyword: keyword.trim(),
        advice,
        plain_text: parsed.plain_text,
        html: parsed.html,
        anon_id: anonId && typeof anonId === "string" ? anonId : null,
        user_email: email && typeof email === "string" ? email.toLowerCase().trim() : null,
        status: "pending",
      })
      .select("id")
      .single();

    if (error) throw error;

    return NextResponse.json({
      id: data.id,
      keyword: keyword.trim(),
      title: parsed.title,
      plain_text: parsed.plain_text,
      html: parsed.html,
    });
  } catch (err) {
    console.error("[generate-article]", err);
    if (err instanceof SyntaxError) {
      return NextResponse.json({ error: "Failed to parse article response" }, { status: 502 });
    }
    return NextResponse.json({ error: "Failed to generate article. Please try again." }, { status: 500 });
  }
}
