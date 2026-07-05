"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, Send } from "lucide-react";
import Link from "next/link";
import RatingStars from "@/components/RatingStars";

export default function RateSwapPage() {
  const router = useRouter();
  const params = useParams();
  const offerId = params.offerId as string;

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          swapOfferId: offerId,
          ratedUserId: "", // Will come from swap details
          rating,
          comment: comment || null,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(`Error: ${error.error}`);
        return;
      }

      alert("Rating submitted!");
      router.push("/swaps");
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : "Failed to submit"}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-ink pb-24">
      <header className="sticky top-0 z-20 flex items-center gap-4 px-4 py-4 border-b border-white/10 bg-ink/90 backdrop-blur">
        <Link href="/swaps" className="p-1">
          <ChevronLeft size={20} className="text-paper" />
        </Link>
        <h1 className="text-lg font-body font-bold text-paper">Rate this swap</h1>
      </header>

      <div className="max-w-md mx-auto px-4 py-6">
        <div className="rounded-lg bg-ink-soft border border-white/10 p-6">
          <p className="text-sm text-paper-dim mb-6">
            How was your experience with this trade?
          </p>

          <div className="mb-6">
            <label className="text-xs uppercase tracking-widest font-mono text-paper-dim block mb-4">
              Rating
            </label>
            <div className="flex gap-3 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-4xl transition-transform active:scale-110 ${
                    star <= rating ? "text-brass" : "text-white/20"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
            <p className="text-center text-sm font-bold text-brass mt-3">
              {rating}/5
            </p>
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest font-mono text-paper-dim block mb-2">
              Comment (optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How was the communication, packaging, and overall experience?"
              rows={4}
              className="w-full rounded-lg px-3 py-3 text-sm border border-paper-dim bg-ink text-paper placeholder:text-paper-dim/60 resize-none"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full mt-6 rounded-lg py-3.5 bg-paper text-ink font-bold text-sm active:scale-95 transition-transform disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <Send size={16} /> {submitting ? "Submitting..." : "Submit Rating"}
          </button>
        </div>
      </div>
    </main>
  );
}