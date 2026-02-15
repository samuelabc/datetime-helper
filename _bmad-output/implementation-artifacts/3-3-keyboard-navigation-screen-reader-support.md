# Story 3.3: Keyboard Navigation & Screen Reader Support

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer who uses keyboard navigation or assistive technology,
I want full keyboard access and screen reader support,
so that I can use datetime-helper effectively regardless of how I interact with my browser.

## Acceptance Criteria

1. **Given** keyboard-only navigation, **When** pressing Tab repeatedly, **Then** focus order is logical: StartDateInput -> OperationRow controls -> remove (if visible) -> AddOperation -> Reset (if visible) -> Hero copy -> Result row copies (FR26, NFR9).

2. **Given** any interactive element receives focus, **When** viewed, **Then** visible orange focus ring (minimum 2px) is rendered (FR27, NFR10).

3. **Given** hero row is live-ticking, **When** screen reader is active, **Then** `aria-live="polite"` announcements are throttled to no more than once every 10 seconds (FR28, NFR11).

4. **Given** copy action succeeds, **When** copy button is activated, **Then** `aria-live="assertive"` announces "Copied to clipboard" immediately (FR28, NFR13).

5. **Given** `prefers-reduced-motion` is enabled, **When** using the page, **Then** live ticking is frozen/static and copy transitions are instant with no animations (FR29, NFR12).

6. **Given** `prefers-reduced-motion` is disabled, **When** using the page, **Then** normal motion behavior remains available.

7. **Given** any error or state change indicator, **When** inspected, **Then** information is conveyed through more than color alone (FR31).

8. **Given** page semantics are inspected, **When** reviewing structure, **Then** semantic elements are used appropriately (`<main>`, `<section>`, `<label>`, `<button>`), with no clickable non-button substitutes.

9. **Given** result labels are read by screen readers, **When** traversing value rows, **Then** labels are clearly associated to values and format identity is explicit.

## Tasks / Subtasks

