import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

const PLATFORM_COMMISSION_RATE = 0.1;

export async function POST(request: NextRequest) {
  try {
    const { listingId } = await request.json();

    if (!listingId) {
      return NextResponse.json(
        { error: "Missing listingId" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: listing } = await supabase
      .from("listings")
      .select("*, profiles!user_id(display_name)")
      .eq("id", listingId)
      .single();

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (!listing.price_usd) {
      return NextResponse.json(
        { error: "Item not for sale" },
        { status: 400 }
      );
    }

    if (listing.user_id === user.id) {
      return NextResponse.json(
        { error: "Cannot buy your own item" },
        { status: 400 }
      );
    }

    const amountUsd = listing.price_usd;
    const platformFeeUsd = amountUsd * PLATFORM_COMMISSION_RATE;
    const sellerPayoutUsd = amountUsd - platformFeeUsd;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: listing.title,
              description: `${listing.brand} - ${listing.size ? `Size ${listing.size}` : ""}`,
              images: listing.image_urls?.length ? [listing.image_urls[0]] : [],
            },
            unit_amount: Math.round(amountUsd * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/purchase-success?session_id={CHECKOUT_SESSION_ID}&listing_id=${listingId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/`,
      metadata: {
        listingId,
        buyerId: user.id,
        sellerId: listing.user_id,
        platformFeeUsd: platformFeeUsd.toString(),
        sellerPayoutUsd: sellerPayoutUsd.toString(),
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      checkoutUrl: session.url,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}