# Story 1.2: Page Layout & Wasm Bridge Integration

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer visiting datetime-helper,
I want to see a clean, structured page with input and output zones,
so that the tool's layout is immediately clear and the computation engine is ready.

## Acceptance Criteria

1. **Given** I navigate to the page, **When** it loads in a desktop browser (>= 1024px width), **Then** I see a centered layout (max-width 960px) with a 40/60 side-by-side split — input zone on the left (gray-50 background) and output zone on the right (white background).

2. **Given** `Layout.astro` is rendered, **When** I inspect the HTML head, **Then** it includes meta tags optimized for "unix timestamp calculator," "date math unix timestamp," and "datetime calculator," plus a proper `<title>`, viewport meta, and the global CSS import with `@import "tailwindcss"`.

3. **Given** `index.astro` renders the page, **When** the static HTML shell loads (before JS hydration), **Then** placeholder content is visible in the output zone — the page is not blank while Wasm loads.

4. **Given** `Calculator.svelte` is mounted with `client:load`, **When** the Svelte island hydrates, **Then** `wasmBridge.init()` is called and the Wasm module initializes successfully.

5. **Given** `wasmBridge.ts` wraps all Wasm functions, **When** any Wasm call throws an error, **Then** the error is caught via try/catch, logged to console, and a typed error result is returned — no uncaught Wasm exceptions propagate. *(Already satisfied by Story 1.1 — verify, do not recreate.)*

6. **Given** `types.ts` defines the `FormattedResult` interface, **When** imported by any component or module, **Then** it provides `{ unixTimestamp: number; iso8601: string; rfc2822: string; localHuman: string }` matching the Wasm output exactly. *(Already satisfied by Story 1.1 — verify, do not recreate.)*

## Tasks / Subtasks

