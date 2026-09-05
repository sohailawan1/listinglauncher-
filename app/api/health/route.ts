import { getSetupStatus } from "@/lib/setup";

export const runtime = "nodejs";

export async function GET(): Promise<Response> {
  const status = getSetupStatus();
  const ready = status.openrouter; // Only OpenRouter is strictly required to run.
  return Response.json({ ready, status });
}
