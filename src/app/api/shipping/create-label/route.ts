import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { offerId } = await request.json();

    if (!offerId) {
      return NextResponse.json(
        { error: "Missing offerId" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the offer — don't select email, it's not in profiles table
    const { data: offer, error: offerError } = await supabase
      .from("swap_offers")
      .select(
        `
        id,
        status,
        offerer_id,
        recipient_id,
        listing_id,
        offered_listing_id,
        listings!listing_id(id, title),
        offered_listings:offered_listing_id(id, title),
        offerer:offerer_id(display_name, avatar_url),
        recipient:recipient_id(display_name, avatar_url)
      `
      )
      .eq("id", offerId)
      .single();

    if (offerError || !offer) {
      console.error("Offer fetch error:", offerError);
      return NextResponse.json(
        { error: "Offer not found" },
        { status: 404 }
      );
    }

    if (offer.status !== "accepted") {
      return NextResponse.json(
        { error: "Offer must be accepted first" },
        { status: 400 }
      );
    }

    const SHIPPO_API_KEY = process.env.SHIPPO_API_KEY;
    if (!SHIPPO_API_KEY) {
      return NextResponse.json(
        { error: "Shippo API key not configured" },
        { status: 500 }
      );
    }

    // Create shipment with placeholder emails (users would enter real address in profile later)
    const shipmentRes = await fetch("https://api.goshippo.com/shipments/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `ShippoToken ${SHIPPO_API_KEY}`,
      },
      body: JSON.stringify({
        address_from: {
          name: offer.offerer?.[0]?.display_name || "Sender",
          street1: "123 Main St",
          city: "San Francisco",
          state: "CA",
          zip: "94102",
          country: "US",
          email: "sender@swaphaus.com",
          phone: "+14155552671",
        },
        address_to: {
          name: offer.recipient?.[0]?.display_name || "Recipient",
          street1: "456 Oak Ave",
          city: "New York",
          state: "NY",
          zip: "10001",
          country: "US",
          email: "recipient@swaphaus.com",
          phone: "+14155552671",
        },
        parcels: [
          {
            length: "10",
            width: "10",
            height: "10",
            distance_unit: "in",
            weight: "1",
            mass_unit: "lb",
          },
        ],
      }),
    });

    if (!shipmentRes.ok) {
      const error = await shipmentRes.text();
      console.error("Shippo shipment error:", error);
      return NextResponse.json(
        { error: "Failed to create shipment with Shippo" },
        { status: shipmentRes.status }
      );
    }

    const shipment = await shipmentRes.json();

    // Get rates
    const ratesRes = await fetch(
      `https://api.goshippo.com/shipments/${shipment.object_id}/rates/`,
      {
        headers: {
          Authorization: `ShippoToken ${SHIPPO_API_KEY}`,
        },
      }
    );

    if (!ratesRes.ok) {
      return NextResponse.json(
        { error: "Failed to get shipping rates" },
        { status: 500 }
      );
    }

    const ratesData = await ratesRes.json();
    const rates = ratesData.results || [];

    if (rates.length === 0) {
      return NextResponse.json(
        { error: "No shipping rates available for this address" },
        { status: 400 }
      );
    }

    const selectedRate = rates.find((r: any) => r.provider === "USPS") || rates[0];

    // Create transaction
    const txRes = await fetch("https://api.goshippo.com/transactions/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `ShippoToken ${SHIPPO_API_KEY}`,
      },
      body: JSON.stringify({
        rate: selectedRate.object_id,
        label_file_type: "PDF",
      }),
    });

    if (!txRes.ok) {
      const error = await txRes.text();
      console.error("Shippo transaction error:", error);
      return NextResponse.json(
        { error: "Failed to create shipping label" },
        { status: txRes.status }
      );
    }

    const transaction = await txRes.json();

    // Save to database
    const { error: updateError } = await supabase
      .from("swap_offers")
      .update({
        shippo_transaction_id: transaction.object_id,
        shippo_label_url: transaction.label_download?.href,
        shippo_tracking_number: transaction.tracking_number,
      })
      .eq("id", offerId);

    if (updateError) {
      console.error("Database update error:", updateError);
      return NextResponse.json(
        { error: "Failed to save label info" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      transactionId: transaction.object_id,
      labelUrl: transaction.label_download?.href || null,
      trackingNumber: transaction.tracking_number || transaction.object_id,
      carrier: transaction.provider,
      cost: transaction.rate_details?.amount,
      testMode: !transaction.label_download,
    });
  } catch (error) {
    console.error("Shipping label error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}