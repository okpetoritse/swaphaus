"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Heart, MessageCircle, Share2, Bookmark, Play, BadgeCheck, Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Listing, CONDITION_LABELS } from "@/types/database";

const MODE_STYLE = {
  swap: { label: "Swap Only", className: "border-swap text-swap" },
  sale: { label: "For Sale", className: "border-stamp text-stamp" },
  both: { label: "Swap or Buy", className: "border-brass text-brass" },
};

function fmtCount(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(n);
}

export default function GarmentCard({
  item,
  liked: initialLiked,
  saved: initialSaved,
  likeCount: initialLikeCount,
  onClick,
  currentUserId,
}: {
  item: Listing;
  liked: boolean;
  saved: boolean;
  likeCount: number;
  onClick: (item: Listing) => void;
  currentUserId: string;
}) {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [currentLikeCount, setCurrentLikeCount] = useState(initialLikeCount);
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [saved, setSaved] = useState(initialSaved);
  const [burst, setBurst] = useState(false);
  const supabase = createClient();
  const mode = MODE_STYLE[item.mode];

  async function toggleLike(forceOn = false) {
    const nextLiked = forceOn ? true : !liked;
    setLiked(nextLiked);
    setLikeCount((c) => c + (nextLiked ? 1 : -1));

    if (nextLiked) {
      await supabase.from("likes").insert({
        user_id: currentUserId,
        listing_id: item.id,
      });
    } else {
      await supabase
        .from("likes")
        .delete()
        .eq("user_id", currentUserId)
        .eq("listing_id", item.id);
    }
  }

  async function toggleSave() {
    const nextSaved = !saved;
    setSaved(nextSaved);
    if (nextSaved) {
      await supabase.from("saves").insert({
        user_id: currentUserId,
        listing_id: item.id,
      });
    } else {
      await supabase
        .from("saves")
        .delete()
        .eq("user_id", currentUserId)
        .eq("listing_id", item.id);
    }
  }

  function onDoubleTap() {
    if (!liked) toggleLike(true);
    setBurst(true);
    setTimeout(() => setBurst(false), 650);
  }

  const cover = item.image_urls?.[0]?.trim() || null;

  return (
    <div className="w-full rounded-card overflow-hidden border border-white/10 shadow-lg shadow-black/40 bg-ink-soft">
      <button
        onClick={() => onClick(item)}
        onDoubleClick={onDoubleTap}
        className="relative w-full text-left block"
      >
        <div className="relative h-72 sm:h-64 bg-ink flex items-center justify-center overflow-hidden">
          {cover ? (
  <Image src={cover} alt={item.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" priority />
) : (
            <Sparkles className="opacity-20" size={64} color="white" />
          )}

          <div
            className={`absolute top-3 left-3 -rotate-3 border-2 rounded px-2 py-1 text-[10px] font-bold uppercase tracking-widest bg-black/55 backdrop-blur-sm ${mode.className}`}
          >
            {mode.label}
          </div>

          {item.video_url && (
            <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-[10px] font-semibold text-white">
              <Play size={10} fill="white" /> video
            </div>
          )}

          {burst && (
            <Heart
              size={90}
              fill="white"
              className="absolute text-white animate-ping-once"
            />
          )}
        </div>
      </button>

      <div className="p-4 bg-paper">
        <button onClick={() => onClick(item)} className="text-left w-full">
          <p className="text-[10px] uppercase tracking-widest text-stamp font-mono">
            {item.brand || "Unbranded"}
          </p>
          <h3 className="text-lg leading-tight mt-0.5 text-ink font-body font-bold">
            {item.title}
          </h3>
          <div className="mt-2 flex items-center justify-between text-xs text-ink">
            <span className="opacity-70">
              {item.size ? `Size ${item.size} · ` : ""}
              {CONDITION_LABELS[item.condition]}
            </span>
            {item.price_usd && <span className="font-bold">${item.price_usd} USD</span>}
          </div>
          {item.wants_description && (
            <p className="mt-2 text-[11px] italic opacity-70 border-t border-paper-dim pt-2 text-ink">
              Wants: {item.wants_description}
            </p>
          )}
        </button>

 <div className="flex items-center justify-between text-xs px-3 py-3 border-t border-white/10 bg-ink-soft rounded-b-lg">
  <button
    onClick={async (e) => {
      e.stopPropagation();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      if (liked) {
        await supabase.from("likes").delete().eq("user_id", user.id).eq("listing_id", item.id);
      } else {
        await supabase.from("likes").insert({ user_id: user.id, listing_id: item.id });
      }
    }}
    className="flex items-center gap-1 hover:text-stamp transition text-paper-dim hover:text-stamp"
  >
    <Heart size={14} fill={liked ? "currentColor" : "none"} className={liked ? "text-stamp" : ""} />
    <span>{likeCount || 0}</span>
  </button>

  <button className="flex items-center gap-1 hover:text-brass transition text-paper-dim hover:text-brass">
    <MessageCircle size={14} />
  </button>

  <button className="flex items-center gap-1 hover:text-swap transition text-paper-dim hover:text-swap">
    <Share2 size={14} />
  </button>

  <button
    onClick={async (e) => {
      e.stopPropagation();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      if (saved) {
        await supabase.from("saves").delete().eq("user_id", user.id).eq("listing_id", item.id);
      } else {
        await supabase.from("saves").insert({ user_id: user.id, listing_id: item.id });
      }
    }}
    className="flex items-center gap-1 hover:text-brass transition text-paper-dim hover:text-brass"
  >
    <Bookmark size={14} fill={saved ? "currentColor" : "none"} className={saved ? "text-brass" : ""} />
  </button>
</div>
      </div>
    </div>
  );
}