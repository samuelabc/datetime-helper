# Story 1.3: Live-Ticking Hero Timestamp & Multi-Format Results

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer needing the current Unix timestamp,
I want to see the current time in all four formats the moment the page loads — with the Unix timestamp ticking live,
so that I can read or copy the value I need without any interaction.

## Acceptance Criteria

1. **Given** the page loads at default state (start = "now", no operations), **When** Wasm initializes, **Then** the hero row displays the current Unix timestamp in large (2rem/32px) semibold monospace text on an orange-50 background with an orange-200 border (FR8, FR20).

2. **Given** the page is at default state, **When** 1 second passes, **Then** the Unix timestamp value in the hero row updates to reflect the current time, without layout shift or jank (FR10, NFR7).

3. **Given** the hero row is live-ticking, **When** I observe it, **Then** a "● live" indicator is displayed in orange near the hero row, communicating that the value is updating in real time (FR11).

4. **Given** the page loads, **When** I look below the hero row, **Then** I see three additional result rows displaying: ISO 8601, RFC 2822, and local human-readable formats — each with a format label in sans-serif and value in monospace (FR7).

5. **Given** the page is at default state, **When** 1 second passes, **Then** all four format values (hero + 3 result rows) update simultaneously, all representing the same instant (NFR17).

6. **Given** the complete calculator and results area on a desktop viewport (1280x800+), **When** I view the page, **Then** everything fits within a single viewport without scrolling (FR25).

## Tasks / Subtasks

