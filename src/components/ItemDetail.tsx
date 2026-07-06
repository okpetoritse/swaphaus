"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, Truck, Repeat, ShoppingBag, MessageCircle } from "lucide-react";
import { Listing, CONDITION_LABELS } from "@/types/database";
import ClosetSelector from "@/components/ClosetSelector";
import { useRouter } from "next/navigation";

export default function ItemDetail({
  item,
  onClose,
}: {
  item: Listing | null;
  onClose: () => void;
}) {
  // ALL HOOKS AT TOP
  const [activeImg, setActiveImg] = useState(0);
  const [showClosetSelector, setShowClosetSelector] = useState(false);
  const router = useRouter();

  // EARLY RETURN AFTER HOOKS
  if (!item) return null;

  // THEN DERIVED DATA
  const images = (item.image_urls || []).filter((url) => url && url.trim().length > 0);

  // THEN RETURN JSX
  return (
    <div
      className="fixed inset-0 z-30 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md sm:rounded-card rounded-t-2xl bg-paper flex flex-col h-[85vh] sm:h-auto sm:max-h-[85vh] overflow-hidden"
      >
        {/* SCROLLABLE AREA */}
        {/* <div className="flex-1 overflow-y-auto min-h-0">
          <div className="relative h-56 sm:h-64 bg-ink flex items-center justify-center shrink-0">
            <button
              onClick={onClose}
              className="absolute top-3 left-3 z-10 p-1.5 rounded-full bg-black/40"
            >
              <ChevronLeft size={18} className="text-white" />
            </button>

            {images.length > 0 ? (
              <Image
                src={images[activeImg]}
                alt={item.title}
                fill
                sizes="(max-width: 640px) 100vw, 448px"
                className="object-cover"
              />
            ) : (
              <p className="text-paper-dim text-sm">No photo uploaded</p>
            )}

            {images.length > 1 && (
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`w-2 h-2 rounded-full ${
                      i === activeImg ? "bg-white" : "bg-white/40"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {item.video_url && (
            <video
              controls
              className="w-full max-h-56 bg-black"
              src={item.video_url}
            />
          )}

          <div className="p-5">
            <p className="text-[11px] uppercase tracking-widest text-stamp font-mono">
              {item.brand || "Unbranded"}
            </p>
            <h2 className="text-2xl mt-1 font-body font-bold text-ink">
              {item.title}
            </h2>

            <div className="flex gap-2 mt-3 flex-wrap">
              {item.size && (
                <span className="text-[10px] font-mono uppercase bg-ink text-paper px-2 py-1 rounded-sm">
                  Size {item.size}
                </span>
              )}
              <span className="text-[10px] font-mono uppercase bg-ink text-paper px-2 py-1 rounded-sm">
                {CONDITION_LABELS[item.condition]}
              </span>
              {item.price_usd && (
                <span className="text-[10px] font-mono uppercase bg-stamp text-paper px-2 py-1 rounded-sm">
                  ${item.price_usd} USD
                </span>
              )}
            </div>

            {item.wants_description && (
              <div className="mt-4 rounded-lg p-3 border border-paper-dim bg-paper-soft">
                <p className="text-xs font-semibold mb-1 text-ink">
                  Looking to trade for
                </p>
                <p className="text-sm italic text-ink">{item.wants_description}</p>
              </div>
            )}

            {item.description && (
              <p className="mt-3 text-sm text-ink opacity-80">
                {item.description}
              </p>
            )}

            <div className="flex items-center gap-2 mt-3 text-xs text-swap">
              <Truck size={14} /> Shipping via Shippo — label generated after both
              sides confirm
            </div>
          </div>
        </div> */}

        {/* Horizontal Scrolling Carousel - Images & Videos Side by Side */}
          {/* Horizontal Scrolling Carousel - Images & Videos Side by Side */}
<div className="relative h-80 sm:h-96 bg-ink overflow-hidden">
  <div className="flex h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide">
    {item.image_urls?.map((url, idx) => (
      <div key={`img-${idx}`} className="flex-shrink-0 w-full h-full snap-start">
        <Image
          src={url.trim()}
          alt={`${item.title} ${idx + 1}`}
          fill
          className="object-cover"
          priority={idx === 0}
        />
      </div>
    ))}

    {item.video_url && (
      <div key="video" className="flex-shrink-0 w-full h-full snap-start bg-black flex items-center justify-center">
        <video
          src={item.video_url}
          controls
          className="w-full h-full object-cover"
        />
      </div>
    )}
  </div>

  {/* Scroll Indicator */}
  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs bg-black/70 text-white px-2 py-1 rounded">
    ← Swipe →
  </div>
</div>

{/* DESCRIPTION SECTION - BELOW CAROUSEL */}
<div className="p-5 bg-paper overflow-y-auto flex-1">
  <p className="text-[11px] uppercase tracking-widest text-stamp font-mono">
    {item.brand || "Unbranded"}
  </p>
  <h2 className="text-2xl mt-1 font-body font-bold text-ink">
    {item.title}
  </h2>

  <div className="flex gap-2 mt-3 flex-wrap">
    {item.size && (
      <span className="text-[10px] font-mono uppercase bg-ink text-paper px-2 py-1 rounded-sm">
        Size {item.size}
      </span>
    )}
    <span className="text-[10px] font-mono uppercase bg-ink text-paper px-2 py-1 rounded-sm">
      {CONDITION_LABELS[item.condition]}
    </span>
    {item.price_usd && (
      <span className="text-[10px] font-mono uppercase bg-stamp text-paper px-2 py-1 rounded-sm">
        ${item.price_usd} USD
      </span>
    )}
  </div>

  {item.wants_description && (
    <div className="mt-4 rounded-lg p-3 border border-paper-dim bg-paper-soft">
      <p className="text-xs font-semibold mb-1 text-ink">
        Looking to trade for
      </p>
      <p className="text-sm italic text-ink">{item.wants_description}</p>
    </div>
  )}

  {item.description && (
    <p className="mt-3 text-sm text-ink opacity-80">
      {item.description}
    </p>
  )}

  <div className="flex items-center gap-2 mt-3 text-xs text-swap">
    <Truck size={14} /> Shipping via Shippo — label generated after both
    sides confirm
  </div>
</div>

        {/* STICKY FOOTER */}
        <div className="shrink-0 p-4 border-t border-paper-dim bg-paper flex gap-2">
          {(item.mode === "swap" || item.mode === "both") && (
            <button
              onClick={() => setShowClosetSelector(true)}
              className="flex-1 rounded-lg py-3.5 font-bold text-sm flex items-center justify-center gap-2 bg-swap text-paper active:scale-95 transition-transform"
            >
              <Repeat size={16} /> Offer a Swap
            </button>
          )}
{(item.mode === "sale" || item.mode === "both") && (
  <button 
 onClick={async () => {
  try {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId: item.id }),
    });

    if (!res.ok) {
      const error = await res.json();
      alert(`Error: ${error.error}`);
      return;
    }

    const { checkoutUrl } = await res.json();
    
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
    }
  } catch (err) {
    alert(`Error: ${err instanceof Error ? err.message : "Payment failed"}`);
  }
}}
    className="flex-1 rounded-lg py-3.5 font-bold text-sm flex items-center justify-center gap-2 bg-stamp text-paper active:scale-95 transition-transform"
  >
    <ShoppingBag size={16} /> Buy · ${item.price_usd}
  </button>
)}
          <button className="rounded-lg px-4 py-3.5 bg-ink active:scale-95 transition-transform">
            <MessageCircle size={18} className="text-paper" />
          </button>
        </div>
      </div>

      {/* CLOSET SELECTOR MODAL */}
      {showClosetSelector && (
        <ClosetSelector
          targetListingId={item.id}
          targetListingTitle={item.title}
          recipientId={item.user_id}
          onClose={() => setShowClosetSelector(false)}
          onSwapCreated={(offerId) => {
            setShowClosetSelector(false);
            onClose();
            router.push(`/swaps/${offerId}`);
          }}
        />
      )}
    </div>
  );
}