"use client";

import { useState } from "react";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [code, setCode] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setMessage(null);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as { code?: string; error?: string };
      if (!res.ok || !data.code) {
        setStatus("error");
        setMessage(data.error ?? "Could not sign you up.");
        return;
      }
      setStatus("done");
      setCode(data.code);
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Network error");
    }
  }

  if (status === "done" && code) {
    return (
      <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-5 text-sm text-green-800">
        <p className="font-semibold">You&apos;re on the list 🎉</p>
        <p className="mt-1">Save this code — when the photo studio launches, enter it on your account page to claim 5 free photo credits.</p>
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-green-300 bg-white px-4 py-3">
          <span className="font-mono text-2xl font-bold tracking-widest text-green-700">{code}</span>
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(code)}
            className="ml-auto rounded-full border border-green-300 bg-white px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-50"
          >
            Copy
          </button>
        </div>
        <p className="mt-2 text-xs text-green-700">
          Bookmark <code className="rounded bg-white px-1.5 py-0.5">/account</code> and enter this code when the photo studio ships.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-6 flex flex-col gap-3 sm:flex-row">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@yourstore.com"
        className="flex-1 rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15"
      />
      <button
        type="submit"
        disabled={status === "sending" || !email}
        className="rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-ink-700 disabled:opacity-60"
      >
        {status === "sending" ? "Joining…" : "Get early access"}
      </button>
      {message ? <p className="text-sm text-red-600 sm:basis-full">{message}</p> : null}
    </form>
  );
}
