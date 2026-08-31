import {
  createAccount,
  createSession,
  SESSION_COOKIE,
  verifyPassword,
  getAccountByEmail,
  recordVisit,
} from "@/lib/store";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  recordVisit().catch(() => {});

  let body: { action?: string; email?: string; name?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = body.email ?? "";
  const password = body.password ?? "";

  if (body.action === "register") {
    const result = await createAccount(email, body.name ?? "", password);
    if ("error" in result) {
      return Response.json({ error: result.error }, { status: 400 });
    }
    const token = await createSession(result.id);
    const jar = await cookies();
    jar.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    return Response.json({
      account: { email: result.email, name: result.name, plan: result.plan },
    });
  }

  if (body.action === "login") {
    const account = await getAccountByEmail(email);
    if (!account || !verifyPassword(password, account.passwordHash)) {
      return Response.json({ error: "Wrong email or password." }, { status: 401 });
    }
    const token = await createSession(account.id);
    const jar = await cookies();
    jar.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    return Response.json({
      account: { email: account.email, name: account.name, plan: account.plan },
    });
  }

  return Response.json({ error: "Unknown action." }, { status: 400 });
}
