---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
lastStep: 8
status: 'complete'
completedAt: '2026-02-15'
inputDocuments:
  - '_bmad-output/planning-artifacts/prd.md'
  - '_bmad-output/planning-artifacts/product-brief-datetime-helper-2026-02-13.md'
  - '_bmad-output/planning-artifacts/ux-design-specification.md'
  - '_bmad-output/brainstorming/brainstorming-session-2026-02-12.md'
workflowType: 'architecture'
project_name: 'datetime-helper'
user_name: 'Samuel'
date: '2026-02-15'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**

31 functional requirements across 6 categories:

| Category | FRs | Architectural Implication |
|----------|-----|--------------------------|
| Date Calculation (FR1-6) | Add/subtract days/months/years from arbitrary or "now" start date, calendar correctness, single engine | All computation routes through Rust/Wasm. No JS datetime fallback. Validation logic lives in Wasm. |
| Result Display (FR7-11) | 4 simultaneous formats, Unix prominence, instant updates, live-ticking, live/static indicator | Reactive state model: one Wasm call produces all 4 format outputs. UI must distinguish live-ticking from static results. |
| Copy & Export (FR12-14) | One-click copy per format, visual confirmation, text selection alternative | Clipboard API integration per result row. ARIA live region for confirmation. Values must remain selectable (no `user-select: none`). |
| Input & Interaction (FR15-19) | Direction (+/-), amount (integer), unit (days/months/years), real-time validation, clear-to-"now" | Native HTML inputs for accessibility. Validation in real-time — error states are non-blocking. Clearing start date reverts to live mode. |
| Page Lifecycle (FR20-22) | Current datetime on load, no network after initial load, offline after cache | Static HTML shell pre-rendered by Astro. Wasm hydrates with live values. Service worker or cache headers for offline. |
| Appearance (FR23-25) | Dark/light mode (system pref), responsive layout, single viewport on desktop | Tailwind `dark:` variants. Desktop-first responsive with stacked mobile fallback. Max-width 960px centered. |

**Accessibility Requirements (FR26-31 + NFR8-13):**

WCAG 2.1 AA compliance as a cross-cutting concern: keyboard navigation with logical tab order, visible focus indicators (2px), screen reader announcements (live regions throttled to 10s for ticking), `prefers-reduced-motion` support, 4.5:1 contrast ratios, no color-only state indication.

**Non-Functional Requirements:**

| Category | NFRs | Architectural Impact |
|----------|------|---------------------|
| Performance (NFR1-7) | TTI < 1s, FCP < 0.5s, CLS < 0.1, calc < 100ms, Wasm < 100KB gzip, copy < 50ms, tick without jank | Wasm bundle must be tree-shaken aggressively. Parallel Wasm loading. No layout shift from hydration. |
| Correctness (NFR14-18) | DST transitions, leap years, month boundaries, format consistency, cross-browser parity | Jiff library handles correctness. No secondary computation path. Cross-browser testing required. |

**Scale & Complexity:**

- Primary domain: Client-side web application (static site + Wasm)
- Complexity level: Low (single-page, no backend, no auth) with moderate technical depth (Wasm integration, real-time reactivity)
- Estimated architectural components: ~10 (Wasm engine, JS bridge, calculator state manager, 6-8 UI components, build pipeline)

### Technical Constraints & Dependencies

| Constraint | Source | Impact |
|-----------|--------|--------|
| Rust/Wasm (jiff) as sole datetime engine | PRD FR6, Brainstorming #17 | No JS datetime logic anywhere. All computation via Wasm bridge. |
| Single Astro page, one interactive island | PRD Architecture | One `client:load` island component contains all interactivity. |
| Wasm < 100KB gzipped | PRD NFR5 (High severity risk) | Must validate early. Tree-shake jiff features. |
| No client-side router | PRD Architecture | Query params via `history.replaceState()` only. |
| Static deployment on Cloudflare Pages | PRD Architecture | No server-side computation. Zero-cost hosting. |
| GitHub Actions CI/CD | PRD Implementation | Astro build + wasm-pack compile + deploy pipeline. |
| Chrome AI optional (not MVP per PRD) | PRD Scope | CommandPalette is Phase 2. Calculator works standalone in MVP. |

### Cross-Cutting Concerns Identified

1. **Wasm Lifecycle** — Loading, initialization, and the JS-to-Wasm bridge affect every computation path. Parallel loading with fallback handling is critical for TTI.
2. **State Model: Live vs. Static** — The calculator has two modes: live-ticking ("now" with no operations) and static (any calculation applied). Mode transitions must be clean — UI indicator, screen reader behavior, and tick interval all change.
3. **Dark/Light Mode** — Every component must support both themes via Tailwind `dark:` variants. Orange accent stays consistent; background and text colors invert.
4. **Accessibility** — WCAG AA compliance spans all components: focus management, ARIA attributes, contrast ratios, reduced motion, screen reader announcements.
5. **Performance Budget** — Sub-1s TTI, sub-100ms calculations, sub-100KB Wasm. These budgets constrain every dependency and rendering decision.
6. **Build Pipeline** — Two compilation targets (Astro + Rust/wasm-pack) must integrate into a single CI/CD pipeline deploying to Cloudflare Pages.

## Starter Template Evaluation

### Primary Technology Domain

**Client-side web application (static site + Wasm)** — Single-page developer utility with Astro as the static site generator and Rust/Wasm as the computation engine. No server-side runtime, no API, no database.

### Package Manager

**pnpm** — Selected for strict dependency hoisting (prevents phantom dependencies), disk efficiency, and clean lockfile management. All project commands use pnpm.

### Starter Options Considered

