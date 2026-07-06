"use client";
import { useState } from "react";
import Image from "next/image";
import { Heart } from "lucide-react";
import { Listing } from "@/types/database";

const MODE_STYLE = {
  swap: { label: "Swap Only", className: "bg-black/70 text-white border-white/30" },
  sale: { label: "For Sale", className: "bg-black/70 text-white border-white/30" },
  both: { label: "Swap or Buy", className: "bg-black/70 text-white border-white/30" },
};

export default function GarmentCard({
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
  const mode = MODE_STYLE[item.mode] || MODE_STYLE.both;

  function toggleLike(e: React.MouseEvent) {
    e.stopPropagation();
    setIsLiked(!isLiked);
    // TODO: Add your Supabase like logic here
  }

  function prevImage(e: React.MouseEvent) {
    e.stopPropagation();
    setImageIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  }

  function nextImage(e: React.MouseEvent) {
    e.stopPropagation();
    setImageIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  }

  return (
    <div
      onClick={() => onClick(item)}
      className="group w-full max-w-[280px] bg-white rounded-3xl overflow-hidden shadow-xl cursor-pointer transition-all hover:shadow-2xl"
    >
      {/* Image Container */}
      <div className="relative h-[260px] bg-gradient-to-br from-[#f8e7ff] via-[#ffe4f0] to-[#e0f0ff] flex items-center justify-center overflow-hidden">
        {currentImage ? (
          <Image
            src={currentImage}
            alt={item.title}
            fill
            className="object-contain p-6 transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 280px"
          />
        ) : (
          <div className="text-gray-400">No image</div>
        )}

        {/* Heart Icon - Top Right */}
        <button
          onClick={toggleLike}
          className="absolute top-4 right-4 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all z-10"
        >
          <Heart
            size={18}
            className={`transition-colors ${isLiked ? "fill-red-500 text-red-500" : "text-gray-600"}`}
          />
        </button>

        {/* Mode Badge */}
        {item.mode && (
          <div
            className={`absolute top-4 left-4 text-[10px] font-bold px-3 py-1 rounded-full border ${mode.className}`}
          >
            {mode.label}
          </div>
        )}

        {/* Image Counter (if multiple images) */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-[10px] px-2.5 py-0.5 rounded-full">
            {imageIndex + 1} / {images.length}
          </div>
        )}

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white w-7 h-7 rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-all"
            >
              ←
            </button>
            <button
              onClick={nextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white w-7 h-7 rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-all"
            >
              →
            </button>
          </>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-semibold text-lg text-gray-900">Men Sport Shoes</h3>
        
        <p className="mt-1 text-sm text-gray-600 line-clamp-2">
          {item.title || "This is the best shoe you can buy at this price point. It stands not..."}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <span className="text-xl font-bold text-gray-900">
              ${item.price_usd?.toLocaleString() || "1,989"}
            </span>
          </div>

          <button
            className="bg-black hover:bg-gray-800 text-white px-8 py-2.5 rounded-2xl text-sm font-medium transition-all active:scale-95"
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Handle Buy / Swap action
              onClick(item);
            }}
          >
            Buy
          </button>
        </div>
      </div>
    </div>
  );
}