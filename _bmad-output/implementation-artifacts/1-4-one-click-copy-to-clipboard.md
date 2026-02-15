# Story 1.4: One-Click Copy to Clipboard

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want to copy any datetime format value to my clipboard with a single click,
so that I can paste it directly into my SQL query, code, or documentation without manual text selection.

## Acceptance Criteria

1. **Given** any result row (hero or standard), **When** I look at it, **Then** I see a copy button at the right edge of the row, styled with gray border and icon in the default state (FR12).

2. **Given** I click a copy button on any result row, **When** the Clipboard API succeeds, **Then** the exact displayed format value is now in my system clipboard.

3. **Given** I click a copy button, **When** the copy action completes, **Then** the button transitions to green border, green-50 background, checkmark icon, and "Copied!" text — reverting to default after 1.5 seconds (FR13).

4. **Given** the Clipboard API is unavailable in the browser, **When** I click a copy button, **Then** the system silently falls back to `document.execCommand('copy')` and the copy still succeeds.

5. **Given** a monospace format value is displayed in a result row, **When** I double-click the value text, **Then** the text is selected (no `user-select: none` applied), allowing standard Ctrl+C copy (FR14).

6. **Given** the hero row's copy button, **When** compared to standard result row copy buttons, **Then** the hero row's copy button is slightly larger, matching the visual prominence of the hero row.

## Tasks / Subtasks

