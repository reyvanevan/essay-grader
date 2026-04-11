import { NextResponse } from "next/server";
import { z } from "zod";
import { processGradingBatch } from "@/lib/grading/worker";

const workerBodySchema = z.object({
  limit: z.number().int().min(1).max(50).optional(),
});

function isWorkerAuthorized(request: Request): boolean {
  const internalSecret = process.env.INTERNAL_WORKER_SECRET;
  const cronSecret = process.env.CRON_SECRET;
  if (!internalSecret && !cronSecret) {
    return true;
  }

  const suppliedHeader = request.headers.get("x-internal-worker-secret");
  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : null;

  return [suppliedHeader, bearerToken].some((value) => {
    if (!value) return false;
    return value === internalSecret || value === cronSecret;
  });
}

export async function POST(request: Request) {
  if (!isWorkerAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized worker request." }, { status: 401 });
  }

  let payload: unknown = {};
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }
  }

  const parsed = workerBodySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const result = await processGradingBatch(parsed.data.limit ?? 10);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown worker error.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
