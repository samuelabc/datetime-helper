---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
  - step-04-final-validation
inputDocuments:
  - '_bmad-output/planning-artifacts/prd.md'
  - '_bmad-output/planning-artifacts/architecture.md'
  - '_bmad-output/planning-artifacts/ux-design-specification.md'
---

# datetime-helper - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for datetime-helper, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

**Date Calculation (FR1–FR6):**

FR1: User can add or subtract a specified number of days, months, or years from a start date
FR2: User can set the start date to any valid calendar date
FR3: System defaults start date to current datetime ("now") when unspecified
FR4: System validates calendar correctness for all inputs and operations (leap years, month boundaries, invalid dates)
FR5: System rejects invalid date inputs with error messaging while preserving the last valid calculation
FR6: System computes results using a single datetime engine with no secondary computation path

**Result Display (FR7–FR11):**

FR7: System displays results simultaneously in Unix timestamp, ISO 8601, RFC 2822, and local human-readable formats
FR8: Unix timestamp is displayed with greater visual prominence than other formats
FR9: All output formats update instantly on any input change, without manual submit
FR10: When start date is "now" with no operations, system displays a live-updating Unix timestamp
FR11: System indicates whether the Unix timestamp is live-updating or static

**Copy & Export (FR12–FR14):**

FR12: User can copy any individual format value to clipboard with a single action
FR13: System provides brief visual confirmation on copy
FR14: Format values are selectable via standard text selection as an alternative to dedicated copy

**Input & Interaction (FR15–FR19):**

FR15: User can select operation direction (add or subtract)
FR16: User can specify operation amount as a non-negative integer
FR17: User can select operation unit (days, months, or years)
FR18: System validates input in real-time as user types
FR19: Clearing the start date input reverts to "now" default

**Page Lifecycle (FR20–FR22):**

FR20: System displays current datetime in all formats immediately on page load, before any interaction
FR21: System is fully functional after initial load with no further network requests
FR22: System functions offline after initial page cache

**Appearance & Responsiveness (FR23–FR25):**

FR23: System supports dark and light modes, matching user's system preference
FR24: System presents functional layout on desktop, tablet, and mobile viewports
FR25: Complete calculator and results fit within a single desktop viewport without scrolling

**Accessibility (FR26–FR31):**

FR26: All interactive elements reachable and operable via keyboard
FR27: All interactive elements display visible focus indicator on keyboard focus
FR28: System provides screen reader announcements for dynamic content changes
FR29: System respects `prefers-reduced-motion` by disabling animations
FR30: All text and interactive elements meet WCAG 2.1 AA contrast requirements
FR31: System does not rely on color alone to convey information or state

### NonFunctional Requirements

**Performance (NFR1–NFR7):**

NFR1: Time to Interactive under 1 second (Lighthouse Performance > 95)
NFR2: First Contentful Paint under 0.5 seconds
NFR3: Cumulative Layout Shift below 0.1
NFR4: Calculator operations complete within 100ms (input change to result display)
NFR5: Wasm module under 100KB gzipped
NFR6: Copy-to-clipboard under 50ms
NFR7: Live-ticking timestamp updates at 1-second intervals without jank or layout shift

**Accessibility (NFR8–NFR13):**

NFR8: All text/background combinations meet WCAG 2.1 AA contrast (4.5:1 normal text, 3:1 large text)
NFR9: Keyboard tab order is logical and predictable
NFR10: Focus indicators minimum 2px width on all interactive elements
NFR11: Screen reader live region updates for ticking timestamp max once per 10 seconds
NFR12: All animations pause when `prefers-reduced-motion` is active
NFR13: Copy confirmations delivered via assertive live regions

**Correctness (NFR14–NFR18):**

NFR14: Datetime engine correctly handles all DST transitions for any IANA timezone
NFR15: Datetime engine correctly handles leap year calculations
NFR16: Datetime engine correctly handles month boundary arithmetic (e.g., Jan 31 + 1 month)
NFR17: All output formats are internally consistent — same instant in time
NFR18: Identical inputs produce identical results across all supported browsers

### Additional Requirements

**From Architecture — Starter Template & Project Setup:**

- Architecture specifies Astro `minimal` template with pnpm as package manager
- Initialization: `pnpm create astro@latest datetime-helper -- --template minimal --typescript strict --git --install`
- Add Tailwind CSS v4 via `@tailwindcss/vite` Vite plugin
- Add Svelte 5 via `pnpm astro add svelte`
- Set up Rust crate: `cargo init --lib crates/datetime-engine`
- **Wasm bundle size validation is the FIRST Rust development task** — if jiff exceeds 100KB gzipped, evaluate feature flag trimming → alternative library → hybrid approach

**From Architecture — Frontend & State Management:**

- Svelte 5 (runes) as the island framework within Astro
- Single interactive island (`Calculator.svelte`) mounted via `client:load`
- State management via Svelte 5 runes (`$state`, `$derived`, `$effect`, `$props`)
- Child components: StartDateInput, OperationRow, AddOperationButton, ResetButton, HeroResultRow, ResultRow, CopyButton
- All state lives in Calculator.svelte — child components communicate via props and callback props
- Combined JS + CSS target under 50KB gzipped (excluding Wasm)

