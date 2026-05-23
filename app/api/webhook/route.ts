import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PLAN_CREDITS: Record<string, number> = {
  starter: 500,
  pro: 5000,
  unlimited: 999999,
};

async function upsertCredits(email: string, planId: string, credits: number) {
  const normalizedEmail = email.toLowerCase().trim();
  await supabase.from("user_credits").upsert({
    email: normalizedEmail,
    credits,
    plan: planId,
    daily_used: 0,
    daily_reset_date: new Date().toISOString().slice(0, 10),
    updated_at: new Date().toISOString(),
  });
}

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

  // Initial subscription purchase
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.payment_status !== "paid") {
      return NextResponse.json({ received: true });
    }

    const email = session.customer_email ?? session.customer_details?.email ?? null;
    const planId = session.metadata?.planId;
    const credits = parseInt(session.metadata?.credits ?? "0", 10);

    if (!email || !planId || credits <= 0) {
      console.error("[webhook] missing email, planId, or credits in session", session.id);
      return NextResponse.json({ received: true });
    }

    await upsertCredits(email, planId, credits);
  }

  // Monthly renewal — reset credits to full allowance for the plan
  if (event.type === "invoice.payment_succeeded") {
    const invoice = event.data.object as Stripe.Invoice;

    // Skip the first invoice (already handled by checkout.session.completed)
    if ((invoice as any).billing_reason === "subscription_create") {
      return NextResponse.json({ received: true });
    }

    const subscriptionId = typeof invoice.subscription === "string"
      ? invoice.subscription
      : invoice.subscription?.id;

    if (!subscriptionId) return NextResponse.json({ received: true });

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const planId = subscription.metadata?.planId;
    const email = typeof invoice.customer_email === "string"
      ? invoice.customer_email
      : null;

    if (!email || !planId || !PLAN_CREDITS[planId]) {
      console.error("[webhook] renewal missing data", invoice.id);
      return NextResponse.json({ received: true });
    }

    await upsertCredits(email, planId, PLAN_CREDITS[planId]);
  }

  return NextResponse.json({ received: true });
}
