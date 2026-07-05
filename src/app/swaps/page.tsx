import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Repeat, MessageCircle, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SwapsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Get all swap offers involving this user, ordered by newest first
  const { data: offers } = await supabase
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
    .or(
      `offerer_id.eq.${user.id},recipient_id.eq.${user.id}`
    )
    .order("created_at", { ascending: false });

  const activeOffers = (offers || []).filter((o) => !["declined", "cancelled"].includes(o.status));
  const isOfferer = (offerId: string) => offers?.find((o) => o.id === offerId)?.offerer_id === user.id;

  return (
    <main className="min-h-screen bg-ink pb-24">
      <header className="sticky top-0 z-20 flex items-center justify-between px-4 py-4 border-b border-white/10 bg-ink/90 backdrop-blur">
        <h1 className="text-xl font-display font-bold text-paper">Active Swaps</h1>
        <span className="inline-flex items-center gap-1 text-xs font-mono uppercase px-2 py-1 rounded bg-ink-soft text-brass">
          <Repeat size={12} /> {activeOffers.length}
        </span>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-4">
        {activeOffers.length === 0 ? (
          <div className="text-center py-12 text-paper-dim">
            <Repeat size={40} className="mx-auto mb-3 opacity-50" />
            <p className="font-body">No active swaps yet — browse the feed to make an offer.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeOffers.map((offer) => {
              const otherUser = offer.offerer_id === user.id ? offer.recipient_profile : offer.offerer_profile;
              const yourItem = offer.listings;
              const theirItem = offer.offered_listings;

              return (
                <Link
                  key={offer.id}
                  href={`/swaps/${offer.id}`}
                  className="block rounded-lg border border-white/10 bg-ink-soft p-4 hover:bg-ink-soft/80 active:scale-95 transition-all"
                >
                  <div className="flex items-start gap-4">
                    {/* Item thumbnails */}
                    <div className="flex gap-2">
                      {yourItem?.image_urls?.[0] && (
                        <img
                          src={yourItem.image_urls[0]}
                          alt={yourItem.title}
                          className="w-16 h-16 rounded object-cover"
                        />
                      )}
                      <div className="flex items-center justify-center text-paper-dim">
                        <Repeat size={20} />
                      </div>
                      {theirItem?.image_urls?.[0] && (
                        <img
                          src={theirItem.image_urls[0]}
                          alt={theirItem.title}
                          className="w-16 h-16 rounded object-cover"
                        />
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] uppercase tracking-widest text-stamp font-mono mb-1">
                        {offer.offerer_id === user.id ? "You offered" : `${otherUser?.display_name} offered`}
                      </p>
                      <h3 className="font-body font-bold text-paper text-sm mb-2">
                        {yourItem?.title} ↔️ {theirItem?.title || "TBD"}
                      </h3>

                      <div className="flex items-center justify-between text-xs text-paper-dim">
                        <span className="flex items-center gap-1">
                          <MessageCircle size={12} /> Chat
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-[10px] font-mono uppercase ${
                            offer.status === "pending"
                              ? "bg-brass/20 text-brass"
                              : "bg-swap/20 text-swap"
                          }`}
                        >
                          {offer.status}
                        </span>
                      </div>
                    </div>

                    <div className="text-paper-dim">
                      <Clock size={16} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}