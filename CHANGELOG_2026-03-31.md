# Changelog — 2026-03-31: Switched from Gemini to Claude API

## What changed

### API Migration: Google Gemini -> Anthropic Claude
- **`app/api/generate/route.ts`** — Replaced the Google Generative AI SDK (`@google/generative-ai`) with the Anthropic SDK (`@anthropic-ai/sdk`).
- The generation model is now **`claude-sonnet-4-6`** (was `gemini-2.5-flash`).
- The API key environment variable is now **`ANTHROPIC_API_KEY`** (was `GEMINI_API_KEY`). Make sure `.env.local` has this set.

### Bug fix: Duplicate code removed
- The file had the entire route duplicated from line 99 onward (imports + export inside the function body), plus a stray debug snippet at the end. This caused a build error: `'import' and 'export' cannot be used outside of module code`. All duplicate/junk code was removed.

### Bug fix: Robust JSON parsing (3-layer fallback)
The model sometimes returns JSON wrapped in markdown fences, or with literal newlines inside string values, which breaks `JSON.parse`. The parsing now has 3 layers of fallback:

1. **Direct parse** — Strip markdown fences, find the `{...}` block, try `JSON.parse`.
2. **Control char escape** — If that fails, escape literal newlines (`\n`), carriage returns (`\r`), and tabs (`\t`) inside the JSON string, then retry.
3. **Regex extraction** — If both fail, extract `title`, `duration`, and `sections` via regex as a last resort.

This fixes the `SyntaxError: Expected property name or '}' in JSON` errors that occurred on generate, complicate, and refine actions.

### Prompt tweaks
- **Complicate** prompt now says "but it should still be playable"
- **Refine** prompt fallback text updated
- **Generate** prompt clarifies "but neither ignore them, since it has to be playable and fun"
- Heat level descriptions for levels 4 and 5 updated with more flavor

## What works now
- Generate new games (all heat levels, both languages)
- Complicate existing games (including imported JSON games)
- Refine existing games (including imported JSON games)
- Import JSON games from earlier versions, then complicate/refine them

## Dependencies
- Added: `@anthropic-ai/sdk`
- Removed: `@google/generative-ai` (can be uninstalled if no longer used elsewhere)
