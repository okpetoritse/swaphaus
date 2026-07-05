import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: ratings } = await supabase
      .from("ratings")
      .select("rating, comment, created_at, rater:rater_id(display_name, avatar_url)")
      .eq("rated_user_id", userId)
      .order("created_at", { ascending: false });

    if (!ratings) {
      return NextResponse.json({ ratings: [], average: 0, count: 0 });
    }

    const average = ratings.length > 0
      ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
      : 0;

    return NextResponse.json({
      ratings,
      average: parseFloat(average as string),
      count: ratings.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { swapOfferId, ratedUserId, rating, comment } = await request.json();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!swapOfferId || !ratedUserId || !rating) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be 1-5" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("ratings").insert({
      swap_offer_id: swapOfferId,
      rater_id: user.id,
      rated_user_id: ratedUserId,
      rating,
      comment: comment || null,
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}