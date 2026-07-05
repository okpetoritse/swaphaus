"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Upload, Download, Check, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function BulkUploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  }

  async function handleUpload() {
    if (!file) {
      alert("Please select a CSV file");
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const text = await file.text();
      const lines = text.split("\n");
      const headers = lines[0].split(",").map((h) => h.trim());

      const listings = lines.slice(1).filter((line) => line.trim()).map((line) => {
        const values = line.split(",").map((v) => v.trim());
        const item: Record<string, any> = {};
        headers.forEach((header, idx) => {
          item[header] = values[idx] || null;
        });
        return item;
      });

      const res = await fetch("/api/bulk-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listings }),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(`Error: ${error.error}`);
        return;
      }

      const data = await res.json();
      setResult(data);
      setProgress(100);
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : "Upload failed"}`);
    } finally {
      setUploading(false);
    }
  }

  return (
    <main className="min-h-screen bg-ink pb-24">
      <header className="sticky top-0 z-20 flex items-center gap-4 px-4 py-4 border-b border-white/10 bg-ink/90 backdrop-blur">
        <Link href="/profile" className="p-1">
          <ChevronLeft size={20} className="text-paper" />
        </Link>
        <h1 className="text-lg font-body font-bold text-paper">Bulk Upload</h1>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {result ? (
          <div className="rounded-lg bg-ink-soft border border-white/10 p-6">
            <div className="flex items-center gap-3 mb-6">
              {result.failed === 0 ? (
                <Check size={32} className="text-swap" />
              ) : (
                <AlertCircle size={32} className="text-brass" />
              )}
              <div>
                <h2 className="text-lg font-bold text-paper">Upload Complete</h2>
                <p className="text-sm text-paper-dim">
                  {result.success} items uploaded{result.failed > 0 ? `, ${result.failed} failed` : ""}
                </p>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="bg-stamp/20 border border-stamp/40 rounded-lg p-4 mb-6">
                <p className="text-xs font-bold text-stamp uppercase mb-3">Errors</p>
                <div className="space-y-2">
                  {result.errors.slice(0, 5).map((err, idx) => (
                    <p key={idx} className="text-xs text-paper-dim">
                      {err}
                    </p>
                  ))}
                  {result.errors.length > 5 && (
                    <p className="text-xs text-paper-dim">
                      +{result.errors.length - 5} more errors
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setFile(null);
                  setResult(null);
                  setProgress(0);
                }}
                className="flex-1 rounded-lg py-3 bg-ink-soft border border-white/10 text-paper font-bold active:scale-95 transition-transform"
              >
                Upload Another
              </button>
              <button
                onClick={() => router.push("/feed")}
                className="flex-1 rounded-lg py-3 bg-paper text-ink font-bold active:scale-95 transition-transform"
              >
                View Feed
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-lg bg-ink-soft border border-white/10 p-6 space-y-6">
            <div>
              <h2 className="text-lg font-body font-bold text-paper mb-2">
                Upload Multiple Items
              </h2>
              <p className="text-sm text-paper-dim">
                Upload up to 1000 items at once using a CSV file. Perfect for brands and resellers.
              </p>
            </div>

            <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-brass/40 transition cursor-pointer relative">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Upload size={32} className="text-paper-dim mx-auto mb-3" />
              <p className="text-sm font-bold text-paper mb-1">
                {file ? file.name : "Drop CSV file or click to browse"}
              </p>
              <p className="text-xs text-paper-dim">CSV format only</p>
            </div>

            <div className="bg-ink rounded-lg p-4 space-y-3">
              <p className="text-xs font-bold text-brass uppercase">CSV Format</p>
              <div className="text-xs text-paper-dim font-mono space-y-2">
                <p>Required columns:</p>
                <p className="text-paper">
                  title, brand, category, size, condition, wants_description, price_usd, mode
                </p>
                <p className="text-paper-dim mt-3">Optional: description, image_url</p>
              </div>
            </div>

            <div>
              <Link
                href="/bulk-upload-template.csv"
                download
                className="flex items-center justify-center gap-2 w-full rounded-lg border border-brass/40 text-brass py-3 font-bold active:scale-95 transition-transform hover:bg-brass/10"
              >
                <Download size={16} /> Download CSV Template
              </Link>
            </div>

            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full rounded-lg py-3.5 bg-paper text-ink font-bold active:scale-95 transition-transform disabled:opacity-60"
            >
              {uploading ? `Uploading (${progress}%)` : "Upload CSV"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}