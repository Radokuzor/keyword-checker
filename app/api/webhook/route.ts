import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("[webhook] signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.payment_status !== "paid") {
      return NextResponse.json({ received: true });
    }

    const email =
      session.customer_email ??
      session.customer_details?.email ??
      null;
    const planId = session.metadata?.planId;
    const credits = parseInt(session.metadata?.credits ?? "0", 10);

    if (!email || !planId || credits <= 0) {
      console.error("[webhook] missing email, planId, or credits in session", session.id);
      return NextResponse.json({ received: true });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Upsert: add credits if user already exists (stacked purchases), insert if new
    const { data: existing } = await supabase
      .from("user_credits")
      .select("credits")
      .eq("email", normalizedEmail)
      .single();

    const newCredits = existing ? existing.credits + credits : credits;

    await supabase.from("user_credits").upsert({
      email: normalizedEmail,
      credits: newCredits,
      plan: planId,
      updated_at: new Date().toISOString(),
    });
  }

  return NextResponse.json({ received: true });
}
