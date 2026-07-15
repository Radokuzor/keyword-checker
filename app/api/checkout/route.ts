import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PLAN_CREDITS: Record<string, number> = {
  pro: 5000,
  unlimited: 999999,
  starter: 999999,
};

const PRICE_IDS: Record<string, string> = {
  starter: process.env.STRIPE_PRICE_STARTER!,
  pro: process.env.STRIPE_PRICE_PRO!,
  unlimited: process.env.STRIPE_PRICE_UNLIMITED!,
};

// POST /api/checkout — create a Stripe checkout session
export async function POST(req: NextRequest) {
  try {
    const { planId } = await req.json();

    if (!planId || !PRICE_IDS[planId]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{ price: PRICE_IDS[planId], quantity: 1 }],
      mode: "subscription",
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/`,
      // metadata on both session (for GET confirmation) and subscription (for renewal webhook)
      metadata: { planId, credits: String(PLAN_CREDITS[planId]) },
      subscription_data: { metadata: { planId, credits: String(PLAN_CREDITS[planId]) } },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[checkout]", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}

// GET /api/checkout?session_id=xxx — confirm session and return email + plan
export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 402 });
    }

    const email =
      session.customer_email ??
      session.customer_details?.email ??
      null;

    const planId = session.metadata?.planId ?? null;
    const credits = parseInt(session.metadata?.credits ?? "0", 10);

    return NextResponse.json({ email, planId, credits });
  } catch (err) {
    console.error("[checkout confirm]", err);
    return NextResponse.json({ error: "Failed to retrieve session" }, { status: 500 });
  }
}
