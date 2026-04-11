# KinkyFoxGames — Changelog

---

## 2026-04-11 — Fix: Dice roll mechanic restored under new XML prompt

**Commit:** `b62d049` on `main` — pushed to github.com/AI-tachiUchia/kinkyfoxesnew, deployed via Vercel. **Verified working in prod by Tim.**
**File:** `app/api/generate/route.ts`
**Why:** After merging `feature/prompt-master-update`, the new XML-structured system prompt produced flat `player_instructions` text and no longer emitted the `:::dice{label="..."}` markdown block that `app/components/DiceRoll.tsx` (`parseDiceRolls()`) looks for. Dice showed up as a plain bulleted list of six options instead of the interactive, partner-synced roll.

### What changed:
- Added optional `dice_roll: { label, options[] }` field to the prompt's JSON output schema.
- Added thinking check #4 in the system prompt: "does a dice mechanic fit this scenario?"
- Added few-shot `<example id="2b">` ("Blinde Lotterie") showing when to use `dice_roll`.
- Server-side conversion: if `dice_roll` is present and has ≥2 options, inject a `:::dice{label="..."}` markdown block into `player_instructions` so the existing UI parser picks it up. Label double-quotes are sanitized (→ `\u201D`), options are trimmed and newlines stripped.
- Legacy path (complicate/refine via `LEGACY_SYSTEM_PROMPT`) still embeds `:::dice` directly and is unchanged — no regression there.

---

## 2026-04-11 — Branch Merge: Next.js 15, Speed Insights, Video Fix

**Branches merged into main:** `feature/next15-upgrade`, `vercel-speed-insights`
**Pushed to:** github.com/AI-tachiUchia/kinkyfoxesnew (main)
**Deployed via:** Vercel auto-deploy on push

### What changed:

#### 1. Next.js 15 + React 19 Upgrade
- `next`: 14.2.3 → 15.5.14
- `react` / `react-dom`: 18.3.1 → 19.2.4
- `@types/react` / `@types/react-dom`: 18 → 19
- `lucide-react`: 0.378.0 → 0.479.0 (required for React 19 peer dep)
- `@swc/helpers`: 0.5.5 → 0.5.15
- `styled-jsx`: 5.1.1 → 5.1.6
- `scheduler`: 0.23.2 → 0.27.0
- **Why:** Fixes the lucide-react peer dependency error visible in Vercel dashboard. React 19 brings a new compiler for more efficient UI updates (timer, dice, etc.).

#### 2. Vercel Speed Insights
- New package: `@vercel/speed-insights@2.0.0`
- `app/layout.tsx`: `<SpeedInsights />` component added inside `<body>`
- **Why:** Enables real performance monitoring from the Vercel dashboard for troubleshooting.

#### 3. Mobile / Safari Loading Video Fix
- `app/components/FoxLoadingVideo.tsx`: added `preload="none"` to `<video>` element
- **Why:** Prevents the browser from auto-preloading the fox video on mobile, which was causing buffering/loading issues on iOS Safari.

#### 4. tsconfig.json Cleanup
- Reformatted arrays for readability
- Added `"target": "ES2017"` for broader compatibility

#### 5. New Docs Files
- `CHANGELOG.md` (this file) — project change history
- `issues.md` — known bugs tracker (QR code / login labels)

---

## 2026-04-03 to 2026-04-07 — Dice Roll, Partner Bar, Share Modal

Already in main before today's merge. Key features:
- **Dice Roll system:** 6-sided die, synced between partners via Supabase broadcast
- **Partner Status Bar:** Shows partner online/offline status
- **Share Modal:** Web Share API + QR code for room invites
- **GameMaster Setup Wizard:** Guided setup flow (toggleable back to classic form)
- **Model switching:** Default model switched to `gemini-3-flash-lite` via admin panel

---

## Tech Stack (current as of 2026-04-11)

| Component | Version |
|---|---|
| Next.js | 15.5.14 |
| React | 19.2.4 |
| Supabase JS | 2.100.x |
| lucide-react | 0.479.0 |
| @vercel/speed-insights | 2.0.0 |
| @google/genai (Vertex AI) | 1.48.0 |
| @anthropic-ai/sdk | 0.80.0 |
| sharp | 0.34.5 |