- [x] Task 1: Create HeroResultRow.svelte component (AC: #1, #3)
  - [x] 1.1 Create `src/components/HeroResultRow.svelte` using Svelte 5 runes
  - [x] 1.2 Define Props interface: `{ value: number; isLive: boolean }`
  - [x] 1.3 Render orange-50 bg, orange-200 border container with "Unix Timestamp" label
  - [x] 1.4 Display value in `font-mono text-[2rem] leading-tight font-semibold`
  - [x] 1.5 Add "● live" indicator: small orange dot + "live" text, visible only when `isLive` is true
  - [x] 1.6 Add `aria-live="polite"` region with 10-second throttle for screen reader updates
  - [x] 1.7 Support `prefers-reduced-motion`: hide live indicator and show static value when active

- [x] Task 2: Create ResultRow.svelte component (AC: #4)
  - [x] 2.1 Create `src/components/ResultRow.svelte` using Svelte 5 runes
  - [x] 2.2 Define Props interface: `{ formatLabel: string; value: string }`
  - [x] 2.3 Render gray-50 bg, gray-100 border container with format label in sans-serif and value in monospace
  - [x] 2.4 Value text must be selectable (no `user-select: none`) — support double-click + Ctrl+C
  - [x] 2.5 Apply dark mode variants consistently

- [x] Task 3: Add live-ticking logic to Calculator.svelte (AC: #2, #5)
  - [x] 3.1 Add `$state` for `isLive` (boolean, default `true`)
  - [x] 3.2 Add `$effect` that sets up a 1-second `setInterval` when `isLive && wasmReady`
  - [x] 3.3 Each tick: generate current ISO date string, call `calculate(today, [])`, update `result` state
  - [x] 3.4 Return cleanup function from `$effect` to `clearInterval` on destroy or re-run
  - [x] 3.5 Support `prefers-reduced-motion`: check `window.matchMedia`, skip interval if active (compute once)
  - [x] 3.6 Import and use HeroResultRow and ResultRow components, replacing inline output HTML

- [x] Task 4: Verify end-to-end behavior (AC: #1–#6)
  - [x] 4.1 Run `pnpm build:wasm` then `pnpm dev`
  - [x] 4.2 Verify: hero row shows current Unix timestamp at 2rem/32px semibold monospace on orange-50 bg
  - [x] 4.3 Verify: Unix timestamp ticks every 1 second with no layout shift
  - [x] 4.4 Verify: "● live" indicator visible in orange near hero row
  - [x] 4.5 Verify: three result rows show ISO 8601, RFC 2822, Local Time with correct format labels
  - [x] 4.6 Verify: all 4 values update simultaneously each second (same instant)
  - [x] 4.7 Verify: everything fits in a single desktop viewport (1280x800) without scrolling
  - [x] 4.8 Verify: no uncaught errors in browser console
  - [x] 4.9 Verify: all 80 Rust tests still pass (`cargo test`)

## Dev Notes

### Critical: Build Wasm Before Dev Server

**The Wasm module must be built before running the dev server.** The `pkg/` directory is gitignored and built from source.

```bash
pnpm build:wasm    # Builds to crates/datetime-engine/pkg/
pnpm dev           # Astro dev server at localhost:4321
```

### Story 1.1 + 1.2 Learnings (CRITICAL — DO NOT VIOLATE)

| Decision | Detail | Impact |
|----------|--------|--------|
| Manual JSON serialization | serde removed from Wasm for bundle size (~94KB gzipped) | Do NOT add serde back |
| localHuman = UTC | jiff timezone database excluded for NFR5 | Intentional — MVP outputs UTC |
| wasm-opt disabled | Uses Rust LTO instead | Do NOT enable wasm-opt |
| wasmBridge import path | `../../crates/datetime-engine/pkg/datetime_engine.js` | Correct relative from `src/lib/` |
| 80 Rust tests passing | correctness + format + edge cases | Run `cargo test` — zero regressions |
| json_utils.rs module | Shared JSON escape utility | Use for any new Rust JSON output |
| Responsive breakpoints | `md:` prefix for tablet side-by-side (NOT `lg:`) | Story 1.2 review fix — do not revert |
| Hero font size | `text-[2rem]` with `leading-tight` | 32px per UX spec, NOT text-2xl (24px) |
| Sections have aria-labels | `aria-label="Input"` and `aria-label="Results"` | Story 1.2 review fix — preserve |

### Files NOT to Modify (Already Correct)

| File | Reason |
|------|--------|
| `src/lib/types.ts` | FormattedResult, Operation, ValidationResult already defined |
| `src/lib/wasmBridge.ts` | Bridge fully implemented — init(), calculate(), validateDate(), nowUnix() |
| `astro.config.mjs` | Svelte + Tailwind already configured |
| `crates/datetime-engine/*` | No Rust changes needed for this story |
| `src/layouts/Layout.astro` | SEO, fonts, body classes already correct |
| `src/pages/index.astro` | Calculator island + page structure already correct |
| `src/styles/global.css` | @theme block with font definitions already correct |

### Files to CREATE

| File | Purpose |
|------|---------|
| `src/components/HeroResultRow.svelte` | Unix timestamp hero display with live indicator |
| `src/components/ResultRow.svelte` | Generic format result row (ISO 8601, RFC 2822, Local Time) |

### Files to MODIFY

| File | Changes |
|------|---------|
| `src/components/Calculator.svelte` | Add live-tick logic ($effect interval), import and use HeroResultRow + ResultRow components, add isLive state |

### Live-Ticking Implementation (CRITICAL DESIGN)

**Architecture:** The live-ticking mechanism uses Svelte 5's `$effect` with a 1-second `setInterval`. Each tick calls `calculate()` with the current ISO date string to get all 4 formats simultaneously from the Wasm engine. This ensures all formats represent the exact same instant (NFR17).

**Why `calculate()` and NOT `nowUnix()`:** The `nowUnix()` function returns only the Unix timestamp. But all 4 format values must update simultaneously representing the same instant. Calling `calculate()` with today's date produces all 4 values from a single computation. If we used `nowUnix()` for the hero and a separate call for others, they could represent different milliseconds.

**Why `$effect` and NOT `onMount`:** The interval depends on reactive state (`isLive` and `wasmReady`). When `isLive` changes (future stories: user enters a date), the `$effect` automatically cleans up the old interval. `onMount` would require manual state tracking. `$effect` is the correct Svelte 5 pattern for reactive side effects.

**The `$effect` must NOT reference `result` state** inside its body (only write to it). Reading `result` would create a dependency loop causing the effect to re-run every time it updates `result`.

**Pseudocode:**

```
// In Calculator.svelte
let isLive = $state(true);
let result = $state<FormattedResult | null>(null);

// Live-tick effect — separate from onMount init
$effect(() => {
  if (!isLive || !wasmReady) return;

  // Check prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Compute immediately on effect start
  const computeNow = () => {
    const now = new Date().toISOString().split('T')[0] + 'T' +
                new Date().toISOString().split('T')[1];
    result = calculate(now, []);
  };
  computeNow();

  // If reduced motion, don't set up interval — static display
  if (prefersReducedMotion) return;

  const interval = setInterval(computeNow, 1000);
  return () => clearInterval(interval);
});
```

**IMPORTANT: Getting "now" as ISO string for Wasm:** Use `new Date().toISOString()` to get the full datetime including time (e.g., "2026-02-15T14:30:00.000Z"). Do NOT use `.split('T')[0]` (date-only) — that would give midnight, not the current time. Pass the full ISO string to `calculate()`.

### Using `new Date().toISOString()` Is Explicitly Allowed

The architecture says "No JS Date API usage for datetime computation." Getting the current time as an ISO string to pass TO the Wasm engine is NOT computation — it's input generation. This is the architecturally intended pattern. The Wasm engine does all actual datetime math.

### HeroResultRow Component Design

```svelte
<!-- HeroResultRow.svelte -->
<script lang="ts">
  // 1. Imports (none needed from svelte for this component)

  // 2. Props
  interface Props {
    value: number;
    isLive: boolean;
  }
  let { value, isLive }: Props = $props();

  // 3. State — for screen reader throttle
  let lastAnnouncedValue = $state(value);
  let lastAnnouncedTime = $state(0);

  // 4. Derived
  // Screen reader text updated max every 10 seconds
  let screenReaderValue = $derived.by(() => {
    const now = Date.now();
    if (now - lastAnnouncedTime >= 10000) {
      // Side effects in $derived are not allowed — handle differently
      // Use $effect instead for the throttle
    }
    return lastAnnouncedValue;
  });

  // 5. Effects
  $effect(() => {
    // Throttle screen reader announcements to every 10 seconds
    const now = Date.now();
    if (now - lastAnnouncedTime >= 10000) {
      lastAnnouncedValue = value;
      lastAnnouncedTime = now;
    }
  });
</script>

<div class="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-md p-4">
  <div class="flex items-center justify-between">
    <span class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Unix Timestamp</span>
    {#if isLive}
      <span class="flex items-center gap-1 text-xs font-medium text-orange-500 dark:text-orange-400">
        <span class="inline-block w-2 h-2 rounded-full bg-orange-500 dark:bg-orange-400"></span>
        live
      </span>
    {/if}
  </div>
  <p class="font-mono text-[2rem] leading-tight font-semibold text-gray-900 dark:text-gray-100 mt-1 select-text">{value}</p>
  <!-- Screen reader live region — throttled to max once per 10 seconds -->
  <div class="sr-only" aria-live="polite" aria-atomic="true">
    Unix Timestamp: {lastAnnouncedValue}
  </div>
</div>
```

**IMPORTANT: The screen reader throttle pattern above is a SKETCH.** The dev agent must implement it correctly:
- The `aria-live="polite"` region should contain text that only updates every 10 seconds
- Use a separate `$effect` with a 10-second interval for screen reader announcements
- The visual value updates every 1 second (from parent), but the aria-live text updates every 10 seconds
- When `prefers-reduced-motion` is active, the value is static — no aria-live updates needed

### ResultRow Component Design

```svelte
<!-- ResultRow.svelte -->
<script lang="ts">
  interface Props {
    formatLabel: string;
    value: string;
  }
  let { formatLabel, value }: Props = $props();
</script>

<div class="bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-md p-3">
  <span class="text-xs font-medium text-gray-500 dark:text-gray-400">{formatLabel}</span>
  <p class="font-mono text-lg text-gray-900 dark:text-gray-100 mt-1 select-text">{value}</p>
</div>
```

### Svelte 5 Component Pattern (MANDATORY)

All components MUST use **Svelte 5 runes** — NOT legacy Svelte 3/4 syntax.

```svelte
<script lang="ts">
  // 1. Imports
  // 2. Props (using $props() rune)
  // 3. State ($state)
  // 4. Derived values ($derived)
  // 5. Effects ($effect)
  // 6. Event handlers (functions)
</script>
```

**Forbidden patterns:**
- `export let` (use `$props()` instead)
- `$:` reactive declarations (use `$derived` or `$effect`)
- `on:click` (use `onclick`)
- Svelte stores for local state (use `$state`)

### Calculator.svelte State Design

After this story, Calculator.svelte should have these state variables:

```typescript
// State
let wasmReady = $state(false);
let error = $state<string | null>(null);
let result = $state<FormattedResult | null>(null);
let isLive = $state(true);  // NEW — always true for now (no user input yet)
```

The `isLive` flag will be used by future stories (1.4 for copy, 2.1 for start date input, 2.2 for operations) to control when ticking starts/stops. For this story, it's always `true`.

### Prefers-Reduced-Motion Implementation

**Two levels of support:**

1. **CSS level (Tailwind):** Use `motion-safe:` prefix for any CSS animations or transitions. Not needed here since the tick is JS-driven, not CSS animation.

2. **JS level:** Check `window.matchMedia('(prefers-reduced-motion: reduce)')` in the `$effect`. If active:
   - Compute the initial value once (call `calculate()` one time)
   - Do NOT set up the `setInterval`
   - The hero row shows a static timestamp
   - The "● live" indicator should still show but could optionally hide — use judgment. The UX spec says "freeze live-ticking to a static display" so the indicator should be hidden when motion is reduced.

```typescript
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

$effect(() => {
  if (!isLive || !wasmReady) return;

  const tick = () => {
    const now = new Date().toISOString();
    result = calculate(now, []);
  };

  tick(); // Always compute at least once

  if (reducedMotion.matches) return; // Static display

  const interval = setInterval(tick, 1000);
  return () => clearInterval(interval);
});
```

### Color Tokens Reference (from Story 1.2 — preserved)

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
| Accent | `text-orange-500` | `dark:text-orange-400` |
| Live indicator dot | `bg-orange-500` | `dark:bg-orange-400` |

### Typography Reference

| Element | Classes | Value |
|---------|---------|-------|
| Unix timestamp (hero) | `font-mono text-[2rem] leading-tight font-semibold` | 32px semibold monospace |
| Other format values | `font-mono text-lg` | 18px regular monospace |
| Format labels | `text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide` | 12px medium sans-serif |
| Live indicator | `text-xs font-medium text-orange-500 dark:text-orange-400` | 12px medium orange |

### Spacing & Layout (Preserved from Story 1.2)

- Within components: 8px (`gap-2`)
- Between result rows: 12px (`space-y-3` — already set in Story 1.2)
- Between zones: 24px (`gap-6`)
- Border radius: 6px (`rounded-md`)

**The existing layout container classes from Calculator.svelte are correct and should NOT change:**
```html
<div class="flex flex-col md:flex-row gap-6">
  <section aria-label="Input" class="md:w-2/5 bg-gray-50 dark:bg-slate-800 rounded-md p-4 md:p-6">
  <section aria-label="Results" class="md:w-3/5 space-y-3">
```

### Scope Boundaries (What This Story Does NOT Include)

| Feature | Deferred To | Reason |
|---------|------------|--------|
| CopyButton component | Story 1.4 | Copy-to-clipboard with confirmation |
| StartDateInput component | Story 2.1 | Date input with "now" default and validation |
| OperationRow component | Story 2.2 | Direction + amount + unit controls |
| AddOperationButton, ResetButton | Story 2.3 | Multi-step operations |
| Stopping live-tick on user input | Story 2.1 / 2.2 | isLive becomes false when user modifies calculator |
| Full dark mode testing | Story 3.1 | BUT: add `dark:` foundation classes now |

**This story transforms the static placeholder display from Story 1.2 into a live, ticking multi-format datetime display. The output zone becomes the primary value of the page — useful on arrival, zero interaction required.**

### Anti-Patterns (FORBIDDEN)

- Do NOT use `nowUnix()` alone for the ticker — must call `calculate()` to get all 4 formats in sync
- Do NOT read `result` state inside the `$effect` that writes to it (creates dependency loop)
- Do NOT use `setInterval` in `onMount` — use `$effect` for reactive cleanup
- Do NOT use `any` in TypeScript — use proper types
- Do NOT use JavaScript Date API for datetime computation (ISO string generation is OK)
- Do NOT create `__tests__/` directories — co-locate tests
- Do NOT use `@apply` in CSS — Tailwind utilities only
- Do NOT use legacy Svelte syntax (`export let`, `$:`, `on:click`)
- Do NOT import Wasm directly in components — only through wasmBridge.ts
- Do NOT modify wasmBridge.ts, types.ts, or any Rust code
- Do NOT remove the placeholder content in the Input zone (it's for future stories)
- Do NOT use inline styles — use Tailwind classes

### Naming Conventions

| Context | Convention | Example |
|---------|-----------|---------|
| Svelte components | PascalCase | `HeroResultRow.svelte` |
| TypeScript modules | camelCase | `wasmBridge.ts` |
| TypeScript interfaces | PascalCase | `FormattedResult` |
| Test files | Co-located `.test.ts` | `HeroResultRow.test.ts` |
| Constants | UPPER_SNAKE_CASE | `TICK_INTERVAL_MS`, `SR_ANNOUNCE_INTERVAL_MS` |
| Props interfaces | PascalCase | `Props` (local to each component) |

### Import Pattern (Follow Exactly)

```svelte
<script lang="ts">
  // 1. Svelte framework imports
  import { onMount } from 'svelte';

  // 2. Wasm bridge imports
  import { init, calculate } from '../lib/wasmBridge';

  // 3. Type imports
  import type { FormattedResult } from '../lib/types';

  // 4. Component imports
  import HeroResultRow from './HeroResultRow.svelte';
  import ResultRow from './ResultRow.svelte';
</script>
```

### Project Structure Notes

Alignment with canonical architecture:

```
src/components/
├── Calculator.svelte          # Root island — MODIFY (add live-tick, use child components)
├── HeroResultRow.svelte       # NEW — Unix timestamp hero display
└── ResultRow.svelte           # NEW — Generic format row
```

All files in their canonical locations per architecture.md. No new directories created.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-1.3] — Acceptance criteria, story statement
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend-Architecture] — Svelte 5 runes, $effect for live-ticking, single island
- [Source: _bmad-output/planning-artifacts/architecture.md#Wasm-Integration-Architecture] — calculate() returns all 4 formats, bridge API
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation-Patterns] — Component structure order, naming, $effect rules
- [Source: _bmad-output/planning-artifacts/architecture.md#Project-Structure-&-Boundaries] — Component tree: HeroResultRow props, ResultRow props
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Component-Strategy] — HeroResultRow (orange-50, 2rem/32px, live indicator), ResultRow (gray-50)
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Feedback-Patterns] — Live-ticking indicator: "● live" in orange, stops on calculation
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Accessibility-Strategy] — aria-live="polite", 10-second throttle, prefers-reduced-motion
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Visual-Design-Foundation] — Colors, typography, spacing tokens
- [Source: _bmad-output/implementation-artifacts/1-2-page-layout-wasm-bridge-integration.md] — Previous story: layout, Wasm init, placeholder content, review fixes
- [Source: sveltejs/svelte@5.x docs] — $effect teardown function for setInterval cleanup pattern
- [Source: _bmad-output/planning-artifacts/prd.md] — FR7-FR11, FR20, FR25, NFR7, NFR11, NFR17

