import { claimWaitlistCode, getSessionAccount, SESSION_COOKIE } from "@/lib/store";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  const account = token ? await getSessionAccount(token) : null;
  if (!account) {
    return Response.json({ error: "Sign in to claim your code." }, { status: 401 });
  }
  let body: { code?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }
  const code = (body.code ?? "").trim().toUpperCase();
  if (!code) return Response.json({ error: "Enter your code." }, { status: 400 });

  const result = await claimWaitlistCode(code, account.id);
  if (!result.ok) return Response.json({ error: result.error }, { status: 400 });
  return Response.json({ ok: true, bonusCredits: 10 });
}
