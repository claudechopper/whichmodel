"use client";

import { useState } from "react";
import { PromptInput } from "@/components/prompt-input";
import { RecommendationCard } from "@/components/recommendation-card";
import { HistoryList } from "@/components/history-list";
import { saveHistoryEntry } from "@/lib/storage";
import type {
  RouteRecommendation,
  RouteResponse,
  RouteError,
  HistoryEntry,
} from "@/lib/types";

export default function Home() {
  const [recommendation, setRecommendation] =
    useState<RouteRecommendation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [historyKey, setHistoryKey] = useState(0);

  async function handleRoute(prompt: string) {
    setIsLoading(true);
    setError(null);
    setRecommendation(null);

    try {
      const res = await fetch("/api/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data: RouteResponse | RouteError = await res.json();

      if (!data.ok) {
        setError(data.error);
        return;
      }

      setRecommendation(data.recommendation);

      // Save to local history (fire and forget — don't block UI on storage).
      const entry: HistoryEntry = {
        id: crypto.randomUUID(),
        promptPreview:
          prompt.length > 80 ? prompt.slice(0, 80) + "…" : prompt,
        recommendation: data.recommendation,
        createdAt: Date.now(),
      };
      saveHistoryEntry(entry)
        .then(() => setHistoryKey((k) => k + 1))
        .catch(() => {
          /* ignore storage failures (private mode, etc.) */
        });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleReset() {
    setRecommendation(null);
    setError(null);
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12 sm:py-20 flex-1">
      <header className="mb-10 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3">
          WhichModel
        </h1>
        <p className="text-lg text-muted-foreground">
          Paste your prompt. We&apos;ll tell you which AI to use.
        </p>
      </header>

      {!recommendation && (
        <PromptInput onSubmit={handleRoute} isLoading={isLoading} />
      )}

      {error && (
        <div
          role="alert"
          className="mt-6 rounded-md border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      {recommendation && (
        <div className="mt-2">
          <RecommendationCard
            recommendation={recommendation}
            onReset={handleReset}
          />
        </div>
      )}

      <HistoryList refreshKey={historyKey} />

      <footer className="mt-16 pt-8 border-t border-border text-center text-xs text-muted-foreground">
        <p>
          Routing logic from{" "}
          <code className="text-[11px]">llm-routing-guide.md</code> · reviewed
          every 4–6 weeks.
        </p>
        <p className="mt-1">
          History stays in your browser. Prompts are sent to Anthropic Haiku for
          classification only.
        </p>
      </footer>
    </main>
  );
}
