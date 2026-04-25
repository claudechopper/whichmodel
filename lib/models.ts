// Model catalog. Source of truth: llm-routing-guide.md (2026-04-19, review every 4-6 weeks).
// Keep this list in sync with classifier.ts allowed values.

import type { ModelId, ModelInfo } from "./types";

export const MODELS: Record<ModelId, ModelInfo> = {
  "claude-opus-4.7": {
    id: "claude-opus-4.7",
    label: "Claude Opus 4.7",
    provider: "Anthropic",
    icon: "🧠",
    superpower:
      "End-to-end reasoning, clean code, multi-file refactors, planning, writing.",
    contextWindow: "1M tokens",
    cliUrl: "https://claude.ai · Claude Code CLI",
  },
  "claude-sonnet-4.6": {
    id: "claude-sonnet-4.6",
    label: "Claude Sonnet 4.6",
    provider: "Anthropic",
    icon: "⚡",
    superpower:
      "Fast, capable default for coding, writing, and analysis. Better $/token than Opus.",
    contextWindow: "200K tokens",
    cliUrl: "https://claude.ai · Claude Code CLI",
  },
  "claude-haiku-4.5": {
    id: "claude-haiku-4.5",
    label: "Claude Haiku 4.5",
    provider: "Anthropic",
    icon: "🪶",
    superpower:
      "Cheapest + fastest Anthropic model. Lookups, formatting, classification, one-line answers.",
    contextWindow: "200K tokens",
    cliUrl: "https://claude.ai · Claude Code CLI (`/model haiku`)",
  },
  "gpt-5.4": {
    id: "gpt-5.4",
    label: "GPT-5.4",
    provider: "OpenAI",
    icon: "🌐",
    superpower:
      "Native computer use (75% OSWorld), full-res vision, agentic UI operation.",
    contextWindow: "1M tokens",
    cliUrl: "https://chatgpt.com · OpenAI API",
  },
  "gpt-5.3-codex": {
    id: "gpt-5.3-codex",
    label: "GPT-5.3-Codex",
    provider: "OpenAI",
    icon: "🔧",
    superpower:
      "Terminal-native agentic loops, precise debugging, iterating against tests.",
    contextWindow: "Large (model-specific)",
    cliUrl: "`codex` CLI · OpenAI API",
  },
  "gemini-3.1-pro": {
    id: "gemini-3.1-pro",
    label: "Gemini 3.1 Pro",
    provider: "Google",
    icon: "🖼️",
    superpower:
      "Multimodal (diagrams, screenshots, PDFs, video). Strong at giant codebases.",
    contextWindow: "1M tokens",
    cliUrl: "https://gemini.google.com · Google AI Studio (free tier)",
  },
};

export const ALL_MODEL_IDS = Object.keys(MODELS) as ModelId[];