## Dev Agent Record

### Agent Model Used

Claude claude-4.6-opus (Cursor)

### Debug Log References

- Vitest configuration required `resolve.conditions: ['browser']` to enable Svelte 5 client-side rendering in jsdom tests
- `vi.runAllTimersAsync()` causes infinite loop with `setInterval` — resolved by using `vi.advanceTimersByTimeAsync(0)` for microtask flushing
- Initial `$state(value)` initializer caused Svelte `state_referenced_locally` warning — resolved by initializing with `0` and letting `$effect` set initial value

### Completion Notes List

- ✅ Created HeroResultRow.svelte: Unix timestamp hero display with orange-50 bg, 2rem monospace text, "● live" indicator, aria-live polite region with 10-second throttle, prefers-reduced-motion support
- ✅ Created ResultRow.svelte: Generic format row with gray-50 bg, format label in sans-serif, value in monospace, selectable text, dark mode variants
- ✅ Modified Calculator.svelte: Added `isLive` state, `$effect` with 1-second setInterval calling `calculate()` with full ISO string, proper cleanup, prefers-reduced-motion check, imported and used HeroResultRow + ResultRow child components
- ✅ Set up vitest testing infrastructure: vitest.config.ts, 23 unit tests across 3 test files (all passing)
- ✅ All 80 Rust tests pass with zero regressions
- ✅ End-to-end verification: live ticking confirmed, all formats update simultaneously, no console errors, fits in 1280x800 viewport
- ✅ All 6 Acceptance Criteria satisfied

