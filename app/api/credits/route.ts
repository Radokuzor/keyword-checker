import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "email required" }, { status: 400 });
  }

  const { data } = await supabase
    .from("user_credits")
    .select("credits, plan")
    .eq("email", email.toLowerCase().trim())
    .single();

  if (!data) {
    return NextResponse.json({ credits: 0, plan: null });
  }

  return NextResponse.json({ credits: data.credits, plan: data.plan });
}
