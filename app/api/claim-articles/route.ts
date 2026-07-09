import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { anonId, email } = await req.json();

    if (!anonId || typeof anonId !== "string") {
      return NextResponse.json({ error: "anonId is required" }, { status: 400 });
    }
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "email is required" }, { status: 400 });
    }

    const { error, count } = await supabase
      .from("articles")
      .update({ user_email: email.toLowerCase().trim() })
      .eq("anon_id", anonId)
      .is("user_email", null);

    if (error) throw error;

    return NextResponse.json({ claimed: count ?? 0 });
  } catch (err) {
    console.error("[claim-articles]", err);
    return NextResponse.json({ error: "Failed to claim articles." }, { status: 500 });
  }
}
