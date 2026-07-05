"use client";

import { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Listing, CONDITION_LABELS } from "@/types/database";
import { createSwapOffer } from "@/lib/supabase/actions";

export default function ClosetSelector({
  targetListingId,
  targetListingTitle,
  recipientId,
  onClose,
  onSwapCreated,
}: {
  targetListingId: string;
  targetListingTitle: string;
  recipientId: string;
  onClose: () => void;
  onSwapCreated: (offerId: string) => void;
}) {
  const supabase = createClient();
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCloset() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("listings")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .neq("id", targetListingId);

      setMyListings(data || []);
      setLoading(false);
    }

    loadCloset();
  }, [supabase, targetListingId]);

  async function handleOffer() {
    if (!selected) {
      setError("Pick an item to offer");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const offer = await createSwapOffer(targetListingId, selected, recipientId);
      onSwapCreated(offer.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md sm:rounded-card rounded-t-2xl bg-paper flex flex-col h-[80vh] sm:h-auto sm:max-h-[80vh] overflow-hidden"
      >
        <div className="shrink-0 p-4 border-b border-paper-dim flex items-center justify-between">
          <h2 className="text-lg font-body font-bold text-ink">Pick something to swap</h2>
          <button onClick={onClose} className="p-1">
            <X size={20} className="text-ink" />
          </button>
        </div>

        {error && (
          <div className="shrink-0 mx-4 mt-4 rounded-lg bg-stamp/15 border border-stamp/40 px-3 py-2 text-sm text-paper">
            {error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto min-h-0 px-4 py-4">
          {loading ? (
            <p className="text-center text-paper-dim text-sm">Loading your closet...</p>
          ) : myListings.length === 0 ? (
            <p className="text-center text-paper-dim text-sm">
              You don't have any active items to offer. Upload something first.
            </p>
          ) : (
            <div className="space-y-3">
              {myListings.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelected(item.id)}
                  className={`w-full rounded-lg p-3 text-left border-2 transition active:scale-95 ${
                    selected === item.id
                      ? "border-swap bg-swap/10"
                      : "border-paper-dim bg-ink-soft"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {item.image_urls?.[0] && (
                      <img
                        src={item.image_urls[0]}
                        alt={item.title}
                        className="w-14 h-14 rounded object-cover shrink-0"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] uppercase tracking-widest text-stamp font-mono">
                        {item.brand || "Unbranded"}
                      </p>
                      <h3 className="text-sm font-body font-bold text-ink truncate">
                        {item.title}
                      </h3>
                      <p className="text-[10px] text-ink opacity-70 mt-0.5">
                        {item.size ? `Size ${item.size} · ` : ""}
                        {CONDITION_LABELS[item.condition]}
                      </p>
                    </div>
                    {selected === item.id && <Check size={18} className="text-swap shrink-0 mt-1" />}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="shrink-0 p-4 border-t border-paper-dim flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg py-3 font-semibold text-sm bg-ink text-paper active:scale-95 transition-transform"
          >
            Cancel
          </button>
          <button
            onClick={handleOffer}
            disabled={submitting || !selected}
            className="flex-1 rounded-lg py-3 font-semibold text-sm bg-swap text-paper active:scale-95 transition-transform disabled:opacity-60"
          >
            {submitting ? "Creating..." : "Send Offer"}
          </button>
        </div>
      </div>
    </div>
  );
}