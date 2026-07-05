"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { getSizeOptions } from "@/lib/sizing";

export default function SizeSelect({
  category,
  value,
  onChange,
}: {
  category: string | null;
  value: string;
  onChange: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const options = getSizeOptions(category);
  const selected = options.find((o) => o.value === value);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((s) => !s)}
        className="w-full rounded-lg px-3 py-3 text-sm border border-paper-dim bg-ink-soft flex items-center justify-between text-paper"
      >
        <span className={selected ? "" : "text-paper-dim/60"}>
          {selected ? selected.label : "Select size"}
        </span>
        <ChevronDown size={16} />
      </button>
      {open && (
        <div className="absolute z-10 mt-1 w-full max-h-56 overflow-y-auto rounded-lg border border-paper-dim bg-ink-soft">
          {options.map((o) => (
            <button
              key={o.value}
              onClick={() => { onChange(o.value); setOpen(false); }}
              className="w-full text-left px-3 py-2.5 text-sm text-paper hover:bg-white/5"
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}