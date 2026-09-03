/**
 * Image processing.
 *
 * Background removal runs IN-PROCESS using @imgly/background-removal-node —
 * free, no API costs, no external service. Server downloads the model once
 * and caches it on disk. Always free, no quota.
 *
 * Lifestyle scene generation uses Black Forest Labs FLUX 1.1 Pro via
 * Replicate. Paid per image ($1 standard, $2 HD) — order paid through
 * Stripe checkout before generation. Supports image-to-image so the
 * customer's actual product appears in the generated scene.
 */

const REPLICATE = "https://api.replicate.com/v1";

/** FLUX 1.1 Pro — best photorealism available, supports image-to-image. */
const FLUX_PRO_MODEL =
  "black-forest-labs/flux-1.1-pro:80a09d66bfd0298ed64a04ecd6c80e2a2af7c6a96cfb65fa6a3c0a12269c45d5";

type ReplicatePrediction = {
  id: string;
  status: "starting" | "processing" | "succeeded" | "failed" | "canceled";
  output?: string | string[];
  error?: string;
};

export function isReplicateConfigured(): boolean {
  return Boolean(process.env.REPLICATE_API_TOKEN);
}

/* ============================ BACKGROUND REMOVAL ============================ */
/**
 * Free, unlimited, $0 cost. Runs locally on the server. Returns a data URL
 * (image/png, base64) so the browser can display it without a CDN.
 */
export async function removeBackground(imageDataUrl: string): Promise<string> {
  const mod = (await import("@imgly/background-removal-node")) as {
    removeBackground(input: Blob | string): Promise<Blob>;
  };
  const inputBlob = await dataUrlToBlob(imageDataUrl);
  const out = await mod.removeBackground(inputBlob);
  return blobToDataUrl(out, "image/png");
}

/* ============================== LIFESTYLE (FLUX) ============================== */

export type LifestyleResolution = "standard" | "hd";
export type LifestyleMode = "text" | "image_to_image";

export type LifestyleOptions = {
  prompt: string;
  resolution: LifestyleResolution;
  productImageDataUrl?: string;
};

/** Standard = 1024x1024. HD = 1536x1536. (FLUX also supports 2048 but $0.12 is steep.) */
function resolutionDims(r: LifestyleResolution): { width: number; height: number } {
  return r === "hd" ? { width: 1536, height: 1536 } : { width: 1024, height: 1024 };
}

/**
 * Generate a lifestyle product photo with FLUX 1.1 Pro. No watermark, no
 * platform logo. If `productImageDataUrl` is provided, FLUX uses it as a
 * reference (image-to-image) so the customer's actual product appears in
 * the generated scene.
 */
export async function generateLifestyle(opts: LifestyleOptions): Promise<string> {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) throw new Error("REPLICATE_API_TOKEN is not configured on the server.");

  const dims = resolutionDims(opts.resolution);
  const input: Record<string, unknown> = {
    prompt: opts.prompt,
    prompt_upsampling: true,
    width: dims.width,
    height: dims.height,
    output_format: "jpg",
    output_quality: 92,
    safety_tolerance: 2,
  };

  if (opts.productImageDataUrl) {
    // FLUX supports image-to-image with `image_prompt` (strength tunable).
    input.image_prompt = opts.productImageDataUrl;
    input.image_prompt_strength = 0.35; // stay faithful to the product
    input.prompt_strength = 0.65; // let FLUX shape the scene
  }

  const res = await fetch(`${REPLICATE}/predictions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ version: FLUX_PRO_MODEL, input }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Replicate ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const initial = (await res.json()) as ReplicatePrediction;
  const pred = await pollUntilDone(initial.id);
  if (pred.status !== "succeeded") {
    throw new Error(pred.error ?? `FLUX generation ${pred.status}`);
  }
  if (!pred.output) throw new Error("No output from FLUX");
  const out = pred.output;
  return Array.isArray(out) ? out[0] : out;
}

async function pollUntilDone(id: string, maxWaitMs = 120_000): Promise<ReplicatePrediction> {
  const token = process.env.REPLICATE_API_TOKEN!;
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    const res = await fetch(`${REPLICATE}/predictions/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Replicate ${res.status}`);
    const pred = (await res.json()) as ReplicatePrediction;
    if (pred.status === "succeeded" || pred.status === "failed" || pred.status === "canceled") {
      return pred;
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
  throw new Error("FLUX prediction timed out");
}

/* =============================== UTILITIES =================================== */

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const m = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!m) {
    if (/^https?:\/\//.test(dataUrl)) {
      const res = await fetch(dataUrl);
      if (!res.ok) throw new Error("Could not fetch image");
      return res.blob();
    }
    throw new Error("Unsupported image source");
  }
  const buffer = Buffer.from(m[2], "base64");
  return new Blob([buffer], { type: m[1] });
}

async function blobToDataUrl(blob: Blob, mime: string): Promise<string> {
  const buf = Buffer.from(await blob.arrayBuffer());
  return `data:${mime};base64,${buf.toString("base64")}`;
}
