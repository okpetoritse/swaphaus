"use client";

import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function LoginClient() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const supabase = createClient();

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/auth/callback`,
      },
    });
  }

  return (
    <main className="min-h-screen bg-ink flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded bg-stamp flex items-center justify-center mx-auto mb-4">
            <span className="text-paper font-bold text-lg">S</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-paper">SWAPHAUS</h1>
          <p className="text-paper-dim text-sm mt-2">Swap your old treasures for new</p>
        </div>

        {error === "auth_failed" && (
          <div className="mb-6 p-4 rounded-lg bg-stamp/20 border border-stamp/40 text-sm text-paper">
            Authentication failed. Please try again.
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-paper text-ink py-3.5 font-bold mb-4 active:scale-95 transition-transform"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <Link
          href="/landing"
          className="w-full flex items-center justify-center gap-2 rounded-lg border-2 border-paper text-paper py-3.5 font-bold active:scale-95 transition-transform"
        >
          Browse as Guest <ArrowRight size={18} />
        </Link>
      </div>
    </main>
  );
}