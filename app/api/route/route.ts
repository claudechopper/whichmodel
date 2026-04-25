// POST /api/route — classify a user prompt with Haiku, return recommendation JSON.
// Server-only: reads ANTHROPIC_API_KEY from env, never exposed to client.

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { classifyPrompt } from "@/lib/classifier";
import type { RouteResponse, RouteError } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RequestSchema = z.object({
  prompt: z.string().min(1).max(20000),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse("Invalid JSON body.", 400);
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(
      `Invalid request: ${parsed.error.issues[0]?.message ?? "bad shape"}.`,
      400,
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return errorResponse(
      "Server misconfigured: ANTHROPIC_API_KEY not set.",
      500,
    );
  }

  try {
    const recommendation = await classifyPrompt({
      prompt: parsed.data.prompt,
      apiKey,
    });
    const payload: RouteResponse = { ok: true, recommendation };
    return NextResponse.json(payload);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return errorResponse(message, 500);
  }
}

function errorResponse(error: string, status: number) {
  const payload: RouteError = { ok: false, error };
  return NextResponse.json(payload, { status });
}
