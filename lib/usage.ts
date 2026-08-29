import { useSyncExternalStore } from "react";
import { FREE_CREDITS_PER_MONTH } from "@/lib/plans";

export const USAGE_KEY = "ll_usage";
export const PLAN_KEY = "ll_plan";

export type UsageState = {
  month: string;
  used: number;
  plan: "free" | "pro" | null;
};

function monthKey(date = new Date()): string {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

function readStored(): UsageState {
  if (typeof window === "undefined") {
    return { month: monthKey(), used: 0, plan: null };
  }
  try {
    const raw = window.localStorage.getItem(USAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as UsageState;
      if (parsed.month === monthKey()) return parsed;
    }
  } catch {
    // ignore corrupt storage
  }
  const fresh: UsageState = { month: monthKey(), used: 0, plan: null };
  try {
    window.localStorage.setItem(USAGE_KEY, JSON.stringify(fresh));
  } catch {
    // storage may be unavailable (private mode); non-fatal
  }
  return fresh;
}

function readPlan(): "free" | "pro" | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(PLAN_KEY) === "pro" ? "pro" : null;
  } catch {
    return null;
  }
}

const listeners = new Set<() => void>();
let snapshot: UsageState | null = null;

function getSnapshot(): UsageState {
  if (snapshot === null) {
    const stored = readStored();
    snapshot = { ...stored, plan: readPlan() ?? stored.plan };
  }
  return snapshot;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function emit(): void {
  snapshot = null;
  listeners.forEach((l) => l());
}

export function useUsage(): UsageState {
  return useSyncExternalStore(subscribe, getSnapshot, () => ({
    month: monthKey(),
    used: 0,
    plan: null,
  }));
}

export function remainingCredits(usage: UsageState): number {
  return Math.max(0, FREE_CREDITS_PER_MONTH - usage.used);
}

export function isProUsage(usage: UsageState): boolean {
  return usage.plan === "pro";
}

export function setProPlan(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PLAN_KEY, "pro");
  } catch {
    // ignore
  }
  emit();
}

/**
 * Persist a successful free-tier generation and notify the UI.
 * Relies on the caller having already checked `remainingCredits(usage) > 0`.
 */
export function recordGeneration(): void {
  const usage = readStored();
  usage.used += 1;
  try {
    window.localStorage.setItem(USAGE_KEY, JSON.stringify(usage));
  } catch {
    // ignore
  }
  emit();
}