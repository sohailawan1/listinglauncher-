/**
 * Health check + setup audit. Returns which integrations are configured
 * so the owner knows what to set up next.
 */
export function getSetupStatus() {
  return {
    openrouter: Boolean(process.env.OPENROUTER_API_KEY),
    upstash: Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN),
    stripe: Boolean(process.env.STRIPE_SECRET_KEY),
    stripePrices: Boolean(
      process.env.STRIPE_PRICE_PRO_MONTHLY && process.env.STRIPE_PRICE_BUSINESS_MONTHLY
    ),
    stripeWebhook: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
    resend: Boolean(process.env.RESEND_API_KEY),
    replicate: Boolean(process.env.REPLICATE_API_TOKEN),
    adminPassword: Boolean(process.env.ADMIN_PASSWORD),
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? null,
  };
}
