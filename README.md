# kinkyfoxes

A real-time couples' roleplay game built with Next.js, Supabase, and AI-powered scene generation.

## Project Structure

- `app/` — Next.js App Router
  - `page.tsx` — Main game UI (session setup, toybox, scene display)
  - `layout.tsx` — Root layout with global providers
  - `globals.css` — Global styles and theme
  - `api/generate/route.ts` — AI scene generation endpoint
  - `api/toys/route.ts` — CRUD API for saved toys
  - `components/PixelScene.tsx` — Pixel art scene renderer
- `public/` — Static assets (images, fonts)
- `.env` — Environment variables (Supabase URL/key, AI keys)

## Features

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
- Add new toys via inline text input
- Delete toys with the × button on each chip
- Selections sync to partner in real-time via Supabase Realtime

### Real-time Partner Sync

Partners join a shared session via link. Toy selections and session state broadcast in real-time using Supabase Realtime channels.

### AI Scene Generation

The `/api/generate` endpoint takes the current session context (scenario, toys, preferences) and returns AI-generated roleplay scenes.

## Setup

1. Clone the repo
2. `npm install`
3. Copy `.env.example` to `.env` and fill in your Supabase and AI API keys
4. `npm run dev`

## Supabase Tables

- `user_toys` — `id` (uuid), `user_id` (uuid), `name` (text), `description` (text)