- [x] Task 1: Create `src/lib/clipboard.ts` — Clipboard API helper with fallback (AC: #2, #4)
  - [x] 1.1 Create `src/lib/clipboard.ts` with `copyToClipboard(text: string): Promise<boolean>` function
  - [x] 1.2 Primary path: `navigator.clipboard.writeText(text)` wrapped in try/catch
  - [x] 1.3 Fallback path: create hidden `<textarea>`, `document.execCommand('copy')`, clean up
  - [x] 1.4 Return `true` on success, `false` on failure — never throw

- [x] Task 2: Create `src/components/CopyButton.svelte` — Copy button component (AC: #1, #3, #6)
  - [x] 2.1 Create `src/components/CopyButton.svelte` using Svelte 5 runes
  - [x] 2.2 Define Props interface: `{ value: string; formatLabel: string; variant?: 'default' | 'hero' }`
  - [x] 2.3 Add `$state` for `copied` (boolean) and `$state` for `timeoutId` (timer tracking)
  - [x] 2.4 Implement `handleCopy()` handler: call `copyToClipboard(value)`, set `copied = true`, setTimeout 1500ms to revert
  - [x] 2.5 Clear previous timeout if button clicked again before 1.5s (prevent stale revert)
  - [x] 2.6 Render default state: gray-200 border, gray-500 icon, "Copy" text
  - [x] 2.7 Render hover state: orange border, orange icon/text, orange-50 bg
  - [x] 2.8 Render copied state: green-500 border, green-500 icon/text, green-50 bg, checkmark icon, "Copied!" text
  - [x] 2.9 Focus state: `ring-2 ring-orange-400` on all variants
  - [x] 2.10 Hero variant: slightly larger padding and text (p-2.5 + text-sm vs p-2 + text-xs)
  - [x] 2.11 Add `aria-label="Copy {formatLabel} value"` for accessibility
  - [x] 2.12 Add `aria-live="assertive"` hidden region for "Copied to clipboard" screen reader announcement
  - [x] 2.13 Support `prefers-reduced-motion`: instant state transitions (no CSS transitions when active)

- [x] Task 3: Modify `src/components/HeroResultRow.svelte` — Add CopyButton (AC: #1, #6)
  - [x] 3.1 Import CopyButton component
  - [x] 3.2 Add CopyButton to the hero row layout with `variant="hero"`, `value={String(value)}`, `formatLabel="Unix Timestamp"`
  - [x] 3.3 Adjust layout to flex row: value on left, CopyButton on right, vertically centered
  - [x] 3.4 Ensure existing live indicator, aria-live region, and screen reader throttle remain unchanged

- [x] Task 4: Modify `src/components/ResultRow.svelte` — Add CopyButton (AC: #1)
  - [x] 4.1 Import CopyButton component
  - [x] 4.2 Add CopyButton to the result row layout with `variant="default"`, `value={value}`, `formatLabel={formatLabel}`
  - [x] 4.3 Adjust layout to flex row: label+value on left, CopyButton on right

- [x] Task 5: Create tests (AC: #1–#6)
  - [x] 5.1 Create `src/components/CopyButton.test.ts` — test default render, click handler, copied state, revert after timeout, hero variant, aria-label, aria-live region
  - [x] 5.2 Update or verify existing HeroResultRow.test.ts and ResultRow.test.ts pass with new CopyButton child

- [x] Task 6: Verify end-to-end behavior (AC: #1–#6)
  - [x] 6.1 Run `pnpm build:wasm` then `pnpm dev`
  - [x] 6.2 Verify: copy button visible at right edge of hero row and all 3 result rows
  - [x] 6.3 Verify: clicking copy puts the exact displayed value in clipboard
  - [x] 6.4 Verify: button transitions to green + checkmark + "Copied!" for 1.5s, then reverts
  - [x] 6.5 Verify: hero row copy button is visibly larger than standard row copy buttons
  - [x] 6.6 Verify: double-click on any value text selects it (no user-select: none)
  - [x] 6.7 Verify: orange focus ring visible when tabbing to copy buttons
  - [x] 6.8 Verify: all existing tests pass (`pnpm test`), all 80 Rust tests pass (`cargo test`)
  - [x] 6.9 Verify: no uncaught errors in browser console
  - [x] 6.10 Verify: layout still fits within single desktop viewport (1280x800)

## Dev Notes

### Critical: Build Wasm Before Dev Server

**The Wasm module must be built before running the dev server.** The `pkg/` directory is gitignored and built from source.

```bash
pnpm build:wasm    # Builds to crates/datetime-engine/pkg/
pnpm dev           # Astro dev server at localhost:4321
```

### Story 1.1 + 1.2 + 1.3 Learnings (CRITICAL — DO NOT VIOLATE)

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
| Vitest config | `resolve.conditions: ['browser']` for Svelte 5 | Required in vitest.config.ts |
| Timer testing | `vi.advanceTimersByTimeAsync(0)` NOT `vi.runAllTimersAsync()` | runAllTimersAsync causes infinite loop with setInterval |
| $state initializers | Initialize with primitive, let $effect set real value | Avoids Svelte `state_referenced_locally` warning |
| Screen reader throttle | Uses `untrack()` in HeroResultRow $effect | Prevents $effect from re-running on every tick |
| 23 Vitest tests passing | HeroResultRow (8), ResultRow (6), Calculator (9) | Run `pnpm test` — zero regressions |

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
| `src/components/Calculator.svelte` | No changes needed — just uses HeroResultRow and ResultRow which handle CopyButton internally |

### Files to CREATE

| File | Purpose |
|------|---------|
| `src/lib/clipboard.ts` | Clipboard API helper with `document.execCommand('copy')` fallback |
| `src/components/CopyButton.svelte` | Copy button component with default/hover/copied states |
| `src/components/CopyButton.test.ts` | Unit tests for CopyButton |

### Files to MODIFY

| File | Changes |
|------|---------|
| `src/components/HeroResultRow.svelte` | Import CopyButton, add to layout with `variant="hero"` |
| `src/components/ResultRow.svelte` | Import CopyButton, add to layout with `variant="default"` |

### clipboard.ts Implementation (EXACT SPECIFICATION)

```typescript
// src/lib/clipboard.ts

/**
 * Copy text to clipboard using the Clipboard API with execCommand fallback.
 * Returns true if the copy succeeded, false otherwise.
 * Never throws — all errors are caught and logged.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // Primary: Clipboard API
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to legacy fallback
    }
  }

  // Fallback: document.execCommand('copy')
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    // Prevent scrolling to bottom of page
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '-9999px';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch {
    console.error('Copy to clipboard failed');
    return false;
  }
}
```

**Key decisions:**
- `async function` — the Clipboard API is async; the fallback is sync but the wrapper is async for a unified interface
- Never throws — returns boolean for success/failure. CopyButton doesn't need error handling.
- Hidden textarea uses `position: fixed` and offscreen positioning to avoid layout shift
- NFR6: Copy-to-clipboard under 50ms — both Clipboard API and execCommand are well within this budget

### CopyButton Component Design (EXACT SPECIFICATION)

**Props:**

```typescript
interface Props {
  value: string;       // The text value to copy to clipboard
  formatLabel: string; // Human-readable format name (for aria-label)
  variant?: 'default' | 'hero';  // Size variant — hero is slightly larger
}
```

**State:**

```typescript
let copied = $state(false);
let timeoutId = $state<ReturnType<typeof setTimeout> | null>(null);
```

**Handler:**

```typescript
async function handleCopy() {
  const success = await copyToClipboard(value);
  if (!success) return;

  // Clear any existing timeout (rapid re-clicks)
  if (timeoutId) clearTimeout(timeoutId);

  copied = true;
  timeoutId = setTimeout(() => {
    copied = false;
    timeoutId = null;
  }, 1500);
}
```

**Visual States:**

| State | Border | Background | Text/Icon Color | Icon | Label |
|-------|--------|------------|-----------------|------|-------|
| Default | `border-gray-200 dark:border-slate-600` | `bg-white dark:bg-slate-700` | `text-gray-500 dark:text-gray-400` | Clipboard SVG | "Copy" |
| Hover | `border-orange-300 dark:border-orange-700` | `bg-orange-50 dark:bg-orange-950/30` | `text-orange-500 dark:text-orange-400` | Clipboard SVG | "Copy" |
| Copied | `border-green-500 dark:border-green-500` | `bg-green-50 dark:bg-green-950/30` | `text-green-600 dark:text-green-400` | Checkmark SVG | "Copied!" |
| Focus | All above + `ring-2 ring-orange-400` | — | — | — | — |

**Size Variants:**

| Variant | Padding | Font Size | Icon Size | Button Height |
|---------|---------|-----------|-----------|---------------|
| `default` | `px-2.5 py-1.5` | `text-xs` | `w-3.5 h-3.5` | ~30px |
| `hero` | `px-3 py-2` | `text-sm` | `w-4 h-4` | ~36px |

**SVG Icons (inline — no icon library):**

Clipboard icon (default state):
```svg
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
  <path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
</svg>
```

Checkmark icon (copied state):
```svg
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
  <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
</svg>
```

**CSS Transitions:**
- Use `motion-safe:transition-colors motion-safe:duration-150` on the button
- When `prefers-reduced-motion` is active, transitions are instant (Tailwind handles this via `motion-safe:` prefix)

**ARIA / Accessibility:**
- `aria-label="Copy {formatLabel} value"` on the button element
- Hidden `aria-live="assertive"` region INSIDE the button component — shows "Copied to clipboard" text only when `copied` is true, empty otherwise
- The assertive live region ensures screen readers announce the copy immediately (NFR13)

**Complete CopyButton Template Skeleton:**

```svelte
<script lang="ts">
  // 1. Imports
  import { copyToClipboard } from '../lib/clipboard';

  // 2. Props
  interface Props {
    value: string;
    formatLabel: string;
    variant?: 'default' | 'hero';
  }
  let { value, formatLabel, variant = 'default' }: Props = $props();

  // 3. State
  let copied = $state(false);
  let timeoutId = $state<ReturnType<typeof setTimeout> | null>(null);

  // 4. Derived
  let isHero = $derived(variant === 'hero');

  // 5. Effects — none

  // 6. Handlers
  async function handleCopy() {
    const success = await copyToClipboard(value);
    if (!success) return;

    if (timeoutId) clearTimeout(timeoutId);

    copied = true;
    timeoutId = setTimeout(() => {
      copied = false;
      timeoutId = null;
    }, 1500);
  }
</script>

<button
  type="button"
  onclick={handleCopy}
  aria-label="Copy {formatLabel} value"
  class="inline-flex items-center gap-1.5 rounded-md border cursor-pointer
    {isHero ? 'px-3 py-2 text-sm' : 'px-2.5 py-1.5 text-xs'}
    font-medium
    motion-safe:transition-colors motion-safe:duration-150
    focus:outline-none focus:ring-2 focus:ring-orange-400
    {copied
      ? 'border-green-500 dark:border-green-500 bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400'
      : 'border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-500 dark:text-gray-400 hover:border-orange-300 dark:hover:border-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950/30 hover:text-orange-500 dark:hover:text-orange-400'
    }"
>
  {#if copied}
    <!-- Checkmark icon -->
    <svg class="{isHero ? 'w-4 h-4' : 'w-3.5 h-3.5'}" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
    Copied!
  {:else}
    <!-- Clipboard icon -->
    <svg class="{isHero ? 'w-4 h-4' : 'w-3.5 h-3.5'}" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
    </svg>
    Copy
  {/if}
</button>

<!-- Screen reader: announce copy action -->
<div class="sr-only" aria-live="assertive" aria-atomic="true">
  {copied ? 'Copied to clipboard' : ''}
</div>
```

### HeroResultRow Modification (EXACT CHANGES)

**Current structure (lines 42-57 of HeroResultRow.svelte):**
```html
<div class="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-md p-4">
  <div class="flex items-center justify-between">
    <span class="...">Unix Timestamp</span>
    {#if showLiveIndicator}...{/if}
  </div>
  <p class="font-mono text-[2rem] leading-tight font-semibold text-gray-900 dark:text-gray-100 mt-1 select-text">{value}</p>
  <!-- Screen reader live region -->
  <div class="sr-only" aria-live="polite" aria-atomic="true">...</div>
</div>
```

**Required changes:**
1. Import CopyButton at top of `<script>`
2. Wrap the value `<p>` and CopyButton in a flex container for horizontal alignment
3. CopyButton positioned at right edge, vertically centered with the value

**New template structure (the outer container and header row stay the same):**
```html
<div class="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-md p-4">
  <div class="flex items-center justify-between">
    <span class="...">Unix Timestamp</span>
    {#if showLiveIndicator}...{/if}
  </div>
  <div class="flex items-center justify-between gap-3 mt-1">
    <p class="font-mono text-[2rem] leading-tight font-semibold text-gray-900 dark:text-gray-100 select-text">{value}</p>
    <CopyButton value={String(value)} formatLabel="Unix Timestamp" variant="hero" />
  </div>
  <!-- Screen reader live region — unchanged -->
  <div class="sr-only" aria-live="polite" aria-atomic="true">
    Unix Timestamp: {lastAnnouncedValue}
  </div>
</div>
```

**IMPORTANT:** The `value` prop of HeroResultRow is `number`. CopyButton expects `string`. Use `String(value)` when passing to CopyButton. The `mt-1` class moves from the `<p>` to the wrapping `<div>`.

### ResultRow Modification (EXACT CHANGES)

**Current structure (lines 12-15 of ResultRow.svelte):**
```html
<div class="bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-md p-3">
  <span class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{formatLabel}</span>
  <p class="font-mono text-lg text-gray-900 dark:text-gray-100 mt-1 select-text">{value}</p>
</div>
```

**Required changes:**
1. Import CopyButton at top of `<script>`
2. Wrap the value `<p>` and CopyButton in a flex container

**New template structure:**
```html
<div class="bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-md p-3">
  <span class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{formatLabel}</span>
  <div class="flex items-center justify-between gap-3 mt-1">
    <p class="font-mono text-lg text-gray-900 dark:text-gray-100 select-text">{value}</p>
    <CopyButton value={value} formatLabel={formatLabel} />
  </div>
</div>
```

**IMPORTANT:** The `mt-1` class moves from the `<p>` to the wrapping `<div>`. The `value` prop is already a `string` in ResultRow.

### CopyButton.test.ts Test Plan

```typescript
// Test cases for CopyButton.svelte
// File: src/components/CopyButton.test.ts

// 1. Renders with "Copy" text and clipboard icon in default state
// 2. Renders with correct aria-label containing format label
// 3. Calls copyToClipboard with the provided value on click
// 4. Transitions to "Copied!" state after successful copy
// 5. Reverts to "Copy" state after 1.5 seconds
// 6. Renders larger when variant="hero" (check for text-sm class)
// 7. Renders smaller when variant="default" (check for text-xs class)
// 8. aria-live region shows "Copied to clipboard" when copied
// 9. aria-live region is empty when not copied
// 10. Does not transition to copied state if copyToClipboard returns false
// 11. Handles rapid re-clicks (clears previous timeout)
```

**Testing dependencies already installed:** vitest, @testing-library/svelte, jsdom (from Story 1.3)

**Mock clipboard.ts in tests:** Use `vi.mock('../lib/clipboard')` to mock `copyToClipboard`. Control the return value to test success and failure paths.

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

### Color Tokens Reference (from Story 1.2/1.3 — preserved)

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
| CopyButton default border | `border-gray-200` | `dark:border-slate-600` |
| CopyButton default bg | `bg-white` | `dark:bg-slate-700` |
| CopyButton hover border | `border-orange-300` | `dark:border-orange-700` |
| CopyButton hover bg | `bg-orange-50` | `dark:bg-orange-950/30` |
| CopyButton copied border | `border-green-500` | `dark:border-green-500` |
| CopyButton copied bg | `bg-green-50` | `dark:bg-green-950/30` |
| CopyButton copied text | `text-green-600` | `dark:text-green-400` |

### Typography Reference

| Element | Classes | Value |
|---------|---------|-------|
| Unix timestamp (hero) | `font-mono text-[2rem] leading-tight font-semibold` | 32px semibold monospace |
| Other format values | `font-mono text-lg` | 18px regular monospace |
| Format labels | `text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide` | 12px medium sans-serif |
| CopyButton default | `text-xs font-medium` | 12px medium sans-serif |
| CopyButton hero | `text-sm font-medium` | 14px medium sans-serif |

### Spacing & Layout (Preserved from Story 1.2/1.3)

- Within components: 8px (`gap-2`)
- Between result rows: 12px (`space-y-3`)
- Between zones: 24px (`gap-6`)
- Border radius: 6px (`rounded-md`)

**The existing layout container classes from Calculator.svelte are correct and should NOT change:**
```html
<div class="flex flex-col md:flex-row gap-6">
  <section aria-label="Input" class="md:w-2/5 bg-gray-50 dark:bg-slate-800 rounded-md p-4 md:p-6">
  <section aria-label="Results" class="md:w-3/5 space-y-3">
```

### Tab Order (Keyboard Navigation)

After this story, the keyboard tab order through the output zone should be:

1. HeroResultRow CopyButton (Unix Timestamp)
2. ResultRow CopyButton (ISO 8601)
3. ResultRow CopyButton (RFC 2822)
4. ResultRow CopyButton (Local Time)

This order is naturally correct because CopyButtons are in DOM order within the result rows. No `tabindex` manipulation needed.

### Scope Boundaries (What This Story Does NOT Include)

| Feature | Deferred To | Reason |
|---------|------------|--------|
| StartDateInput component | Story 2.1 | Date input with "now" default and validation |
| OperationRow component | Story 2.2 | Direction + amount + unit controls |
| AddOperationButton, ResetButton | Story 2.3 | Multi-step operations |
| Stopping live-tick on user input | Story 2.1 / 2.2 | isLive becomes false when user modifies calculator |
| Full dark mode testing | Story 3.1 | BUT: add `dark:` foundation classes now |
| Keyboard navigation testing | Story 3.3 | BUT: tab order should naturally work |
| CI/CD pipeline | Story 1.5 | Deployment workflow |

**This story adds the critical "copy and leave" interaction that completes the core value proposition: load → see → copy → done. After this story, the output zone is fully functional for the "quick lookup" journey — users can see all 4 formats and copy any value with one click.**

### Anti-Patterns (FORBIDDEN)

- Do NOT use `any` in TypeScript — use proper types or `unknown`
- Do NOT use JavaScript Date API for datetime computation (getting ISO string for Wasm input is OK)
- Do NOT create `__tests__/` directories — co-locate tests
- Do NOT use `@apply` in CSS — Tailwind utilities only in templates
- Do NOT use legacy Svelte syntax (`export let`, `$:`, `on:click`)
- Do NOT import Wasm directly in components — only through wasmBridge.ts
- Do NOT modify wasmBridge.ts, types.ts, or any Rust code
- Do NOT modify Calculator.svelte (CopyButton is added inside HeroResultRow and ResultRow)
- Do NOT use inline styles — use Tailwind classes
- Do NOT use an icon library — use inline SVGs (two small icons: clipboard + checkmark)
- Do NOT add `user-select: none` to any value text — values must remain selectable
- Do NOT use toast notifications — copy feedback is inline on the button itself
- Do NOT use `$effect` for the timeout — plain `setTimeout` is correct since it's not reactive

### Naming Conventions

| Context | Convention | Example |
|---------|-----------|---------|
| Svelte components | PascalCase | `CopyButton.svelte` |
| TypeScript modules | camelCase | `clipboard.ts` |
| TypeScript interfaces | PascalCase | `Props` |
| Test files | Co-located `.test.ts` | `CopyButton.test.ts` |
| Constants | UPPER_SNAKE_CASE | `COPY_FEEDBACK_DURATION_MS` |
| Function names | camelCase | `copyToClipboard`, `handleCopy` |

### Import Pattern (Follow Exactly)

```svelte
<!-- In HeroResultRow.svelte and ResultRow.svelte -->
<script lang="ts">
  // 1. Svelte framework imports (if any)

  // 4. Component imports
  import CopyButton from './CopyButton.svelte';

  // 2. Props...
</script>
```

```svelte
<!-- In CopyButton.svelte -->
<script lang="ts">
  // 1. Imports
  import { copyToClipboard } from '../lib/clipboard';

  // 2. Props...
</script>
```

### Project Structure Notes

Alignment with canonical architecture:

```
src/components/
├── Calculator.svelte          # Root island — NO CHANGES
├── Calculator.test.ts         # Existing tests — verify pass
├── HeroResultRow.svelte       # MODIFY — add CopyButton with hero variant
├── HeroResultRow.test.ts      # Existing tests — verify pass
├── ResultRow.svelte           # MODIFY — add CopyButton with default variant
├── ResultRow.test.ts          # Existing tests — verify pass
└── CopyButton.svelte          # NEW — copy to clipboard button
    CopyButton.test.ts         # NEW — unit tests

src/lib/
├── clipboard.ts               # NEW — Clipboard API helper with fallback
├── types.ts                   # NO CHANGES
└── wasmBridge.ts              # NO CHANGES
```

All files in their canonical locations per architecture.md. No new directories created.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-1.4] — Acceptance criteria, story statement, all 6 ACs
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend-Architecture] — CopyButton as child component, clipboard.ts in lib/
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation-Patterns] — Component structure order, naming, error handling (clipboard failure = fallback)
- [Source: _bmad-output/planning-artifacts/architecture.md#Project-Structure-&-Boundaries] — Component tree: CopyButton inside HeroResultRow and ResultRow, clipboard.ts helper
- [Source: _bmad-output/planning-artifacts/architecture.md#Process-Patterns] — Clipboard API failure → fallback to execCommand, silent
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Component-Strategy] — CopyButton anatomy (7 states), HeroResultRow slightly larger variant
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Feedback-Patterns] — Copy confirmation: green + checkmark + "Copied!" for 1.5s, no toast
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Button-Hierarchy] — CopyButton = Primary action tier, outlined gray default
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Accessibility-Strategy] — aria-live="assertive" for copy announcements, focus ring, keyboard reachable
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Visual-Design-Foundation] — Colors (green-500 success, orange accent), spacing tokens
- [Source: _bmad-output/planning-artifacts/prd.md] — FR12 (one-click copy), FR13 (visual confirmation), FR14 (text selection), NFR6 (copy < 50ms), NFR13 (assertive live regions)
- [Source: _bmad-output/implementation-artifacts/1-3-live-ticking-hero-timestamp-multi-format-results.md] — Previous story: HeroResultRow/ResultRow implementation, vitest setup, learnings
- [Source: _bmad-output/implementation-artifacts/1-2-page-layout-wasm-bridge-integration.md] — Layout foundation, responsive breakpoints (md: not lg:), section aria-labels
- [Source: src/components/HeroResultRow.svelte] — Current implementation: value/isLive props, screen reader throttle with untrack()
- [Source: src/components/ResultRow.svelte] — Current implementation: formatLabel/value props, selectable text
- [Source: src/components/Calculator.svelte] — Current implementation: passes result.unixTimestamp to HeroResultRow, result.iso8601/rfc2822/localHuman to ResultRows
- [Source: src/lib/types.ts] — FormattedResult interface: unixTimestamp (number), iso8601/rfc2822/localHuman (string)

