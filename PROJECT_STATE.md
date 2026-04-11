# Project State: KinkyFoxGames
**Date:** 2026-04-11
**Current Status:** Production (kinkyfoxes.com) — Next.js 15 + React 19 live on main.

## Technical Details
- **Framework:** Next.js 15 (App Router), React 19
- **Database/Realtime:** Supabase
- **AI Models:** Gemini (primary via Vertex AI), Claude fallback available in admin
- **Default model (game gen):** `gemini-3-flash-lite` (Vertex AI, `@google/genai` SDK)
- **Admin Panel:** Active via `?admin=SECRET` URL param. Persistent via sessionStorage.
- **Admin Secret:** Managed via `NEXT_PUBLIC_ADMIN_SECRET` env var.
- **Analytics:** Vercel Speed Insights (`@vercel/speed-insights`) active in layout.

## Branch Status (2026-04-11)
All feature branches fully merged into main and pushed:
- `feature/next15-upgrade` ✅ merged
- `vercel-speed-insights` ✅ merged (was subset of next15)
- Dice Roll system ✅ was already in main since `95fe9cb`

## Recent Changes (2026-04-11)
1. **Next.js 15 + React 19 upgrade:** Replaced Next 14 / React 18. Fixes the lucide-react icon error shown in Vercel dashboard. Async params (`await`) used for room URL params.
2. **Vercel Speed Insights:** `<SpeedInsights />` added to root layout. Package `@vercel/speed-insights@2.0.0` in dependencies. Enables troubleshooting performance issues from Vercel dashboard.
3. **Mobile/Safari video fix:** `preload="none"` added to `FoxLoadingVideo.tsx` — prevents auto-preloading on mobile which caused buffering issues.
4. **Dice Roll system:** Realtime dice roll UI (6-sided) synced across partners via Supabase broadcast — was already live since a prior session.
5. **heatLevel in API calls (unstaged):** `app/page.tsx` passes `heatLevel` to both "complicate" and "refine" API calls. Not yet committed.
6. **Dice fix under new XML prompt:** `app/api/generate/route.ts` — added optional `dice_roll` JSON field + server-side injection of `:::dice{}` markdown block so the interactive dice UI works again for newly generated games. See CHANGELOG for details.

## Active Bugs / Known Issues
See `issues.md` for the full list. Summary:
- QR codes not compatible with ZXing library implementations.
- Login page input fields missing explicit HTML labels (accessibility).

## Future Roadmap (Improvement Ideas)
- Fix QR code compatibility (ZXing)
- Add HTML labels to login inputs (accessibility / PageSpeed score)
- Game Templates: more roleplay categories
- Witzige Kommentare: AI comments on selected toys
