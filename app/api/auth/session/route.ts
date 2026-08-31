import { deleteSession, getSessionAccount, SESSION_COOKIE } from "@/lib/store";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function GET(): Promise<Response> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  const account = token ? await getSessionAccount(token) : null;

  if (!account) {
    return Response.json({ account: null });
  }

  return Response.json({
    account: { email: account.email, name: account.name, plan: account.plan, id: account.id },
  });
}

export async function DELETE(): Promise<Response> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await deleteSession(token);
  jar.delete(SESSION_COOKIE);
  return Response.json({ ok: true });
}
