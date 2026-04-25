// Server-side classifier. Calls Claude Haiku with a strict-JSON system prompt
// derived from llm-routing-guide.md.

import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type { RouteRecommendation, ModelId } from "./types";
import { ALL_MODEL_IDS } from "./models";

// ---------- Zod schema for parsing Haiku output ----------

const ModelIdSchema = z.enum([
  "claude-opus-4.7",
  "claude-sonnet-4.6",
  "claude-haiku-4.5",
  "gpt-5.4",
  "gpt-5.3-codex",
  "gemini-3.1-pro",
]);

const RecommendationSchema = z.object({
  model: ModelIdSchema,
  effort: z.enum(["none", "low", "medium", "high"]),
  reason: z.string().min(1).max(300),
  alternates: z.array(ModelIdSchema).max(2),
});

// ---------- System prompt ----------

const SYSTEM_PROMPT = `You are a model-routing classifier for the WhichModel app. Given a user's prompt, you must decide which AI model and effort level fits best.

Respond with STRICT JSON in this exact shape:
{
  "model": "<one of the allowed model IDs>",
  "effort": "none" | "low" | "medium" | "high",
  "reason": "<one sentence, max 25 words, plain English>",
  "alternates": [<up to 2 fallback model IDs, ordered best first>]
}

Allowed model IDs (use exactly these strings):
- "claude-opus-4.7"   — best for planning, architecture, hard reasoning, multi-file refactors, polished writing
- "claude-sonnet-4.6" — default for coding, moderate analysis, longer batch work
- "claude-haiku-4.5"  — cheapest/fastest. Simple lookups, formatting, classification, one-line factual
- "gpt-5.4"           — agentic computer/browser use, full-res vision, real-time UI operation
- "gpt-5.3-codex"     — terminal loops, "find the bug", running tests until green, CI/CD
- "gemini-3.1-pro"    — multimodal (image/PDF/video) and giant-context (>200K tokens) tasks

Routing rules (priority order — apply the first matching rule):
1. Prompt mentions images, PDFs, video, screenshots, or pasted long content (>200K tokens of input)  → gemini-3.1-pro
2. Prompt is "operate a browser/UI/computer" or "automate this app"                                  → gpt-5.4
3. Prompt is "run commands until X works" / agentic shell loop / iterate against tests              → gpt-5.3-codex
4. Prompt is "find the bug" / debug / "tests pass but prod fails"                                    → gpt-5.3-codex
5. Prompt is a trivial lookup, reformatting, translation, single-line factual, or classification    → claude-haiku-4.5 (effort: none)
6. Prompt is plan/spec/architecture/design/refactor across many files / explain WHY                  → claude-opus-4.7 (effort: high)
7. Prompt is general coding, writing, moderate analysis, longer-running tasks                        → claude-sonnet-4.6 (effort: low or medium)
8. Genuinely ambiguous or unclassifiable                                                              → claude-sonnet-4.6 (effort: medium) as a safe default

Effort guidelines:
- "none"   — straightforward, no thinking needed
- "low"    — simple reasoning, quick answer
- "medium" — multi-step reasoning, trade-offs
- "high"   — hard architecture, novel problems, ambiguity, subtle bugs

Output rules:
- Output ONLY the JSON object. No prose, no code fences, no explanation.
- The "reason" must be ≤25 words, plain English, name the dominant signal you used.
- If the prompt is empty, vague, or one word, default to claude-sonnet-4.6 with effort:low and explain.
- Never invent new model IDs. Use the allowed list exactly.`;

// ---------- Public API ----------

export interface ClassifyOptions {
  prompt: string;
  apiKey: string;
}

export async function classifyPrompt(
  opts: ClassifyOptions,
): Promise<RouteRecommendation> {
  const { prompt, apiKey } = opts;

  if (!prompt || prompt.trim().length === 0) {
    throw new Error("Prompt is empty.");
  }
  if (!apiKey) {
    throw new Error("Missing ANTHROPIC_API_KEY.");
  }

  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 400,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Classify this prompt:\n\n---\n${prompt.slice(0, 6000)}\n---`,
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Haiku returned no text content.");
  }

  const raw = textBlock.text.trim();
  const jsonText = stripCodeFences(raw);

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error(
      `Haiku returned non-JSON: ${raw.slice(0, 200)}`,
    );
  }

  const result = RecommendationSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(
      `Haiku JSON failed schema: ${result.error.message}`,
    );
  }

  // Sanity guards: ensure no alternate equals the primary, dedupe, cap to 2.
  const cleanAlternates = Array.from(
    new Set(
      result.data.alternates.filter(
        (m): m is ModelId =>
          ALL_MODEL_IDS.includes(m) && m !== result.data.model,
      ),
    ),
  ).slice(0, 2);

  return {
    model: result.data.model,
    effort: result.data.effort,
    reason: result.data.reason,
    alternates: cleanAlternates,
  };
}

// ---------- Helpers ----------

function stripCodeFences(text: string): string {
  // If Haiku wraps the JSON in ```json ... ``` despite instructions, strip it.
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (fenceMatch) return fenceMatch[1].trim();
  return text;
}