- [x] Task 1: Validate and enforce keyboard navigation order and focus visibility (AC: #1, #2)
  - [x] Audit tab sequence across dynamic operation rows and conditional reset/remove controls
  - [x] Ensure all interactive controls retain orange 2px focus ring in light/dark themes
  - [x] Fix any tabindex/DOM-order issues causing unexpected focus jumps

- [x] Task 2: Implement robust live-region behavior for ticking and copy feedback (AC: #3, #4, #9)
  - [x] Ensure hero live updates use polite announcements and throttle announcements to <= 10s
  - [x] Ensure copy confirmation uses assertive live region with clear, consistent copy text
  - [x] Verify each result row exposes clear format labeling to assistive tech

- [x] Task 3: Enforce reduced-motion behavior without functional regressions (AC: #5, #6)
  - [x] Respect `prefers-reduced-motion` for ticking and micro-animations
  - [x] Keep value correctness/copy behavior unchanged while motion is reduced
  - [x] Confirm normal animated behavior remains when reduced motion is not requested

- [x] Task 4: Ensure semantic structure and non-color-only states remain compliant (AC: #7, #8)
  - [x] Audit interactive semantics and replace any non-semantic patterns if present
  - [x] Confirm error and copied states include text/icon cues in addition to color
  - [x] Validate accessibility attributes remain consistent after responsive/theme updates

- [x] Task 5: Add accessibility-focused tests and manual verification scripts (AC: #1-#9)
  - [x] Extend component tests for aria attributes, live-region behavior, and reduced-motion branching
  - [x] Extend Playwright accessibility scenarios for keyboard-only flows
  - [x] Run Lighthouse/Axe scans and document any deltas

## Dev Notes

### Previous Story Intelligence (3.2)

- Story 3.2 modifies layout and may affect tab flow through wrapping/stacked controls; this story should explicitly verify focus order after responsive changes.
- Keep touch and keyboard parity; mobile improvements should not degrade desktop keyboard predictability.

### Technical Requirements

- Accessibility behavior must be deterministic for dynamic UI states (added/removed operation rows).
- Live region messaging should avoid spam while still confirming critical actions.
- Maintain existing calculator computation model and avoid business-logic rewrites.

### Architecture Compliance

- Preserve Svelte component boundaries and state ownership in `Calculator.svelte`.
- Keep Tailwind utility classes and architecture anti-pattern constraints (`no any`, no custom class systems, no JS Date logic).
- Maintain semantic HTML and existing ARIA strategy from UX and architecture docs.

### Library / Framework Requirements

- Svelte 5 runes remain required patterns for component updates.
- Prefer native semantic controls; do not introduce custom control primitives unless necessary for compliance.
- Keep Clipboard fallback behavior intact while adding announcement rigor.

### File Structure Requirements

- Expected primary files:
  - `src/components/Calculator.svelte`
  - `src/components/HeroResultRow.svelte`
  - `src/components/ResultRow.svelte`
  - `src/components/CopyButton.svelte`
  - `src/components/StartDateInput.svelte`
  - `src/components/OperationRow.svelte`
- Tests:
  - `src/components/*.test.ts` as needed
  - `e2e/accessibility.spec.ts`

### Testing Requirements

- `pnpm test`
- `pnpm test:e2e` accessibility scenarios
- Manual checks:
  - keyboard-only full-flow operation and copy
  - VoiceOver announcements for live ticker and copy events
  - reduced-motion mode on/off behavior
- Automated checks:
  - Lighthouse accessibility score
  - Axe violations baseline comparison

### Git Intelligence Summary

- Recent epic commits indicate stable component patterns and test practices; follow incremental edits with explicit regression assertions.
- Keep story scope tightly focused on accessibility mechanics and semantics rather than layout redesign.

### Latest Tech Information

- Current architecture baselines remain valid: Tailwind utility variants, semantic HTML controls, and ARIA live regions as primary a11y mechanisms.
- Avoid coupling this story to framework upgrades; implement with current stable project stack.

### Project Structure Notes

- Accessibility changes should compose with Story 3.1 theming and Story 3.2 responsiveness.
- Keep source of truth in existing components; no new top-level subsystems required.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-3.3]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Accessibility-Strategy]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Feedback-Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Cross-Cutting-Concerns-Identified]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation-Patterns-&-Consistency-Rules]
- [Source: _bmad-output/planning-artifacts/prd.md#Accessibility]
- [Source: _bmad-output/implementation-artifacts/3-2-responsive-layout-for-tablet-mobile.md]

## Dev Agent Record

### Agent Model Used

GPT-5.3 Codex

### Debug Log References

- Story created by create-story workflow.
- Added semantic label/value associations and live-region assertions for assistive technologies.
- Added reduced-motion preference listener in calculator live-tick flow and motion-safe copy button handling.
- Added keyboard-order and live-region E2E checks plus Lighthouse accessibility audit run.

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.
- Confirmed logical tab progression through start input, operation controls, and action buttons in keyboard-only flow.
- Preserved 2px orange focus ring visibility across interactive controls in both themes.
- Kept hero `aria-live="polite"` throttled updates and copy `aria-live="assertive"` confirmation messaging.
- Added explicit semantic associations (`aria-labelledby`/`aria-describedby`) for result labels and values.
- Ran Lighthouse accessibility audit (`_bmad-output/implementation-artifacts/lighthouse-accessibility-report.json`) with score 0.96.
- Verified with `pnpm test` and `pnpm test:e2e`.

### File List

- `_bmad-output/implementation-artifacts/3-3-keyboard-navigation-screen-reader-support.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `src/components/Calculator.svelte`
- `src/components/HeroResultRow.svelte`
- `src/components/ResultRow.svelte`
- `src/components/CopyButton.svelte`
- `src/components/OperationRow.svelte`
- `src/components/StartDateInput.svelte`
- `src/components/AddOperationButton.svelte`
- `src/components/ResetButton.svelte`
- `src/components/Calculator.test.ts`
- `src/components/HeroResultRow.test.ts`
- `src/components/ResultRow.test.ts`
- `src/components/CopyButton.test.ts`
- `e2e/accessibility.spec.ts`
- `e2e/theme.spec.ts`
- `playwright.config.ts`
- `package.json`
- `pnpm-lock.yaml`
- `_bmad-output/implementation-artifacts/lighthouse-accessibility-report.json`

## Change Log

- 2026-02-16: Implemented keyboard/live-region/reduced-motion a11y improvements, added E2E accessibility tests, and recorded Lighthouse accessibility audit.
- 2026-02-16: Applied review fixes for semantic label coverage, tab-order verification depth, and 10-second live-region throttling validation.
