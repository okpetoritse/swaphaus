import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import FeedClient from "@/components/FeedClient";

export const dynamic = "force-dynamic";

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const params = await searchParams;
  const category = params.category;
  const query = params.q;

  let listingsQuery = supabase
    .from("listings")
    .select("*, profiles!user_id(username, display_name, avatar_url)")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (category) {
    listingsQuery = listingsQuery.eq("category", category);
  }

  if (query) {
    listingsQuery = listingsQuery.or(
      `title.ilike.%${query}%,brand.ilike.%${query}%`
    );
  }

  const { data: listings } = await listingsQuery;

  const listingIds = (listings || []).map((l) => l.id);
  const safeIds = listingIds.length ? listingIds : ["00000000-0000-0000-0000-000000000000"];

  const { data: myLikes } = await supabase
    .from("likes").select("listing_id").eq("user_id", user.id).in("listing_id", safeIds);

  const { data: mySaves } = await supabase
    .from("saves").select("listing_id").eq("user_id", user.id).in("listing_id", safeIds);

  const { data: allLikes } = await supabase
    .from("likes").select("listing_id").in("listing_id", safeIds);

  const likeCounts: Record<string, number> = {};
  (allLikes || []).forEach((l) => {
    likeCounts[l.listing_id] = (likeCounts[l.listing_id] || 0) + 1;
  });

  return (
    <FeedClient
      listings={listings || []}
      currentUserId={user.id}
      likeCounts={likeCounts}
      likedSet={(myLikes || []).map((l) => l.listing_id)}
      savedSet={(mySaves || []).map((l) => l.listing_id)}
      searchQuery={query}
      filterCategory={category}
    />
  );
}