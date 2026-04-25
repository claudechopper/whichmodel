// Shared types for WhichModel routing app.

export type ModelId =
  | "claude-opus-4.7"
  | "claude-sonnet-4.6"
  | "claude-haiku-4.5"
  | "gpt-5.4"
  | "gpt-5.3-codex"
  | "gemini-3.1-pro";

export type EffortLevel = "none" | "low" | "medium" | "high";

export interface ModelInfo {
  id: ModelId;
  label: string;
  provider: "Anthropic" | "OpenAI" | "Google";
  icon: string; // emoji or short marker
  superpower: string; // one-line strength
  contextWindow: string;
  cliUrl: string; // primary place to use it
}

export interface RouteRecommendation {
  model: ModelId;
  effort: EffortLevel;
  reason: string; // <= 25 words
  alternates: ModelId[]; // up to 2 fallbacks
}

export interface HistoryEntry {
  id: string; // uuid
  promptPreview: string; // first ~80 chars
  recommendation: RouteRecommendation;
  createdAt: number; // unix ms
}

export interface RouteRequest {
  prompt: string;
}

export interface RouteResponse {
  ok: true;
  recommendation: RouteRecommendation;
}

export interface RouteError {
  ok: false;
  error: string;
}
