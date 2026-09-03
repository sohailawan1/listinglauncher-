# ListingLauncher

An AI product-listing generator for e-commerce sellers. Write titles, descriptions, tags, and SEO keywords for Etsy, Amazon, Shopify, and eBay in about 10 seconds. Includes a **Listing Audit** (score 0–100 + rewrite), **Bulk CSV** mode, a **Creator Marketplace** where sellers hire TikTok/Instagram/YouTube creators, an **AI Photo Studio** with free background removal + paid FLUX 1.1 Pro lifestyle scenes, and an **Affiliate program** (30% recurring for 12 months).

---

## What's new (full feature list)

| Tool | What it does | URL |
|---|---|---|
| **Listing Generator** | Writes a complete listing from a one-line description | `/generate` |
| **Listing Audit** | Scores an existing listing 0–100 and rewrites it | `/audit` |
| **Bulk CSV** | Upload a catalog, get all listings, download CSV | `/bulk` |
| **AI Photo Studio** | Free unlimited background removal + $1–$2 lifestyle scenes | `/photo` |
| **Creator Marketplace** | Browse vetted creators, book promotions, escrow-protected | `/creators` |
| **Creator Application** | Apply to be a creator (Stripe Connect onboarding) | `/creators/apply` |
| **Creator Dashboard** | Manage bookings, accept work, see earnings | `/creators/dashboard` |
| **Library** | Every generated listing auto-saved | `/library` |
| **Affiliate program** | 30% recurring for 12 months via custom link | `/affiliate` |
| **Outreach Kit** | Copy-paste DM scripts to recruit creators | `/pitch` |
| **Blog (SEO)** | 3 deep-dive posts on Etsy/Amazon/Shopify SEO | `/blog` |
| **Owner dashboard** | Users, bookings, creators, errors, MRR | `/admin` |

---

## Tech

