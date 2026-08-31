/**
 * Data layer for accounts, usage metering, and stats.
 *
 * Uses Upstash Redis when configured (UPSTASH_REDIS_REST_URL + TOKEN), so it
 * works on Vercel with multiple instances. Falls back to an in-memory store so
 * the app is fully functional in local dev without any setup.
 */

export type Store = {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  del(key: string): Promise<void>;
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<void>;
  keys(pattern: string): Promise<string[]>;
};

/* ------------------------- Upstash REST adapter ------------------------- */

type UpstashStore = Store & {
  set(key: string, value: string): Promise<void>;
};

function createUpstashStore(url: string, token: string): UpstashStore {
  async function command<T>(...args: (string | number)[]): Promise<T> {
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(args),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Upstash ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const json = (await res.json()) as { result: T };
    return json.result;
  }

  return {
    async get(key) {
      return command<string | null>("GET", key);
    },
    async set(key, value) {
      await command("SET", key, value);
    },
    async del(key) {
      await command<number>("DEL", key);
    },
    async incr(key) {
      return command<number>("INCR", key);
    },
    async expire(key, seconds) {
      await command<number>("EXPIRE", key, seconds);
    },
    async keys(pattern) {
      const result = await command<string[]>("KEYS", pattern);
      return result ?? [];
    },
  };
}

/* ------------------------- In-memory fallback -------------------------- */

function createMemoryStore(): Store {
  const map = new Map<string, string>();
  return {
    async get(key) {
      return map.get(key) ?? null;
    },
    async set(key, value) {
      map.set(key, value);
    },
    async del(key) {
      map.delete(key);
    },
    async incr(key) {
      const next = Number(map.get(key) ?? 0) + 1;
      map.set(key, String(next));
      return next;
    },
    async expire(key, seconds) {
      // TTL approximated: store expiry alongside the value in a side map.
      expirations.set(key, Date.now() + seconds * 1000);
    },
    async keys(pattern) {
      const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
      const now = Date.now();
      for (const [k, exp] of expirations) {
        if (exp <= now) {
          map.delete(k);
          expirations.delete(k);
        }
      }
      return [...map.keys()].filter((k) => regex.test(k));
    },
  };
}

const expirations = new Map<string, number>();

/* ------------------------------ singleton ------------------------------- */

let storeInstance: Store | null = null;

export function getStore(): Store {
  if (storeInstance) return storeInstance;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    storeInstance = createUpstashStore(url, token);
  } else {
    console.warn("[store] UPSTASH_REDIS not configured — using in-memory store. Usage stats reset on restart; do not use in production.");
    storeInstance = createMemoryStore();
  }
  return storeInstance;
}

export function isRedisConfigured(): boolean {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

/* ----------------------------- key helpers ------------------------------ */

export function monthKey(date = new Date()): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function dayKey(date = new Date()): string {
  return `${monthKey(date)}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

function secondsUntilMonthEnd(): number {
  const now = new Date();
  const end = Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1);
  return Math.max(1, Math.ceil((end - now.getTime()) / 1000));
}

function secondsUntilDayEnd(): number {
  const now = new Date();
  const end = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
  return Math.max(1, Math.ceil((end - now.getTime()) / 1000));
}

/* ------------------------------ accounts -------------------------------- */

export type Account = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  plan: "free" | "pro" | "business";
  createdAt: number;
  stripeCustomerId?: string;
};

function hashPassword(password: string, salt: string): string {
  // Built-in crypto scrypt — no external dependency.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { scryptSync } = require("crypto") as typeof import("crypto");
  const derived = scryptSync(password, salt, 32);
  return `${salt}:${derived.toString("hex")}`;
}

export function makePasswordHash(password: string): string {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { randomBytes } = require("crypto") as typeof import("crypto");
  const salt = randomBytes(16).toString("hex");
  return hashPassword(password, salt);
}

export function verifyPassword(password: string, stored: string): boolean {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { timingSafeEqual } = require("crypto") as typeof import("crypto");
  const [salt, hex] = stored.split(":");
  if (!salt || !hex) return false;
  const candidate = Buffer.from(hashPassword(password, salt).split(":")[1], "hex");
  const expected = Buffer.from(hex, "hex");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function createAccount(
  email: string,
  name: string,
  password: string
): Promise<Account | { error: string }> {
  email = email.trim().toLowerCase();
  name = name.trim().slice(0, 80);
  if (!EMAIL_RE.test(email)) return { error: "Enter a valid email address." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (name.length < 1) return { error: "Enter your name." };

  const store = getStore();
  const existing = await store.get(`account:email:${email}`);
  if (existing) return { error: "An account with this email already exists." };

  const id = `u_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
  const account: Account = {
    id,
    email,
    name,
    passwordHash: makePasswordHash(password),
    plan: "free",
    createdAt: Date.now(),
  };

  await store.set(`account:${id}`, JSON.stringify(account));
  await store.set(`account:email:${email}`, id);
  await store.incr(`stats:accounts:total`);
  await store.incr(`stats:accounts:${dayKey()}:new`);
  return account;
}

export async function getAccountByEmail(email: string): Promise<Account | null> {
  const store = getStore();
  const id = await store.get(`account:email:${email.trim().toLowerCase()}`);
  if (!id) return null;
  const raw = await store.get(`account:${id}`);
  if (!raw) return null;
  return JSON.parse(raw) as Account;
}

export async function getAccountById(id: string): Promise<Account | null> {
  const store = getStore();
  const raw = await store.get(`account:${id}`);
  if (!raw) return null;
  return JSON.parse(raw) as Account;
}

export async function updateAccount(account: Account): Promise<void> {
  const store = getStore();
  await store.set(`account:${account.id}`, JSON.stringify(account));
}

/* ------------------------------- sessions -------------------------------- */

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

export async function createSession(accountId: string): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { randomBytes } = require("crypto") as typeof import("crypto");
  const token = randomBytes(32).toString("hex");
  const store = getStore();
  await store.set(`session:${token}`, accountId);
  await store.expire(`session:${token}`, SESSION_TTL_SECONDS);
  return token;
}

