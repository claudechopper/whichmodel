# WhichModel

Paste your prompt. WhichModel tells you which AI model and effort level to use — Claude Opus, Sonnet, Haiku, GPT-5.4, GPT-5.3-Codex, or Gemini 3.1 Pro.

Routing logic ports from `llm-routing-guide.md` and is reviewed every 4–6 weeks.

## Stack
- Next.js 16 (App Router, TypeScript strict)
- Tailwind CSS v4 + shadcn/ui (slate base)
- Zustand 5, Dexie (local-only history)
- React Hook Form + Zod
- `@anthropic-ai/sdk` — server-side Haiku call for classification

## Local development

```bash
pnpm install
cp .env.example .env.local
# edit .env.local and add your ANTHROPIC_API_KEY
pnpm dev
```

Visit `http://localhost:3000`.

## How it works
1. User pastes a prompt
2. `POST /api/route` calls Claude Haiku 4.5 with a strict-JSON system prompt that encodes the routing rules
3. Server parses + validates the JSON against a Zod schema
4. Client renders the recommendation + saves to local IndexedDB history (last 50 entries, never leaves the browser)

## Deploy (Session 2)
- Push to GitHub
- Connect Railway → set `ANTHROPIC_API_KEY` env var → deploy
- (Optional) buy domain, point at Railway

## File map
- `app/page.tsx` — single-screen UI
- `app/api/route/route.ts` — POST endpoint, server-only API key
- `lib/classifier.ts` — Haiku system prompt + JSON parser + Zod validation
- `lib/models.ts` — 6-model catalog (sync with `llm-routing-guide.md`)
- `lib/storage.ts` — Dexie wrapper for local history
- `components/prompt-input.tsx` — paste textarea + submit
- `components/recommendation-card.tsx` — model + effort + reason
- `components/history-list.tsx` — last 10 routings
