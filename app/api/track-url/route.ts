import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { url, email } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "url is required" }, { status: 400 });
    }
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "email is required" }, { status: 401 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedUrl = url.trim();

    const { error } = await supabase.from("tracked_urls").insert({
      email: normalizedEmail,
      url: normalizedUrl,
    });

    // Unique constraint violation — already tracked
    if (error?.code === "23505") {
      return NextResponse.json({ tracked: true, alreadyTracked: true });
    }

    if (error) {
      console.error("[track-url]", error.message);
      return NextResponse.json({ error: "Failed to track URL" }, { status: 500 });
    }

    return NextResponse.json({ tracked: true });
  } catch (err) {
    console.error("[track-url]", err);
    return NextResponse.json({ error: "Failed to track URL" }, { status: 500 });
  }
}