## Dev Agent Record

### Agent Model Used

Claude claude-4.6-opus (Cursor)

### Debug Log References

No debug issues encountered. All implementations worked correctly on first attempt.

### Completion Notes List

- **Task 1:** Created `src/lib/clipboard.ts` with `copyToClipboard()` async function. Primary path uses `navigator.clipboard.writeText()`, fallback uses `document.execCommand('copy')` with hidden textarea. Never throws — returns boolean.
- **Task 2:** Created `src/components/CopyButton.svelte` using Svelte 5 runes ($props, $state, $derived). Implements 3 visual states (default/hover/copied) with gray→orange→green color transitions. Hero variant is larger (px-3 py-2 text-sm vs px-2.5 py-1.5 text-xs). Includes aria-label and aria-live="assertive" for screen reader support. Uses `motion-safe:` prefix for reduced-motion compliance.
- **Task 3:** Modified `src/components/HeroResultRow.svelte` — imported CopyButton, wrapped value `<p>` and CopyButton in flex container with `gap-3 mt-1`. Passes `String(value)` since value is number. Existing live indicator, aria-live region, and screen reader throttle remain unchanged.
- **Task 4:** Modified `src/components/ResultRow.svelte` — imported CopyButton, wrapped value `<p>` and CopyButton in flex container with `gap-3 mt-1`. Uses shorthand props `{value} {formatLabel}`.
- **Task 5:** Created `src/components/CopyButton.test.ts` with 11 unit tests covering: default render, aria-label, click handler, copied state transition, 1.5s revert, hero/default variants, aria-live region content, failed copy handling, and rapid re-click timeout clearing. Verified all 23 existing tests pass with new CopyButton child component.
- **Task 6:** End-to-end browser verification: all 4 copy buttons visible, copy works via Clipboard API, button transitions to green "Copied!" with checkmark for 1.5s then reverts, hero button visually larger, all values selectable (user-select: text), orange focus ring visible, 34 Vitest + 80 Rust tests pass, zero console errors, layout fits 1280x800.
- **Test results:** 34 Vitest tests (23 existing + 11 new), 80 Rust tests — all passing, zero regressions.

