# Project State: KinkyFoxGames
**Date:** 2026-04-05
**Current Status:** Production (kinkyfoxes.com) live with latest model switching and UI polish.

## Technical Details
- **Framework:** Next.js (App Router)
- **Database/Realtime:** Supabase
- **AI Models:** Claude Sonnet 4.6 (Primary), Gemini 3.1 Pro (Fallback)
- **Admin Panel:** Active via `?admin=SECRET` URL param. Persistent via sessionStorage.
- **Admin Secret:** Managed via `NEXT_PUBLIC_ADMIN_SECRET` env var.

## Recent Changes (2026-04-05)
1. **Model Switch Polish:** Fixed Anthropic auth error (invalid key updated by user). Added `gemini-2.0-flash` as stable option. Improved server-side logging and model fallbacks.
2. **UI Restoration:** Restored emojis in section titles (e.g., "🔥 Intro"). Ensured the first section of a game is automatically expanded upon generation/complicate/refine.
3. **Admin Stability:** Preserved URL parameters during room redirect and added sessionStorage persistence for admin status.
4. **Assets:** Integrated approved fox images and looping loading videos.

## Active Bugs / Known Issues
- None.

## Future Roadmap (Improvement Ideas)
- **Witzige Kommentare:** AI comments on selected toys.
- **Atmosphäre/Stimmung:** Make the vibe field clearer.
- **Game Templates:** Add more roleplay categories.
- **Realtime Timer:** Shared timer for game tasks.
- **Dice Function:** Realtime dice rolls.
