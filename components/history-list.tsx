"use client";

import { useEffect, useState } from "react";
import { loadHistory, clearHistory } from "@/lib/storage";
import { MODELS } from "@/lib/models";
import type { HistoryEntry } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface Props {
  refreshKey: number; // bump this to force a reload after a new save
}

export function HistoryList({ refreshKey }: Props) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadHistory(10)
      .then((rows) => {
        if (!cancelled) {
          setEntries(rows);
          setLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  if (!loaded) return null;
  if (entries.length === 0) return null;

  async function handleClear() {
    await clearHistory();
    setEntries([]);
  }

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Recent (last 10 · stored locally only)
        </h2>
        <Button
          onClick={handleClear}
          variant="ghost"
          size="sm"
          className="text-muted-foreground gap-1.5 h-7"
        >
          <Trash2 className="size-3.5" /> Clear
        </Button>
      </div>
      <ul className="divide-y divide-border rounded-md border bg-card">
        {entries.map((e) => {
          const model = MODELS[e.recommendation.model];
          return (
            <li
              key={e.id}
              className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm"
            >
              <span className="truncate flex-1 text-foreground/80">
                {e.promptPreview}
              </span>
              <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                {model.icon} {model.label} · {e.recommendation.effort}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