export async function getSessionAccount(token: string): Promise<Account | null> {
  if (!token) return null;
  const store = getStore();
  const id = await store.get(`session:${token}`);
  if (!id) return null;
  return getAccountById(id);
}

export async function deleteSession(token: string): Promise<void> {
  await getStore().del(`session:${token}`);
}

export const SESSION_COOKIE = "ll_session";

/* -------------------------------- usage ---------------------------------- */

export type PlanLimits = {
  monthly: number;
  daily: number;
  auditMonthly: number;
  bulkMaxRows: number;
};

export function planLimits(plan: "free" | "pro" | "business"): PlanLimits {
  // Mirror of PLAN_LIMITS in lib/plans.ts, kept local so server code has a
  // single import surface (plans.ts is also imported by client components).
  switch (plan) {
    case "business":
      return { monthly: 2000, daily: 300, auditMonthly: 500, bulkMaxRows: 200 };
    case "pro":
      return { monthly: 300, daily: 50, auditMonthly: 100, bulkMaxRows: 50 };
    default:
      return { monthly: 3, daily: 3, auditMonthly: 1, bulkMaxRows: 0 };
  }
}

export type UsageCheck = {
  allowed: boolean;
  reason?: string;
  usedMonthly: number;
  usedDaily: number;
  limitMonthly: number;
  plan: "free" | "pro" | "business";
};

export async function checkUsage(
  accountId: string,
  plan: "free" | "pro" | "business",
  cost = 1
): Promise<UsageCheck> {
  const store = getStore();
  const limits = planLimits(plan);

  const month = `usage:${accountId}:${monthKey()}`;
  const day = `usage:${accountId}:${dayKey()}`;

  const [usedMonthly, usedDaily] = await Promise.all([
    store.get(month).then((v) => Number(v ?? 0)),
    store.get(day).then((v) => Number(v ?? 0)),
  ]);

  return {
    allowed:
      usedMonthly + cost <= limits.monthly &&
      usedDaily + cost <= limits.daily,
    reason: usedMonthly + cost > limits.monthly
      ? `You reached your ${limits.monthly} listings/month limit. Upgrade your plan for more.`
      : usedDaily + cost > limits.daily
        ? `You reached your daily limit of ${limits.daily} listings. Come back tomorrow or upgrade.`
        : undefined,
    usedMonthly,
    usedDaily,
    limitMonthly: limits.monthly,
    plan,
  };
}

export async function checkAuditUsage(
  accountId: string,
  plan: "free" | "pro" | "business"
): Promise<UsageCheck> {
  const store = getStore();
  const limits = planLimits(plan);
  const auditKey = `usage:${accountId}:audit:${monthKey()}`;
  const used = Number((await store.get(auditKey)) ?? 0);
  return {
    allowed: used + 1 <= limits.auditMonthly,
    reason:
      used + 1 > limits.auditMonthly
        ? `You reached your ${limits.auditMonthly} audits/month limit. Upgrade for more.`
        : undefined,
    usedMonthly: used,
    usedDaily: 0,
    limitMonthly: limits.auditMonthly,
    plan,
  };
}

