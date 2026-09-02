"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthContext";
import type { PhotoJob } from "@/lib/store";

const LIFESTYLE_PRESETS = [
  "On a rustic wooden table in warm morning light, with a linen napkin, blurred kitchen background",
  "Held by a person in a sunlit living room, cozy interior, lifestyle marketing photo",
  "Flat-lay on marble countertop with soft shadows, modern e-commerce photo",
  "In a gift box on a bed with wrapping paper, premium holiday gifting scene",
  "Outdoors on natural stone, soft golden hour, premium product hero shot",
];

const fieldClasses =
  "w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 shadow-sm transition-all focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15";

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

export function PhotoTool() {
  const { account, loading } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"background_removal" | "lifestyle">("background_removal");
  const [imageData, setImageData] = useState<string | null>(null);
  const [prompt, setPrompt] = useState(LIFESTYLE_PRESETS[0]);
  const [busy, setBusy] = useState(false);
  const [job, setJob] = useState<PhotoJob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<PhotoJob[]>([]);

  useEffect(() => {
    if (!account) return;
    fetch("/api/photo")
      .then((r) => r.json())
      .then((d) => setHistory(d.jobs ?? []))
      .catch(() => {});
  }, [account]);

  if (loading) {
    return <div className="px-4 py-20 text-center text-sm text-ink-400 sm:px-6">Loading…</div>;
  }

  if (!account) {
    return (
      <div className="mx-auto max-w-md px-4 sm:px-6">
        <div className="rounded-3xl border border-ink-200/80 bg-white p-8 text-center shadow-lg shadow-ink-900/5">
          <h2 className="text-xl font-bold text-ink-900">Create a free account to use the photo tool</h2>
          <p className="mt-2 text-sm text-ink-500">
            The first 3 photos are on the house (counts against your free plan).
          </p>
          <Link
            href="/account"
            className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-600 px-6 py-3 text-sm font-semibold text-white"
          >
            Create account
          </Link>
        </div>
      </div>
    );
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 8 * 1024 * 1024) {
      setError("Image too large. Max 8MB.");
      return;
    }
    try {
      setImageData(await readFileAsDataUrl(f));
      setError(null);
      setJob(null);
    } catch {
      setError("Could not read image.");
    }
  }

  async function run() {
    if (mode === "background_removal" && !imageData) {
      setError("Upload an image first.");
      return;
    }
    if (mode === "lifestyle" && prompt.trim().length < 5) {
      setError("Write a scene description.");
      return;
    }
    setBusy(true);
    setError(null);
    setJob(null);
    try {
      const res = await fetch("/api/photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          image: imageData ?? undefined,
          prompt: mode === "lifestyle" ? prompt : undefined,
        }),
      });
      const data = (await res.json()) as { job?: PhotoJob; error?: string };
      if (!res.ok || !data.job) {
        setError(data.error ?? "Generation failed.");
        return;
      }
      setJob(data.job);
      // refresh history
      fetch("/api/photo")
        .then((r) => r.json())
        .then((d) => setHistory(d.jobs ?? []))
        .catch(() => {});
    } catch {
      setError("Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-ink-200/80 bg-white p-6 shadow-lg shadow-ink-900/5 sm:p-8">
          <div className="flex rounded-full bg-ink-100 p-1">
            {(
              [
                { value: "background_removal", label: "Remove background" },
                { value: "lifestyle", label: "Lifestyle scene" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setMode(opt.value)}
                className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  mode === opt.value ? "bg-white text-ink-900 shadow-sm" : "text-ink-500"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {mode === "background_removal" ? (
            <div className="mt-5">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={onFile}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ink-300 bg-ink-50/50 px-6 py-10 text-center transition-all hover:border-brand-400 hover:bg-brand-50/40"
              >
                <svg className="h-8 w-8 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M14 8h.01M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-semibold text-ink-800">
                  {imageData ? "Change image" : "Upload product photo"}
                </span>
                <span className="text-xs text-ink-400">PNG, JPG · up to 8 MB</span>
              </button>
              {imageData ? (
                <div className="mt-3 overflow-hidden rounded-2xl border border-ink-200 bg-ink-50 p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageData} alt="Source" className="mx-auto max-h-56 rounded-xl object-contain" />
                </div>
              ) : null}
            </div>
          ) : (
            <div className="mt-5">
              <label htmlFor="ph-prompt" className="mb-1.5 block text-sm font-medium text-ink-700">
                Scene description
              </label>
              <textarea
                id="ph-prompt"
                className={`${fieldClasses} min-h-28 resize-y`}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="On a rustic wooden table in warm morning light…"
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {LIFESTYLE_PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPrompt(p)}
                    className="rounded-full border border-ink-200 bg-white px-2.5 py-1 text-[11px] text-ink-600 hover:bg-ink-50"
                  >
                    {p.slice(0, 38)}…
                  </button>
                ))}
              </div>
            </div>
          )}

          {error ? (
            <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <button
            type="button"
            onClick={run}
            disabled={busy}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-500/40 disabled:opacity-60"
          >
            {busy
              ? mode === "background_removal"
                ? "Removing background…"
                : "Generating scene…"
              : "Generate image"}
          </button>
          <p className="mt-2 text-center text-xs text-ink-400">
            Each generation counts as 2 listings from your monthly quota.
          </p>
        </div>

        <div className="rounded-3xl border border-ink-200/80 bg-white p-6 shadow-lg shadow-ink-900/5 sm:p-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-400">Result</h2>
          {busy ? (
            <div className="mt-4 grid h-72 place-items-center rounded-2xl border border-dashed border-ink-300 bg-ink-50/50">
              <p className="text-sm text-ink-500">Working on it…</p>
            </div>
          ) : job?.resultUrl ? (
            <div className="mt-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={job.resultUrl}
                alt="Generated"
                className="mx-auto max-h-80 rounded-2xl border border-ink-200 object-contain shadow-md"
              />
              <div className="mt-3 flex gap-2">
                <a
                  href={job.resultUrl}
                  download="listinglauncher-photo.png"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-ink-900 px-4 py-2 text-xs font-semibold text-white"
                >
                  Download
                </a>
                <a
                  href={job.resultUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white px-4 py-2 text-xs font-semibold text-ink-700"
                >
                  Open full size
                </a>
              </div>
            </div>
          ) : (
            <div className="mt-4 grid h-72 place-items-center rounded-2xl border border-dashed border-ink-300 bg-ink-50/50 text-center">
              <p className="px-6 text-sm text-ink-500">
                Your generated image will appear here. Try removing the background from a
                phone snap of your product, or describe a lifestyle scene.
              </p>
            </div>
          )}
        </div>
      </div>

      {history.length > 0 ? (
        <div className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-400">Recent photos</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {history.map((j) =>
              j.resultUrl ? (
                <a
                  key={j.id}
                  href={j.resultUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={j.resultUrl} alt="" className="h-40 w-full object-cover" />
                  <p className="px-3 py-1.5 text-[11px] text-ink-500">
                    {j.mode === "background_removal" ? "BG removed" : "Lifestyle"} ·{" "}
                    {new Date(j.createdAt).toLocaleDateString()}
                  </p>
                </a>
              ) : null
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