### Senior Developer Review (AI)

**Reviewer:** Samuel (via adversarial code review workflow)
**Date:** 2026-02-15
**Issues Found:** 2 High, 3 Medium, 3 Low
**Resolution:** All HIGH and MEDIUM issues auto-fixed; LOW issues L7, L8 deferred.

| ID | Severity | Description | Resolution |
|----|----------|-------------|------------|
| H1 | HIGH | Missing timeout cleanup on CopyButton destroy — stale state updates on unmounted component | Fixed: Added `onDestroy` cleanup in CopyButton.svelte |
| H2 | HIGH | HeroResultRow/ResultRow tests don't verify CopyButton is rendered — silent regression risk | Fixed: Added integration assertion in both test files |
| M3 | MEDIUM | `timeoutId` stored in reactive `$state` unnecessarily — overhead for non-UI bookkeeping | Fixed: Changed to plain `let` variable |
| M4 | MEDIUM | No diagnostic logging when Clipboard API primary path fails but fallback succeeds | Fixed: Added `console.warn` in clipboard.ts catch block |
| M5 | MEDIUM | Missing test coverage for focus ring and motion-safe accessibility classes | Fixed: Added 2 tests in CopyButton.test.ts |
| L6 | LOW | Redundant `cursor-pointer` on `<button>` element (Tailwind v4 default) | Fixed: Removed redundant class |
| L7 | LOW | CopyButton renders as fragment (button + sr-only div) — extra flex child | Deferred: `sr-only` uses `position: absolute`, no visual impact |
| L8 | LOW | `vitest.config.ts` has unnecessary `globals: true` | Deferred: Not harmful, config file not in story scope |

