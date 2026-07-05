"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { ChevronLeft, Check } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [form, setForm] = useState({
    street_address: "",
    city: "",
    state_province: "",
    postal_code: "",
    country: "",
    phone: "",
  });

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("street_address, city, state_province, postal_code, country, phone")
        .eq("id", user.id)
        .single();

      if (data) {
        setForm({
          street_address: data.street_address || "",
          city: data.city || "",
          state_province: data.state_province || "",
          postal_code: data.postal_code || "",
          country: data.country || "",
          phone: data.phone || "",
        });
      }
      setLoading(false);
    }

    loadProfile();
  }, [supabase, router]);

  async function handleSave() {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update(form)
        .eq("id", user.id);

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : "Failed to save"}`);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-ink flex items-center justify-center">
        <p className="text-paper-dim">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-ink pb-24">
      <header className="sticky top-0 z-20 flex items-center gap-4 px-4 py-4 border-b border-white/10 bg-ink/90 backdrop-blur">
        <Link href="/profile" className="p-1">
          <ChevronLeft size={20} className="text-paper" />
        </Link>
        <h1 className="text-lg font-body font-bold text-paper">Settings</h1>
      </header>

      <div className="max-w-md mx-auto px-4 py-6">
        <div className="rounded-lg bg-ink-soft border border-white/10 p-6">
          <h2 className="text-sm font-body font-bold text-paper mb-4 uppercase tracking-wide">
            Shipping Address
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-widest font-mono text-paper-dim block mb-2">
                Street Address
              </label>
              <input
                type="text"
                value={form.street_address}
                onChange={(e) =>
                  setForm((s) => ({ ...s, street_address: e.target.value }))
                }
                placeholder="123 Main St"
                className="w-full rounded-lg px-3 py-3 text-sm border border-paper-dim bg-ink text-paper placeholder:text-paper-dim/60"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs uppercase tracking-widest font-mono text-paper-dim block mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, city: e.target.value }))
                  }
                  placeholder="San Francisco"
                  className="w-full rounded-lg px-3 py-3 text-sm border border-paper-dim bg-ink text-paper placeholder:text-paper-dim/60"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest font-mono text-paper-dim block mb-2">
                  State/Province
                </label>
                <input
                  type="text"
                  value={form.state_province}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, state_province: e.target.value }))
                  }
                  placeholder="CA"
                  className="w-full rounded-lg px-3 py-3 text-sm border border-paper-dim bg-ink text-paper placeholder:text-paper-dim/60"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs uppercase tracking-widest font-mono text-paper-dim block mb-2">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={form.postal_code}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, postal_code: e.target.value }))
                  }
                  placeholder="94102"
                  className="w-full rounded-lg px-3 py-3 text-sm border border-paper-dim bg-ink text-paper placeholder:text-paper-dim/60"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest font-mono text-paper-dim block mb-2">
                  Country
                </label>
                <input
                  type="text"
                  value={form.country}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, country: e.target.value }))
                  }
                  placeholder="United States"
                  className="w-full rounded-lg px-3 py-3 text-sm border border-paper-dim bg-ink text-paper placeholder:text-paper-dim/60"
                />
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-widest font-mono text-paper-dim block mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) =>
                  setForm((s) => ({ ...s, phone: e.target.value }))
                }
                placeholder="+1 (415) 555-1234"
                className="w-full rounded-lg px-3 py-3 text-sm border border-paper-dim bg-ink text-paper placeholder:text-paper-dim/60"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full mt-6 rounded-lg py-3.5 bg-paper text-ink font-bold text-sm active:scale-95 transition-transform disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {success ? (
              <>
                <Check size={16} /> Saved
              </>
            ) : saving ? (
              "Saving..."
            ) : (
              "Save Address"
            )}
          </button>
        </div>
      </div>
    </main>
  );
}