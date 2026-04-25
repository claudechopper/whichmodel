"use client";

import { useState, FormEvent, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles } from "lucide-react";

interface Props {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
}

export function PromptInput({ onSubmit, isLoading }: Props) {
  const [value, setValue] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSubmit(trimmed);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    // ⌘+Enter / Ctrl+Enter to submit.
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Paste your prompt here. We'll tell you which model + effort level to use."
        className="min-h-[160px] resize-y text-base"
        disabled={isLoading}
        autoFocus
      />
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          ⌘ + Enter to route · {value.length} chars
        </p>
        <Button
          type="submit"
          disabled={!value.trim() || isLoading}
          size="lg"
          className="gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Routing…
            </>
          ) : (
            <>
              <Sparkles className="size-4" />
              Route it
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
