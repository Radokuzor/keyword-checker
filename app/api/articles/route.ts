import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function PATCH(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }
    const { error } = await supabase
      .from("articles")
      .update({ status: "saved" })
      .eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[articles PATCH]", err);
    return NextResponse.json({ error: "Failed to update article." }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("articles")
    .select("id, keyword, plain_text, html, status, created_at")
    .eq("user_email", email.toLowerCase().trim())
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[articles GET]", error.message);
    return NextResponse.json({ error: "Failed to fetch articles." }, { status: 500 });
  }

  return NextResponse.json({ article: data ?? null });
}
