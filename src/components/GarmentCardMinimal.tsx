"use client";
import { useState } from "react";
import Image from "next/image";
import { Heart } from "lucide-react";
import { Listing } from "@/types/database";

export default function GarmentCardMinimal({
  item,
  liked: initialLiked,
  onClick,
}: {
  item: Listing;
  liked: boolean;
  onClick: (item: Listing) => void;
}) {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [imageIndex, setImageIndex] = useState(0);

  const images = item.image_urls || [];
  const currentImage = images[imageIndex]?.trim() || null;

  function toggleLike(e: React.MouseEvent) {
    e.stopPropagation();
    setIsLiked(!isLiked);
  }

  function nextImage(e: React.MouseEvent) {
    e.stopPropagation();
    setImageIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  }

  const MODE_LABEL = {
    swap: "Swap",
    sale: "Buy",
    both: "Swap/Buy",
  };

  return (
    <div
      onClick={() => onClick(item)}
      className="group relative w-full aspect-square rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer bg-ink"
    >
      {/* Image */}
      {currentImage ? (
        <Image
          src={currentImage}
          alt={item.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      ) : (
        <div className="w-full h-full bg-paper-dim flex items-center justify-center text-paper-dim">
          No image
        </div>
      )}

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Badge: Top Left */}
      <div className="absolute top-3 left-3 bg-brass/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
        {MODE_LABEL[item.mode as keyof typeof MODE_LABEL] || "Swap"}
      </div>

      {/* Heart Icon: Top Right (floating) */}
      <button
        onClick={toggleLike}
        className="absolute top-3 right-3 bg-white/90 backdrop-blur p-2 rounded-full shadow-md hover:scale-110 transition-transform z-10"
      >
        <Heart
          size={16}
          fill={isLiked ? "currentColor" : "none"}
          className={isLiked ? "text-stamp" : "text-ink"}
        />
      </button>

      {/* Image Counter: Bottom Center */}
      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/70 text-white text-[9px] px-2 py-0.5 rounded-full">
          {imageIndex + 1}/{images.length}
        </div>
      )}

      {/* Next Image on Tap/Hover */}
      {images.length > 1 && (
        <button
          onClick={nextImage}
          className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity"
          aria-label="Next image"
        />
      )}
    </div>
  );
}