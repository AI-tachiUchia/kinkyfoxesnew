# Project State: KinkyFoxGames
**Date:** 2026-04-05
**Current Status:** Production (kinkyfoxes.com), Vercel auto-deploy from main branch.

## Technical Details
- **Framework:** Next.js (App Router)
- **Database/Realtime:** Supabase
- **AI Models:** Claude Sonnet 4.6 (Primary), Gemini 3.1 Pro (Fallback)
- **Admin Panel:** Active via `?admin=SECRET` URL param.
- **Admin Secret:** Managed via `NEXT_PUBLIC_ADMIN_SECRET` env var.

## Recent Changes (2026-04-05)
1. **Admin Panel:** Implemented live AI model switching in production. Fixed issue where room redirect stripped URL parameters. Added `sessionStorage` persistence for admin status.
2. **Assets:** Integrated approved fox images (Worship, Nurse, Spanking, etc.) and new looping loading videos.
3. **Rendering:** Fixed fox image rendering. Pixel-art uses `object-contain` + dark BG; Full-illustrations use `object-cover` + dark BG.
4. **Environment:** Local dev server running on port 3000. Admin password set in `.env.local`.

## Active Bugs / Known Issues
- None reported at the moment.

## Future Roadmap (Improvement Ideas)
- **Witzige Kommentare:** AI comments on selected toys.
- **Atmosphäre/Stimmung:** Make the vibe field clearer.
- **Game Templates:** Add more roleplay categories (Maid, Police, etc.).
- **Realtime Timer:** Shared timer for game tasks.
- **Dice Function:** Realtime dice rolls.
