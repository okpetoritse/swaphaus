import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { LogOut, Plus, Star, Repeat, Settings } from "lucide-react";
import Image from "next/image";

export const dynamic = "force-dynamic";

async function handleLogout() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/landing");
}

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: listings } = await supabase
    .from("listings")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: swaps } = await supabase
    .from("swap_offers")
    .select("status")
    .or(`offerer_id.eq.${user.id},recipient_id.eq.${user.id}`);

  const completedSwaps = (swaps || []).filter((s) => s.status === "completed").length;

  return (
    <main className="min-h-screen bg-ink pb-24">
      <header className="relative bg-gradient-to-b from-ink-soft to-ink border-b border-white/10">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              {profile?.avatar_url && (
                <Image
                  src={profile.avatar_url}
                  alt={profile.display_name || "User"}
                  width={56}
                  height={56}
                  className="w-14 h-14 rounded-full"
                />
              )}
              <div>
                <h1 className="font-display text-2xl font-bold text-paper">
                  {profile?.display_name || "User"}
                </h1>
                <p className="text-xs text-paper-dim mt-1 font-mono uppercase">
                  {profile?.city || "Location unknown"}
                </p>
              </div>
            </div>
            <form action={handleLogout}>
              <button
                type="submit"
                className="p-2 rounded-lg hover:bg-white/10 transition"
              >
                <LogOut size={18} className="text-paper-dim" />
              </button>
            </form>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-ink p-3 text-center">
              <p className="text-lg font-bold text-swap">
                {(listings || []).length}
              </p>
              <p className="text-[10px] uppercase tracking-widest text-paper-dim font-mono mt-1">
                Items
              </p>
            </div>
            <div className="rounded-lg bg-ink p-3 text-center">
              <p className="text-lg font-bold text-brass">
                {completedSwaps}
              </p>
              <p className="text-[10px] uppercase tracking-widest text-paper-dim font-mono mt-1">
                Trades
              </p>
            </div>
            <div className="rounded-lg bg-ink p-3 text-center">
              <p className="text-lg font-bold text-stamp flex items-center justify-center gap-1">
                <Star size={14} fill="currentColor" />
                {profile?.rating_avg || 5.0}
              </p>
              <p className="text-[10px] uppercase tracking-widest text-paper-dim font-mono mt-1">
                Rating
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-lg bg-swap/15 border border-swap/40 p-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-swap uppercase tracking-wide">
                Swap Credits
              </p>
              <p className="text-2xl font-bold text-swap mt-1">
                {profile?.swap_credits || 0}
              </p>
            </div>
            <Repeat size={24} className="text-swap opacity-30" />
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 mt-6 space-y-3">
        <Link
          href="/upload"
          className="flex items-center justify-center gap-2 w-full rounded-lg bg-paper text-ink py-3.5 font-bold active:scale-95 transition-transform"
        >
          <Plus size={18} /> Upload New Item
        </Link>

        <Link
  href="/bulk-upload"
  className="flex items-center justify-center gap-2 w-full rounded-lg border border-white/10 text-paper py-3.5 font-bold active:scale-95 transition-transform hover:bg-white/5"
>
  📦 Bulk Upload
</Link>
        <Link
          href="/settings"
          className="flex items-center justify-center gap-2 w-full rounded-lg border border-white/10 text-paper py-3.5 font-bold active:scale-95 transition-transform hover:bg-white/5"
        >
          <Settings size={18} /> Settings
        </Link>
      </div>

      <section className="max-w-2xl mx-auto px-4 mt-8">
        <h2 className="text-lg font-body font-bold text-paper mb-4">Your Closet</h2>

        {(listings || []).length === 0 ? (
          <p className="text-center text-paper-dim text-sm py-8">
            No listings yet — start by uploading an item.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {listings?.map((item) => (
              <button
                key={item.id}
                className="rounded-lg overflow-hidden border border-white/10 group hover:border-brass/40 transition"
              >
                {item.image_urls?.[0] && (
                  <div className="relative h-40">
                    <Image
                      src={item.image_urls[0]}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute top-2 right-2 px-2 py-1 rounded-sm text-[9px] font-mono uppercase font-bold bg-black/60 text-paper">
                      {item.mode === "swap" ? "Swap" : item.mode === "sale" ? "Sale" : "Both"}
                    </div>
                  </div>
                )}
                <div className="p-2 bg-ink-soft">
                  <p className="text-[10px] uppercase tracking-widest text-stamp font-mono">
                    {item.brand || "Unbranded"}
                  </p>
                  <p className="text-xs font-body font-bold text-paper line-clamp-2 mt-1">
                    {item.title}
                  </p>
                  {item.price_usd && (
                    <p className="text-[11px] font-bold text-paper mt-1">
                      ${item.price_usd}
                    </p>
                  )}
                </div>
              </button>
              
            ))}
          </div>
        )}
      </section>
    </main>
  );
}