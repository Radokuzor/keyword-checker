import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { keyword, email } = await req.json();

    if (!keyword || typeof keyword !== "string") {
      return NextResponse.json({ error: "keyword is required" }, { status: 400 });
    }
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "email is required" }, { status: 401 });
    }

    const { error } = await supabase.from("tracked_keywords").insert({
      email: email.toLowerCase().trim(),
      keyword: keyword.trim(),
    });

    // Unique constraint — already tracking
    if (error?.code === "23505") {
      return NextResponse.json({ tracked: true, alreadyTracked: true });
    }

    if (error) {
      console.error("[track-keyword]", error.message);
      return NextResponse.json({ error: "Failed to track keyword" }, { status: 500 });
    }

    return NextResponse.json({ tracked: true });
  } catch (err) {
    console.error("[track-keyword]", err);
    return NextResponse.json({ error: "Failed to track keyword" }, { status: 500 });
  }
}
