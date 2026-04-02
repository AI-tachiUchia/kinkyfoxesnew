# kinkyfoxes

A real-time couples' roleplay game built with Next.js, Supabase, and AI-powered scene generation.

## Project Structure

- `app/` — Next.js App Router
  - `page.tsx` — Main game UI (three-view system: setup, generating, game)
  - `layout.tsx` — Root layout with global providers
  - `globals.css` — Global styles, theme, and view transition animations
  - `api/generate/route.ts` — AI game generation endpoint (Claude Haiku 4.5)
  - `api/toys/route.ts` — CRUD API for saved toys
  - `api/saved-games/route.ts` — CRUD API for bookmarked games
  - `components/FoxDisplay.tsx` — Fox character display with particle effects and dialogue bar
  - `components/FoxImage.tsx` — Fox image switcher with crossfade transitions (scene-aware)
  - `components/FoxLoadingVideo.tsx` — Fox loading animation for generation view
  - `components/PixelScene.tsx` — Pixel art scene renderer (legacy, still available)
- `public/fox-assets/` — Fox character images (transparent PNGs, 512×492)
- `.env` — Environment variables (Supabase URL/key, Anthropic API key)

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

### Fox Character Display

Replaced the old pixel art renderer with real fox character images that change based on game context:

- **Scene detection**: Analyzes game content for keywords (blindfold, bondage, punishment, tease, etc.) and selects a matching fox image
- **7 fox variants**: Default, blindfold, bondage/shibari, police costume, teacher, stewardess, sexy photos — all with transparent backgrounds
- **Crossfade transitions**: Smooth 700ms opacity crossfade when the scene changes
- **Particle effects**: Floating pixel-art particles (hearts, chains, flames, stars) overlay the fox image, themed to the current scene
- **Dialogue bar**: Context-aware text below the fox display

### Export as PDF

The game view includes a PDF export button (document icon in the action bar). Opens a clean, print-optimized view with the game title, duration, and all sections formatted for paper. Uses the browser's native print-to-PDF — no server-side rendering or extra dependencies.

### AI Game Generation

The `/api/generate` endpoint uses Claude Haiku 4.5 to generate, escalate, or refine games. The system prompt includes a comprehensive game design toolkit with 13 mechanic categories:

- Dares & challenges, power dynamics, sensory play, restraint & bondage, tease & denial, roleplay scenarios, escalation systems, randomization, competition & stakes, communication tools (safewords), physical challenges, psychological play, props & environment

**Key design rules enforced by the prompt:**
- All challenges, dares, and prompts are pre-generated (never "come up with your own")
- Clear, unambiguous rules — how turns work, what triggers escalation, how the game ends
- Enough content to fill the stated duration (8-12+ challenges minimum)
- Built-in escalation arc from warm-up to peak intensity
- Safety (traffic light safewords) and aftercare reminders for intense games

**Heat levels** (1-5) each have detailed guidance controlling language intensity, explicitness, and which mechanics are appropriate — from "sensual teasing, eye contact" at level 1 to "no-holds-barred, heavy BDSM" at level 5.

**Actions:**
| Action | Description |
|--------|-------------|
| `generate` | Create a new game from setup parameters |
| `complicate` | Escalate an existing game — more rounds, twists, bolder stakes |
| `refine` | Polish a game based on player feedback or general improvement |

## Setup

1. Clone the repo
2. `npm install`
3. Copy `.env.example` to `.env` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `ANTHROPIC_API_KEY`
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

## Session Log — 2026-04-02

### What was done

1. **Fox image transparency & resize** — Removed backgrounds from all fox images (JPG→PNG with transparency via sharp). Resized from ~2100×2016 to 512×492 (~95% smaller). Fixed FoxDisplay sizing to fit within its border box (`object-contain`, max 160px height).

2. **PDF export** — Added export-as-PDF button to the game view action bar. Opens a styled, print-optimized page with game title, duration, and sections. Translations for DE and EN.

3. **Game generation prompt rewrite** — Replaced thin prompts with a comprehensive system prompt containing a 13-category game design toolkit. Enforces pre-generated content, clear rules, built-in escalation, and safety. Expanded heat level descriptions. Increased max_tokens from 2048 to 4096. Rewrote all three action prompts (generate, escalate, refine).

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