- [Next.js 16](https://nextjs.org) (App Router, Turbopack) · React 19
- [OpenRouter](https://openrouter.ai) — AI listing generation
- [Stripe](https://stripe.com) — subscriptions + Connect (creator payouts) + Checkout
- [Upstash Redis](https://upstash.com) — accounts, usage metering, rate limits (optional in dev)
- [Resend](https://resend.com) — transactional email
- [Replicate](https://replicate.com) — FLUX 1.1 Pro for lifestyle scenes
- [@imgly/background-removal-node](https://github.com/imgly/background-removal-node) — free, in-process BG removal

---

## Getting started (local dev)

```bash
npm install
cp .env.example .env.local
# Edit .env.local and add your OPENROUTER_API_KEY (required for listing
# generation). Other vars are optional for local dev.
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Optional env vars (with free tier where available)

| Var | Required for | Free? |
|---|---|---|
| `OPENROUTER_API_KEY` | Listing generation, audit | Free credits on signup |
| `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` | Production persistence (accounts, usage) | 500K commands/month free |
| `STRIPE_SECRET_KEY` | Subscriptions + creator Connect onboarding | Test mode free |
| `STRIPE_PRICE_PRO_MONTHLY` | Pro plan ($9/mo) | — |
| `STRIPE_PRICE_BUSINESS_MONTHLY` | Business plan ($29/mo) | — |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature verification | — |
| `RESEND_API_KEY` + `RESEND_FROM` | Transactional email | 100 emails/day free |
| `REPLICATE_API_TOKEN` | AI lifestyle scenes (FLUX 1.1 Pro) | Free credit on signup |
| `ADMIN_PASSWORD` | Owner dashboard at `/admin` | — |

Without Redis the app runs on a file-backed store in dev (`.next/cache/ll-store.json`) so accounts persist across Next dev module reloads. **In production you must configure Upstash Redis** — every serverless instance has its own memory and accounts will not persist otherwise.

---

## Plans & pricing

| | Free | Pro $9/mo | Business $29/mo |
|---|---|---|---|
| Listings / month | 3 | 300 | 2,000 |
| Audits / month | 1 | 100 | 500 |
| Bulk CSV | — | 50 rows | 200 rows |
| AI Photo Studio — Background removal | Unlimited, free | Unlimited, free | Unlimited, free |
| AI Photo Studio — Lifestyle scenes | Pay per image | Pay per image | Pay per image |
| Creator marketplace | ✅ | ✅ | ✅ |
| Affiliate program (earn 30%) | ✅ | ✅ | ✅ |

Lifestyle images are paid separately: **$1 for 1024px standard**, **$2 for 1536px HD**. Powered by Black Forest Labs FLUX 1.1 Pro. No watermark, no platform logo.

---

## Cost math (per plan, worst case usage)

| Plan | AI cost | Stripe fee (3%) | Net to you | Margin |
|---|---|---|---|---|
| Free | ~$0.01 | $0 | -$0.01 | Marketing cost |
| Pro $9 | ~$0.40 (300 listings) | $0.59 | $8.01 | **89%** |
| Business $29 | ~$2.50 (2,000 listings) | $1.19 | $25.31 | **87%** |
| Lifestyle image (sold separately) | $0.04 FLUX | $0.03 (3%) | $0.93 (std) / $1.93 (HD) | **93–96%** |
| Creator booking (escrow) | $0 AI | $0 (paid) | 15% of booking | **Pure margin** |

---

## Architecture overview

```
Request → Route handler
              │
              ├─ Auth (scrypt + cookie session) ───────────┐
              │                                             │
              ├─ Rate limit (per-IP burst)                  │
              │                                             │
              ├─ Plan check (lib/usage-server) ────────────┤
              │                                             │
              ├─ AI call (lib/ai → OpenRouter)              │
              │                                             │
              └─ Record usage (lib/store) ────→ Upstash Redis (production)
                                                   File-backed (dev: .next/cache/ll-store.json)
```

The owner dashboard at `/admin` shows real-time MRR, listings, audits, errors, creators, bookings, and platform-fee revenue.

---

## Project structure

```
app/
  page.tsx                      # Landing
  generate/                     # Listing Generator
  audit/                        # Listing Audit
  bulk/                         # Bulk CSV
  photo/                        # AI Photo Studio
  creators/                     # Public marketplace + apply + dashboard
  library/                      # Saved listings
  account/                      # Login / register / plan / claim code
  affiliate/                    # 30% recurring program
  pitch/                        # Outreach scripts for owners
  blog/                         # SEO content
  admin/                        # Owner dashboard
  api/
    auth/                       # Register, login, session
    generate/                   # POST: AI listing
    audit/                      # POST: AI audit
    bulk/                       # POST: bulk listings
    photo/                      # POST: background removal / lifestyle
    lifestyle/checkout + verify # Per-image Stripe Checkout
    creators/                   # Apply, list, profile, reviews
    bookings/                   # Create, accept, deliver, complete
    affiliate/                  # Join, referrals
    waitlist/                   # Email capture with code
    admin/                      # Owner endpoints
  sitemap.ts                    # SEO sitemap
  robots.ts                     # SEO robots

components/                     # Client UI
lib/
  ai.ts                         # OpenRouter client with reasoning-model recovery
  store.ts                      # Accounts, usage, creators, bookings, photos
  stripe.ts                     # Subscriptions, Connect, checkout, payouts
  email.ts                      # Resend templates
  images.ts                     # In-process BG removal + Replicate FLUX
  prompt.ts                     # AI prompts for each marketplace
  plans.ts                      # Plan limits + feature copy
  blog.ts                       # Static SEO posts
  types.ts                      # Shared types

middleware/                      # (none — auth in route handlers)
```

---

## API surface

| Method | Path | Auth | Notes |
|---|---|---|---|
| `POST` | `/api/auth` | — | Register or login |
| `GET/DELETE` | `/api/auth/session` | — | Current session |
| `POST` | `/api/generate` | Account | Returns listing + usage counters |
| `POST` | `/api/audit` | Account | Returns report + usage |
| `POST` | `/api/bulk` | Account | Returns listings (cap by plan) |
| `POST` | `/api/photo` | Account | BG removal (free) or lifestyle (paid) |
| `POST` | `/api/lifestyle/checkout` | Account | Stripe Checkout for lifestyle image |
| `POST` | `/api/lifestyle/verify` | Account | Verify a paid session |
| `GET/POST` | `/api/creators/apply` | Account | Apply / view my profile |
| `GET` | `/api/creators` | — | Browse approved creators |
| `GET` | `/api/creators/[id]` | — | Public creator profile + reviews |
| `POST` | `/api/creators/[id]/review` | Account | Post review |
| `GET/POST` | `/api/creators/onboard` | Account | Stripe Connect Express onboarding link |
| `GET/POST/PATCH` | `/api/bookings` | Account | Create / list / accept / deliver / complete |
| `GET/POST` | `/api/affiliate` | Account | Join program / view referrals |
| `POST` | `/api/waitlist` | — | Email capture (returns code) |
| `POST` | `/api/waitlist/claim` | Account | Redeem waitlist code for 5 free photo credits |
| `GET/POST/DELETE` | `/api/admin/stats` | Admin password | Owner dashboard data |
| `PATCH` | `/api/admin/creators` | Admin password | Approve / reject creators |
| `POST` | `/api/admin/release` | Admin password | Release creator payout (escrow) |

---

## Deploying to Vercel

1. Push to GitHub (already done).
2. Import the repo in Vercel — auto-detects Next.js.
3. Add every env var from `.env.example` in **Project → Settings → Environment Variables**.
4. Deploy. Vercel auto-deploys on every push to `main`.

---

## Owner dashboard

`/admin` (password protected, configured by `ADMIN_PASSWORD` env var) shows:

- Total / free / pro / business accounts
- Today's + week's + month's listings, audits, visits
- Estimated subscription MRR
- Creator marketplace fees earned (15% of completed bookings)
- AI cost estimate (~$0.0005 per listing)
- Pending creator applications (with Approve / Reject buttons)
- Bookings ready for payout release
- Errors by category
- Newest accounts

---

## License

MIT — your project, your code.
