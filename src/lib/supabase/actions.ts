"use server";

import { createClient } from "@/lib/supabase/server";

export async function createSwapOffer(
  listingId: string,
  offeredListingId: string | null,
  recipientId: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");
  if (user.id === recipientId) throw new Error("Cannot swap with yourself");

  const { data, error } = await supabase
    .from("swap_offers")
    .insert({
      listing_id: listingId,
      offered_listing_id: offeredListingId,
      offerer_id: user.id,
      recipient_id: recipientId,
      status: "pending",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function sendMessage(swapOfferId: string, content: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");
  if (!content.trim()) throw new Error("Message cannot be empty");

  const { data, error } = await supabase
    .from("messages")
    .insert({
      swap_offer_id: swapOfferId,
      sender_id: user.id,
      content: content.trim(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateOfferStatus(
  offerId: string,
  status: "accepted" | "declined" | "cancelled"
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data: offer } = await supabase
    .from("swap_offers")
    .select("offerer_id, recipient_id, listings!listing_id(title)")
    .eq("id", offerId)
    .single();

  if (!offer || (offer.offerer_id !== user.id && offer.recipient_id !== user.id)) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("swap_offers")
    .update({ status })
    .eq("id", offerId)
    .select()
    .single();

  if (error) throw error;

  // Send notification to the other user
  const otherUserId = user.id === offer.offerer_id ? offer.recipient_id : offer.offerer_id;
  const titles = {
    accepted: `Swap accepted! 🎉`,
    declined: `Swap declined`,
    cancelled: `Swap cancelled`,
  };

  await createNotification(
    otherUserId,
    status === "accepted" ? "offer_accepted" : "offer_declined",
    offerId,
    user.id,
    titles[status],
    status === "accepted"
      ? `They accepted your swap for ${offer.listings?.[0]?.title || "an item"}!`
      : `They declined your swap offer.`
  );

  return data;
}
export async function createNotification(
  userId: string,
  type: "offer_received" | "offer_accepted" | "offer_declined" | "swap_completed" | "rating_received",
  swapOfferId: string,
  actorId: string,
  title: string,
  message?: string
) {
  const supabase = await createClient();

  const { error } = await supabase.from("notifications").insert({
    user_id: userId,
    type,
    swap_offer_id: swapOfferId,
    actor_id: actorId,
    title,
    message,
  });

  if (error) throw error;
}

export async function markSwapAsCompleted(offerId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  // Get the swap offer
  const { data: offer } = await supabase
    .from("swap_offers")
    .select("listing_id, offered_listing_id")
    .eq("id", offerId)
    .single();

  if (!offer) throw new Error("Swap not found");

  // Mark both listings as swapped
  await supabase
    .from("listings")
    .update({ status: "swapped" })
    .in("id", [offer.listing_id, offer.offered_listing_id]);

  // Mark swap as completed
  const { error } = await supabase
    .from("swap_offers")
    .update({ status: "completed" })
    .eq("id", offerId);

  if (error) throw error;
}