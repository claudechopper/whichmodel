"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, RotateCcw, Check } from "lucide-react";
import { useState } from "react";
import { MODELS } from "@/lib/models";
import type { RouteRecommendation, EffortLevel } from "@/lib/types";

interface Props {
  recommendation: RouteRecommendation;
  onReset: () => void;
}

const EFFORT_LABEL: Record<EffortLevel, string> = {
  none: "No thinking",
  low: "Low effort",
  medium: "Medium effort",
  high: "High effort",
};

const EFFORT_TONE: Record<EffortLevel, string> = {
  none: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  low: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  medium:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  high: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200",
};

export function RecommendationCard({ recommendation, onReset }: Props) {
  const [copied, setCopied] = useState(false);
  const model = MODELS[recommendation.model];

  async function copyModelId() {
    await navigator.clipboard.writeText(recommendation.model);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Card className="border-2 border-primary/20 shadow-sm">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl" aria-hidden="true">
              {model.icon}
            </span>
            <div>
              <CardTitle className="text-2xl">{model.label}</CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                {model.provider} · {model.contextWindow}
              </p>
            </div>
          </div>
          <Badge className={EFFORT_TONE[recommendation.effort]}>
            {EFFORT_LABEL[recommendation.effort]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
            Why
          </p>
          <p className="text-base leading-relaxed">{recommendation.reason}</p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
            Superpower
          </p>
          <p className="text-sm text-foreground/80">{model.superpower}</p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
            Where to use it
          </p>
          <p className="text-sm text-foreground/80">{model.cliUrl}</p>
        </div>

        {recommendation.alternates.length > 0 && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
              Alternates
            </p>
            <div className="flex flex-wrap gap-2">
              {recommendation.alternates.map((id) => (
                <Badge key={id} variant="secondary">
                  {MODELS[id].icon} {MODELS[id].label}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button onClick={copyModelId} variant="outline" size="sm" className="gap-2">
            {copied ? (
              <>
                <Check className="size-4" /> Copied
              </>
            ) : (
              <>
                <Copy className="size-4" /> Copy model ID
              </>
            )}
          </Button>
          <Button onClick={onReset} variant="ghost" size="sm" className="gap-2">
            <RotateCcw className="size-4" /> New prompt
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
