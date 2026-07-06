"use client";
import { useState } from "react";
import Image from "next/image";
import { Heart, Bookmark, Share2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Listing } from "@/types/database";

export default function GarmentCardSwaphaus({
  item,
  liked: initialLiked,
  saved: initialSaved,
  onClick,
  currentUserId,
}: {
  item: Listing;
  liked: boolean;
  saved: boolean;
  onClick: (item: Listing) => void;
  currentUserId: string;
}) {
  const supabase = createClient();
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [imageIndex, setImageIndex] = useState(0);

  const images = item.image_urls || [];
  const currentImage = images[imageIndex]?.trim() || null;

  async function handleLike(e: React.MouseEvent) {
    e.stopPropagation();
    try {
      if (isLiked) {
        await supabase.from("likes").delete().eq("user_id", currentUserId).eq("listing_id", item.id);
        setIsLiked(false);
      } else {
        await supabase.from("likes").insert({ user_id: currentUserId, listing_id: item.id });
        setIsLiked(true);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSave(e: React.MouseEvent) {
    e.stopPropagation();
    try {
      if (isSaved) {
        await supabase.from("saves").delete().eq("user_id", currentUserId).eq("listing_id", item.id);
        setIsSaved(false);
      } else {
        await supabase.from("saves").insert({ user_id: currentUserId, listing_id: item.id });
        setIsSaved(true);
      }
    } catch (err) {
      console.error(err);
    }
  }

  function nextImage(e: React.MouseEvent) {
    e.stopPropagation();
    setImageIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  }

  function goToImage(index: number, e: React.MouseEvent) {
    e.stopPropagation();
    setImageIndex(index);
  }

  const MODE_LABEL = {
    swap: "Swap",
    sale: "Buy",
    both: "Swap or Buy",
  };

  return (
    <div className="w-full min-h-screen sm:min-h-[100dvh] bg-ink relative flex flex-col justify-between snap-start overflow-hidden">
      {/* Background Image - CLEAR, NO OVERLAY */}
      <div className="absolute inset-0">
        {currentImage ? (
          <Image
            src={currentImage}
            alt={item.title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-paper-dim" />
        )}

        {/* MINIMAL Overlay - Only bottom area */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-ink via-ink/80 to-transparent" />
      </div>

      {/* Top Section: Badge + Image Counter */}
      <div className="relative z-20 pt-4 sm:pt-6 px-4 sm:px-6 flex items-center justify-between">
        <div className="inline-block backdrop-blur-md bg-white/10 border border-white/20 rounded-full px-4 py-2">
          <span className="text-xs font-bold uppercase tracking-widest text-brass">
            {MODE_LABEL[item.mode as keyof typeof MODE_LABEL] || "Swap"}
          </span>
        </div>

        {images.length > 1 && (
          <div className="text-white text-xs font-mono backdrop-blur-md bg-black/30 px-3 py-1 rounded-full">
            {imageIndex + 1}/{images.length}
          </div>
        )}
      </div>

      {/* Image Navigation Dots - Center */}
      {images.length > 1 && (
        <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => goToImage(idx, e)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === imageIndex
                  ? "bg-white w-6"
                  : "bg-white/50 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}

      {/* Click to Next Image Area */}
      {images.length > 1 && (
        <button
          onClick={nextImage}
          className="absolute inset-0 z-10"
          aria-label="Next image"
        />
      )}

      {/* Middle Spacer */}
      <div className="relative z-20 flex-1" />

      {/* Bottom Section: Info + Actions - ALWAYS VISIBLE */}
      <div className="relative z-20 px-4 sm:px-6 py-6 sm:py-8 space-y-4 pb-20 sm:pb-8">
        {/* Title + Brand */}
        <div>
          <p className="text-white/60 text-xs uppercase tracking-widest font-mono mb-1">
            {item.brand || "Unbranded"}
          </p>
          <h2 className="text-2xl sm:text-4xl font-bold text-paper leading-tight">
            {item.title}
          </h2>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-3xl sm:text-5xl font-bold text-stamp">
            ${item.price_usd}
          </span>
          <span className="text-white/50 text-sm">USD</span>
        </div>

        {/* Description */}
        {item.wants_description && (
          <p className="text-white/80 text-sm">
            Looking for: <span className="italic">{item.wants_description}</span>
          </p>
        )}

        {/* Action Buttons - FULLY VISIBLE */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4">
          {(item.mode === "swap" || item.mode === "both") && (
            <button
              onClick={() => onClick(item)}
              className="flex-1 bg-swap hover:bg-swap/90 text-white font-bold py-3 sm:py-4 rounded-xl active:scale-95 transition-all"
            >
              ⟳ Swap
            </button>
          )}
          {(item.mode === "sale" || item.mode === "both") && (
            <button
              onClick={() => onClick(item)}
              className="flex-1 bg-stamp hover:bg-stamp/90 text-white font-bold py-3 sm:py-4 rounded-xl active:scale-95 transition-all"
            >
              💳 Buy
            </button>
          )}
        </div>

        {/* Floating Action Buttons */}
        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={handleLike}
            className="p-3 rounded-full bg-white/20 backdrop-blur hover:bg-white/30 transition-all"
          >
            <Heart
              size={18}
              fill={isLiked ? "currentColor" : "none"}
              className={isLiked ? "text-stamp" : "text-white"}
            />
          </button>
          <button
            onClick={handleSave}
            className="p-3 rounded-full bg-white/20 backdrop-blur hover:bg-white/30 transition-all"
          >
            <Bookmark
              size={18}
              fill={isSaved ? "currentColor" : "none"}
              className={isSaved ? "text-brass" : "text-white"}
            />
          </button>
          <button
            onClick={() => onClick(item)}
            className="p-3 rounded-full bg-white/20 backdrop-blur hover:bg-white/30 transition-all"
          >
            <Share2 size={18} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}