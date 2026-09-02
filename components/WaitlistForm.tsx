"use client";

import { useState } from "react";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
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
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Could not sign you up.");
        return;
      }
      setStatus("done");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Network error");
    }
  }

  if (status === "done") {
    return (
      <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
        <p className="font-semibold">You&apos;re on the list 🎉</p>
        <p className="mt-1">We&apos;ll email you the moment your photo credits are live.</p>
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
