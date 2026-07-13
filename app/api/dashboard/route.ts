import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "email required" }, { status: 400 });
  }

  const normalizedEmail = email.toLowerCase().trim();

  const [urlsResult, keywordsResult] = await Promise.all([
    supabase
      .from("tracked_urls")
      .select("url, created_at")
      .eq("email", normalizedEmail)
      .order("created_at", { ascending: false }),
    supabase
      .from("tracked_keywords")
      .select("keyword, created_at")
      .eq("email", normalizedEmail)
      .order("created_at", { ascending: false }),
  ]);

  return NextResponse.json({
    urls: urlsResult.data ?? [],
    keywords: keywordsResult.data ?? [],
  });
}
