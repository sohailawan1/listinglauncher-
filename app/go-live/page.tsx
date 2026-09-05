import { getSetupStatus } from "@/lib/setup";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Go Live in 10 Minutes",
  robots: { index: false, follow: false },
};

export default function GoLivePage() {
  const status = getSetupStatus();
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <span className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3.5 py-1 text-xs font-semibold text-green-700">
        10-minute setup
      </span>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
        Turn on payments in 10 minutes
      </h1>
      <p className="mt-2 text-ink-600">
        You already have the site live on Vercel. Now wire up the 4 services that
        make it earn money. You only do this once.
      </p>

      <ol className="mt-8 space-y-6">
        <Step n={1} title="Sign up for Upstash Redis (2 min) — free">
          <p>Go to <a className="font-semibold text-brand-600 underline" href="https://upstash.com" target="_blank" rel="noreferrer">upstash.com</a> → Create account → Create database (pick the closest region to your Vercel region).</p>
          <p>Copy the <strong>REST URL</strong> and <strong>REST Token</strong> from the dashboard.</p>
          <ConfigVars
            current={[
              ["UPSTASH_REDIS_REST_URL", status.upstash],
              ["UPSTASH_REDIS_REST_TOKEN", status.upstash],
            ]}
          />
          <p className="text-xs text-ink-500">Without this, accounts reset when Vercel pauses your lambda (~10 min of no traffic).</p>
        </Step>

        <Step n={2} title="Sign up for Stripe (3 min) — free test mode">
          <p>Go to <a className="font-semibold text-brand-600 underline" href="https://dashboard.stripe.com" target="_blank" rel="noreferrer">dashboard.stripe.com</a> → create account. Make sure <strong>Test mode</strong> is toggled on (top right).</p>
          <p>Developers → API keys → copy the <strong>Secret key</strong> (starts with <code>sk_test_</code>).</p>
          <ConfigVars
            current={[["STRIPE_SECRET_KEY", status.stripe]]}
          />
        </Step>

        <Step n={3} title="Create the 2 subscription products (2 min)">
          <p>In Stripe: <strong>Products → Add product</strong></p>
          <ul className="ml-4 mt-2 list-disc text-sm text-ink-700">
            <li><strong>ListingLauncher Pro</strong> — Recurring · $9.00 USD / monthly → copy its <code>price_...</code> ID</li>
            <li><strong>ListingLauncher Business</strong> — Recurring · $29.00 USD / monthly → copy its <code>price_...</code> ID</li>
          </ul>
          <ConfigVars
            current={[
              ["STRIPE_PRICE_PRO_MONTHLY", status.stripePrices],
              ["STRIPE_PRICE_BUSINESS_MONTHLY", status.stripePrices],
            ]}
          />
        </Step>

        <Step n={4} title="Add the webhook (1 min)">
          <p>Stripe → <strong>Developers → Webhooks → Add endpoint</strong></p>
          <ul className="ml-4 mt-2 list-disc text-sm text-ink-700">
            <li>URL: <code>https://listinglauncher.vercel.app/api/webhook</code></li>
            <li>Events: <code>checkout.session.completed</code>, <code>customer.subscription.created</code>, <code>customer.subscription.updated</code>, <code>customer.subscription.deleted</code></li>
            <li>Save → copy the <strong>Signing secret</strong> (starts with <code>whsec_</code>)</li>
          </ul>
          <ConfigVars current={[["STRIPE_WEBHOOK_SECRET", status.stripeWebhook]]} />
        </Step>

        <Step n={5} title="Set an admin password (30 sec)">
          <p>Pick any strong password you&apos;ll remember. This locks <Link href="/admin" className="font-semibold text-brand-600 underline">/admin</Link>.</p>
          <ConfigVars current={[["ADMIN_PASSWORD", status.adminPassword]]} />
        </Step>

        <Step n={6} title="Add Resend (1 min) — optional but recommended">
          <p>Go to <a className="font-semibold text-brand-600 underline" href="https://resend.com" target="_blank" rel="noreferrer">resend.com</a> → create account → API keys → copy the key.</p>
          <ConfigVars
            current={[["RESEND_API_KEY", status.resend]]}
          />
          <p className="text-xs text-ink-500">Without this, booking confirmations and review emails print to the server log instead of being sent.</p>
        </Step>

        <Step n={7} title="Add Replicate (1 min) — optional">
          <p>Go to <a className="font-semibold text-brand-600 underline" href="https://replicate.com" target="_blank" rel="noreferrer">replicate.com</a> → sign up → copy API token. Get free credit to start.</p>
          <ConfigVars
            current={[["REPLICATE_API_TOKEN", status.replicate]]}
          />
          <p className="text-xs text-ink-500">Without this, AI lifestyle scenes don&apos;t work (background removal still does, free).</p>
        </Step>

        <Step n={8} title="Redeploy">
          <p>Vercel → your project → <strong>Deployments</strong> → click the latest deployment → ⋯ menu → <strong>Redeploy</strong>.</p>
          <p>Wait 2 minutes. Reload <Link href="/setup" className="font-semibold text-brand-600 underline">/setup</Link> to verify everything is green.</p>
        </Step>

        <Step n={9} title="Test the full flow">
          <ol className="ml-4 mt-2 list-decimal text-sm text-ink-700">
            <li>Visit your site → sign up</li>
            <li>Click &ldquo;Go Pro&rdquo; &rarr; Stripe checkout opens</li>
            <li>Use test card <code>4242 4242 4242 4242</code> (any future date, any CVC, any ZIP)</li>
            <li>After payment, you&apos;re redirected to <code>/generate?upgraded=1</code></li>
            <li>Open <Link href="/account" className="font-semibold text-brand-600 underline">/account</Link> → plan badge should say <strong>Pro</strong></li>
            <li>Open <Link href="/admin" className="font-semibold text-brand-600 underline">/admin</Link> → accounts.pro should be 1, MRR should show $9</li>
          </ol>
        </Step>

        <Step n={10} title="Go live">
          <p>When you&apos;re ready for real money: in Stripe, toggle off <strong>Test mode</strong> and replace <code>sk_test_</code> with your <code>sk_live_</code> key in Vercel. Redeploy.</p>
          <p>That&apos;s it. You&apos;re taking real payments.</p>
        </Step>
      </ol>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-3 text-sm">
        <Link href="/setup" className="font-semibold text-brand-600 hover:underline">
          ← Back to setup status
        </Link>
        <Link href="/" className="font-semibold text-ink-500 hover:underline">
          Home
        </Link>
      </div>
    </main>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <li className="rounded-3xl border border-ink-200/80 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-sm font-bold text-white shadow-md">
          {n}
        </span>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-ink-900">{title}</h2>
          <div className="mt-3 space-y-2 text-sm leading-relaxed text-ink-700 [&_a]:font-semibold [&_a]:text-brand-600 [&_a]:underline">
            {children}
          </div>
        </div>
      </div>
    </li>
  );
}

function ConfigVars({ current }: { current: [string, boolean][] }) {
  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {current.map(([name, set]) => (
        <code
          key={name}
          className={`rounded-md px-2 py-1 font-mono text-[11px] ring-1 ${
            set ? "bg-green-100 text-green-800 ring-green-200" : "bg-amber-50 text-amber-800 ring-amber-200"
          }`}
        >
          {name} {set ? "✓" : "(missing)"}
        </code>
      ))}
    </div>
  );
}
