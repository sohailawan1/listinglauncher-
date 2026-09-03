import { recordWaitlist, isRedisConfigured, getWaitlistRecord } from "@/lib/store";

export const runtime = "nodejs";

function generateCode(): string {
  // 8-char alphanumeric, easy to type
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 8; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return s;
}

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

  // If they already signed up, return their existing code so they don't
  // get a second one.
  const existing = await getWaitlistRecord(email);
  if (existing) {
    return Response.json({ ok: true, code: existing.code, returning: true });
  }

  const code = generateCode();
  await recordWaitlist(email, code);
  return Response.json({ ok: true, code, persistence: isRedisConfigured() ? "redis" : "file" });
}
