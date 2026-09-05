"use client";

import { useEffect, useState } from "react";

type Status = {
  ready: boolean;
  status: {
    openrouter: boolean;
    upstash: boolean;
    stripe: boolean;
    resend: boolean;
    replicate: boolean;
  };
};

export function SetupBanner() {
  const [data, setData] = useState<Status | null>(null);
  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {});
  }, []);
  if (!data) return null;
  if (data.status.openrouter && data.status.stripe) return null;

  const missing: string[] = [];
  if (!data.status.openrouter) missing.push("OpenRouter");
  if (!data.status.stripe) missing.push("Stripe payments");
  if (!data.status.upstash) missing.push("Upstash Redis");
  if (!data.status.resend) missing.push("Resend email");
  if (!data.status.replicate) missing.push("Replicate (lifestyle scenes)");
  if (missing.length === 0) return null;

  return (
    <div className="border-b border-amber-200 bg-amber-50/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-2 text-xs sm:px-6">
        <p className="text-amber-800">
          <strong>Owner note:</strong> {missing.length} service{missing.length === 1 ? "" : "s"} not configured
          {" "}&mdash; {missing.slice(0, 4).join(", ")}
          {missing.length > 4 ? "..." : ""}. App still works; payments and email just won&apos;t go through.
        </p>
        <a
          href="/setup"
          className="shrink-0 rounded-full border border-amber-300 bg-white px-3 py-1 font-semibold text-amber-800 transition-all hover:-translate-y-0.5"
        >
          See setup
        </a>
      </div>
    </div>
  );
}
