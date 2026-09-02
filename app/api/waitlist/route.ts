import { recordWaitlist, isRedisConfigured } from "@/lib/store";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }
  const email = (body.email ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "Enter a valid email." }, { status: 400 });
  }
  await recordWaitlist(email);
  return Response.json({ ok: true, persistence: isRedisConfigured() ? "redis" : "memory" });
}