- [x] Task 1: Update Layout.astro with SEO meta tags and font loading (AC: #2)
  - [x] 1.1 Add `<meta name="description">` targeting "unix timestamp calculator", "date math", "datetime calculator"
  - [x] 1.2 Add Open Graph meta tags (`og:title`, `og:description`, `og:type`)
  - [x] 1.3 Add JetBrains Mono font loading via Google Fonts CDN with `display=swap`
  - [x] 1.4 Add `<link rel="preconnect">` hints for `fonts.googleapis.com` and `fonts.gstatic.com`
  - [x] 1.5 Set `<body>` classes: `bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 font-sans antialiased`
  - [x] 1.6 Ensure `<html lang="en">` is set

- [x] Task 2: Update global.css with Tailwind v4 theme config (AC: #1)
  - [x] 2.1 Add `@theme` block defining `--font-mono` (JetBrains Mono stack) and `--font-sans` (system stack)
  - [x] 2.2 Add base html/body styles for min-height and smooth rendering

- [x] Task 3: Create Calculator.svelte root island component (AC: #1, #3, #4)
  - [x] 3.1 Create `src/components/Calculator.svelte` with Svelte 5 structure (imports → state → effects → handlers → template)
  - [x] 3.2 Add `$state` for `wasmReady` (boolean) and `error` (string | null)
  - [x] 3.3 Call `wasmBridge.init()` in `onMount`, set `wasmReady = true` on success, capture error on failure
  - [x] 3.4 Render two-zone flexbox layout: `flex-col lg:flex-row` with `gap-6`
  - [x] 3.5 Input zone: `lg:w-2/5`, `bg-gray-50`, `rounded-md`, placeholder labels for "Start Date" and "Operations"
  - [x] 3.6 Output zone: `lg:w-3/5`, placeholder result rows with format labels (Unix Timestamp on orange-50, ISO 8601, RFC 2822, Local Time on gray-50) showing "---" when not ready
  - [x] 3.7 After Wasm init succeeds, call `calculate()` with today's ISO date to verify integration — display real values as proof
  - [x] 3.8 Show Wasm error state if init fails (inline, non-blocking, subtle text)

- [x] Task 4: Update index.astro with Calculator island and page structure (AC: #1, #3)
  - [x] 4.1 Import Calculator.svelte and mount with `client:load`
  - [x] 4.2 Wrap content in `<main>` with centered `max-w-[960px] mx-auto` container
  - [x] 4.3 Add minimal header with "datetime-helper" branding (text only, sans-serif, semibold)
  - [x] 4.4 Remove placeholder "Project scaffolding complete" text

- [x] Task 5: Verify end-to-end integration (AC: #1, #3, #4, #5, #6)
  - [x] 5.1 Run `pnpm build:wasm` to ensure Wasm pkg/ exists
  - [x] 5.2 Run `pnpm dev` and open localhost:4321
  - [x] 5.3 Verify: centered 40/60 layout with distinct zone backgrounds on desktop
  - [x] 5.4 Verify: placeholder content renders in SSR before hydration (view page source)
  - [x] 5.5 Verify: no uncaught errors in browser console after Wasm init
  - [x] 5.6 Verify: real formatted result values display after Wasm initializes
  - [x] 5.7 Verify: layout stacks vertically on mobile viewport (< 768px via dev tools)
  - [x] 5.8 Verify: `types.ts` and `wasmBridge.ts` unchanged from Story 1.1

## Dev Notes

### Critical: Build Wasm Before Dev Server

**The Wasm module must be built before running the dev server.** The `pkg/` directory is gitignored and built from source.

```bash
pnpm build:wasm    # Builds to crates/datetime-engine/pkg/
pnpm dev           # Astro dev server at localhost:4321
```

The dev server will fail to resolve the Wasm import if `pkg/` doesn't exist. Always build Wasm first.

### AC #5 and #6: Already Satisfied — Do NOT Recreate

`wasmBridge.ts` (try/catch error handling) and `types.ts` (FormattedResult interface) were fully implemented in Story 1.1. Both AC #5 and #6 are already met. **Verify during integration testing but do NOT modify these files.**

### Story 1.1 Learnings (CRITICAL)

Patterns established in the previous story that MUST be respected:

| Decision | Detail | Impact |
|----------|--------|--------|
| Manual JSON serialization | serde removed from Wasm for bundle size (~94KB gzipped) | Do NOT add serde back |
| localHuman = UTC | jiff timezone database excluded for NFR5 | Intentional — MVP outputs UTC |
| wasm-opt disabled | Uses Rust LTO instead | Do NOT enable wasm-opt |
| wasmBridge import path | `../../crates/datetime-engine/pkg/datetime_engine.js` | Correct relative from `src/lib/` |
| 80 Rust tests passing | correctness + format + edge cases | Run `cargo test` if touching Rust |
| json_utils.rs module | Shared JSON escape utility | Use for any new Rust JSON output |

### Svelte 5 Component Pattern (MANDATORY)

Calculator.svelte must use **Svelte 5 runes** — NOT legacy Svelte 3/4 syntax.

```svelte
<script lang="ts">
  // 1. Imports
  import { onMount } from 'svelte';
  import { init, calculate } from '../lib/wasmBridge';
  import type { FormattedResult } from '../lib/types';

  // 2. Props (none for Calculator — root component)

  // 3. State
  let wasmReady = $state(false);
  let error = $state<string | null>(null);
  let result = $state<FormattedResult | null>(null);

  // 4. Derived values (none yet — added in Story 1.3)

  // 5. Effects / Lifecycle
  onMount(async () => {
    try {
      await init();
      wasmReady = true;
      // Verify integration with a test calculation
      const today = new Date().toISOString().split('T')[0]; // "2026-02-15"
      result = calculate(today, []);
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to initialize engine';
      console.error('Wasm init failed:', e);
    }
  });

  // 6. Event handlers (none yet)
</script>
```

**Why `onMount` instead of `$effect`:** Wasm initialization is a one-time side effect on component mount, not a reactive dependency. `onMount` is the correct Svelte 5 pattern for fire-once initialization. `$effect` is for reactive side effects that re-run when dependencies change.

**Why `new Date().toISOString()` here is OK:** This is ONLY for generating the initial ISO date string to pass TO the Wasm engine. All datetime computation happens in Wasm. The JS Date API is used only to get "now" as an ISO string input — this is explicitly allowed and is how the architecture intends it.

### Layout Specifications (from UX Design)

**Two-zone 40/60 split layout:**

```
┌─────────────────────────────────────────────────┐
│  datetime-helper                     (header)   │
├──────────────────┬──────────────────────────────┤
│  INPUT ZONE (40%)│  OUTPUT ZONE (60%)           │
│  bg-gray-50      │  bg-white                    │
│                  │                              │
│  [Start Date]    │  ┌── Unix Timestamp ──────┐  │
│  [Operations]    │  │  orange-50 bg, hero     │  │
│                  │  └────────────────────────┘  │
│                  │  ┌── ISO 8601 ─────────────┐ │
│                  │  │  gray-50 bg             │  │
│                  │  └────────────────────────┘  │
│                  │  ┌── RFC 2822 ─────────────┐ │
│                  │  └────────────────────────┘  │
│                  │  ┌── Local Time ───────────┐ │
│                  │  └────────────────────────┘  │
└──────────────────┴──────────────────────────────┘
```

**Responsive breakpoints:**

| Breakpoint | Width | Layout | Padding |
|-----------|-------|--------|---------|
| Desktop | >= 1024px | Side-by-side 40/60 | 32px (`px-8`) |
| Tablet | 768px–1023px | Side-by-side, tighter | 24px (`px-6`) |
| Mobile | < 768px | Stacked vertical | 16px (`px-4`) |

**Tailwind classes for the layout container:**
```html
<div class="max-w-[960px] mx-auto px-4 md:px-6 lg:px-8 py-6">
  <div class="flex flex-col lg:flex-row gap-6">
    <section class="lg:w-2/5 bg-gray-50 dark:bg-slate-800 rounded-md p-4 md:p-6">
      <!-- Input zone -->
    </section>
    <section class="lg:w-3/5 space-y-3">
      <!-- Output zone -->
    </section>
  </div>
</div>
```

**Spacing tokens:**
- Within components: 8px (`gap-2`)
- Between components in same zone: 16px (`gap-4`, `space-y-4`)
- Between zones: 24px (`gap-6`)
- Border radius: 6px (`rounded-md`) on all elements

### SEO Meta Tags

```html
<title>Unix Timestamp Calculator & Date Math Tool | datetime-helper</title>
<meta name="description" content="Free online Unix timestamp calculator with date math. Add or subtract days, months, years — instant results in Unix, ISO 8601, RFC 2822 formats. No ads, no tracking." />
<meta property="og:title" content="datetime-helper — Unix Timestamp Calculator & Date Math" />
<meta property="og:description" content="Free developer tool for Unix timestamp calculations and date math. Instant multi-format results." />
<meta property="og:type" content="website" />
```

### Typography

**JetBrains Mono via Google Fonts CDN (simplest for MVP):**
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet" />
```

**Tailwind v4 theme extension in global.css:**
```css
@import "tailwindcss";

@theme {
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  --font-sans: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
```

Use `font-mono` for all timestamp/date values. Use `font-sans` (default) for labels and UI text.

### Placeholder Content (AC #3)

When `wasmReady === false`, Calculator.svelte renders skeleton layout:

**Hero placeholder (Unix Timestamp):**
- `bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-md p-4`
- Label: `text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide` → "Unix Timestamp"
- Value: `font-mono text-2xl font-semibold text-gray-300 dark:text-gray-600` → "---"

**Standard format placeholders (ISO 8601, RFC 2822, Local Time):**
- `bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-md p-3`
- Label: `text-xs font-medium text-gray-500 dark:text-gray-400` → format name
- Value: `font-mono text-lg text-gray-300 dark:text-gray-600` → "---"

After Wasm init, replace "---" with actual computed values from `calculate()`.

### Color Tokens Reference

| Token | Light | Dark |
|-------|-------|------|
| Page background | `bg-white` | `dark:bg-slate-900` |
| Input zone bg | `bg-gray-50` | `dark:bg-slate-800` |
| Output zone bg | `bg-white` | `dark:bg-slate-900` |
| Hero row bg | `bg-orange-50` | `dark:bg-orange-950/30` |
| Hero row border | `border-orange-200` | `dark:border-orange-800` |
| Result row bg | `bg-gray-50` | `dark:bg-slate-800` |
| Result row border | `border-gray-100` | `dark:border-slate-700` |
| Text primary | `text-gray-900` | `dark:text-gray-100` |
| Text secondary | `text-gray-500` | `dark:text-gray-400` |
| Accent | `text-orange-500` | `text-orange-400` |

### Scope Boundaries (What This Story Does NOT Include)

| Feature | Deferred To | Reason |
|---------|------------|--------|
| Live-ticking Unix timestamp | Story 1.3 | Requires $effect interval, "● live" indicator |
| StartDateInput component | Story 2.1 | Date input with "now" default and validation |
| OperationRow component | Story 2.2 | Direction + amount + unit controls |
| AddOperationButton, ResetButton | Story 2.3 | Multi-step operations |
| CopyButton component | Story 1.4 | Copy-to-clipboard with confirmation |
| HeroResultRow / ResultRow as standalone components | Story 1.3 | Extracted from Calculator when needed |
| Full dark mode styling | Story 3.1 | BUT: add `dark:` foundation classes now |
| Mobile fine-tuning | Story 3.2 | BUT: implement basic responsive breakpoints now |

**This story creates the SHELL — the page layout, Wasm initialization, and visual foundation that all subsequent stories build upon. Placeholder content in both zones demonstrates the layout is correct.**

### Project Structure Notes

**Files to CREATE:**

| File | Purpose |
|------|---------|
| `src/components/Calculator.svelte` | Root island component — layout, Wasm init, placeholder content |

**Files to MODIFY:**

| File | Changes |
|------|---------|
| `src/layouts/Layout.astro` | Add SEO meta tags, font loading, preconnect hints, body classes |
| `src/pages/index.astro` | Import Calculator with `client:load`, add `<main>` container, header |
| `src/styles/global.css` | Add `@theme` block with font family definitions |

**Files NOT to modify (already correct from Story 1.1):**

| File | Reason |
|------|--------|
| `src/lib/types.ts` | FormattedResult already defined correctly |
| `src/lib/wasmBridge.ts` | Bridge fully implemented with error handling |
| `astro.config.mjs` | Svelte + Tailwind already configured |
| `crates/datetime-engine/*` | No Rust changes needed |

### Anti-Patterns (FORBIDDEN)

- Do NOT create a `utils/` folder — use `lib/`
- Do NOT use `any` in TypeScript — use proper types or `unknown`
- Do NOT use JavaScript Date API for datetime computation (getting ISO string for Wasm input is OK)
- Do NOT create `__tests__/` directories — co-locate tests
- Do NOT use `@apply` in CSS — Tailwind utilities only in templates
- Do NOT create custom CSS class names — Tailwind utilities only
- Do NOT use legacy Svelte syntax (`export let`, `$:`, `on:click`)
- Do NOT import Wasm directly in components — only through wasmBridge.ts
- Do NOT use inline styles — use Tailwind classes

### Naming Conventions

| Context | Convention | Example |
|---------|-----------|---------|
| Svelte components | PascalCase | `Calculator.svelte` |
| TypeScript modules | camelCase | `wasmBridge.ts` |
| TypeScript interfaces | PascalCase | `FormattedResult` |
| Test files | Co-located `.test.ts` | `Calculator.test.ts` |
| Constants | UPPER_SNAKE_CASE | `TICK_INTERVAL_MS` |

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend-Architecture] — Svelte 5 runes, state management, Calculator.svelte as root island
- [Source: _bmad-output/planning-artifacts/architecture.md#Wasm-Integration-Architecture] — Bridge API, eager loading, init() on mount
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation-Patterns] — Component structure order, naming, anti-patterns, Tailwind rules
- [Source: _bmad-output/planning-artifacts/architecture.md#Project-Structure-&-Boundaries] — Directory structure, 3 architectural boundaries, component tree
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Visual-Design-Foundation] — Colors (orange-500 accent), typography (JetBrains Mono), spacing (4px base)
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Design-Direction-Decision] — 40/60 Classic Side-by-Side, zone backgrounds, max-width 960px
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Responsive-Design] — Breakpoints (1024px/768px), desktop-first, stacked mobile
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Component-Strategy] — HeroResultRow (orange-50, 2rem/32px), ResultRow (gray-50), component anatomy
- [Source: _bmad-output/planning-artifacts/epics.md#Story-1.2] — Acceptance criteria, story statement
- [Source: _bmad-output/planning-artifacts/prd.md#SEO-Strategy] — Meta tags for "unix timestamp calculator", Astro static HTML
- [Source: _bmad-output/implementation-artifacts/1-1-project-scaffolding-wasm-engine-validation.md] — Previous story: Wasm bridge, types.ts, manual JSON, ~94KB bundle, wasm-opt disabled
- [Source: sveltejs/svelte@5.x docs] — $state, $derived, $effect, onMount lifecycle patterns
- [Source: withastro/docs] — client:load directive, Svelte integration, SEO head component patterns
- [Source: Tailwind CSS v4 docs] — @theme block for custom design tokens, font family configuration

## Dev Agent Record

### Agent Model Used

Claude claude-4.6-opus (Cursor Agent)

### Debug Log References

- No debug issues encountered. All tasks implemented cleanly in a single pass.

### Completion Notes List

- **Task 1:** Updated Layout.astro with SEO meta tags (description, og:title, og:description, og:type), JetBrains Mono font loading via Google Fonts CDN with display=swap, preconnect hints, and body classes for bg/text/font/antialiased. `<html lang="en">` was already set from Story 1.1.
- **Task 2:** Added `@theme` block to global.css defining `--font-mono` (JetBrains Mono stack) and `--font-sans` (system stack) for Tailwind v4. Added base html/body styles for min-height and smooth font rendering.
- **Task 3:** Created Calculator.svelte using Svelte 5 runes (`$state`). Component initializes Wasm via `onMount`, renders 40/60 flexbox layout with input zone (placeholder labels) and output zone (Unix Timestamp on orange-50 hero row, ISO 8601/RFC 2822/Local Time on gray-50 rows). Shows "---" placeholders before Wasm init, real computed values after. Error state displayed inline.
- **Task 4:** Updated index.astro to import Calculator with `client:load`, wrapped in `<main>` with max-w-[960px] centered container. Added "datetime-helper" branding header. Removed placeholder scaffolding text.
- **Task 5:** Full end-to-end verification: Wasm builds successfully (~96KB gzipped), centered 40/60 layout confirmed on desktop, vertical stacking on mobile (375px), SSR placeholder "---" content confirmed in built HTML source, zero browser console errors, real values (Unix: 1771113600, ISO 8601, RFC 2822, Local Time) display after Wasm hydration. types.ts and wasmBridge.ts unchanged from Story 1.1. All 80 Rust tests pass with zero regressions.

### File List

- src/layouts/Layout.astro (modified) — Added SEO meta tags, OG tags, JetBrains Mono font loading, preconnect hints, body classes; review: added initial-scale=1 to viewport meta
- src/styles/global.css (modified) — Added @theme block with --font-mono and --font-sans, base html/body styles; review: removed redundant font smoothing (duplicated by Tailwind antialiased class)
- src/components/Calculator.svelte (new) — Root Svelte 5 island: Wasm init, 40/60 layout, placeholder/live output zones; review: fixed responsive breakpoint (lg: → md:), hero font size (text-2xl → text-[2rem]), heading hierarchy (h2 → p), added aria-labels on sections
- src/pages/index.astro (modified) — Calculator island with client:load, centered main container, header branding
- src/components/.gitkeep (deleted) — Removed placeholder, replaced by Calculator.svelte

### Senior Developer Review (AI)

**Reviewer:** Samuel (AI-assisted) on 2026-02-15
**Issues Found:** 2 High, 5 Medium, 3 Low
**Issues Fixed:** 7 (2 High + 5 Medium)

**Fixed issues:**
- [x] [AI-Review][HIGH] Responsive breakpoint mismatch: tablet (768-1023px) stacked instead of side-by-side. Changed lg: → md: prefixes in Calculator.svelte (flex-row, w-2/5, w-3/5).
- [x] [AI-Review][HIGH] Hero Unix Timestamp font size was 24px (text-2xl) instead of UX-specified 32px. Changed to text-[2rem] with leading-tight.
- [x] [AI-Review][MEDIUM] `<h2>Input</h2>` violated UX spec heading hierarchy ("h1 only"). Changed to `<p>`.
- [x] [AI-Review][MEDIUM] Missing `initial-scale=1` in viewport meta tag. Added to Layout.astro.
- [x] [AI-Review][MEDIUM] Font smoothing properties duplicated between Layout.astro (Tailwind antialiased) and global.css. Removed redundant CSS properties.
- [x] [AI-Review][MEDIUM] Git repository not initialized. Ran `git init`.
- [x] [AI-Review][MEDIUM] Missing `aria-label` on `<section>` elements. Added `aria-label="Input"` and `aria-label="Results"`.

**Remaining low-severity items (not fixed — non-blocking):**
- [AI-Review][LOW] "datetime calculator" keyword not present in meta description
- [AI-Review][LOW] No co-located Calculator.test.ts file (architecture recommends co-located tests)
- [AI-Review][LOW] Output zone `<section>` has no explicit background (inherits from body)

## Change Log

- 2026-02-15: Story 1.2 implemented — Page layout with 40/60 side-by-side split (input/output zones), SEO meta tags (description, Open Graph), JetBrains Mono font via Google Fonts CDN, Tailwind v4 @theme config, and Calculator.svelte root island with Wasm bridge integration. SSR renders placeholder "---" content before hydration; live Wasm values display after init. All 80 Rust tests pass, zero regressions, zero console errors.
- 2026-02-15: Code review fixes applied — Fixed responsive breakpoint (lg: → md: for tablet side-by-side), hero font size (24px → 32px per UX spec), heading hierarchy (h2 → p), viewport meta (added initial-scale=1), removed duplicate font smoothing, initialized git repo, added aria-labels to section elements.
