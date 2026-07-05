import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-ink relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/landing-hero-bg.jpg')",
          backgroundAttachment: "fixed",
        }}
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Glassmorphism Content */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 py-12 sm:py-20">
        <div className="w-full max-w-2xl">
          {/* Glass Card */}
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 sm:p-12 shadow-2xl">
            <div className="text-center">
              {/* Accent Label */}
              <div className="mb-6 inline-block">
                <span className="text-xs sm:text-sm font-mono uppercase tracking-widest text-brass px-4 py-2 rounded-full bg-white/10 border border-brass/40">
                  Fashion Swap Marketplace
                </span>
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white mb-4 leading-tight">
                Swap Your Old{" "}
                <span className="text-swap">Treasures</span> for New
              </h1>

              {/* Subheading */}
              <p className="text-base sm:text-lg text-white/90 mb-8 font-body max-w-xl mx-auto">
                Free closet swaps, direct cash sales, and shipping made simple.
                Join the fashion community reshaping how we shop.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link
                  href="/login"
                  className="rounded-lg bg-paper text-ink px-6 sm:px-8 py-3.5 sm:py-4 font-bold text-base sm:text-lg active:scale-95 transition-transform flex items-center justify-center gap-2 hover:shadow-lg"
                >
                  Get Started <ArrowRight size={20} />
                </Link>
                <Link
                  href="/feed"
                  className="rounded-lg bg-white/20 backdrop-blur border-2 border-white/40 text-white px-6 sm:px-8 py-3.5 sm:py-4 font-bold text-base sm:text-lg active:scale-95 transition-transform hover:bg-white/30"
                >
                  Browse Free
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-8 sm:mt-12 pt-8 border-t border-white/20">
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-swap">100K+</p>
                  <p className="text-xs sm:text-sm text-white/70 mt-1">Items Listed</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-brass">Free</p>
                  <p className="text-xs sm:text-sm text-white/70 mt-1">Swaps</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-stamp">10%</p>
                  <p className="text-xs sm:text-sm text-white/70 mt-1">Commission</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-12 sm:py-20 px-4 bg-black/40 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white text-center mb-8 sm:mb-12">
            Why SWAPHAUS?
          </h2>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                emoji: "🔄",
                title: "Swap Free",
                desc: "Trade directly with other users, no commission on swaps",
              },
              {
                emoji: "💳",
                title: "Buy & Sell",
                desc: "Direct sales with 10% commission, Stripe payments",
              },
              {
                emoji: "📦",
                title: "Ship Easy",
                desc: "Shippo integration generates labels automatically",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6 text-center hover:bg-white/15 transition"
              >
                <div className="text-4xl mb-3">{feature.emoji}</div>
                <h3 className="font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-white/70">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="relative py-12 px-4 text-center">
        <div className="max-w-2xl mx-auto backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-8">
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Ready to start swapping?
          </h3>
          <Link
            href="/login"
            className="inline-block rounded-lg bg-paper text-ink px-8 py-3.5 font-bold active:scale-95 transition-transform hover:shadow-lg"
          >
            Sign Up Free
          </Link>
        </div>
      </section>
    </main>
  );
}