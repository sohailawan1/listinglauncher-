import { getSetupStatus } from "@/lib/setup";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Setup Status",
  robots: { index: false, follow: false },
};

const SERVICES: {
  key: keyof ReturnType<typeof getSetupStatus>;
  name: string;
  required: boolean;
  freeTier: string;
  purpose: string;
  signupUrl: string;
  envVars: string[];
}[] = [
  {
    key: "openrouter",
    name: "OpenRouter",
    required: true,
    freeTier: "Free credits on signup",
    purpose: "AI listing generation (DeepSeek v4 Flash)",
    signupUrl: "https://openrouter.ai/keys",
    envVars: ["OPENROUTER_API_KEY"],
  },
  {
    key: "upstash",
    name: "Upstash Redis",
    required: false,
    freeTier: "500K commands/month",
    purpose: "Account + usage persistence in production (without it, accounts reset on every deploy)",
    signupUrl: "https://upstash.com",
    envVars: ["UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN"],
  },
  {
    key: "stripe",
    name: "Stripe",
    required: false,
    freeTier: "Test mode forever",
    purpose: "Pro $9 + Business $29 subscriptions, creator Connect payouts, lifestyle image checkout",
    signupUrl: "https://dashboard.stripe.com",
    envVars: ["STRIPE_SECRET_KEY", "STRIPE_PRICE_PRO_MONTHLY", "STRIPE_PRICE_BUSINESS_MONTHLY", "STRIPE_WEBHOOK_SECRET"],
  },
  {
    key: "resend",
    name: "Resend",
    required: false,
    freeTier: "100 emails/day, 3K/month",
    purpose: "Booking confirmations, payout notifications, review requests",
    signupUrl: "https://resend.com",
    envVars: ["RESEND_API_KEY", "RESEND_FROM"],
  },
  {
    key: "replicate",
    name: "Replicate",
    required: false,
    freeTier: "Free credit on signup",
    purpose: "FLUX 1.1 Pro for AI lifestyle scenes (background removal works without it, free)",
    signupUrl: "https://replicate.com",
    envVars: ["REPLICATE_API_TOKEN"],
  },
  {
    key: "adminPassword",
    name: "Admin password",
    required: false,
    freeTier: "Set any string",
    purpose: "Locks the /admin dashboard. Without it, /admin is inaccessible.",
    signupUrl: "",
    envVars: ["ADMIN_PASSWORD"],
  },
];

export default function SetupPage() {
  const status = getSetupStatus();
  const configuredCount = SERVICES.filter((s) => status[s.key]).length;
  const totalCount = SERVICES.length;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <span className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-ink-100 px-3.5 py-1 text-xs font-semibold text-ink-600">
        Setup status
      </span>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
        {configuredCount} / {totalCount} integrations configured
      </h1>
      <p className="mt-2 text-ink-600">
        Add these env vars in <strong>Vercel → Project → Settings → Environment Variables</strong> to
        turn on the rest of the app.
      </p>

      <div className="mt-8 space-y-3">
        {SERVICES.map((s) => {
          const ok = status[s.key];
          return (
            <div
              key={s.key}
              className={`rounded-2xl border p-5 ${
                ok
                  ? "border-green-200 bg-green-50/60"
                  : s.required
                    ? "border-red-200 bg-red-50/60"
                    : "border-ink-200 bg-white"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold text-white ${
                      ok ? "bg-green-600" : s.required ? "bg-red-500" : "bg-ink-300"
                    }`}
                  >
                    {ok ? "✓" : "!"}
                  </span>
                  <div>
                    <p className="font-semibold text-ink-900">{s.name}</p>
                    <p className="mt-0.5 text-xs text-ink-500">{s.purpose}</p>
                  </div>
                </div>
                <div className="text-right text-xs">
                  <span className="font-semibold text-green-700">{s.freeTier}</span>
                  {s.signupUrl ? (
                    <>
                      {" · "}
                      <a
                        href={s.signupUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-brand-600 hover:underline"
                      >
                        Sign up →
                      </a>
                    </>
                  ) : null}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {s.envVars.map((v) => (
                  <code
                    key={v}
                    className={`rounded-md px-2 py-1 font-mono text-[11px] ${
                      ok ? "bg-green-100 text-green-800" : "bg-ink-100 text-ink-700"
                    }`}
                  >
                    {v}
                  </code>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 rounded-3xl border border-ink-200/80 bg-white p-6 shadow-sm">
        <h2 className="text-base font-bold text-ink-900">How to set them in Vercel</h2>
        <ol className="mt-3 space-y-2 text-sm text-ink-600">
          <li>1. Open <strong>Vercel</strong> → your project → <strong>Settings → Environment Variables</strong></li>
          <li>2. Paste each key from the rows above</li>
          <li>3. Click <strong>Save</strong></li>
          <li>4. Go to <strong>Deployments</strong> → click latest → <strong>Redeploy</strong></li>
          <li>5. Reload <a className="text-brand-600 underline" href="/setup">/setup</a> to verify</li>
        </ol>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm">
        <Link href="/" className="font-semibold text-brand-600 hover:underline">
          ← Back to home
        </Link>
        <Link href="/admin" className="font-semibold text-ink-500 hover:underline">
          /admin (owner dashboard)
        </Link>
      </div>
    </main>
  );
}
