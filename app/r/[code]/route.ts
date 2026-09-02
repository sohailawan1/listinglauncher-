import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  const safe = (code ?? "").replace(/[^A-Z0-9]/gi, "").toUpperCase().slice(0, 12);
  const url = new URL(request.url);
  const target = new URL("/", url);
  const res = NextResponse.redirect(target, { status: 302 });
  if (safe) {
    res.cookies.set("ll_ref", safe, {
      maxAge: 60 * 60 * 24 * 60, // 60 days
      path: "/",
      sameSite: "lax",
    });
  }
  return res;
}
