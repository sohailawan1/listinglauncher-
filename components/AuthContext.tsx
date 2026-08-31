"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

export type SessionAccount = {
  email: string;
  name: string;
  plan: "free" | "pro" | "business";
  id?: string;
};

type AuthState = {
  account: SessionAccount | null;
  loading: boolean;
  refresh: () => Promise<void>;
  login: (email: string, password: string) => Promise<string | null>;
  register: (name: string, email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Fetch the session once on first mount; state updates happen inside the
  // async callback (not synchronously in the effect body).
  const [account, setAccount] = useState<SessionAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchedOnce = useRef(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session");
      const data = (await res.json()) as { account: SessionAccount | null };
      setAccount(data.account);
    } catch {
      setAccount(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load the session once on mount. All state updates happen asynchronously
  // (after the fetch resolves), never synchronously inside the effect body.
  useEffect(() => {
    if (fetchedOnce.current) return;
    fetchedOnce.current = true;
    void refresh();
  }, [refresh]);

  const login = useCallback(
    async (email: string, password: string): Promise<string | null> => {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", email, password }),
      });
      const data = (await res.json()) as { account?: SessionAccount; error?: string };
      if (!res.ok || !data.account) return data.error ?? "Login failed.";
      setAccount(data.account);
      return null;
    },
    []
  );

  const register = useCallback(
    async (name: string, email: string, password: string): Promise<string | null> => {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "register", name, email, password }),
      });
      const data = (await res.json()) as { account?: SessionAccount; error?: string };
      if (!res.ok || !data.account) return data.error ?? "Registration failed.";
      setAccount(data.account);
      return null;
    },
    []
  );

  const logout = useCallback(async () => {
    await fetch("/api/auth/session", { method: "DELETE" });
    setAccount(null);
  }, []);

  return (
    <AuthContext.Provider value={{ account, loading, refresh, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