| Option | Evaluation | Verdict |
|--------|-----------|---------|
| Astro `minimal` template | Bare-bones single page, no styling opinions, clean structure. Perfect for a single-page tool where we control every detail. | **Selected** |
| Astro `basics` template | Includes example components and basic styling. More than we need — would require removing example code. | Rejected — unnecessary scaffolding |
| Astro `blog` template | Content-focused with markdown support, RSS, sitemap. Wrong paradigm for an interactive tool. | Rejected — wrong use case |
| Custom from scratch | No template, manual setup. More control but no benefit over `minimal` which is already bare-bones. | Rejected — minimal template is already bare enough |

### Selected Starter: Astro `minimal` Template

**Rationale:** The minimal template provides exactly the right foundation — a single page with no opinions about styling, component frameworks, or content structure. For a single-page utility with one interactive island, starting minimal and adding only what we need (Tailwind, Wasm integration) keeps the architecture clean and the bundle small.

**Initialization Command:**

```bash
# Create Astro project
pnpm create astro@latest datetime-helper -- --template minimal --typescript strict --git --install

# Add Tailwind CSS v4 via Vite plugin
cd datetime-helper
pnpm add tailwindcss @tailwindcss/vite
```

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**
- TypeScript (strict mode) — Astro has built-in TypeScript support
- Node.js >= 18.20.8 for build tooling
- No client-side framework (React/Vue/Svelte) — Astro components only for this project

**Styling Solution:**
- Tailwind CSS v4 via `@tailwindcss/vite` Vite plugin (not the deprecated `@astrojs/tailwind`)
- Global CSS imported in base layout: `@import "tailwindcss";`
- `dark:` variants for system-preference dark mode

**Build Tooling:**
- Astro 5 build pipeline (Vite 6 under the hood)
- Static output to `./dist/` directory
- wasm-pack for Rust → Wasm compilation (separate build step integrated into pipeline)

**Testing Framework:**
- Not included by starter — to be determined in architecture decisions (likely Vitest for JS, `cargo test` for Rust)

**Code Organization:**
- `src/pages/index.astro` — single page entry point
- `src/components/` — Astro island components
- `src/styles/` — global CSS with Tailwind
- `crates/datetime-engine/` — Rust/Wasm project (added alongside Astro)
- `public/` — static assets

**Development Experience:**
- `pnpm dev` — Astro dev server at `localhost:4321` with hot reload
- `pnpm build` — production build
- `pnpm preview` — preview production build locally
- `pnpm astro ...` — run Astro CLI commands

**Critical Version Note — jiff on Wasm:**
jiff v0.2.19 embeds the IANA Time Zone Database on `wasm32-unknown-unknown` targets by default. This may significantly increase bundle size beyond the 100KB gzipped budget (NFR5). Mitigation strategies:
- Investigate jiff feature flags to disable embedded timezone database (MVP only needs UTC + local browser time)
- Enable the `js` feature for `wasm32-unknown-unknown` to access current time via JavaScript
- Bundle size validation must be the first Rust/Wasm development task

**Verified Technology Versions:**

| Technology | Version | Date Verified |
|-----------|---------|---------------|
| Astro | 5.17 | 2026-02-15 |
| create-astro | 4.13.2 | 2026-02-15 |
| Tailwind CSS | v4 (via @tailwindcss/vite) | 2026-02-15 |
| wasm-pack | 0.14.0 | 2026-02-15 |
| jiff | 0.2.19 | 2026-02-15 |

**Note:** Project initialization using this command should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
1. Interactive island framework → Svelte 5
2. JS-to-Wasm bridge API surface → Single `calculate()` call returning all formats
3. Wasm loading strategy → Eager load on island hydration
4. CI/CD build pipeline order → Rust first, then Astro

**Important Decisions (Shape Architecture):**
5. State management → Svelte 5 runes (built-in)
6. Testing strategy → cargo test + Vitest + Testing Library
7. Error handling → Result types across Wasm boundary, inline UI errors

**Deferred Decisions (Post-MVP):**
- Chrome AI integration architecture (Phase 2)
- Query parameter state encoding (Phase 2)
- Web component extraction approach (Phase 3)

### Frontend Architecture

**Island Framework: Svelte 5 (Runes)**
- Version: Svelte 5 (stable, Oct 2024)
- Astro integration: `@astrojs/svelte` v7
- Rationale: Near-zero runtime overhead (compiler-based), fine-grained reactivity via runes, minimal bundle contribution, less boilerplate than alternatives, mature Astro integration.
- Installation: `pnpm astro add svelte`

