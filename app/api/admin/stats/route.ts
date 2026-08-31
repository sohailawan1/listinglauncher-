import { ADMIN_COOKIE, getAdminStats } from "@/lib/store";
import { cookies } from "next/headers";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { timingSafeEqual } = require("crypto") as typeof import("crypto");

export const runtime = "nodejs";
export const maxDuration = 60;

function checkAdminPassword(candidate: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const a = Buffer.from(candidate);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(): Promise<Response> {
  const jar = await cookies();
  if (jar.get(ADMIN_COOKIE)?.value !== "ok") {
    return Response.json({ error: "Not authorized." }, { status: 401 });
  }
  const stats = await getAdminStats();
  return Response.json({ stats });
}

export async function POST(request: Request): Promise<Response> {
  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!checkAdminPassword(body.password ?? "")) {
    return Response.json({ error: "Wrong password." }, { status: 401 });
  }

  const jar = await cookies();
  jar.set(ADMIN_COOKIE, "ok", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 12,
    path: "/",
  });

  const stats = await getAdminStats();
  return Response.json({ stats });
}

export async function DELETE(): Promise<Response> {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
  return Response.json({ ok: true });
}
