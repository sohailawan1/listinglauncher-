# ListingLauncher

An AI-powered micro-SaaS that writes professional e-commerce product listings in seconds. Built for a zero-budget launch.

**The product:** A seller describes their product once. AI writes a complete listing — title, short title, description, key benefits, tags, and search keywords — formatted and optimized for Etsy, Amazon, Shopify, or eBay.

**The model:** Free tier = 3 listings/month. Pro = $9/month for unlimited (via Stripe subscriptions).

Tech: [Next.js 16](https://nextjs.org) (App Router, Turbopack) · React 19 · Tailwind CSS v4 · OpenRouter API (DeepSeek V4 Flash) · Stripe Checkout.

---

## Getting started (local dev)

```bash
# 1. Install dependencies
npm install

# 2. Copy the env template and fill it in
cp .env.example .env.local
```

Required env vars:

| Variable                       | Required | Purpose                                                        |
| ------------------------------ | -------- | -------------------------------------------------------------- |
| `OPENROUTER_API_KEY`           | Yes*     | Powers listing generation. Get one free at openrouter.ai/keys. |
| `OPENROUTER_MODEL`             | No       | Model to use (default: `deepseek/deepseek-v4-flash-0731`).     |
| `NEXT_PUBLIC_SITE_URL`         | No       | Your public URL. Used for the API referrer.                    |
| `STRIPE_SECRET_KEY`            | No*      | Enables Pro checkout. Get one at dashboard.stripe.com.         |
| `STRIPE_PRICE_PRO_MONTHLY`     | No*      | Price ID of your $9/month subscription (see below).            |
| `STRIPE_WEBHOOK_SECRET`        | No*      | For processing Stripe webhooks.                                |

\* The app runs without these, but: without `OPENROUTER_API_KEY` the generator returns a friendly "not configured" message, and without Stripe vars the "Go Pro" button explains payments aren't set up yet.

```bash
# 3. Run it
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## How it's structured

```
app/
  page.tsx                  # Landing page (marketing, pricing, features)
  generate/page.tsx         # The actual tool
  api/
    generate/route.ts       # POST: calls OpenRouter, returns a structured listing
    checkout/route.ts       # POST: creates a Stripe Checkout session
    webhook/route.ts        # POST: Stripe subscription lifecycle events
components/
  SiteHeader.tsx            # Nav + CTA
  SiteFooter.tsx
  Generator.tsx             # Tool UI: form, AI call, result cards, copy buttons
  CheckoutButton.tsx        # Pricing "Go Pro" -> Stripe
lib/
  plans.ts                  # Free / Pro plan definitions
  prompt.ts                 # The AI prompt (system + user) and JSON contract
  stripe.ts                 # Stripe client + checkout session helper
  types.ts                  # ListingInput / GeneratedListing types
  usage.ts                  # Client-side free-tier credit tracking (localStorage)
```

---

## Zero-budget launch checklist (in order)

### 1. Get your free API key
Go to [openrouter.ai/keys](https://openrouter.ai/keys), create an account, click "Create Key", and paste it into `.env.local` as `OPENROUTER_API_KEY`. OpenRouter gives every new account free credits — enough to test the tool without spending a cent.

> Tip: want a totally free ongoing model? OpenRouter also lists `:free` models. Swap `OPENROUTER_MODEL` to something like `z-ai/glm-5.2:free` (see `/models` docs). Good for launch; DeepSeek V4 Flash is cheap enough to keep on paid once traffic arrives.

Update `lib/prompt.ts` if you want a different model behavior. The default model costs ~$0.03/M input — a single listing costs well under $0.01.

### 2. Launch on free hosting (Vercel)
1. Push this folder to a GitHub repository.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. Vercel auto-detects Next.js. Add your env vars from `.env.local` in Project → Settings → Environment Variables.
4. Deploy. You get a free `your-app.vercel.app` domain. This is your public URL — set it as `NEXT_PUBLIC_SITE_URL`.

### 3. Set up payments (Stripe, free to start)
1. Create an account at [dashboard.stripe.com](https://dashboard.stripe.com). No monthly fee.
2. Products → Add product → name "ListingLauncher Pro", price **Recurring** → $9.00 / monthly.
3. Copy the **Price ID** (starts with `price_`) → `STRIPE_PRICE_PRO_MONTHLY`.
4. Copy your **Secret key** (starts with `sk_live_`) → `STRIPE_SECRET_KEY`. (Use `sk_test_` while testing.)
5. For the webhook, run the Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhook
   ```
   Copy the `whsec_` signing secret → `STRIPE_WEBHOOK_SECRET`. Then when live, add the webhook at Dashboard → Developers → Webhooks → add endpoint `https://your-app.vercel.app/api/webhook`.

### 4. Test the whole flow
- Generate a listing on the free tier (3/month). Confirm results appear in the cards and the credit counter drops.
- Click "Go Pro" → your Stripe test card (`4242 4242 4242 4242`) → after checkout you're redirected to `/generate?upgraded=1`, which marks you Pro.
- Confirm the cancel/subscription events arrive at `/api/webhook`.

### 5. Launch & get your first users (free)
- Post in Etsy/Amazon seller Facebook groups, Reddit (r/Etsy, r/AmazonSeller), and Discord seller communities. Show a before/after sample listing.
- Share your landing page on TikTok/Shorts with a "I wrote this listing in 10 seconds" demo.
- Collect emails early; a simple "1 free week" launch offer converts well.

---

## Known limitations (honest)

- **Usage limiting is client-side.** The 3/month counter lives in the browser's `localStorage` and can be bypassed by clearing it. For a real paid product, add real auth + a database (e.g. Supabase free tier) and gate the `/api/generate` endpoint server-side. The webhook in `lib/stripe.ts` and `api/webhook/route.ts` is already structured for this — hook the events up to your user records.
- **No user accounts yet.** Great for validating demand; required before scale.

## Production-ready next steps

1. Add Auth (Supabase/Gotrue, or NextAuth) and link Stripe `customer.email` to a user row.
2. Move credit counting into the database and enforce it in `api/generate`.
3. Add bulk CSV listing generation as a Pro upsell.
4. Redirect success/cancel pages to friendly UI (`app/success`, `app/cancel`).

---

## Scripts

```bash
npm run dev      # development server (Turbopack)
npm run build    # production build
npm run start    # run the production build
npm run lint     # ESLint
```