### Change Log

- 2026-02-15: Story 1.3 implementation — live-ticking hero timestamp and multi-format results display
- 2026-02-15: Code review fixes — H1: fixed broken screen reader throttle using `untrack()` in HeroResultRow, H2: added `test` script to package.json, M1: added `uppercase tracking-wide` to ResultRow label, M3: added reduced-motion test for Calculator timer, M4: removed dead import in Calculator.test.ts, L1: deleted screenshot artifacts

### File List

**Created:**
- `src/components/HeroResultRow.svelte` — Unix timestamp hero display with live indicator
- `src/components/ResultRow.svelte` — Generic format result row component
- `src/components/HeroResultRow.test.ts` — 8 unit tests for HeroResultRow
- `src/components/ResultRow.test.ts` — 6 unit tests for ResultRow
- `src/components/Calculator.test.ts` — 9 unit tests for Calculator (8 original + 1 reduced-motion)
- `vitest.config.ts` — Vitest configuration for Svelte 5 component testing

**Modified:**
- `src/components/Calculator.svelte` — Added isLive state, $effect live-tick interval, HeroResultRow + ResultRow imports
- `package.json` — Added vitest, @testing-library/svelte, jsdom, @sveltejs/vite-plugin-svelte devDependencies; added `test` script
- `pnpm-lock.yaml` — Updated lockfile for new devDependencies
