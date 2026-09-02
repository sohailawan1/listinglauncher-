import { isReplicateConfigured, removeBackground, generateLifestyle } from "@/lib/images";
import {
  getSessionAccount,
  SESSION_COOKIE,
  checkUsage,
  recordUsage,
  savePhotoJob,
  getPhotoJob,
  type PhotoJob,
} from "@/lib/store";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const maxDuration = 120;

const PHOTO_COST_LISTING = 2; // each photo costs 2 listings worth of credit

export async function POST(request: Request): Promise<Response> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  const account = token ? await getSessionAccount(token) : null;
  if (!account) return Response.json({ error: "Sign in to use the photo tool." }, { status: 401 });

  let body: { mode?: "background_removal" | "lifestyle"; image?: string; prompt?: string; jobId?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const mode = body.mode;
  if (mode !== "background_removal" && mode !== "lifestyle") {
    return Response.json({ error: "Unknown mode." }, { status: 400 });
  }

  // Quota: charge as 2 listing-equivalents per photo
  const usage = await checkUsage(account.id, account.plan, PHOTO_COST_LISTING);
  if (!usage.allowed) {
    return Response.json({ error: usage.reason ?? "Photo quota exceeded." }, { status: 402 });
  }

  if (!isReplicateConfigured()) {
    return Response.json(
      {
        error:
          "Photo tool isn't configured yet. Add REPLICATE_API_TOKEN to your environment (get a free key at replicate.com).",
      },
      { status: 503 }
    );
  }

  const jobId = body.jobId ?? `pj_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
  const existing = await getPhotoJob(jobId);

  const job: PhotoJob = existing ?? {
    id: jobId,
    accountId: account.id,
    status: "processing",
    mode,
    sourceUrl: body.image?.slice(0, 200),
    prompt: body.prompt,
    createdAt: Date.now(),
  };
  job.status = "processing";
  await savePhotoJob(job);

  try {
    let resultUrl = "";
    if (mode === "background_removal") {
      if (!body.image) {
        return Response.json({ error: "Provide an image (data URL or hosted URL)." }, { status: 400 });
      }
      resultUrl = await removeBackground(body.image);
    } else {
      if (!body.prompt || body.prompt.length < 5) {
        return Response.json({ error: "Provide a prompt for the lifestyle scene." }, { status: 400 });
      }
      resultUrl = await generateLifestyle(body.prompt);
    }
    job.status = "done";
    job.resultUrl = resultUrl;
    job.completedAt = Date.now();
    await savePhotoJob(job);
    await recordUsage(account.id, PHOTO_COST_LISTING, "listing");
    return Response.json({ job });
  } catch (err) {
    job.status = "failed";
    job.error = err instanceof Error ? err.message : "Generation failed";
    job.completedAt = Date.now();
    await savePhotoJob(job);
    return Response.json(
      { error: job.error, job },
      { status: 502 }
    );
  }
}

export async function GET(): Promise<Response> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  const account = token ? await getSessionAccount(token) : null;
  if (!account) return Response.json({ error: "Sign in." }, { status: 401 });

  const { listPhotoJobsForAccount } = await import("@/lib/store");
  const jobs = await listPhotoJobsForAccount(account.id);
  return Response.json({ jobs: jobs.slice(0, 20) });
}
