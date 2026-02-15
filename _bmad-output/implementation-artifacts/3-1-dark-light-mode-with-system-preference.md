# Story 3.1: Dark/Light Mode with System Preference

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer using datetime-helper,
I want the tool to automatically match my system's dark or light mode,
so that it fits seamlessly into my desktop environment without manual theme toggling.

## Acceptance Criteria

1. **Given** my operating system is set to light mode, **When** I load datetime-helper, **Then** the page renders with white/light gray backgrounds, dark text, and the orange accent color (FR23).

2. **Given** my operating system is set to dark mode, **When** I load datetime-helper, **Then** the page renders with dark slate backgrounds (`slate-900`/`slate-800`), light text, and the same orange accent color (FR23).

3. **Given** dark mode is active, **When** I inspect all text/background combinations, **Then** every combination meets WCAG 2.1 AA contrast ratios: 4.5:1 for normal text, 3:1 for large text (FR30, NFR8).

4. **Given** light mode is active, **When** I inspect all text/background combinations, **Then** every combination meets WCAG 2.1 AA contrast ratios, including orange accent text using `orange-600` or darker on white backgrounds (FR30, NFR8).

5. **Given** the hero result row, **When** viewed in dark mode, **Then** the orange-tinted background adapts appropriately and Unix timestamp remains visually prominent/readable.

6. **Given** all components (StartDateInput, OperationRow, AddOperationButton, ResetButton, HeroResultRow, ResultRow, CopyButton), **When** viewed in both light and dark modes, **Then** each component has complete `dark:` styling with no invisible text/borders.

7. **Given** CopyButton is in "Copied!" state, **When** viewed in dark mode, **Then** green confirmation styling remains visible and contrast-compliant (FR31).

## Tasks / Subtasks

- [x] Task 1: Add app-wide dark/light token mapping aligned to system preference (AC: #1, #2)
  - [x] Update `src/styles/global.css` for base light/dark semantic colors using Tailwind utilities and `dark:` variants
  - [x] Ensure `color-scheme` handling is correct for form controls in both themes
  - [x] Keep default behavior as system preference (no manual theme switch in this story)

- [x] Task 2: Apply dark variants across all calculator/result components (AC: #2, #5, #6)
  - [x] Update `src/components/Calculator.svelte` wrapper zones (input/output background separation) for both themes
  - [x] Update `HeroResultRow.svelte`, `ResultRow.svelte`, `CopyButton.svelte`
  - [x] Update `StartDateInput.svelte`, `OperationRow.svelte`, `AddOperationButton.svelte`, `ResetButton.svelte`

- [x] Task 3: Enforce contrast-safe color choices and non-color-only state signaling (AC: #3, #4, #7)
  - [x] Use `orange-600`+ where text appears on light surfaces
  - [x] Verify copied state preserves icon+text+color signals in both themes
  - [x] Confirm focus ring remains visible in dark and light contexts

- [x] Task 4: Add/extend tests for theme behavior and regressions (AC: #1-#7)
  - [x] Add component tests for dark-mode class rendering where practical
  - [x] Extend Playwright E2E coverage to validate dark/light render parity and copied-state visibility
  - [x] Run Lighthouse accessibility checks for contrast regressions

## Dev Notes

### Technical Requirements

- Keep Tailwind utility-first styling; do not introduce custom component CSS class systems.
- Preserve current Svelte 5 runes and component ownership model.
- No datetime logic changes in this story; scope is visual/theming/accessibility.
- Keep all Wasm integration boundaries unchanged (`wasmBridge.ts` remains single integration point).

### Architecture Compliance

- Follow canonical file locations:
  - `src/components/*` for component-level theme variants
  - `src/styles/global.css` for app-level global style tokens
- Respect architecture rule: no `@apply`, no new style framework dependencies.
- Maintain existing semantic structure and accessibility attributes.

### Library / Framework Requirements

- Tailwind CSS v4 dark mode should keep system `prefers-color-scheme` as the default.
- Astro 5.x + Svelte 5 stack remains unchanged; no migration work included in this story.
- Prefer `dark:` and `motion-safe:` utilities rather than bespoke CSS selectors.

### File Structure Requirements

- Modify only existing styling and component files for this story.
- Do not create new top-level directories.
- Keep tests co-located with component files (`.test.ts`) and E2E in `e2e/`.

### Testing Requirements

- `pnpm test` (component suite)
- `pnpm test:e2e` (or existing Playwright command) for theme verification
- Manual checks:
  - macOS/system light and dark mode
  - copy button default/hover/copied states in both themes
  - focus ring visibility on all interactive controls
- Accessibility check:
  - Lighthouse or equivalent contrast verification for key surfaces

### Git Intelligence Summary

- Recent Epic 2 commits stabilized calculator operation components and state flow.
- Story 3.1 should be implemented as focused UI/theming updates without refactoring calculator computation logic.
- Preserve recent testing discipline: component + integration assertions for UX-critical states.

### Latest Tech Information

- Tailwind v4 continues to support system-preference dark mode via `dark:` variants and can complement with `color-scheme` defaults.
- Keep implementation conservative against architecture baselines already validated in planning artifacts.

### Project Structure Notes

- This story must not alter Rust crate structure or Wasm API contracts.
- Keep UX layout hierarchy: hero Unix row remains most prominent in both themes.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-3.1]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation-Patterns-&-Consistency-Rules]
- [Source: _bmad-output/planning-artifacts/architecture.md#Cross-Cutting-Concerns-Identified]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Color-System]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Accessibility-Considerations]
- [Source: _bmad-output/planning-artifacts/prd.md#Appearance-&-Responsiveness]

## Dev Agent Record

### Agent Model Used

GPT-5.3 Codex

### Debug Log References

- Story created by create-story workflow.
- Updated global theme baseline and component-level dark/light class parity across calculator UI.
- Added/updated component tests to guard dark-mode and contrast-oriented class behavior.

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.
- Added system-preference theming baseline via `color-scheme` with inherited form control behavior.
- Applied dark/light-safe styling updates to calculator controls and result rows, including stronger orange contrast on light surfaces.
- Preserved non-color-only copied-state confirmation (icon + text + color) and visible 2px orange focus rings across interactive controls.
- Verified implementation with `pnpm test` (65 passing tests).

### File List

- `_bmad-output/implementation-artifacts/3-1-dark-light-mode-with-system-preference.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `src/styles/global.css`
- `src/components/Calculator.svelte`
- `src/components/HeroResultRow.svelte`
- `src/components/ResultRow.svelte`
- `src/components/CopyButton.svelte`
- `src/components/StartDateInput.svelte`
- `src/components/OperationRow.svelte`
- `src/components/AddOperationButton.svelte`
- `src/components/ResetButton.svelte`
- `src/components/Calculator.test.ts`
- `src/components/HeroResultRow.test.ts`
- `src/components/ResultRow.test.ts`
- `src/components/CopyButton.test.ts`
- `src/components/StartDateInput.test.ts`
- `src/components/OperationRow.test.ts`
- `src/components/AddOperationButton.test.ts`
- `src/components/ResetButton.test.ts`
- `e2e/theme.spec.ts`

## Change Log

- 2026-02-16: Implemented system-preference dark/light theming updates, improved contrast/focus styling, and expanded component regression tests.
- 2026-02-16: Applied review fixes for light-mode contrast (accent text/readability) and strengthened theme parity assertions.
