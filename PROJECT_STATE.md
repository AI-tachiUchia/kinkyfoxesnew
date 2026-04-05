# KinkyFoxGames — Project State
_Last updated: 2026-04-04_

## Repo & Branch
- **Repo:** https://github.com/AI-tachiUchia/kinkyfoxesnew
- **Active branch:** `feat/ui-polish-round2`
- **Deploy:** Vercel (auto-deploy on push to main, manual deploy from branch)

## Tech Stack
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS — dark mode, rose gold / burnt orange accents
- **AI Generation:** Anthropic Claude Sonnet 4.6 (`claude-sonnet-4-6`) via `@anthropic-ai/sdk`
- **Database / Realtime:** Supabase (partner-link sync, saved games)

## Environment Variables (`.env.local`)
```
ANTHROPIC_API_KEY=<key>              # Used by generate route — ACTIVE MODEL
NEXT_PUBLIC_SUPABASE_URL=<url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<key>
GEMINI_API_KEY=<key>                 # Legacy — no longer used in generate route
GOOGLE_APPLICATION_CREDENTIALS=./vertex-express-key.json  # Legacy — no longer used
GOOGLE_CLOUD_PROJECT=gen-lang-client-0317713513            # Legacy — no longer used
```
> ⚠️ Vercel needs `ANTHROPIC_API_KEY` set in its environment variables for production to work.
> The Vertex AI / GCP vars are no longer needed by the app but can stay for now.

## Key Files
| File | Purpose |
|---|---|
| `app/api/generate/route.ts` | Main AI generation endpoint — all game logic here |
| `app/page.tsx` | Main UI |
| `app/components/` | FoxDisplay, PixelScene, FoxImage, FoxLoadingVideo |
| `lib/supabase.ts` | Supabase client + partner-link realtime sync |
| `lib/translations.ts` | DE/EN i18n strings |
| `app/context/LanguageContext.tsx` | Language toggle context |
| `app/api/toys/route.ts` | Toys/items API |
| `app/api/saved-games/route.ts` | Save/load games via Supabase |

## Completed Features
- [x] Game generation with Gemini → **migrated to Claude Sonnet 4.6**
- [x] Heat level slider (1–5), DE/EN language toggle
- [x] "Complicate" (escalate game) + "Refine" (polish/fix game) actions
- [x] Partner-Link Sync via Supabase Realtime (room ID based)
- [x] Game Templates (Spielvorlagen)
- [x] Save as JSON
- [x] Expandable output sections
- [x] Pixel fox art / animations

## Open / Backlog
- [ ] Visual feedback / pixel GIF art tied to game content (low prio)
- [ ] Vercel env var: ensure `ANTHROPIC_API_KEY` is set in production dashboard

## Recent Changes (2026-04-04)
### AI Backend Switch (commit `1fdeac1`)
- **Reason:** Gemini 3.1 Flash-Lite not available on the GCP project (Preview, needs manual access).
  Gemini 2.5 Flash deprecated. Claude Sonnet 4.6 tested and working.
- **What changed:** `app/api/generate/route.ts`
  - Removed: `@google/genai`, Vertex AI init, GCP service account key injection, safety settings
  - Added: `@anthropic-ai/sdk`, Anthropic client init
  - `max_tokens`: 4096 → 8192 (prevents truncated games)
  - **Prompt fix:** Added Rule #3 — model must fully write ALL announced phases/rounds.
    No more "continue similarly for round 3" placeholders. If it can't fit, it reduces scope
    but never leaves a phase half-written.

## How to Run Locally
```bash
cd kinkyfoxgames
npm install
npm run dev
# App at http://localhost:3000
```
