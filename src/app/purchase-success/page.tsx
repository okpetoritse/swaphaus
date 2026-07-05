import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Check } from "lucide-react";

export default async function PurchaseSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; listing_id?: string }>;
}) {
  const { session_id, listing_id } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !session_id || !listing_id) {
    redirect("/");
  }

  // Get listing details
  const { data: listing } = await supabase
    .from("listings")
    .select("*, profiles!user_id(display_name)")
    .eq("id", listing_id)
    .single();

  return (
    <main className="min-h-screen bg-ink flex items-center justify-center px-4">
      <div className="max-w-md w-full rounded-lg bg-ink-soft border border-swap/40 p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-swap flex items-center justify-center mx-auto mb-4">
          <Check size={32} className="text-paper" />
        </div>

        <h1 className="text-2xl font-display font-bold text-paper mb-2">
          Purchase Complete!
        </h1>

        <p className="text-paper-dim text-sm mb-4">
          You've purchased{" "}
          <span className="text-swap font-semibold">{listing?.title}</span> from{" "}
          <span className="text-swap font-semibold">
            {listing?.profiles?.display_name}
          </span>
        </p>

        <div className="bg-ink rounded-lg p-4 mb-6 text-left">
          <p className="text-xs uppercase tracking-widest text-brass font-mono mb-2">
            Next Steps
          </p>
          <ol className="text-xs text-paper-dim space-y-2">
            <li>✓ Check your email for payment confirmation</li>
            <li>✓ Seller will prepare your item for shipping</li>
            <li>✓ You'll receive tracking info when it ships</li>
            <li>✓ Enjoy your new piece!</li>
          </ol>
        </div>

        <Link
          href="/"
          className="w-full rounded-lg py-3 bg-paper text-ink font-bold text-sm active:scale-95 transition-transform inline-block"
        >
          Back to Feed
        </Link>
      </div>
    </main>
  );
}