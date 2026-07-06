"use client";
import { useState } from "react";
import Image from "next/image";
import { Heart, Bookmark, MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Listing } from "@/types/database";

export default function GarmentCardTiktok({
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

  const MODE_LABEL = {
    swap: "Swap",
    sale: "Buy",
    both: "Swap or Buy",
  };

  return (
    <div className="w-screen h-screen sm:h-[100dvh] relative bg-ink overflow-hidden snap-start">
      {/* Full Background Image */}
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

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />
      </div>

      {/* Side Action Buttons (Right Side - TikTok style) */}
      <div className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 flex flex-col gap-6 z-20">
        {/* Like Button */}
        <button
          onClick={handleLike}
          className="flex flex-col items-center gap-1 group"
        >
          <div className="bg-white/20 backdrop-blur p-3 sm:p-4 rounded-full group-hover:bg-white/30 transition-all">
            <Heart
              size={24}
              fill={isLiked ? "currentColor" : "none"}
              className={isLiked ? "text-stamp" : "text-white"}
            />
          </div>
          <span className="text-white text-xs font-semibold">Like</span>
        </button>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="flex flex-col items-center gap-1 group"
        >
          <div className="bg-white/20 backdrop-blur p-3 sm:p-4 rounded-full group-hover:bg-white/30 transition-all">
            <Bookmark
              size={24}
              fill={isSaved ? "currentColor" : "none"}
              className={isSaved ? "text-brass" : "text-white"}
            />
          </div>
          <span className="text-white text-xs font-semibold">Save</span>
        </button>

        {/* Message Button */}
        <button
          onClick={() => onClick(item)}
          className="flex flex-col items-center gap-1 group"
        >
          <div className="bg-white/20 backdrop-blur p-3 sm:p-4 rounded-full group-hover:bg-white/30 transition-all">
            <MessageCircle size={24} className="text-white" />
          </div>
          <span className="text-white text-xs font-semibold">Chat</span>
        </button>
      </div>

      {/* Bottom Info Section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 z-20">
        <div className="max-w-sm mx-auto sm:mx-0">
          {/* Badge */}
          <div className="inline-block bg-brass/90 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
            {MODE_LABEL[item.mode as keyof typeof MODE_LABEL] || "Swap"}
          </div>

          {/* Title */}
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 line-clamp-2">
            {item.title}
          </h2>

          {/* Brand + Price */}
          <p className="text-white/80 text-sm mb-3">
            {item.brand} • <span className="font-bold text-lg text-stamp">${item.price_usd}</span>
          </p>

          {/* Description */}
          {item.wants_description && (
            <p className="text-white/70 text-sm mb-4 line-clamp-2">
              Looking for: {item.wants_description}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 sm:gap-4">
            {(item.mode === "swap" || item.mode === "both") && (
              <button
                onClick={() => onClick(item)}
                className="flex-1 bg-swap hover:bg-swap/90 text-white font-bold py-3 rounded-lg active:scale-95 transition-all"
              >
                Swap
              </button>
            )}
            {(item.mode === "sale" || item.mode === "both") && (
              <button
                onClick={() => onClick(item)}
                className="flex-1 bg-stamp hover:bg-stamp/90 text-white font-bold py-3 rounded-lg active:scale-95 transition-all"
              >
                Buy
              </button>
            )}
          </div>

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="mt-3 text-center text-white/60 text-xs">
              {imageIndex + 1} of {images.length}
              <button
                onClick={nextImage}
                className="block w-full mt-2 text-white underline text-sm"
              >
                Tap to next image
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}