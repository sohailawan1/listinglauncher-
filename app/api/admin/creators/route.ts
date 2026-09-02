import { getCreator, saveCreator, listAllCreators, ADMIN_COOKIE } from "@/lib/store";
import { sendEmail } from "@/lib/email";

export const runtime = "nodejs";

const VALID_STATUS = ["approved", "rejected", "suspended"] as const;

export async function GET(): Promise<Response> {
  const { cookies } = await import("next/headers");
  const jar = await cookies();
  if (jar.get(ADMIN_COOKIE)?.value !== "ok") {
    return Response.json({ error: "Admin only." }, { status: 401 });
  }
  const creators = await listAllCreators();
  return Response.json({ creators });
}

export async function PATCH(request: Request): Promise<Response> {
  const { cookies } = await import("next/headers");
  const jar = await cookies();
  if (jar.get(ADMIN_COOKIE)?.value !== "ok") {
    return Response.json({ error: "Admin only." }, { status: 401 });
  }

  let body: { id?: string; status?: string; reason?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!body.id || !VALID_STATUS.includes(body.status as (typeof VALID_STATUS)[number])) {
    return Response.json({ error: "Provide id and a valid status." }, { status: 400 });
  }

  const creator = await getCreator(body.id);
  if (!creator) return Response.json({ error: "Creator not found." }, { status: 404 });

  creator.status = body.status as (typeof VALID_STATUS)[number];
  if (creator.status === "approved") creator.approvedAt = Date.now();
  await saveCreator(creator);

  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  if (creator.status === "approved") {
    await sendEmail(creator.email, "creator_approved", { url: `${origin}/creators/${creator.id}` });
  } else {
    await sendEmail(creator.email, "creator_rejected", { reason: body.reason ?? "" });
  }

  return Response.json({ creator });
}