**Post-fix test results:** 38 Vitest tests (24 existing + 14 new), all passing, zero regressions.

### File List

- `src/lib/clipboard.ts` — NEW: Clipboard API helper with execCommand fallback (review: added diagnostic logging)
- `src/components/CopyButton.svelte` — NEW: Copy button component with default/hover/copied states, hero variant (review: added onDestroy cleanup, changed timeoutId to plain let, removed redundant cursor-pointer)
- `src/components/CopyButton.test.ts` — NEW: 13 unit tests for CopyButton (review: added focus ring + motion-safe tests)
- `src/components/HeroResultRow.svelte` — MODIFIED: Added CopyButton import and hero variant in flex layout
- `src/components/HeroResultRow.test.ts` — MODIFIED: Added CopyButton integration test (review fix)
- `src/components/ResultRow.svelte` — MODIFIED: Added CopyButton import and default variant in flex layout
- `src/components/ResultRow.test.ts` — MODIFIED: Added CopyButton integration test (review fix)

## Change Log

- **2026-02-15:** Implemented one-click copy-to-clipboard for all datetime format values. Created clipboard helper with Clipboard API + execCommand fallback, CopyButton component with 3 visual states (default/hover/copied) and hero size variant, integrated into HeroResultRow and ResultRow. Added 11 unit tests. All 114 tests pass (34 Vitest + 80 Rust).
- **2026-02-15 (Review):** Code review found 2 HIGH, 3 MEDIUM, 3 LOW issues. Fixed: added onDestroy timeout cleanup in CopyButton, changed timeoutId from $state to plain let, added console.warn for Clipboard API fallback, added CopyButton integration tests to HeroResultRow.test.ts and ResultRow.test.ts, added focus ring and motion-safe accessibility tests. Post-review: 38 Vitest tests passing (4 new assertions added).
