type Bucket = {
  count: number;
  resetAt: number;
};

// In-memory sliding-window limiter. Good enough to stop scripted abuse on a
// single instance; for hard guarantees behind a load balancer, move this to
// Redis or a database. Real per-user quotas require auth + storage (see README).
const buckets = new Map<string, Bucket>();

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 20;

function now(): number {
  return Date.now();
}

function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

export function rateLimit(request: Request): {
  allowed: boolean;
  retryAfterSeconds: number;
} {
  const ip = clientIp(request);
  const key = `generate:${ip}`;
  const t = now();

  let bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= t) {
    bucket = { count: 0, resetAt: t + WINDOW_MS };
    buckets.set(key, bucket);
  }

  bucket.count += 1;

  if (bucket.count > MAX_PER_WINDOW) {
    return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - t) / 1000)) };
  }

  return { allowed: true, retryAfterSeconds: 0 };
}