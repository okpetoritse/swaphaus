import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

const CONDITION_MAP: Record<string, string> = {
  nwt: "nwt",
  new: "new",
  like_new: "like_new",
  gently_used: "gently_used",
  fairly_used: "fairly_used",
  well_worn: "well_worn",
};

const CATEGORIES = [
  "tops",
  "bottoms",
  "dresses",
  "outerwear",
  "footwear",
  "bags",
  "accessories",
];

const SIZES = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "One Size",
  "US5",
  "US6",
  "US7",
  "US8",
  "US9",
  "US10",
  "US11",
  "US12",
  "US13",
];

export async function POST(request: NextRequest) {
  try {
    const { listings } = await request.json();

    if (!Array.isArray(listings) || listings.length === 0) {
      return NextResponse.json(
        { error: "Invalid listings array" },
        { status: 400 }
      );
    }

    if (listings.length > 1000) {
      return NextResponse.json(
        { error: "Maximum 1000 items per upload" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const errors: string[] = [];
    const validListings = [];

    for (let i = 0; i < listings.length; i++) {
      const item = listings[i];
      const rowNum = i + 2;

      if (!item.title || !item.brand || !item.category) {
        errors.push(`Row ${rowNum}: Missing required fields (title, brand, category)`);
        continue;
      }

      if (!CATEGORIES.includes(item.category.toLowerCase())) {
        errors.push(
          `Row ${rowNum}: Invalid category. Must be one of: ${CATEGORIES.join(", ")}`
        );
        continue;
      }

      const condition = CONDITION_MAP[item.condition?.toLowerCase()];
      if (!condition) {
        errors.push(
          `Row ${rowNum}: Invalid condition. Must be one of: ${Object.keys(CONDITION_MAP).join(", ")}`
        );
        continue;
      }

      const price = item.price_usd ? parseFloat(item.price_usd) : null;
      if (price && (isNaN(price) || price < 0)) {
        errors.push(`Row ${rowNum}: Invalid price`);
        continue;
      }

      const mode = item.mode?.toLowerCase() || "swap";
      if (!["swap", "sale", "both"].includes(mode)) {
        errors.push(`Row ${rowNum}: Mode must be swap, sale, or both`);
        continue;
      }

      validListings.push({
        user_id: user.id,
        title: item.title,
        brand: item.brand,
        category: item.category.toLowerCase(),
        size: item.size || null,
        condition,
        description: item.description || null,
        wants_description: item.wants_description || null,
        price_usd: price,
        mode,
        image_urls: item.image_url ? [item.image_url] : [],
        status: "active",
      });
    }

    if (validListings.length === 0) {
      return NextResponse.json(
        { success: 0, failed: listings.length, errors },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("listings")
      .insert(validListings);

    if (error) {
      errors.push(`Database error: ${error.message}`);
      return NextResponse.json(
        {
          success: 0,
          failed: validListings.length,
          errors,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: validListings.length,
      failed: errors.length,
      errors,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Server error",
        success: 0,
        failed: 0,
        errors: [],
      },
      { status: 500 }
    );
  }
}