import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature") || "";

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    return NextResponse.json(
      { error: `Webhook Error: ${err instanceof Error ? err.message : "Unknown"}` },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const listingId = session.metadata?.listingId;
    const buyerId = session.metadata?.buyerId;
    const sellerId = session.metadata?.sellerId;
    const platformFeeUsd = parseFloat(session.metadata?.platformFeeUsd || "0");
    const sellerPayoutUsd = parseFloat(session.metadata?.sellerPayoutUsd || "0");

    if (!listingId || !buyerId || !sellerId) {
      return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
    }

    const supabase = await createClient();

    // Update listing to sold
    await supabase
      .from("listings")
      .update({ status: "sold" })
      .eq("id", listingId);

    // Create sales record with commission breakdown
   // Create sales record with commission breakdown
    try {
      await supabase
        .from("sales")
        .insert({
          listing_id: listingId,
          buyer_id: buyerId,
          seller_id: sellerId,
          amount_usd: (session.amount_total || 0) / 100,
          platform_fee_usd: platformFeeUsd,
          seller_payout_usd: sellerPayoutUsd,
          stripe_session_id: session.id,
        });
    } catch (err) {
      console.log("Sales table may not exist yet:", err);
    }

    console.log(`Sale recorded: ${listingId} | Platform: $${platformFeeUsd} | Seller: $${sellerPayoutUsd}`);

    return NextResponse.json({ received: true });
  }

  return NextResponse.json({ received: true });
}