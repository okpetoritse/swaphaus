export type ListingMode = "swap" | "sale" | "both";
export type ListingCondition =
  | "nwt"
  | "new"
  | "like_new"
  | "gently_used"
  | "fairly_used"
  | "well_worn";
export type ListingStatus = "active" | "pending" | "swapped" | "sold" | "removed";

export const CONDITION_LABELS: Record<ListingCondition, string> = {
  nwt: "Brand New · Tags On",
  new: "New · No Tags",
  like_new: "Like New",
  gently_used: "Gently Used",
  fairly_used: "Fairly Used",
  well_worn: "Old / Well Worn",
};

export interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  city: string | null;
  swap_credits: number;
  rating_avg: number;
  rating_count: number;
  created_at: string;
}

export interface Listing {
  id: string;
  user_id: string;
  title: string;
  brand: string | null;
  category: string | null;
  size: string | null;
  condition: ListingCondition;
  description: string | null;
  mode: ListingMode;
  price_usd: number | null;
  wants_description: string | null;
  image_urls: string[];
  video_url: string | null;
  status: ListingStatus;
  created_at: string;
  profiles?: Pick<Profile, "username" | "display_name" | "avatar_url">;
}
export interface SwapOffer {
  id: string;
  listing_id: string;
  offered_listing_id: string | null;
  offerer_id: string;
  recipient_id: string;
  status: "pending" | "accepted" | "declined" | "completed" | "cancelled";
  cash_topup_usd: number | null;
  created_at: string;
  listings?: Pick<Listing, "id" | "title" | "image_urls" | "brand">;
  offered_listings?: Pick<Listing, "id" | "title" | "image_urls" | "brand">;
  offerer_profile?: Pick<Profile, "display_name" | "avatar_url">;
  recipient_profile?: Pick<Profile, "display_name" | "avatar_url">;
}

export interface Message {
  id: string;
  swap_offer_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender?: Pick<Profile, "display_name" | "avatar_url">;
}