**From Architecture — Wasm Integration:**

- Wasm bridge API: `calculate()`, `validate_date()`, `now_unix()`, `init()` exposed via wasm-bindgen
- JSON strings cross the Wasm boundary; Rust uses `#[serde(rename_all = "camelCase")]`
- FormattedResult interface: `{ unixTimestamp, iso8601, rfc2822, localHuman }`
- Eager Wasm loading on island hydration — `init()` called once during component mount
- jiff `js` feature flag required for `wasm32-unknown-unknown` target
- `wasmBridge.ts` is the single point of contact with Wasm — components never import Wasm directly
- All Wasm calls wrapped in try/catch — errors propagate as typed results

**From Architecture — Build Pipeline & Infrastructure:**

- CI/CD build order: cargo test → wasm-pack build --target web → pnpm install → pnpm test → pnpm build → deploy dist/ to Cloudflare Pages
- Caching: Rust/cargo dependencies and pnpm store cached between CI runs
- Static deployment on Cloudflare Pages — zero server infrastructure
- Cloudflare Analytics for monitoring (built-in, free)
- Lighthouse CI in GitHub Actions for performance regression detection

**From Architecture — Testing Strategy:**

- Rust engine: `cargo test` for datetime correctness (DST, leap years, month boundaries, format consistency)
- Svelte components: Vitest + `@testing-library/svelte` for behavior, reactivity, accessibility attributes
- Wasm integration: Vitest for bridge correctness and error propagation
- E2E: Playwright for full page flows, dark/light mode, responsive layout, keyboard navigation
- Performance: Lighthouse CI for TTI, FCP, CLS, Wasm bundle size

**From Architecture — Implementation Patterns (mandatory):**

- Naming: PascalCase Svelte components, camelCase TS modules, snake_case Rust files, camelCase JSON across Wasm boundary
- Tailwind utility classes only — no `@apply`, no custom CSS class names in components
- Co-located test files (`.test.ts` next to source)
- Svelte component structure order: imports → props → state → derived → effects → handlers
- No JS Date API usage — all datetime computation via Wasm
- No `any` type in TypeScript — use proper types or `unknown` with type guards

**From UX Design — Layout & Visual Design:**