export async function recordUsage(
  accountId: string,
  amount = 1,
  kind: "listing" | "audit" = "listing"
): Promise<void> {
  const store = getStore();
  const month = `usage:${accountId}:${monthKey()}`;
  const day = `usage:${accountId}:${dayKey()}`;
  const auditKey = `usage:${accountId}:audit:${monthKey()}`;

  const ops: Promise<unknown>[] = [];
  if (kind === "listing") {
    ops.push(store.incr(month).then(() => store.expire(month, secondsUntilMonthEnd())));
    for (let i = 0; i < amount; i++) store.incr(day);
    ops.push(store.expire(day, secondsUntilDayEnd()));
  } else {
    ops.push(store.incr(auditKey).then(() => store.expire(auditKey, secondsUntilMonthEnd())));
  }

  // Global stats for the admin dashboard.
  ops.push(store.incr(`stats:listings:total`));
  ops.push(store.incr(`stats:listings:${dayKey()}`));
  if (kind === "listing" && amount > 1) {
    ops.push(store.incr(`stats:bulk:total`));
  }
  ops.push(store.incr(`stats:api:${dayKey()}:${kind}`));

  await Promise.all(ops);
}

/* ------------------------------ error stats ------------------------------ */

export async function recordError(kind: string): Promise<void> {
  const store = getStore();
  await store.incr(`stats:errors:${kind}:${dayKey()}`);
  await store.incr(`stats:errors:${kind}:total`);
}

/* ------------------------------- visitors --------------------------------- */

export async function recordVisit(): Promise<void> {
  const store = getStore();
  await store.incr(`stats:visits:total`);
  await store.incr(`stats:visits:${dayKey()}`);
}

/* --------------------------------- admin ---------------------------------- */

export type AdminStats = {
  storage: "redis" | "memory";
  accounts: { total: number; newToday: number; free: number; pro: number; business: number };
  visits: { total: number; today: number };
  listings: { total: number; today: number };
  audits: { total: number };
  errors: Record<string, number>;
  recentAccounts: { email: string; name: string; plan: string; createdAt: number }[];
};

async function sumKeys(store: Store, pattern: string): Promise<number> {
  const keys = await store.keys(pattern);
  let total = 0;
  for (const k of keys) total += Number((await store.get(k)) ?? 0);
  return total;
}

export async function getAdminStats(): Promise<AdminStats> {
  const store = getStore();

  const [
    accountsTotal,
    accountsNewToday,
    visitsTotal,
    visitsToday,
    listingsTotal,
    listingsToday,
    auditsTotal,
  ] = await Promise.all([
    sumKeys(store, "stats:accounts:total"),
    sumKeys(store, `stats:accounts:${dayKey()}:new`),
    sumKeys(store, "stats:visits:total"),
    sumKeys(store, `stats:visits:${dayKey()}`),
    sumKeys(store, "stats:listings:total"),
    sumKeys(store, `stats:listings:${dayKey()}`),
    sumKeys(store, `stats:api:*:audit`),
  ]);

  // Count plans by scanning accounts.
  const accountIds = await store.keys("account:u_*");
  let free = 0;
  let pro = 0;
  let business = 0;
  const recentAccounts: AdminStats["recentAccounts"] = [];
  for (const key of accountIds.slice(-100)) {
    const raw = await store.get(key);
    if (!raw) continue;
    try {
      const acc = JSON.parse(raw) as Account;
      if (acc.plan === "pro") pro++;
      else if (acc.plan === "business") business++;
      else free++;
      recentAccounts.push({
        email: acc.email,
        name: acc.name,
        plan: acc.plan,
        createdAt: acc.createdAt,
      });
    } catch {
      // skip corrupt rows
    }
  }
  recentAccounts.sort((a, b) => b.createdAt - a.createdAt);

  // Error counters grouped by kind.
  const errorKeys = await store.keys(`stats:errors:*:${dayKey()}`);
  const errors: Record<string, number> = {};
  for (const key of errorKeys) {
    const parts = key.split(":");
    const kind = parts[2] ?? "unknown";
    errors[kind] = Number((await store.get(key)) ?? 0);
  }

  return {
    storage: isRedisConfigured() ? "redis" : "memory",
    accounts: { total: accountsTotal, newToday: accountsNewToday, free, pro, business },
    visits: { total: visitsTotal, today: visitsToday },
    listings: { total: listingsTotal, today: listingsToday },
    audits: { total: auditsTotal },
    errors,
    recentAccounts: recentAccounts.slice(0, 10),
  };
}

export const ADMIN_COOKIE = "ll_admin";
