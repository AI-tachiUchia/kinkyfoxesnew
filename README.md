# kinkyfoxes

A real-time couples' roleplay game built with Next.js, Supabase, and AI-powered scene generation.

## Project Structure

- `app/` — Next.js App Router
  - `page.tsx` — Main game UI (three-view system: setup, generating, game)
  - `layout.tsx` — Root layout with global providers
  - `globals.css` — Global styles, theme, and view transition animations
  - `api/generate/route.ts` — AI scene generation endpoint (Gemini 2.5 Flash)
  - `api/toys/route.ts` — CRUD API for saved toys
  - `api/saved-games/route.ts` — CRUD API for bookmarked games
  - `components/PixelScene.tsx` — Pixel art scene renderer
- `public/` — Static assets (images, fonts)
- `.env` — Environment variables (Supabase URL/key, Gemini API key)

## Features

### View-Switching UI

The app uses a three-screen architecture instead of a single scrollable page:

1. **Setup View** — Configure distance, toybox, atmosphere, template, heat level. Generate or Surprise buttons transition to the next view.
2. **Generating View** — Full-screen immersive loading with pulsing glow, pixel scene animation, and breathing text.
3. **Game View** — The generated game takes the entire screen. Sections animate in with staggered delays. A floating action bar at the bottom provides Refine, Escalate, Bookmark, and Download actions. A back arrow returns to setup.

Transitions use CSS keyframes (slide left/right with scale easing) defined in `globals.css`.

### Toybox

Lets users save their toys to the database so they don't have to re-type them every session. Toys are stored per-user in the `user_toys` Supabase table.

**API** (`app/api/toys/route.ts`):
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/toys` | Fetch all saved toys for the authenticated user |
| `POST` | `/api/toys` | Add a new toy `{ name, description }` |
| `DELETE` | `/api/toys?id=<uuid>` | Delete a toy by ID |

**UI** (in `app/page.tsx`):
- Collapsible "Toybox" panel with chip-based toggles
- Click a chip to toggle it on/off — selected toys auto-fill the "Available Items" field
- Add new toys via inline text input (supports comma/and-separated bulk add)
- Delete toys with the x button on each chip
- Selections sync to partner in real-time via Supabase Realtime

### Partner Toy Sync

Each user's toybox is broadcast to their partner via Supabase Realtime (`toybox-sync` event). Partner's items appear as read-only purple chips below the user's own toybox. Both sets of toys are automatically included in AI generation prompts so the AI knows what both partners have available.

### Session History / Favorites

Users can bookmark generated games to replay later without re-generating.

**API** (`app/api/saved-games/route.ts`):
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/saved-games` | Fetch all bookmarked games for the authenticated user |
| `POST` | `/api/saved-games` | Bookmark a game `{ title, game_data }` |
| `DELETE` | `/api/saved-games?id=<uuid>` | Delete a bookmarked game by ID |

**UI**: Collapsible "Saved Games" panel in the setup view. Click a saved game to load it directly into the game view.

### Custom Refinement

The Refine button in the game view opens an inline text input where users describe exactly what to change (e.g. "make round 2 longer", "add a blindfold twist"). When left empty, the API falls back to a generic improvement prompt. The backend (`api/generate/route.ts`) already supported the `refinement` field — only the frontend needed updating.

### Real-time Partner Sync

Partners join a shared session via link (`?room=<id>`). All session state (distance, toys, vibe, template, generated game, loading states) and toybox contents broadcast in real-time using Supabase Realtime broadcast channels.

### AI Scene Generation

The `/api/generate` endpoint uses Gemini 2.5 Flash to generate, complicate ("escalate"), or refine games. Supports 5 heat levels with calibrated prompt instructions. Returns structured JSON with title, duration, and collapsible sections.

## Setup

1. Clone the repo
2. `npm install`
3. Copy `.env.example` to `.env` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GEMINI_API_KEY`
4. Create Supabase tables (see below)
5. `npm run dev`

## Supabase Tables

### `user_toys`
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Auto-generated |
| `user_id` | uuid (FK -> auth.users) | Owner |
| `name` | text | Toy name |
| `description` | text | Optional description |

### `saved_games`
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Auto-generated |
| `user_id` | uuid (FK -> auth.users) | Owner |
| `title` | text | Game title |
| `game_data` | jsonb | Full game object |
| `created_at` | timestamptz | Auto-generated |

Both tables use RLS with policies scoped to `auth.uid() = user_id`.

---

## Session Log — 2026-03-29

### What was done

**4 commits across this session:**

1. **`457616c` — Toybox documentation + push**
   Updated README with full project structure, feature docs, and Supabase schema. Committed all previously unstaged toybox work (API route, chip UI, PixelScene component).

2. **`4329557` — Build fix**
   `PixelScene.tsx` used `[...row]` to iterate a string, which fails TypeScript's type checker without `downlevelIteration`. Fixed by replacing with `row.split('')`.

3. **`114b01e` — Three new features**
   - **Session History**: New `saved-games` API route + bookmark/load/delete UI
   - **Custom Refinement**: Replaced hardcoded refine prompt with user text input
   - **Partner Toy Sync**: Broadcast toybox via Realtime, show partner items as purple chips, include in generation

4. **`6840ab8` — View-switching UI overhaul**
   Replaced the single-page scroll layout with a three-screen system (setup / generating / game). CSS keyframe transitions between views. Full-screen immersive loading. Floating bottom action bar on game view. Back navigation.

### How it was done

- **Pattern cloning**: The `saved-games` API was built by cloning the existing `toys/route.ts` pattern exactly — same auth flow, same Supabase client setup, same error handling. Consistency over cleverness.
- **Realtime reuse**: Partner toy sync used the existing broadcast channel infrastructure. Added a new `toybox-sync` event type and extended the `request-sync` handler to include toys. No new channels or subscriptions.
- **Backend-first check**: For custom refinement, checked the API first and found it already accepted a `refinement` field — so zero backend changes were needed. Only the frontend hardcoded string needed replacing.
- **View state machine**: The three-view system uses a simple `view` state (`'setup' | 'generating' | 'game'`) with a `transitionTo()` helper that sequences exit/enter animations via `setTimeout`. No routing library needed for this scale.
- **Build-test loop**: Every change was verified with `next build` before pushing to catch type errors early (which caught the PixelScene spread issue on the first push).

### What I'd approach differently next time

1. **Break `page.tsx` into components sooner**. The file is ~850 lines with all three views, all handlers, and all state in one component. Should have extracted `SetupView`, `GameView`, `GeneratingView`, and a `useGameState` hook. This would make each view independently testable and easier to modify.

2. **Use a proper state machine library** (like XState or Zustand) for the view transitions. The current `view` + `viewAnim` + `setTimeout` approach works but is fragile — rapid clicks can desync the animation state. A state machine would make impossible states impossible.

3. **Stream the AI response** instead of waiting for the full JSON. The generating view looks great but the wait can be 10-15 seconds. Streaming sections as they arrive would feel much snappier and is a better use of the immersive loading screen.

4. **Add the Supabase migration to the repo**. The `saved_games` table had to be created manually via the dashboard. A `supabase/migrations/` directory with SQL files would make this reproducible and version-controlled.

5. **Test partner sync with two browsers** before shipping. The toybox broadcast logic was written and verified at the code level but not integration-tested with an actual second client. Edge cases like reconnection and stale state could surface.