- Side-by-side 40/60 layout (Classic Side-by-Side direction): input zone left, output zone right
- Desktop-first responsive design with stacked mobile fallback at < 768px
- Max content width 960px centered
- Orange accent color (orange-500 / #F97316), consistent across dark and light modes
- JetBrains Mono (self-hosted) for monospace values; system font stack for UI text
- Hero Unix timestamp at 2rem/32px semibold monospace
- Input zone on gray-50 background; output zone on white; hero row on orange-50 background

**From UX Design — Interaction Patterns:**

- No submit buttons — all results live-update on input change
- Copy confirmation: button transitions to green checkmark + "Copied!" for 1.5 seconds
- Live-ticking Unix timestamp with "● live" indicator when at default state
- Error states: inline, non-blocking — red border + subtle error text below input
- No modal dialogs, no toast notifications — all feedback is inline and co-located
- StartDateInput: on focus, select all text; on blur with empty value, revert to "now"
- OperationRow defaults: subtract (−), 0, days

**From UX Design — Accessibility Specifics:**

- Focus ring: 2px orange ring (`ring-2 ring-orange-400`) on all interactive elements
- Tab order: header → StartDate → OperationRow(s) → AddOperation → Reset → HeroResultRow copy → ResultRow copies
- `aria-live="polite"` on live-ticking HeroResultRow
- `aria-live="assertive"` on copy confirmation announcements
- Screen reader live region updates max once per 10 seconds for ticking
- `prefers-reduced-motion`: freeze live-ticking, make copy transitions instant
- Semantic HTML: `<main>`, `<section>`, `<label>`, `<button>`
- No information conveyed by color alone — copy uses color + text + icon change

**From UX Design — Spacing:**

- Base unit: 4px; spacing tokens: xs(4px), sm(8px), md(16px), lg(24px), xl(32px)
- Within components: 8px gaps; between components in same zone: 16px; between zones: 24px
- Page padding: 32px desktop, 16px mobile
- Border radius: 6px (`rounded-md`) consistent across all elements

### FR Coverage Map

| FR | Epic | Description |
|----|------|-------------|
| FR1 | Epic 2 | Add/subtract days, months, years from start date |
| FR2 | Epic 2 | Set start date to any valid calendar date |
| FR3 | Epic 1 | Default start date to "now" |
| FR4 | Epic 2 | Calendar correctness validation (leap years, month boundaries) |
| FR5 | Epic 2 | Reject invalid inputs with error messaging, preserve last valid |
| FR6 | Epic 1 | Single datetime engine (Wasm), no secondary computation path |
| FR7 | Epic 1 | Display results in Unix, ISO 8601, RFC 2822, local formats |
| FR8 | Epic 1 | Unix timestamp displayed with greater visual prominence |
| FR9 | Epic 2 | All formats update instantly on any input change |
| FR10 | Epic 1 | Live-updating Unix timestamp when "now" with no operations |
| FR11 | Epic 1 | Indicate whether timestamp is live-updating or static |
| FR12 | Epic 1 | One-click copy per format |
| FR13 | Epic 1 | Brief visual confirmation on copy |
| FR14 | Epic 1 | Values selectable via standard text selection |
| FR15 | Epic 2 | Select operation direction (add/subtract) |
| FR16 | Epic 2 | Specify operation amount as non-negative integer |
| FR17 | Epic 2 | Select operation unit (days/months/years) |
| FR18 | Epic 2 | Real-time input validation |
| FR19 | Epic 2 | Clearing start date reverts to "now" |
| FR20 | Epic 1 | Display current datetime on page load, before interaction |
| FR21 | Epic 1 | Fully functional after initial load, no further network requests |
| FR22 | Epic 1 | Functions offline after initial page cache |
| FR23 | Epic 3 | Dark and light modes matching system preference |
| FR24 | Epic 3 | Functional layout on desktop, tablet, and mobile |
| FR25 | Epic 1 | Calculator and results fit within single desktop viewport |
| FR26 | Epic 3 | All interactive elements keyboard-reachable and operable |
| FR27 | Epic 3 | Visible focus indicator on keyboard focus |
| FR28 | Epic 3 | Screen reader announcements for dynamic content |
| FR29 | Epic 3 | Respects `prefers-reduced-motion` |
| FR30 | Epic 3 | WCAG 2.1 AA contrast compliance |
| FR31 | Epic 3 | No color-only state indication |

**Post-MVP Expansion Coverage (not part of FR1–FR31):**

- Epic 4: AI natural language accelerator (Cmd+K parse -> calculator auto-populate -> auto-execute with editable steps)
- Epic 5: URL state, shareability, and URL-as-API contract for human and agent workflows
- Epic 6: Reverse decode and advanced time utilities (timestamp decode, higher-order operations, extended utility flows)

## Epic List

### Epic 1: Live Timestamp Display & One-Click Copy
Users can load the page and immediately see the current time as a live-ticking Unix timestamp, plus ISO 8601, RFC 2822, and local human-readable formats, and copy any value to clipboard with one click. The page is deployed and accessible on the web.
**FRs covered:** FR3, FR6, FR7, FR8, FR10, FR11, FR12, FR13, FR14, FR20, FR21, FR22, FR25

### Epic 2: Date Math Calculator
Users can perform date calculations by adding or subtracting days, months, or years from any start date (or "now"), with all format results updating instantly. Invalid inputs show inline errors while preserving the last valid result.
**FRs covered:** FR1, FR2, FR4, FR5, FR9, FR15, FR16, FR17, FR18, FR19

### Epic 3: Theming, Responsiveness & Accessibility
Users experience a polished, professional tool with automatic dark/light mode matching their system preference, functional layouts across desktop/tablet/mobile, full keyboard navigation, screen reader support, and WCAG 2.1 AA compliance.
**FRs covered:** FR23, FR24, FR26, FR27, FR28, FR29, FR30, FR31

### Epic 4: AI Natural Language Accelerator (Post-MVP)
Users can express date-time intent in natural language (Cmd+K), have the calculator auto-populate and execute instantly, and still retain full transparency and editability of steps.
**FRs covered:** Post-MVP (outside FR1–FR31)

### Epic 5: URL State, Shareability & URL-as-API (Post-MVP)
Users and AI agents can encode calculator state in URL parameters, restore deterministic state on load, and share exact reproducible calculations via links.
**FRs covered:** Post-MVP (outside FR1–FR31)

### Epic 6: Reverse Decode & Advanced Time Utilities (Post-MVP)
Users can decode timestamps and perform advanced date-time workflows while preserving the same fast, copy-first interaction model.
**FRs covered:** Post-MVP (outside FR1–FR31)

## Epic 1: Live Timestamp Display & One-Click Copy

Users can load the page and immediately see the current time as a live-ticking Unix timestamp, plus ISO 8601, RFC 2822, and local human-readable formats, and copy any value to clipboard with one click. The page is deployed and accessible on the web.

### Story 1.1: Project Scaffolding & Wasm Engine Validation

As a developer using datetime-helper,
I want the tool built on a proven, correct datetime computation engine,
So that all timestamp calculations I rely on are accurate for DST, leap years, and calendar edge cases.

**Acceptance Criteria:**

**Given** the project is initialized with Astro minimal template, Svelte 5, and Tailwind CSS v4,
**When** I run `pnpm dev`,
**Then** the Astro dev server starts successfully at localhost:4321.

**Given** the Rust crate is configured with jiff and wasm-bindgen,
**When** I run `wasm-pack build --target web` on the `crates/datetime-engine` crate,
**Then** the Wasm module compiles successfully and the `.wasm` output is under 100KB gzipped (NFR5).

**Given** the Wasm module exposes a `calculate(start_date, operations_json)` function,
**When** called with a valid ISO date string and empty operations,
**Then** it returns a JSON string with `unixTimestamp` (number), `iso8601` (string), `rfc2822` (string), and `localHuman` (string) fields representing the same instant in time.

**Given** the Wasm module exposes a `now_unix()` function,
**When** called,
**Then** it returns the current Unix timestamp as an f64.

**Given** the Wasm module exposes a `validate_date(input)` function,
**When** called with `"2027-02-29"`,
**Then** it returns an error result indicating the date is invalid (2027 is not a leap year).

**Given** Rust tests exist for datetime correctness,
**When** I run `cargo test`,
**Then** all tests pass, covering: DST transition dates, leap year calculations (FR4), month boundary arithmetic (e.g., Jan 31 + 1 month), format consistency across all four output formats (NFR14–NFR18).

**Given** the project directory structure is established,
**When** I inspect the project,
**Then** it matches the canonical architecture: `src/pages/`, `src/components/`, `src/lib/`, `src/styles/`, `src/layouts/`, `crates/datetime-engine/src/`, with `pnpm` as the package manager and TypeScript in strict mode.

### Story 1.2: Page Layout & Wasm Bridge Integration

As a developer visiting datetime-helper,
I want to see a clean, structured page with input and output zones,
So that the tool's layout is immediately clear and the computation engine is ready.

**Acceptance Criteria:**

**Given** I navigate to the page,
**When** it loads in a desktop browser (>= 1024px width),
**Then** I see a centered layout (max-width 960px) with a 40/60 side-by-side split — input zone on the left (gray-50 background) and output zone on the right (white background).

**Given** `Layout.astro` is rendered,
**When** I inspect the HTML head,
**Then** it includes meta tags optimized for "unix timestamp calculator," "date math unix timestamp," and "datetime calculator," plus a proper `<title>`, viewport meta, and the global CSS import with `@import "tailwindcss"`.

**Given** `index.astro` renders the page,
**When** the static HTML shell loads (before JS hydration),
**Then** placeholder content is visible in the output zone — the page is not blank while Wasm loads.

**Given** `Calculator.svelte` is mounted with `client:load`,
**When** the Svelte island hydrates,
**Then** `wasmBridge.init()` is called and the Wasm module initializes successfully.

**Given** `wasmBridge.ts` wraps all Wasm functions,
**When** any Wasm call throws an error,
**Then** the error is caught via try/catch, logged to console, and a typed error result is returned — no uncaught Wasm exceptions propagate.

**Given** `types.ts` defines the `FormattedResult` interface,
**When** imported by any component or module,
**Then** it provides `{ unixTimestamp: number; iso8601: string; rfc2822: string; localHuman: string }` matching the Wasm output exactly.

### Story 1.3: Live-Ticking Hero Timestamp & Multi-Format Results

As a developer needing the current Unix timestamp,
I want to see the current time in all four formats the moment the page loads — with the Unix timestamp ticking live,
So that I can read or copy the value I need without any interaction.

**Acceptance Criteria:**

**Given** the page loads at default state (start = "now", no operations),
**When** Wasm initializes,
**Then** the hero row displays the current Unix timestamp in large (2rem/32px) semibold monospace text on an orange-50 background with an orange-200 border (FR8, FR20).

**Given** the page is at default state,
**When** 1 second passes,
**Then** the Unix timestamp value in the hero row updates to reflect the current time, without layout shift or jank (FR10, NFR7).

**Given** the hero row is live-ticking,
**When** I observe it,
**Then** a "● live" indicator is displayed in orange near the hero row, communicating that the value is updating in real time (FR11).

**Given** the page loads,
**When** I look below the hero row,
**Then** I see three additional result rows displaying: ISO 8601, RFC 2822, and local human-readable formats — each with a format label in sans-serif and value in monospace (FR7).

**Given** the page is at default state,
**When** 1 second passes,
**Then** all four format values (hero + 3 result rows) update simultaneously, all representing the same instant (NFR17).

**Given** the complete calculator and results area on a desktop viewport (1280x800+),
**When** I view the page,
**Then** everything fits within a single viewport without scrolling (FR25).

### Story 1.4: One-Click Copy to Clipboard

As a developer,
I want to copy any datetime format value to my clipboard with a single click,
So that I can paste it directly into my SQL query, code, or documentation without manual text selection.

**Acceptance Criteria:**

**Given** any result row (hero or standard),
**When** I look at it,
**Then** I see a copy button at the right edge of the row, styled with gray border and icon in the default state (FR12).

**Given** I click a copy button on any result row,
**When** the Clipboard API succeeds,
**Then** the exact displayed format value is now in my system clipboard.

**Given** I click a copy button,
**When** the copy action completes,
**Then** the button transitions to green border, green-50 background, checkmark icon, and "Copied!" text — reverting to default after 1.5 seconds (FR13).

**Given** the Clipboard API is unavailable in the browser,
**When** I click a copy button,
**Then** the system silently falls back to `document.execCommand('copy')` and the copy still succeeds.

**Given** a monospace format value is displayed in a result row,
**When** I double-click the value text,
**Then** the text is selected (no `user-select: none` applied), allowing standard Ctrl+C copy (FR14).

**Given** the hero row's copy button,
**When** compared to standard result row copy buttons,
**Then** the hero row's copy button is slightly larger, matching the visual prominence of the hero row.

### Story 1.5: CI/CD Pipeline & Production Deployment

As a developer,
I want datetime-helper deployed and accessible on the web,
So that I can use it from any browser without local setup.

**Acceptance Criteria:**

**Given** a GitHub Actions workflow file exists at `.github/workflows/deploy.yml`,
**When** code is pushed to the main branch,
**Then** the pipeline executes in order: `cargo test` → `wasm-pack build --target web` → `pnpm install` → `pnpm test` → `pnpm build` → deploy `dist/` to Cloudflare Pages.

**Given** the pipeline runs,
**When** any step fails (cargo test, wasm-pack, pnpm test, or pnpm build),
**Then** the pipeline halts and does not deploy, with clear error output identifying the failing step.

**Given** the build succeeds and deployment completes,
**When** I navigate to the Cloudflare Pages URL,
**Then** the site loads and all functionality works: live-ticking timestamp, multi-format display, one-click copy (FR21).

**Given** the CI pipeline runs repeatedly,
**When** Rust source hasn't changed,
**Then** Rust/cargo dependencies and pnpm store are restored from cache, reducing build time.

**Given** the deployed site has loaded all static assets,
**When** I disconnect from the network and continue using the tool,
**Then** it continues to function — all computation is client-side via Wasm with no further network requests needed (FR21, FR22).

## Epic 2: Date Math Calculator

Users can perform date calculations by adding or subtracting days, months, or years from any start date (or "now"), with all format results updating instantly. Invalid inputs show inline errors while preserving the last valid result.

### Story 2.1: Start Date Input with "Now" Default

As a developer,
I want to enter any date as my calculation starting point — or leave it as "now" for the current time,
So that I can get timestamp results for any date I'm working with.

**Acceptance Criteria:**

**Given** the page loads at default state,
**When** I look at the input zone,
**Then** the StartDateInput displays "now" in orange text, indicating the live default (FR3).

**Given** the StartDateInput is at the "now" default,
**When** I click into the field,
**Then** all text is selected for easy replacement, and an orange focus ring (2px) appears.

**Given** I type a valid date (e.g., "2026-03-15") into the StartDateInput,
**When** the input value changes,
**Then** all four result format values update instantly to reflect that date (instead of "now"), the live-ticking stops, and the "● live" indicator disappears (FR2, FR9).

**Given** I type an invalid date (e.g., "2026-13-01") into the StartDateInput,
**When** the input value changes,
**Then** the input border turns red with a subtle error message below (e.g., "Invalid date"), and the result area continues showing the last valid calculation — no blank screen, no error dialog (FR5, FR18).

**Given** the StartDateInput is showing a validation error,
**When** I correct the input to a valid date,
**Then** the red border and error message clear instantly, and results snap to the corrected date.

**Given** I have entered a custom date in StartDateInput,
**When** I clear the field (select all + delete) and blur,
**Then** the input reverts to "now" in orange text, live-ticking resumes, and the "● live" indicator reappears (FR19).

**Given** the Wasm engine validates the date,
**When** I enter "2028-02-29" (a leap year),
**Then** it is accepted as valid. When I enter "2027-02-29" (not a leap year), it is rejected with an error (FR4).

### Story 2.2: Single Operation Row with Live Results

As a developer debugging a time-range issue,
I want to add or subtract days, months, or years from my start date and see instant results,
So that I can get the exact timestamp I need for my database query or log analysis.

**Acceptance Criteria:**

**Given** the calculator displays an operation row below the start date input,
**When** I look at it,
**Then** I see three controls: a direction select (+/−), an amount input (number), and a unit select (days/months/years), with defaults of subtract (−), 0, days (FR15, FR16, FR17).

**Given** I change the direction to "subtract," enter "7" in the amount field, and select "days,"
**When** the start date is "now,"
**Then** all four result formats update instantly (< 100ms) to show the datetime 7 days ago (FR1, FR9, NFR4).

**Given** I change any operation field (direction, amount, or unit),
**When** the input changes,
**Then** results recalculate and update live — no submit button, no manual action required.

**Given** the start date is "now" and an operation is applied (amount > 0),
**When** I look at the hero row,
**Then** the live-ticking stops, the "● live" indicator disappears, and the Unix timestamp shows the static calculated result.

**Given** I enter a non-numeric or negative value in the amount field,
**When** the input changes,
**Then** the field prevents invalid input — only non-negative integers are accepted (FR16).

**Given** I set the amount back to 0,
**When** the start date is "now,"
**Then** the result is equivalent to "now" — live-ticking resumes since effectively no operation is applied.

**Given** I enter "1" month with start date "2026-01-31,"
**When** the calculation runs,
**Then** the Wasm engine handles the month boundary correctly (e.g., produces Feb 28, 2026) — no crash, no invalid date (FR4, NFR16).

### Story 2.3: Multi-Step Operations & Reset

As a developer performing complex date calculations,
I want to chain multiple operations and easily reset to start over,
So that I can build multi-step calculations (e.g., "6 months ago, minus 3 days") without starting from scratch.

**Acceptance Criteria:**

**Given** the calculator shows one operation row,
**When** I click the "+ Add operation" button (full-width, dashed gray border),
**Then** a new operation row appears below the existing one with default values (subtract, 0, days), and the new row's direction select receives focus.

**Given** multiple operation rows exist (e.g., −6 months, then −3 days),
**When** I look at the results,
**Then** all operations are applied sequentially to the start date, and all four format results reflect the final calculated datetime.

**Given** multiple operation rows exist,
**When** I change any field in any operation row,
**Then** the entire calculation re-runs and results update instantly.

**Given** there are two or more operation rows,
**When** I look at each row,
**Then** each row has a remove button (✕) at the right edge. Clicking it removes that row and recalculates results.

**Given** there is only one operation row,
**When** I look at it,
**Then** the remove button is hidden — at least one operation row is always present.

**Given** the calculator has been modified from default state (custom date or operations with amount > 0),
**When** I look at the input zone,
**Then** a reset button ("↺ Reset") is visible in subtle gray styling.

**Given** I click the reset button,
**When** the action completes,
**Then** the start date reverts to "now," all extra operation rows are removed, the remaining operation resets to defaults (subtract, 0, days), live-ticking resumes, and results snap back to current datetime — no confirmation dialog (FR19).

**Given** the calculator is at default state (now, single operation at 0),
**When** I look at the input zone,
**Then** the reset button is hidden.

## Epic 3: Theming, Responsiveness & Accessibility

Users experience a polished, professional tool with automatic dark/light mode matching their system preference, functional layouts across desktop/tablet/mobile, full keyboard navigation, screen reader support, and WCAG 2.1 AA compliance.

### Story 3.1: Dark/Light Mode with System Preference

As a developer using datetime-helper,
I want the tool to automatically match my system's dark or light mode,
So that it fits seamlessly into my desktop environment without manual theme toggling.

**Acceptance Criteria:**

**Given** my operating system is set to light mode,
**When** I load datetime-helper,
**Then** the page renders with white/light gray backgrounds, dark text, and the orange accent color (FR23).

**Given** my operating system is set to dark mode,
**When** I load datetime-helper,
**Then** the page renders with dark slate backgrounds (`slate-900`/`slate-800`), light text, and the same orange accent color — consistent brand across both modes (FR23).

**Given** the dark mode is active,
**When** I inspect all text/background combinations,
**Then** every combination meets WCAG 2.1 AA contrast ratios: 4.5:1 for normal text, 3:1 for large text (FR30, NFR8).

**Given** the light mode is active,
**When** I inspect all text/background combinations,
**Then** every combination meets WCAG 2.1 AA contrast ratios, including orange accent text which uses `orange-600` or darker on white backgrounds (FR30, NFR8).

**Given** the hero result row,
**When** viewed in dark mode,
**Then** the orange-tinted background adapts appropriately — the Unix timestamp remains visually prominent and readable.

**Given** all components (StartDateInput, OperationRow, AddOperationButton, ResetButton, HeroResultRow, ResultRow, CopyButton),
**When** viewed in both light and dark modes,
**Then** every component has appropriate `dark:` variant styling — no unstyled elements, no invisible text, no broken borders.

**Given** the CopyButton in its "Copied!" state,
**When** viewed in dark mode,
**Then** the green confirmation styling (border, background, text) remains visible and meets contrast requirements (FR31).

### Story 3.2: Responsive Layout for Tablet & Mobile

As a developer checking a timestamp on my tablet or phone,
I want datetime-helper to work on any screen size,
So that I can use the tool even when I'm away from my desktop.

**Acceptance Criteria:**

**Given** I view the page on a desktop viewport (>= 1024px),
**When** the layout renders,
**Then** the 40/60 side-by-side split is displayed with 32px page padding and full spacing between zones (FR24).

**Given** I view the page on a tablet viewport (768px–1023px),
**When** the layout renders,
**Then** the side-by-side layout is maintained with tighter padding (24px) and slightly compressed component spacing (FR24).

**Given** I view the page on a mobile viewport (< 768px),
**When** the layout renders,
**Then** the layout switches to stacked vertical: input zone on top, output zone below, with 16px page padding (FR24).

**Given** the mobile stacked layout,
**When** I use all calculator features (start date, operations, add/remove, reset, copy),
**Then** every feature is fully functional — nothing is hidden or removed on mobile.

**Given** a very narrow viewport (375px, iPhone SE width),
**When** the page renders,
**Then** all content fits within the viewport width — no horizontal scrolling, no content overflow.

**Given** the mobile layout,
**When** I tap interactive elements (buttons, inputs, selects),
**Then** touch targets are sufficiently large (>= 44px height) for comfortable touch interaction.

### Story 3.3: Keyboard Navigation & Screen Reader Support

As a developer who uses keyboard navigation or assistive technology,
I want full keyboard access and screen reader support,
So that I can use datetime-helper effectively regardless of how I interact with my browser.

**Acceptance Criteria:**

**Given** I navigate the page using only the Tab key,
**When** I press Tab repeatedly,
**Then** focus moves in logical order: StartDateInput → OperationRow direction → OperationRow amount → OperationRow unit → OperationRow remove (if visible) → AddOperationButton → ResetButton (if visible) → HeroResultRow CopyButton → ResultRow CopyButtons (ISO, RFC, Local) (FR26, NFR9).

**Given** any interactive element receives keyboard focus,
**When** I look at it,
**Then** a visible orange focus ring (minimum 2px width) is displayed around the element (FR27, NFR10).

**Given** the hero row is live-ticking,
**When** a screen reader is active,
**Then** an `aria-live="polite"` region announces the updated timestamp no more than once every 10 seconds — avoiding screen reader spam (FR28, NFR11).

**Given** I click a copy button,
**When** the copy succeeds,
**Then** an `aria-live="assertive"` region announces "Copied to clipboard" so screen readers communicate the action immediately (FR28, NFR13).

**Given** `prefers-reduced-motion` is enabled in my OS settings,
**When** I use the page,
**Then** the live-ticking timestamp freezes to a static display, the CopyButton confirmation transitions are instant (no animation), and no animations play anywhere on the page (FR29, NFR12).

**Given** `prefers-reduced-motion` is not enabled,
**When** I use the page,
**Then** animations play normally — live-ticking updates, copy button transitions with smooth state changes.

**Given** any error or state change on the page,
**When** I inspect the visual indicator,
**Then** the state is communicated through multiple channels — never color alone. Errors use red border + text message. Copy confirmation uses green color + checkmark icon + "Copied!" text (FR31).

**Given** I inspect the page's HTML structure,
**When** I review the semantic elements,
**Then** the page uses `<main>` for the app, `<section>` for input/output zones, `<label>` for all inputs, `<button>` for all actions — no `<div>` or `<span>` with click handlers acting as buttons.

**Given** all format labels in result rows,
**When** a screen reader reads them,
**Then** labels are properly associated with their values via `aria-describedby` or equivalent, and each format is clearly identified (e.g., "Unix Timestamp," "ISO 8601").

## Epic 4: AI Natural Language Accelerator (Post-MVP)

Users can express date-time intent in natural language (Cmd+K), have the calculator auto-populate and execute instantly, and still retain full transparency and editability of steps.

### Story 4.1: Command Palette Entry and Availability Detection

As a developer,
I want to open a natural-language command palette quickly and understand whether AI is available,
So that I can start AI-assisted datetime input without breaking flow.

**Acceptance Criteria:**

**Given** the calculator page is loaded,
**When** I press Cmd+K (or Ctrl+K on non-macOS),
**Then** a command palette opens, focus moves to its input, and background content is dimmed but still visible.

**Given** the command palette is open,
**When** I press Escape or click outside the panel,
**Then** the palette closes and focus returns to the previously focused element.

**Given** the browser environment supports the configured AI provider,
**When** the palette initializes,
**Then** it shows ready state and accepts natural-language prompts.

**Given** the browser environment does not support the configured AI provider,
**When** the palette initializes,
**Then** it shows a non-blocking "AI unavailable" message and offers "use calculator directly" guidance.

### Story 4.2: Natural Language Parsing to Calculator Operations

As a developer,
I want my natural-language date request translated into structured calculator inputs,
So that I can verify and use AI output without black-box behavior.

**Acceptance Criteria:**

**Given** I submit a prompt such as "6 months ago from now",
**When** the AI parse completes,
**Then** the system returns a structured result containing start date intent and ordered operations compatible with the existing calculator schema.

**Given** the parse result includes multiple operations,
**When** it is transformed to calculator state,
**Then** operation order is preserved exactly as parsed.

**Given** the parse result is ambiguous or incomplete,
**When** transformation validation runs,
**Then** the system returns a typed parse error and does not mutate the existing calculator state.

**Given** parsing succeeds,
**When** the transformed state is inspected,
**Then** all fields conform to calculator constraints (direction, non-negative integer amount, valid unit).

### Story 4.3: Auto-Execute Parsed Steps with Editable Review

As a developer,
I want parsed steps applied immediately while remaining editable,
So that I get fast results and can correct interpretation errors instantly.

**Acceptance Criteria:**

**Given** a valid parse result is returned,
**When** the command palette submit flow completes,
**Then** the calculator state updates in one transaction and all result formats recalculate immediately.

**Given** parsed steps have been applied,
**When** I inspect the calculator area,
**Then** I can see each populated field and edit it directly using the same controls as manual mode.

**Given** I edit any AI-populated field,
**When** the input changes,
**Then** results update live using standard calculator behavior with no AI dependency.

**Given** AI parsing fails,
**When** the failure is surfaced,
**Then** the calculator remains in its prior valid state and an inline error explains what failed.

### Story 4.4: AI Interaction Accessibility and Safety Constraints

As a keyboard and assistive-technology user,
I want AI interactions to remain accessible and predictable,
So that natural-language acceleration does not reduce usability or trust.

**Acceptance Criteria:**

**Given** I use keyboard-only navigation,
**When** the command palette is open,
**Then** focus is trapped within the palette and Tab order remains logical.

**Given** I submit a prompt and parsing succeeds,
**When** state is applied,
**Then** a polite live-region announcement confirms that calculator steps were updated.

**Given** I submit repeated prompts quickly,
**When** parse requests overlap,
**Then** only the latest request can mutate calculator state and earlier in-flight responses are ignored.

**Given** `prefers-reduced-motion` is enabled,
**When** the palette opens and closes,
**Then** transitions are reduced/removed while preserving functional clarity.

## Epic 5: URL State, Shareability & URL-as-API (Post-MVP)

Users and AI agents can encode calculator state in URL parameters, restore deterministic state on load, and share exact reproducible calculations via links.

### Story 5.1: URL State Schema and Deterministic Encoder/Decoder

As a developer,
I want a stable URL schema for calculator state,
So that links are reproducible for both humans and AI agents.

**Acceptance Criteria:**

**Given** a calculator state (start date + ordered operations),
**When** it is encoded,
**Then** it produces a canonical query-string format with deterministic field ordering.

**Given** a canonical query string,
**When** it is decoded,
**Then** it reconstructs an equivalent calculator state with matching operation order and values.

**Given** unknown or unsupported query parameters are present,
**When** decode runs,
**Then** unknown fields are ignored safely without breaking valid state restoration.

**Given** malformed URL state is provided,
**When** decode validation fails,
**Then** the app falls back to the last known valid/default state and emits a typed validation error.

### Story 5.2: State Hydration from URL on Page Load

As a returning user,
I want the app to open exactly in the state represented by the URL,
So that shared links and bookmarks immediately show the intended calculation.

**Acceptance Criteria:**

**Given** I load a URL with valid query-state parameters,
**When** the app initializes,
**Then** calculator inputs are hydrated from the URL before first visible calculation output.

**Given** the URL contains no state parameters,
**When** the app initializes,
**Then** it starts in default "now" mode with standard live behavior.

**Given** URL-provided state is invalid,
**When** hydration runs,
**Then** the app preserves usability by falling back to default/last-valid state and showing inline feedback.

**Given** hydration succeeds,
**When** results render,
**Then** all output formats are internally consistent and correspond to hydrated state.

### Story 5.3: Live URL Synchronization and Share-Link Copy

As a developer,
I want URL state to stay synchronized and easy to copy,
So that I can share or reuse exact calculations without manual reconstruction.

**Acceptance Criteria:**

**Given** I change any calculator input,
**When** state updates,
**Then** the URL query string updates via `history.replaceState()` without full page reload.

**Given** I click "Copy share link",
**When** clipboard copy succeeds,
**Then** the full canonical URL is copied and a brief inline confirmation is shown.

**Given** URL synchronization is active,
**When** state changes rapidly,
**Then** updates remain stable and do not introduce visible lag or history spam.

**Given** a copied share link is opened in a new browser session,
**When** the page loads,
**Then** the exact calculation state and outputs are reproduced.

## Epic 6: Reverse Decode & Advanced Time Utilities (Post-MVP)

Users can decode timestamps and perform advanced date-time workflows while preserving the same fast, copy-first interaction model.

### Story 6.1: Reverse Decode Input for Unix and Common Datetime Formats

As a developer,
I want to paste an existing timestamp or datetime string and decode it,
So that I can quickly inspect equivalent values across supported output formats.

**Acceptance Criteria:**

**Given** reverse mode is available,
**When** I paste a valid Unix timestamp,
**Then** the app parses it and displays equivalent ISO 8601, RFC 2822, and local-human outputs.

**Given** I paste a valid ISO 8601 string,
**When** parsing completes,
**Then** the Unix timestamp and other formats render as the same instant.

**Given** I paste an invalid or unsupported value,
**When** validation runs,
**Then** an inline error is shown and the last valid output remains visible.

**Given** reverse mode output is displayed,
**When** I click a copy button on any row,
**Then** copy behavior and confirmation match the existing forward-calculation UX.

### Story 6.2: Snap-to Boundary Operations

As a developer,
I want quick "snap-to" operations (for example start/end of day or month),
So that I can produce common boundary timestamps without manual multi-step edits.

**Acceptance Criteria:**

**Given** a valid base date/time,
**When** I select a supported snap operation (for example startOfDay, endOfDay, startOfMonth, endOfMonth),
**Then** the calculator applies it as a deterministic operation and results update instantly.

**Given** snap operations are chained with existing add/subtract operations,
**When** calculation executes,
**Then** operation order is preserved and output remains consistent.

**Given** a snap operation would produce an invalid intermediate state,
**When** validation runs,
**Then** the operation is rejected with inline feedback and prior valid state is preserved.

**Given** a snap operation is applied,
**When** URL synchronization is enabled,
**Then** the operation is represented in canonical shareable URL state.

### Story 6.3: Timezone-Aware Utility Controls

As a developer working across regions,
I want timezone-aware display controls for advanced inspection,
So that I can reason about the same instant in context without external tools.

**Acceptance Criteria:**

**Given** timezone controls are available,
**When** I choose UTC or Local display mode,
**Then** output labels and values reflect the selected context consistently.

**Given** I select a supported IANA timezone (if enabled in this phase),
**When** results render,
**Then** displayed local-human context updates to that timezone while preserving the same instant.

**Given** timezone selection changes,
**When** I copy any output value,
**Then** copied content matches the currently displayed timezone context.

**Given** timezone controls are unsupported in a constrained environment,
**When** feature detection runs,
**Then** controls degrade gracefully to UTC/Local baseline without blocking core calculator usage.
