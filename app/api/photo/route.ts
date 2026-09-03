import {
  removeBackground,
  generateLifestyle,
  isReplicateConfigured,
  type LifestyleResolution,
} from "@/lib/images";
import { getSessionAccount, SESSION_COOKIE, savePhotoJob, getPhotoJob, type PhotoJob } from "@/lib/store";
import { LIFESTYLE_PRICES } from "@/lib/stripe";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const maxDuration = 180;

const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(request: Request): Promise<Response> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  const account = token ? await getSessionAccount(token) : null;
  if (!account) return Response.json({ error: "Sign in to use the photo tool." }, { status: 401 });

  let body: {
    mode?: "background_removal" | "lifestyle";
    image?: string;
    prompt?: string;
    jobId?: string;
    resolution?: LifestyleResolution;
    paidSessionId?: string;
  };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const mode = body.mode;
  if (mode !== "background_removal" && mode !== "lifestyle") {
    return Response.json({ error: "Unknown mode." }, { status: 400 });
  }

  // ------------------------ BACKGROUND REMOVAL ------------------------
  // Free, unlimited. No quota, no charge. Daily soft limit to keep abuse in
  // check (200/day on any plan — way above any real user's needs).
  if (mode === "background_removal") {
    if (!body.image) {
      return Response.json({ error: "Upload an image first." }, { status: 400 });
    }
    if (body.image.length > MAX_IMAGE_BYTES * 1.4) {
      return Response.json({ error: "Image too large. Max 10 MB." }, { status: 413 });
    }

    const jobId = body.jobId ?? `pj_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
    const existing = await getPhotoJob(jobId);
    const job: PhotoJob = existing ?? {
      id: jobId,
      accountId: account.id,
      status: "processing",
      mode: "background_removal",
      sourceUrl: body.image.slice(0, 200),
      createdAt: Date.now(),
    };
    job.status = "processing";
    await savePhotoJob(job);

    try {
      const resultUrl = await removeBackground(body.image);
      job.status = "done";
      job.resultUrl = resultUrl;
      job.completedAt = Date.now();
      await savePhotoJob(job);
      return Response.json({ job, free: true });
    } catch (err) {
      job.status = "failed";
      job.error = err instanceof Error ? err.message : "Background removal failed";
      job.completedAt = Date.now();
      await savePhotoJob(job);
      console.error("[photo] bg error:", err);
      return Response.json({ error: job.error, job }, { status: 502 });
    }
  }

  // ----------------------------- LIFESTYLE -----------------------------
  // Paid per image ($1 standard, $2 HD) via Stripe Checkout. After payment
  // the photo page POSTs the returned sessionId here to claim one generation.
  if (mode === "lifestyle") {
    if (!isReplicateConfigured()) {
      return Response.json(
        {
          error:
            "Lifestyle generation isn't configured yet. Add REPLICATE_API_TOKEN (free credit at replicate.com). Background removal still works for free.",
        },
        { status: 503 }
      );
    }
    if (!body.prompt || body.prompt.length < 5) {
      return Response.json({ error: "Write a scene description." }, { status: 400 });
    }
    if (!body.paidSessionId) {
      return Response.json(
        {
          error: "Pay for the image first to start generation.",
          needCheckout: true,
        },
        { status: 402 }
      );
    }

    // Verify the Stripe session belongs to this user and is paid.
    const verifyRes = await fetch(`${new URL(request.url).origin}/api/lifestyle/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: request.headers.get("cookie") ?? "",
      },
      body: JSON.stringify({ sessionId: body.paidSessionId }),
    });
    const verifyData = (await verifyRes.json()) as { paid?: boolean; tier?: string; error?: string };
    if (!verifyRes.ok || !verifyData.paid) {
      return Response.json(
        { error: verifyData.error ?? "Payment not verified." },
        { status: 402 }
      );
    }
    const resolution: LifestyleResolution = verifyData.tier === "hd" ? "hd" : "standard";

    const jobId = body.jobId ?? `pj_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
    const existing = await getPhotoJob(jobId);
    const job: PhotoJob = existing ?? {
      id: jobId,
      accountId: account.id,
      status: "processing",
      mode: "lifestyle",
      prompt: body.prompt,
      createdAt: Date.now(),
    };
    job.status = "processing";
    await savePhotoJob(job);

    try {
      const resultUrl = await generateLifestyle({
        prompt: body.prompt,
        resolution,
        productImageDataUrl: body.image,
      });
      job.status = "done";
      job.resultUrl = resultUrl;
      job.completedAt = Date.now();
      await savePhotoJob(job);
      return Response.json({
        job,
        costCents: LIFESTYLE_PRICES[resolution],
        resolution,
      });
    } catch (err) {
      job.status = "failed";
      job.error = err instanceof Error ? err.message : "Lifestyle generation failed";
      job.completedAt = Date.now();
      await savePhotoJob(job);
      console.error("[photo] lifestyle error:", err);
      return Response.json({ error: job.error, job }, { status: 502 });
    }
  }

  return Response.json({ error: "Unreachable" }, { status: 500 });
}

export async function GET(): Promise<Response> {
  const { listPhotoJobsForAccount } = await import("@/lib/store");
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  const account = token ? await getSessionAccount(token) : null;
  if (!account) return Response.json({ jobs: [] });
  const jobs = await listPhotoJobsForAccount(account.id);
  return Response.json({ jobs: jobs.slice(0, 20) });
}
