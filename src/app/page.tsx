import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If logged in, show the feed
  if (user) {
    redirect("/feed");
  }

  // If not logged in, show landing page
  redirect("/landing");
}