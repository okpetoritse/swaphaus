"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Home, Compass, Plus, Inbox, User, Search, X, ChevronLeft } from "lucide-react";
import Image from "next/image";
import GarmentCard from "./GarmentCard";
import ItemDetail from "./ItemDetail";
import NotificationBell from "./NotificationBell";
import { Listing } from "@/types/database";

export default function FeedClient({
  listings,
  currentUserId,
  likeCounts,
  likedSet,
  savedSet,
  searchQuery = "",
  filterCategory = "",
}: {
  listings: Listing[];
  currentUserId: string;
  likeCounts: Record<string, number>;
  likedSet: string[];
  savedSet: string[];
  searchQuery?: string;
  filterCategory?: string;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Listing | null>(null);
  const [searchInput, setSearchInput] = useState(searchQuery || "");
  const [showSearch, setShowSearch] = useState(false);

  function handleSearch() {
    if (searchInput.trim()) {
      router.push(`/feed?q=${encodeURIComponent(searchInput)}`);
      setShowSearch(false);
    }
  }

  function clearFilters() {
    router.push("/feed");
    setSearchInput("");
  }

  return (
    <main className="min-h-screen bg-ink pb-24">
      {/* Top Bar */}
      <header className="sticky top-0 z-20 flex items-center justify-between px-4 py-4 border-b border-white/10 bg-ink/90 backdrop-blur">
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="p-1 sm:hidden hover:bg-white/10 rounded transition"
          >
            <ChevronLeft size={18} className="text-paper" />
          </button>
          <Link href="/feed" className="flex items-center gap-2">
            <img src="/logo.svg" alt="SWAPHAUS" className="w-8 h-8 rounded" />
            <span className="font-display font-bold text-paper hidden sm:inline">SWAPHAUS</span>
          </Link>
        </div>

        <div className="flex-1 mx-4">
          {showSearch ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                autoFocus
                placeholder="Search items..."
                className="flex-1 rounded-lg px-3 py-2 text-sm border border-paper-dim bg-ink text-paper placeholder:text-paper-dim/60"
              />
              <button onClick={() => setShowSearch(false)} className="p-2">
                <X size={18} className="text-paper-dim" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowSearch(true)}
              className="p-2 rounded-lg hover:bg-white/10 transition"
            >
              <Search size={18} className="text-paper" />
            </button>
          )}
        </div>

        <NotificationBell />
      </header>

      {/* Filter Pills */}
      {(searchQuery || filterCategory) && (
        <div className="px-4 py-3 border-b border-white/10 bg-ink-soft flex items-center gap-2 overflow-x-auto">
          {searchQuery && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brass/20 text-brass text-xs font-mono">
              {searchQuery} <X size={12} className="cursor-pointer" onClick={clearFilters} />
            </span>
          )}
          {filterCategory && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-swap/20 text-swap text-xs font-mono">
              {filterCategory} <X size={12} className="cursor-pointer" onClick={clearFilters} />
            </span>
          )}
        </div>
      )}

      {/* Listings Grid */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {listings.length === 0 ? (
          <div className="text-center py-12 text-paper-dim">
            <p className="font-body">No items found. Try adjusting your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {listings.map((item) => (
              <GarmentCard
                key={item.id}
                item={item}
                liked={likedSet.includes(item.id)}
                saved={savedSet.includes(item.id)}
                likeCount={likeCounts[item.id] || 0}
                onClick={() => setSelected(item)}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        )}
      </div>

      {/* Item Detail Modal */}
      {selected && <ItemDetail item={selected} onClose={() => setSelected(null)} />}

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 flex items-center justify-around border-t border-white/10 px-2 py-2 bg-ink/95 backdrop-blur">
        <Link href="/feed" className="p-2 rounded-lg hover:bg-white/5 transition">
          <Home size={20} className="text-brass" />
        </Link>
        <Link href="/feed" className="p-2 rounded-lg hover:bg-white/5 transition">
          <Compass size={20} className="text-paper-dim hover:text-paper" />
        </Link>
        <Link
          href="/upload"
          className="-mt-6 w-14 h-14 rounded-full flex items-center justify-center shadow-lg bg-stamp active:scale-90 transition-transform"
        >
          <Plus size={26} className="text-paper" />
        </Link>
        <Link href="/swaps" className="p-2 rounded-lg hover:bg-white/5 transition">
          <Inbox size={20} className="text-paper-dim hover:text-paper" />
        </Link>
        <Link href="/profile" className="p-2 rounded-lg hover:bg-white/5 transition">
          <User size={20} className="text-paper-dim hover:text-paper" />
        </Link>
      </nav>
    </main>
  );
}