**State Management: Svelte 5 Built-in Reactivity**
- `$state` for mutable calculator state (start date string, operations array, each operation's direction/amount/unit)
- `$derived` for computed results (calls Wasm `calculate()` on any state change, produces all 4 format values)
- `$effect` for side effects (live-ticking interval management, `history.replaceState()` for URL updates post-MVP)
- No external state management library. Single component tree with props/bindings between child components.

**Component Architecture:**
- Single Svelte island component (`Calculator.svelte`) mounted via `client:load` in `index.astro`
- Child components: `StartDateInput`, `OperationRow`, `AddOperationButton`, `ResetButton`, `HeroResultRow`, `ResultRow`, `CopyButton`
- CommandPalette deferred to Phase 2
- All components are Svelte components within the single island — not separate islands

**Bundle Optimization:**
- Svelte compiles away at build time — minimal runtime JS
- Tailwind CSS purged at build time
- Wasm loaded as a separate binary (not inlined in JS)
- Target: combined JS + CSS under 50KB gzipped (excluding Wasm)

### Wasm Integration Architecture

**JS-to-Wasm Bridge API:**

```rust
// Exposed by Rust via wasm-bindgen:
pub fn calculate(start_date: &str, operations_json: &str) -> String  // Returns JSON FormattedResult
pub fn validate_date(input: &str) -> String                          // Returns JSON ValidationResult
pub fn now_unix() -> f64                                              // Returns current Unix timestamp
pub fn init()                                                         // Initialize Wasm module
```

- Single `calculate()` call returns all 4 formats (Unix, ISO 8601, RFC 2822, local) as a JSON object
- Operations passed as serialized JSON array (direction, amount, unit per operation)
- Returns JSON strings across the Wasm boundary (wasm-bindgen handles serialization)
- `now_unix()` used for the live-ticking display (lightweight, no full calculation needed)

**Wasm Loading Strategy: Eager**
- Wasm module loaded immediately when the Svelte island hydrates (`client:load`)
- `init()` called once during component mount
- Static HTML shell (Astro-rendered) shows placeholder values; Svelte replaces with live Wasm-computed values on hydration
- No lazy loading — the tool's core purpose requires Wasm immediately

**Wasm Feature Configuration (jiff):**
- Enable `js` feature flag for `wasm32-unknown-unknown` target (required for current time access)
- Investigate disabling embedded IANA timezone database to reduce bundle size (MVP only needs UTC + browser local time)
- Bundle size validation is the first Rust development task — if jiff exceeds 100KB gzipped, evaluate: feature flag trimming → alternative library → hybrid approach

### Error Handling

**Wasm Boundary Errors:**
- Rust functions return `Result` types; wasm-bindgen translates errors to JS exceptions
- Svelte components wrap Wasm calls in try/catch
- Valid input → `FormattedResult` with all 4 formats
- Invalid input → `ValidationError` with human-readable message → inline error display, last valid result preserved
- Unexpected panic → caught by try/catch, generic error displayed, logged to console

**UI Error Handling (from UX spec):**
- All errors are inline and non-blocking
- Red border + subtle error text below input
- Error clears instantly when input becomes valid
- No modal dialogs, no "retry" buttons
- Last valid calculation persists during error state

### Testing Strategy

| Layer | Tool | Scope |
|-------|------|-------|
| Rust engine | `cargo test` | Datetime correctness: DST transitions, leap years, month boundary arithmetic, format consistency, edge cases (NFR14-18) |
| Svelte components | Vitest + `@testing-library/svelte` | Component behavior: reactive updates, copy button states, error display, accessibility attributes |
| Wasm integration | Vitest | Bridge: JS → Wasm calls produce correct results, error propagation, init lifecycle |
| E2E | Playwright | Full page flows: load → calculate → copy, dark/light mode, responsive layout, keyboard navigation |
| Performance | Lighthouse CI | TTI < 1s, FCP < 0.5s, CLS < 0.1, Wasm bundle size < 100KB gzip |

**Testing priority:** Rust engine correctness tests are the highest priority — they validate the core architectural bet (Wasm for correctness over JS).

### Infrastructure & Deployment

**CI/CD Pipeline (GitHub Actions):**

```
Build Order:
1. cargo test                              → Validate Rust correctness
2. wasm-pack build --target web            → Compile Rust → Wasm + JS bindings
3. pnpm install                            → Install Node dependencies
4. pnpm test                               → Run Vitest suite
5. pnpm build                              → Astro production build (references Wasm output)
6. Deploy dist/ to Cloudflare Pages        → Wrangler or GitHub integration
```

**Caching:**
- Rust/cargo dependencies cached between CI runs (`~/.cargo/registry`, `target/`)
- pnpm store cached between CI runs
- Wasm output cached if Rust source unchanged

**Environment Configuration:**
- No environment variables needed for MVP (no API keys, no server)
- Build-time only: Wasm target configuration, Astro output mode
- Post-MVP: optional Gemini API key stored in localStorage (never in env vars)

**Monitoring:**
- Cloudflare Analytics (built-in, free) — page views, visitors, return rate
- Lighthouse CI in GitHub Actions — performance regression detection
- No server monitoring needed (static site)

### Decision Impact Analysis

**Implementation Sequence:**
1. Rust/Wasm engine (validate bundle size, establish bridge API) — unblocks everything
2. Astro + Svelte project setup (scaffold, Tailwind, island mount)
3. Calculator state model (Svelte runes wired to Wasm)
4. UI components (HeroResultRow → ResultRows → CopyButton → inputs → operations)
5. Testing (Rust tests first, then Svelte component tests)
6. CI/CD pipeline (GitHub Actions)
7. Deploy to Cloudflare Pages

**Cross-Component Dependencies:**
- Wasm engine must be built before Astro build (build pipeline dependency)
- All UI components depend on the Wasm bridge API contract (FormattedResult shape)
- CopyButton depends on Clipboard API (broadly supported, low risk)
- Dark mode is a Tailwind concern independent of component logic
- Live-ticking depends on Wasm `now_unix()` + Svelte `$effect` interval

**Verified Technology Versions:**

| Technology | Version | Date Verified |
|-----------|---------|---------------|
| Svelte | 5 (stable) | 2026-02-15 |
| @astrojs/svelte | 7.x | 2026-02-15 |
| Vitest | Latest | To be pinned at project init |
| Playwright | Latest | To be pinned at project init |

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**10 potential conflict points identified** where AI agents could make different choices. All patterns below are mandatory for implementation consistency.

### Naming Patterns

**File Naming:**

| File Type | Convention | Example |
|-----------|-----------|---------|
| Svelte components | PascalCase | `CopyButton.svelte`, `HeroResultRow.svelte` |
| TypeScript modules | camelCase | `wasmBridge.ts`, `calculatorState.svelte.ts` |
| TypeScript types/interfaces | camelCase file, PascalCase exports | `types.ts` → `export interface FormattedResult` |
| Test files | Co-located, `.test.ts` suffix | `CopyButton.test.ts` next to `CopyButton.svelte` |
| Rust source files | snake_case | `date_calc.rs`, `format_output.rs` |
| CSS files | kebab-case | `global.css` |
| Config files | Standard names | `astro.config.mjs`, `Cargo.toml`, `vite.config.ts` |

**Code Naming:**

| Context | Convention | Example |
|---------|-----------|---------|
| Svelte component names | PascalCase | `<CopyButton />`, `<OperationRow />` |
| TypeScript functions | camelCase | `copyToClipboard()`, `formatUnixTimestamp()` |
| TypeScript variables | camelCase | `startDate`, `operationsList`, `isLiveTicking` |
| TypeScript constants | UPPER_SNAKE_CASE | `MAX_OPERATIONS`, `TICK_INTERVAL_MS` |
| TypeScript interfaces/types | PascalCase | `FormattedResult`, `Operation`, `ValidationError` |
| TypeScript enums | PascalCase name, PascalCase members | `OperationDirection.Add`, `OperationUnit.Days` |
| Svelte props | camelCase | `formatLabel`, `value` |
| Svelte events | camelCase with `on` prefix | `oncopy`, `onreset`, `onchange` |
| Rust functions (public API) | snake_case | `calculate()`, `validate_date()`, `now_unix()` |
| Rust types | PascalCase | `FormattedResult`, `OperationInput` |
| CSS / Tailwind | Tailwind utilities only (no custom class names in components) | `class="text-gray-900 dark:text-gray-100"` |

**Wasm Bridge JSON Field Naming:**

All JSON crossing the Wasm boundary uses **camelCase** field names. Rust structs use `#[serde(rename_all = "camelCase")]`.

```rust
// Rust side
#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FormattedResult {
    pub unix_timestamp: i64,      // → "unixTimestamp" in JSON
    pub iso_8601: String,         // → "iso8601" in JSON
    pub rfc_2822: String,         // → "rfc2822" in JSON
    pub local_human: String,      // → "localHuman" in JSON
}
```

```typescript
// TypeScript side — matches JSON exactly
interface FormattedResult {
  unixTimestamp: number;
  iso8601: string;
  rfc2822: string;
  localHuman: string;
}
```

### Structure Patterns

**Project Organization:**
- Components organized **by type** (not by feature) — the project is too small for feature folders
- Tests co-located next to source files
- Shared TypeScript types in a single `types.ts` file
- Wasm bridge logic isolated in a single module (`wasmBridge.ts`)

**Canonical Directory Structure:**

```
datetime-helper/
├── src/
│   ├── pages/
│   │   └── index.astro              # Single page entry point
│   ├── components/
│   │   ├── Calculator.svelte         # Root island component
│   │   ├── Calculator.test.ts
│   │   ├── StartDateInput.svelte
│   │   ├── StartDateInput.test.ts
│   │   ├── OperationRow.svelte
│   │   ├── OperationRow.test.ts
│   │   ├── AddOperationButton.svelte
│   │   ├── ResetButton.svelte
│   │   ├── HeroResultRow.svelte
│   │   ├── HeroResultRow.test.ts
│   │   ├── ResultRow.svelte
│   │   ├── ResultRow.test.ts
│   │   ├── CopyButton.svelte
│   │   └── CopyButton.test.ts
│   ├── lib/
│   │   ├── wasmBridge.ts             # Wasm init + typed wrapper functions
│   │   ├── wasmBridge.test.ts
│   │   ├── types.ts                  # Shared TypeScript interfaces
│   │   └── clipboard.ts             # Clipboard API helper
│   ├── styles/
│   │   └── global.css                # @import "tailwindcss" + custom tokens
│   └── layouts/
│       └── Layout.astro              # Base HTML shell with meta tags
├── crates/
│   └── datetime-engine/
│       ├── Cargo.toml
│       ├── src/
│       │   ├── lib.rs                # Wasm entry point, #[wasm_bindgen] exports
│       │   ├── calc.rs               # Core calculation logic
│       │   ├── format.rs             # Output formatting (Unix, ISO, RFC, local)
│       │   └── validate.rs           # Input validation
│       └── tests/
│           └── integration.rs        # Comprehensive datetime correctness tests
├── public/                            # Static assets (favicon, etc.)
├── astro.config.mjs
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── vitest.config.ts
└── .github/
    └── workflows/
        └── deploy.yml                # CI/CD pipeline
```

### Component Patterns

**Svelte Component Structure (mandatory order):**

```svelte
<script lang="ts">
  // 1. Imports
  // 2. Props (using $props rune in Svelte 5)
  // 3. State ($state)
  // 4. Derived values ($derived)
  // 5. Effects ($effect)
  // 6. Event handlers (functions)
</script>

<!-- Template (HTML) -->

<style>
  /* Component-scoped styles ONLY if Tailwind utilities are insufficient */
  /* Prefer Tailwind classes in the template */
</style>
```

**Svelte 5 Runes Usage Rules:**
- Use `$props()` for component inputs (not legacy `export let`)
- Use `$state` for local mutable state
- Use `$derived` for computed values (including Wasm calls)
- Use `$effect` only for side effects (timers, DOM manipulation, clipboard)
- Never use `$effect` for derived computations — use `$derived` instead
- Reactive state that multiple components need lives in `.svelte.ts` files using runes

**Props Pattern:**

```svelte
<script lang="ts">
  interface Props {
    formatLabel: string;
    value: string;
    onCopy?: () => void;
  }
  let { formatLabel, value, onCopy }: Props = $props();
</script>
```

### Styling Patterns

**Tailwind Usage Rules:**
- **Always** use Tailwind utility classes in component templates
- **Never** use `@apply` to extract utilities into CSS classes
- **Never** create custom CSS class names in components — Tailwind utilities only
- Component-scoped `<style>` blocks only for things Tailwind can't express (rare)
- Dark mode: always pair light and dark variants — `text-gray-900 dark:text-gray-100`
- Responsive: use Tailwind breakpoint prefixes — `lg:flex-row flex-col`
- Reduced motion: use `motion-safe:` prefix for animations

**Tailwind Class Ordering (in templates):**
1. Layout (flex, grid, position)
2. Sizing (w, h, max-w)
3. Spacing (p, m, gap)
4. Typography (text, font, leading)
5. Colors (bg, text, border color)
6. Borders (border, rounded)
7. Effects (shadow, opacity)
8. Dark mode variants
9. Responsive variants
10. State variants (hover, focus, active)

### Process Patterns

**Error Handling:**

| Error Source | Handling Pattern | UI Response |
|-------------|-----------------|-------------|
| Invalid date input | Wasm returns `ValidationError` | Red border, inline error text, last valid result preserved |
| Invalid operation amount | JS-side validation (non-negative integer) | Prevent invalid input, no error state |
| Wasm calculation error | Try/catch in `wasmBridge.ts`, return error type | Inline error, last valid result preserved |
| Wasm panic (unexpected) | Try/catch wrapper, console.error | Generic error message, suggest page reload |
| Clipboard API failure | Try/catch in `clipboard.ts` | Fallback to `document.execCommand('copy')`, silent |

**Loading State:**
- Only one loading state exists: Wasm initialization on first page load
- Static HTML shell (Astro-rendered) shows placeholder text while Wasm loads
- Once Wasm is initialized, no loading states ever appear — all calculations are synchronous and < 100ms
- No spinners, no skeleton screens, no loading indicators after initial hydration

**State Flow (single direction):**

```
User Input → $state update → $derived (calls Wasm) → UI update
                                                    ↓
                                              All 4 format values update simultaneously
```

No bidirectional bindings between calculator and results. Results are always derived from calculator state via Wasm.

### Import Ordering

All TypeScript/Svelte files follow this import order (enforced by linter):

```typescript
// 1. Svelte framework imports
import { onMount } from 'svelte';

// 2. Wasm bridge imports
import { calculate, validateDate } from '../lib/wasmBridge';

// 3. Type imports
import type { FormattedResult, Operation } from '../lib/types';

// 4. Component imports
import CopyButton from './CopyButton.svelte';

// 5. Utility imports
import { copyToClipboard } from '../lib/clipboard';
```

Blank line between each group.

### Enforcement Guidelines

**All AI Agents MUST:**

1. Follow the naming conventions table exactly — no exceptions, no "creative" alternatives
2. Place files in the canonical directory structure — don't create new directories without explicit approval
3. Use Svelte 5 runes (`$state`, `$derived`, `$effect`, `$props`) — never legacy Svelte 3/4 syntax
4. Use Tailwind utility classes in templates — never `@apply`, never custom CSS class names
5. Keep all Wasm calls in `wasmBridge.ts` — components never import Wasm directly
6. Co-locate test files next to source files with `.test.ts` suffix
7. Use the `FormattedResult` interface exactly as defined — don't create alternative result shapes
8. Handle all Wasm calls with try/catch — never let Wasm errors propagate uncaught
9. Use `camelCase` for all JSON crossing the Wasm boundary
10. Follow the Svelte component structure order (imports → props → state → derived → effects → handlers)

**Anti-Patterns (explicitly forbidden):**

- Creating a `utils/` folder (use `lib/` instead)
- Using `any` type in TypeScript (use proper types or `unknown` with type guards)
- Using JavaScript Date API for any datetime computation (all computation via Wasm)
- Inline styles in Svelte templates (use Tailwind classes)
- Creating separate `__tests__/` directories (co-locate tests)
- Using `document.querySelector` for DOM manipulation (use Svelte reactivity)
- Using `setTimeout` for debouncing calculations (calculations are synchronous, no debounce needed)

## Project Structure & Boundaries

### Complete Project Directory Structure

```
datetime-helper/
├── .github/
│   └── workflows/
│       └── deploy.yml                    # CI/CD: cargo test → wasm-pack → pnpm build → CF Pages
├── crates/
│   └── datetime-engine/
│       ├── Cargo.toml                    # jiff dependency, wasm-bindgen, serde
│       ├── src/
│       │   ├── lib.rs                    # #[wasm_bindgen] exports: calculate, validate_date, now_unix
│       │   ├── calc.rs                   # Core: add/subtract operations on dates (FR1-FR4)
│       │   ├── format.rs                 # Output: Unix, ISO 8601, RFC 2822, local human (FR7)
│       │   └── validate.rs              # Input: date string validation, error messages (FR4-FR5)
│       └── tests/
│           ├── correctness.rs            # DST, leap years, month boundaries (NFR14-NFR18)
│           ├── format.rs                 # Output format consistency tests
│           └── edge_cases.rs             # Calendar edge cases, boundary dates
├── src/
│   ├── pages/
│   │   └── index.astro                   # Single page: static shell + <Calculator client:load />
│   ├── layouts/
│   │   └── Layout.astro                  # HTML head, meta tags, SEO, global CSS import, font loading
│   ├── components/
│   │   ├── Calculator.svelte             # Root island: state management, Wasm init, live-tick control
│   │   ├── Calculator.test.ts            # Integration: state flow, Wasm bridge, mode transitions
│   │   ├── StartDateInput.svelte         # "Now" default, date entry, validation display (FR2-FR3, FR18-FR19)
│   │   ├── StartDateInput.test.ts
│   │   ├── OperationRow.svelte           # Direction + amount + unit + remove (FR1, FR15-FR17)
│   │   ├── OperationRow.test.ts
│   │   ├── AddOperationButton.svelte     # "+ Add operation" button
│   │   ├── ResetButton.svelte            # Reset to "now" default state
│   │   ├── HeroResultRow.svelte          # Unix timestamp: large, orange-tinted, live indicator (FR8, FR10-FR11)
│   │   ├── HeroResultRow.test.ts
│   │   ├── ResultRow.svelte              # ISO 8601, RFC 2822, Local formats (FR7)
│   │   ├── ResultRow.test.ts
│   │   ├── CopyButton.svelte             # Copy to clipboard + "Copied!" feedback (FR12-FR13)
│   │   └── CopyButton.test.ts
│   ├── lib/
│   │   ├── wasmBridge.ts                 # Wasm init(), calculate(), validateDate(), nowUnix() wrappers
│   │   ├── wasmBridge.test.ts            # Bridge: correct results, error propagation, init lifecycle
│   │   ├── types.ts                      # FormattedResult, Operation, ValidationError, CalculatorState
│   │   └── clipboard.ts                  # Clipboard API with execCommand fallback
│   └── styles/
│       └── global.css                    # @import "tailwindcss", custom font declarations, CSS tokens
├── public/
│   ├── favicon.svg                       # Site favicon
│   └── fonts/                            # JetBrains Mono (self-hosted for monospace values)
├── e2e/
│   ├── calculator.spec.ts                # Full flows: load → calculate → copy
│   ├── accessibility.spec.ts             # Keyboard nav, focus order, screen reader
│   └── responsive.spec.ts               # Desktop, tablet, mobile layouts
├── astro.config.mjs                      # Astro config: svelte integration, tailwind vite plugin, output: 'static'
├── svelte.config.js                      # Svelte 5 compiler options
├── vite.config.ts                        # Vitest config, Wasm plugin if needed
├── vitest.config.ts                      # Vitest setup: svelte preprocessing, test environment
├── tsconfig.json                         # TypeScript strict mode, path aliases
├── package.json                          # Scripts: dev, build, test, preview, build:wasm
├── pnpm-lock.yaml
├── playwright.config.ts                  # E2E test configuration
├── .gitignore                            # dist/, node_modules/, target/, pkg/
└── README.md                             # Project setup, development, architecture overview
```

### Architectural Boundaries

**Boundary 1: Wasm Engine ↔ TypeScript (the critical boundary)**

```
┌──────────────────────────────┐     JSON strings     ┌──────────────────────────────┐
│      Rust/Wasm Engine        │ ◄──────────────────► │     TypeScript (wasmBridge)   │
│                              │                       │                              │
│  lib.rs (wasm_bindgen API)   │  calculate()         │  wasmBridge.ts               │
│  calc.rs (date math)         │  validate_date()     │  - init(): Promise<void>     │
│  format.rs (output formats)  │  now_unix()          │  - calculate(): FormattedResult│
│  validate.rs (input check)   │                       │  - validateDate(): ValidationResult│
│                              │                       │  - nowUnix(): number         │
└──────────────────────────────┘                       └──────────────────────────────┘
```

- **Contract:** JSON strings cross the boundary. Rust serializes with serde; TypeScript deserializes to typed interfaces.
- **Rule:** Only `wasmBridge.ts` touches Wasm. Components never import Wasm directly.
- **Error boundary:** `wasmBridge.ts` wraps all Wasm calls in try/catch and returns typed results or errors.

**Boundary 2: Astro (Static Shell) ↔ Svelte (Interactive Island)**

```
┌──────────────────────────────┐                       ┌──────────────────────────────┐
│     Astro (build-time)       │     client:load       │     Svelte Island (runtime)   │
│                              │ ────────────────────► │                              │
│  Layout.astro (HTML shell)   │                       │  Calculator.svelte (root)     │
│  index.astro (page)          │                       │  ├── StartDateInput           │
│  global.css (Tailwind)       │                       │  ├── OperationRow(s)          │
│  meta tags, SEO              │                       │  ├── AddOperationButton       │
│                              │                       │  ├── ResetButton              │
│  Static HTML rendered at     │                       │  ├── HeroResultRow            │
│  build time. No JS.          │                       │  ├── ResultRow (×3)           │
│                              │                       │  └── CopyButton (×4)          │
└──────────────────────────────┘                       └──────────────────────────────┘
```

- **Contract:** Astro renders a static HTML shell. Svelte hydrates exactly one island via `client:load`.
- **Rule:** No Astro component is interactive. All interactivity lives inside the Svelte island.
- **Data flow:** Astro passes no props to the Svelte island — Calculator.svelte initializes its own state.

**Boundary 3: Svelte Components (internal communication)**

```
Calculator.svelte (owns all state)
├── $state: startDate, operations[], wasmReady, error
├── $derived: result (FormattedResult from Wasm)
├── $effect: live-tick interval
│
├── StartDateInput ← props: value, error | events: onchange
├── OperationRow[] ← props: operation | events: onchange, onremove
├── AddOperationButton ← events: onadd
├── ResetButton ← props: isModified | events: onreset
├── HeroResultRow ← props: value, isLive | contains: CopyButton
├── ResultRow (×3) ← props: label, value | contains: CopyButton
└── CopyButton (×4) ← props: value, formatLabel
```

- **Rule:** All state lives in `Calculator.svelte`. Child components receive data via props, communicate up via callback props.
- **No shared stores.** The component tree is shallow enough that prop drilling is cleaner than a store.

### Requirements to Structure Mapping

**FR Category → Files:**

| FR Category | Primary Files | Supporting Files |
|------------|---------------|-----------------|
| Date Calculation (FR1-6) | `crates/.../calc.rs`, `crates/.../validate.rs` | `wasmBridge.ts`, `Calculator.svelte` |
| Result Display (FR7-11) | `HeroResultRow.svelte`, `ResultRow.svelte` | `crates/.../format.rs`, `types.ts` |
| Copy & Export (FR12-14) | `CopyButton.svelte`, `clipboard.ts` | — |
| Input & Interaction (FR15-19) | `StartDateInput.svelte`, `OperationRow.svelte` | `AddOperationButton.svelte`, `ResetButton.svelte` |
| Page Lifecycle (FR20-22) | `index.astro`, `Layout.astro`, `Calculator.svelte` | `wasmBridge.ts` (init) |
| Appearance (FR23-25) | `global.css`, `Layout.astro` | All `.svelte` components (Tailwind classes) |
| Accessibility (FR26-31) | All `.svelte` components | `global.css` (focus styles) |

**NFR Category → Files:**

| NFR Category | Primary Files | Validation |
|-------------|---------------|------------|
| Performance (NFR1-7) | `Cargo.toml` (feature flags), `astro.config.mjs` | Lighthouse CI in `deploy.yml` |
| Correctness (NFR14-18) | `crates/.../tests/*.rs` | `cargo test` in CI |
| Accessibility (NFR8-13) | All `.svelte` components, `global.css` | `e2e/accessibility.spec.ts` |

### Cross-Cutting Concerns Mapping

| Concern | Affected Files | Pattern |
|---------|---------------|---------|
| Dark/Light mode | All `.svelte` components, `global.css` | Tailwind `dark:` variants, `prefers-color-scheme` |
| Accessibility | All `.svelte` components | ARIA attributes, focus management, semantic HTML |
| Reduced motion | `HeroResultRow.svelte`, `CopyButton.svelte`, `global.css` | `motion-safe:` Tailwind prefix |
| Error state | `Calculator.svelte`, `StartDateInput.svelte`, `wasmBridge.ts` | Error propagation from Wasm → state → UI |
| Live-ticking mode | `Calculator.svelte`, `HeroResultRow.svelte` | `$effect` interval, `$derived` isLive flag |

### Data Flow

```
Page Load:
  Astro renders static HTML shell → Browser receives HTML + CSS
  Svelte island hydrates (client:load) → wasmBridge.init() → Wasm ready
  Calculator sets startDate = "now" → $derived calls calculate() → results display
  $effect starts 1-second tick interval → HeroResultRow shows live indicator

User Interaction:
  User changes input → $state updates → $derived recalculates via Wasm
  All 4 format ResultRows update simultaneously (< 100ms)
  Live-tick stops if calculation applied (startDate !== "now" or operations exist)

Copy Action:
  User clicks CopyButton → clipboard.ts writes to clipboard
  CopyButton shows "Copied!" for 1.5s → reverts to default
  aria-live region announces "Copied to clipboard"
```

### Development Workflow Integration

**Local Development:**
- `pnpm dev` — Astro dev server with HMR. Svelte components hot-reload.
- Wasm changes require manual rebuild: `cd crates/datetime-engine && wasm-pack build --target web`
- Consider a `pnpm build:wasm` script + file watcher for Rust source changes during development

**Build Process:**
```
pnpm build:wasm    → wasm-pack build --target web (output to crates/datetime-engine/pkg/)
pnpm build         → Astro build imports from pkg/, outputs to dist/
```

**Wasm Output Location:**
- wasm-pack outputs to `crates/datetime-engine/pkg/`
- `wasmBridge.ts` imports from this location (path alias in tsconfig: `@wasm/*`)
- The `pkg/` directory is gitignored — always built from source

**Deployment:**
- `dist/` directory deployed to Cloudflare Pages
- Contains: HTML, CSS, JS bundle, Wasm binary, static assets
- No server configuration needed — pure static files

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
All technology choices verified compatible:
- Astro 5 + @astrojs/svelte v7 + Svelte 5 → confirmed working integration
- Tailwind CSS v4 via @tailwindcss/vite → correct approach for Astro 5
- Rust/wasm-pack 0.14.0 → jiff 0.2.19 with `js` feature → wasm32-unknown-unknown → wasmBridge.ts → Svelte components
- pnpm + Astro 5 + Vite 6 → no compatibility issues
- Static output → Cloudflare Pages → no server-side requirements
- No contradictory decisions found.

**Pattern Consistency:**
- Naming conventions consistent across all contexts (TS, Svelte, Rust, JSON boundary)
- Svelte 5 runes usage rules explicit and non-conflicting
- Component structure order defined and enforceable
- Tailwind-only styling rule eliminates CSS methodology conflicts

**Structure Alignment:**
- Directory structure directly supports all decisions
- Three boundaries clearly defined with communication contracts
- Requirements mapped to specific files

### Requirements Coverage Validation ✅

**Functional Requirements (31/31 covered):**

| FR Range | Category | Architectural Support | Status |
|----------|---------|----------------------|--------|
| FR1-6 | Date Calculation | `calc.rs` + `validate.rs` via Wasm bridge | ✅ |
| FR7-11 | Result Display | `format.rs` → `FormattedResult` → HeroResultRow + ResultRow, $effect tick, isLive flag | ✅ |
| FR12-14 | Copy & Export | CopyButton + clipboard.ts, ARIA live region, selectable values | ✅ |
| FR15-19 | Input & Interaction | OperationRow, StartDateInput, real-time validation | ✅ |
| FR20-22 | Page Lifecycle | Astro static shell, Wasm hydration, offline via static architecture | ✅ |
| FR23-25 | Appearance | Tailwind dark: variants, responsive breakpoints, max-width 960px | ✅ |
| FR26-31 | Accessibility | Native HTML inputs, focus rings, ARIA attributes, motion-safe, contrast | ✅ |

**Non-Functional Requirements (18/18 covered):**

| NFR Range | Category | Architectural Support | Status |
|-----------|---------|----------------------|--------|
| NFR1-3 | Load Performance | Astro static HTML (FCP), parallel Wasm load (TTI), no layout shift (CLS) | ✅ |
| NFR4 | Calc < 100ms | Synchronous Wasm calls after init, $derived reactivity | ✅ |
| NFR5 | Wasm < 100KB gzip | jiff feature flags, first dev task to validate | ⚠️ Risk |
| NFR6-7 | Copy/Tick perf | Clipboard API direct, $effect 1s interval | ✅ |
| NFR8-13 | Accessibility | Comprehensive in patterns + enforcement guidelines | ✅ |
| NFR14-18 | Correctness | jiff library + cargo test suite | ✅ |

### Implementation Readiness Validation ✅

**Decision Completeness:**
- All critical decisions documented with verified versions ✅
- Wasm bridge API defined with exact function signatures ✅
- State management approach specified (runes, single owner) ✅
- Build pipeline order documented ✅

**Structure Completeness:**
- Every file and directory defined with annotations ✅
- Three architectural boundaries diagrammed with contracts ✅
- Requirements mapped to specific files ✅

**Pattern Completeness:**
- 10 conflict points identified and resolved ✅
- 10 enforcement rules for AI agents ✅
- 7 explicitly forbidden anti-patterns ✅

### Gap Analysis Results

**No critical gaps found.**

**Minor observations (non-blocking):**

1. **Font loading strategy** — JetBrains Mono in `public/fonts/` needs `font-display: swap` in `global.css` and `<link rel="preload">` in `Layout.astro`. Implementation detail, not architectural gap.

2. **Wasm init async handling** — `init()` is async, subsequent calls are synchronous. `wasmReady` $state flag in Calculator.svelte gates $derived calculations. Already covered in boundary diagram.

3. **Config consolidation** — `vite.config.ts` and `vitest.config.ts` could be merged. Implementation detail for setup phase.

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context thoroughly analyzed (31 FRs, 18 NFRs)
- [x] Scale and complexity assessed (low complexity, moderate technical depth)
- [x] Technical constraints identified (7 constraints documented)
- [x] Cross-cutting concerns mapped (6 concerns)

**✅ Architectural Decisions**
- [x] Critical decisions documented with versions (7 decisions, 9 verified versions)
- [x] Technology stack fully specified (Astro 5 + Svelte 5 + Tailwind v4 + Rust/jiff + wasm-pack)
- [x] Integration patterns defined (Wasm bridge, island hydration, component tree)
- [x] Performance considerations addressed (TTI, FCP, CLS, calc latency, bundle budgets)

**✅ Implementation Patterns**
- [x] Naming conventions established (files, code, JSON, Rust)
- [x] Structure patterns defined (by-type organization, co-located tests)
- [x] Component patterns specified (Svelte 5 runes, props, structure order)
- [x] Process patterns documented (error handling, loading, state flow)

**✅ Project Structure**
- [x] Complete directory structure defined (every file annotated)
- [x] Component boundaries established (3 boundaries diagrammed)
- [x] Integration points mapped (Wasm ↔ TS, Astro ↔ Svelte, component tree)
- [x] Requirements to structure mapping complete (all FRs + NFRs → files)

### Architecture Readiness Assessment

**Overall Status: READY FOR IMPLEMENTATION**

**Confidence Level: High**

The architecture is well-constrained by design — single page, no backend, no auth, no database. The technical depth (Wasm integration, real-time reactivity) is fully addressed with clear boundaries and patterns. One known risk (Wasm bundle size) is properly flagged with a validation-first implementation strategy.

**Key Strengths:**
1. **Clear boundaries** — Three-boundary model eliminates ambiguity about where code lives and how it communicates
2. **Single computation path** — All datetime logic routes through Wasm. No dual-implementation risk.
3. **Explicit enforcement rules** — 10 mandatory rules + 7 anti-patterns give AI agents clear guardrails
4. **Requirements traceability** — Every FR and NFR maps to specific files

**Areas for Future Enhancement:**
- Chrome AI integration architecture (Phase 2)
- Query parameter state encoding and URL-as-API (Phase 2)
- Web component extraction `<datetime-helper>` (Phase 3)
- Service worker for explicit offline caching (optional)

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented
- Use implementation patterns consistently across all components
- Respect project structure and boundaries — no new directories without approval
- Refer to this document for all architectural questions
- When in doubt, check the enforcement guidelines and anti-patterns list

**First Implementation Priority:**
1. Initialize Astro project: `pnpm create astro@latest datetime-helper -- --template minimal --typescript strict --git --install`
2. Add integrations: `pnpm astro add svelte` + `pnpm add tailwindcss @tailwindcss/vite`
3. Set up Rust crate: `cargo init --lib crates/datetime-engine`
4. **Validate Wasm bundle size** — Build minimal jiff Wasm module before any UI work. This is the highest-risk validation task.
