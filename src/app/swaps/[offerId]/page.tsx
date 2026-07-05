import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SwapThread from "@/components/SwapThread";

export const dynamic = "force-dynamic";

export default async function SwapDetailPage({
  params,
}: {
  params: Promise<{ offerId: string }>;
}) {
  const { offerId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: offer } = await supabase
    .from("swap_offers")
    .select(
      `
      *,
      listings!listing_id(id, title, image_urls, brand),
      offered_listings:offered_listing_id(id, title, image_urls, brand),
      offerer_profile:offerer_id(display_name, avatar_url),
      recipient_profile:recipient_id(display_name, avatar_url)
    `
    )
    .eq("id", offerId)
    .single();

  if (!offer) {
    redirect("/");
  }

  // Verify user is involved in this swap
  if (user.id !== offer.offerer_id && user.id !== offer.recipient_id) {
    redirect("/");
  }

  return (
    <main className="h-screen flex flex-col bg-ink">
      <SwapThread offer={offer} currentUserId={user.id} />
    </main>
  );
}