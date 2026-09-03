"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthContext";

export function ClaimCodeForm() {
  const { account } = useAuth();
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  if (!account) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setMessage(null);
    try {
      const res = await fetch("/api/waitlist/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Could not claim the code.");
        return;
      }
      setStatus("ok");
      setMessage("5 free photo credits added to your account 🎉");
      setCode("");
    } catch {
      setStatus("error");
      setMessage("Network error");
    }
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-ink-200/80 bg-white p-5 shadow-sm"
    >
      <h3 className="text-sm font-semibold text-ink-900">Have a waitlist code?</h3>
      <p className="mt-1 text-xs text-ink-500">
        Claim 5 free photo credits (1 credit per background removal).
      </p>
      <div className="mt-3 flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter your 8-char code"
          className="flex-1 rounded-lg border border-ink-200 bg-white px-3 py-2 font-mono text-sm uppercase tracking-wider shadow-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15"
        />
        <button
          type="submit"
          disabled={!code || status === "sending"}
          className="rounded-full bg-ink-900 px-4 py-2 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-ink-700 disabled:opacity-60"
        >
          {status === "sending" ? "Claiming…" : "Claim"}
        </button>
      </div>
      {message ? (
        <p
          className={`mt-2 text-xs ${
            status === "ok" ? "text-green-700" : "text-red-600"
          }`}
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
