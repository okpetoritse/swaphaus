"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Play, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { uploadListingImages, uploadListingVideo } from "@/lib/supabase/storage";
import { ListingMode, ListingCondition, CONDITION_LABELS } from "@/types/database";
import SizeSelect from "@/components/SizeSelect";

const CATEGORIES = ["Outerwear", "Tops", "Bottoms", "Dresses", "Footwear", "Bags", "Accessories"];

export default function UploadPage() {
  const router = useRouter();
  const supabase = createClient();

  const [images, setImages] = useState<File[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const [mode, setMode] = useState<ListingMode>("swap");
  const [condition, setCondition] = useState<ListingCondition | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [showCategories, setShowCategories] = useState(false);
  const [title, setTitle] = useState("");
  const [brand, setBrand] = useState("");
  const [size, setSize] = useState("");
  const [price, setPrice] = useState("");
  const [wants, setWants] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit() {
    setErrorMsg("");

    if (!title || !condition || images.length === 0) {
      setErrorMsg("Add at least one photo, a title, and a condition before publishing.");
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");

      const imageUrls = await uploadListingImages(images, user.id);
      const videoUrl = video ? await uploadListingVideo(video, user.id) : null;

      const { error } = await supabase.from("listings").insert({
        user_id: user.id,
        title,
        brand: brand || null,
        category,
        size: size || null,
        condition,
        description: description || null,
        mode,
        price_usd: mode !== "swap" && price ? parseFloat(price) : null,
        wants_description: mode !== "sale" ? wants || null : null,
        image_urls: imageUrls,
        video_url: videoUrl,
      });

      if (error) throw error;

      router.push("/");
      router.refresh();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-ink px-4 py-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-xl font-body font-bold text-paper mb-4">List an Item</h1>

        {errorMsg && (
          <div className="mb-4 rounded-lg bg-stamp/15 border border-stamp/40 px-4 py-3 text-sm text-paper">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-5">
          <label className="aspect-square rounded-xl border-2 border-dashed border-paper-dim flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-ink-soft">
            <Camera size={24} className="text-stamp" />
            <span className="text-[11px] font-semibold text-paper">
              {images.length > 0 ? `${images.length} photo(s)` : "Add Photos"}
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => setImages(Array.from(e.target.files || []))}
            />
          </label>
          <label className="aspect-square rounded-xl border-2 border-dashed border-paper-dim flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-ink-soft">
            <Play size={24} className="text-stamp" />
            <span className="text-[11px] font-semibold text-center text-paper leading-tight">
              {video ? "Video added" : <>30s Video<br />Recommended</>}
            </span>
            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => setVideo(e.target.files?.[0] || null)}
            />
          </label>
        </div>

        <label className="text-[11px] font-semibold uppercase tracking-wide block mb-1.5 text-paper font-mono">
          Listing type
        </label>
        <div className="flex gap-2 mb-4">
          {(["swap", "sale", "both"] as ListingMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 rounded-lg py-2.5 text-xs font-bold border-2 transition active:scale-95 ${
                mode === m ? "bg-stamp border-stamp text-paper" : "border-paper-dim text-paper"
              }`}
            >
              {m === "swap" ? "Swap Only" : m === "sale" ? "For Sale" : "Both"}
            </button>
          ))}
        </div>

        <div className="space-y-3.5">
          <input
            placeholder="Item name"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg px-3 py-3 text-sm border border-paper-dim bg-ink-soft text-paper placeholder:text-paper-dim/60"
          />

          <input
            placeholder="Brand"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="w-full rounded-lg px-3 py-3 text-sm border border-paper-dim bg-ink-soft text-paper placeholder:text-paper-dim/60"
          />

          {/* Category comes BEFORE size on purpose — size options depend on category */}
          <div className="relative">
            <button
              onClick={() => setShowCategories((s) => !s)}
              className="w-full rounded-lg px-3 py-3 text-sm border border-paper-dim bg-ink-soft flex items-center justify-between text-paper"
            >
              <span className={category ? "" : "text-paper-dim/60"}>{category || "Select a category"}</span>
              <ChevronDown size={16} />
            </button>
            {showCategories && (
              <div className="absolute z-10 mt-1 w-full rounded-lg border border-paper-dim bg-ink-soft overflow-hidden">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => { setCategory(c); setShowCategories(false); setSize(""); }}
                    className="w-full text-left px-3 py-2.5 text-sm text-paper hover:bg-white/5"
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          <SizeSelect category={category} value={size} onChange={setSize} />

          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide block mb-1.5 text-paper font-mono">
              Condition
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(CONDITION_LABELS) as ListingCondition[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setCondition(c)}
                  className={`rounded-lg py-2.5 px-2 text-[11px] font-semibold border-2 transition active:scale-95 leading-tight ${
                    condition === c ? "bg-stamp border-stamp text-paper" : "border-paper-dim text-paper"
                  }`}
                >
                  {CONDITION_LABELS[c]}
                </button>
              ))}
            </div>
          </div>

          {mode !== "swap" && (
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-paper">$</span>
              <input
                placeholder="0.00"
                inputMode="decimal"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-lg pl-7 pr-14 py-3 text-sm border border-paper-dim bg-ink-soft text-paper placeholder:text-paper-dim/60"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold opacity-50 text-paper">USD</span>
            </div>
          )}

          {mode !== "sale" && (
            <input
              placeholder="What would you swap this for?"
              value={wants}
              onChange={(e) => setWants(e.target.value)}
              className="w-full rounded-lg px-3 py-3 text-sm border border-paper-dim bg-ink-soft text-paper placeholder:text-paper-dim/60"
            />
          )}

          <textarea
            placeholder="Description (fit notes, flaws, why you're letting it go)"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg px-3 py-3 text-sm border border-paper-dim bg-ink-soft text-paper placeholder:text-paper-dim/60 resize-none"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full mt-5 rounded-lg py-3.5 font-bold text-sm bg-paper text-ink active:scale-95 transition-transform disabled:opacity-60"
        >
          {submitting ? "Publishing..." : "Publish to Feed"}
        </button>
      </div>
    </main>
  );
}