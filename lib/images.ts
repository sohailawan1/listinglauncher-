/**
 * Image generation service using Replicate. Falls back to a clear error
 * message when REPLICATE_API_TOKEN is missing, so the rest of the app
 * continues to work.
 */

const REPLICATE = "https://api.replicate.com/v1";

const BG_REMOVAL_MODEL = "briaai/RMBG-1.4";
const LIFESTYLE_MODEL = "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea5355252556131aa4f31c63f2";

type ReplicatePrediction = {
  id: string;
  status: "starting" | "processing" | "succeeded" | "failed" | "canceled";
  output?: string | string[];
  error?: string;
};

async function createPrediction(version: string, input: Record<string, unknown>): Promise<ReplicatePrediction> {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) throw new Error("REPLICATE_API_TOKEN is not configured on the server.");

  // The lifestyle model uses version:hash syntax; bg-removal uses owner/model with no version.
  const url = version.includes(":")
    ? `${REPLICATE}/predictions`
    : `${REPLICATE}/predictions`;

  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(version.includes(":") ? { version, input } : { version: BG_REMOVAL_MODEL, input }),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Replicate ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
  return (await res.json()) as ReplicatePrediction;
}

async function pollUntilDone(id: string, maxWaitMs = 90_000): Promise<ReplicatePrediction> {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) throw new Error("REPLICATE_API_TOKEN is not configured on the server.");
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
  throw new Error("Replicate prediction timed out");
}

export function isReplicateConfigured(): boolean {
  return Boolean(process.env.REPLICATE_API_TOKEN);
}

export async function removeBackground(imageDataUrl: string): Promise<string> {
  const initial = await createPrediction(BG_REMOVAL_MODEL, { image: imageDataUrl });
  const pred = initial.status === "starting" || initial.status === "processing"
    ? await pollUntilDone(initial.id)
    : initial;
  if (pred.status === "failed" || pred.status === "canceled") {
    throw new Error(pred.error ?? "Background removal failed");
  }
  if (!pred.output) throw new Error("No output from background removal model");
  const out = pred.output;
  return Array.isArray(out) ? out[0] : out;
}

export async function generateLifestyle(prompt: string, negativePrompt?: string): Promise<string> {
  const initial = await createPrediction(LIFESTYLE_MODEL, {
    prompt,
    negative_prompt: negativePrompt ?? "low quality, blurry, distorted, text, watermark",
    width: 1024,
    height: 1024,
    num_outputs: 1,
    guidance_scale: 7.5,
    num_inference_steps: 30,
  });
  const pred = initial.status === "starting" || initial.status === "processing"
    ? await pollUntilDone(initial.id)
    : initial;
  if (pred.status === "failed" || pred.status === "canceled") {
    throw new Error(pred.error ?? "Lifestyle generation failed");
  }
  if (!pred.output) throw new Error("No output from lifestyle model");
  const out = pred.output;
  return Array.isArray(out) ? out[0] : out;
}
