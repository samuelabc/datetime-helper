# Story 3.2: Responsive Layout for Tablet & Mobile

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer checking a timestamp on my tablet or phone,
I want datetime-helper to work on any screen size,
so that I can use the tool even when I'm away from my desktop.

## Acceptance Criteria

1. **Given** desktop viewport (`>= 1024px`), **When** layout renders, **Then** 40/60 side-by-side split appears with 32px page padding and full spacing between zones (FR24).

2. **Given** tablet viewport (`768px-1023px`), **When** layout renders, **Then** side-by-side layout is retained with tighter padding (24px) and compressed spacing (FR24).

3. **Given** mobile viewport (`< 768px`), **When** layout renders, **Then** layout switches to stacked vertical with input zone above output zone and 16px page padding (FR24).

4. **Given** mobile stacked layout, **When** using start date, operations, add/remove, reset, and copy, **Then** all features remain fully functional.

5. **Given** very narrow viewport (`375px`), **When** page renders, **Then** content fits viewport width with no horizontal scrolling or overflow.

6. **Given** mobile layout, **When** tapping interactive elements, **Then** touch targets are comfortably usable (`>= 44px` height where applicable).

## Tasks / Subtasks

- [x] Task 1: Implement breakpoint-aware container and zone layout behavior (AC: #1, #2, #3)
  - [x] Update `src/components/Calculator.svelte` layout wrappers for desktop/tablet/mobile
  - [x] Keep desktop 40/60 split and ensure tablet spacing compaction
  - [x] Stack to single-column below 768px

- [x] Task 2: Ensure component-level responsiveness and no overflow (AC: #3, #4, #5)
  - [x] Verify `HeroResultRow` and `ResultRow` value wrapping/truncation strategy does not overflow narrow viewports
  - [x] Update operation row controls for narrow widths (wrap/stack fields while preserving usability)
  - [x] Validate no horizontal scroll at 375px width

- [x] Task 3: Enforce touch-friendly target sizes and interaction parity (AC: #4, #6)
  - [x] Confirm button/input/select heights are at least 44px in mobile contexts
  - [x] Preserve keyboard and pointer behavior after responsive changes
  - [x] Keep copy and reset interactions identical across breakpoints

- [x] Task 4: Add responsive tests and viewport-based regression checks (AC: #1-#6)
  - [x] Extend Playwright responsive test coverage (`desktop/tablet/mobile/375px`)
  - [x] Add/adjust component tests for responsive class behavior where practical
  - [x] Verify desktop still satisfies no-scroll-in-viewport expectation from prior stories

## Dev Notes

### Previous Story Intelligence (3.1)

- Story 3.1 establishes dark/light coverage across all components. Responsive updates in 3.2 must preserve those theme variants.
- Avoid introducing layout-specific colors that bypass Story 3.1 contrast guardrails.

### Technical Requirements

- Keep side-by-side as default desktop behavior; do not regress current information hierarchy.
- Mobile fallback can stack controls, but all calculator features must remain visible and operable.
- Preserve existing reactive state flow and Wasm compute cadence; this story is layout-only.

### Architecture Compliance

- Follow architecture structure and naming conventions in existing components.
- Maintain Tailwind utility-only styling and breakpoint classes.
- Do not move business logic from `Calculator.svelte` into new stores/modules for this story.

### Library / Framework Requirements

- Use Tailwind breakpoints (`lg`, `md`, `sm` semantics currently defined by project usage).
- Keep Astro/Svelte integration unchanged and maintain single interactive island model.

### File Structure Requirements

- Primary files likely impacted:
  - `src/components/Calculator.svelte`
  - `src/components/OperationRow.svelte`
  - `src/components/HeroResultRow.svelte`
  - `src/components/ResultRow.svelte`
  - `src/components/CopyButton.svelte`
- Tests:
  - `src/components/Calculator.test.ts`
  - `e2e/responsive.spec.ts`

### Testing Requirements

- `pnpm test`
- `pnpm test:e2e` (responsive suite)
- Manual viewport verification:
  - 1280x800 desktop
  - 834x1112 tablet
  - 390x844 and 375x667 mobile
- Confirm no horizontal overflow and full feature parity on mobile.

### Git Intelligence Summary

- Epic 2 introduced multi-row operation flows and reset behavior; responsive changes must not break dynamic operation interactions.
- Recent codebase patterns favor explicit tests for regressions; mirror that approach for viewport-dependent behavior.

### Latest Tech Information

- Tailwind v4 utility performance and dark-mode support remain aligned with existing architecture decisions; responsive behavior should be implemented through standard utility breakpoints.
- Avoid adopting framework upgrades in this story; focus on stable responsive implementation.

### Project Structure Notes

- Maintain max-width container strategy from UX direction (around 960px on desktop).
- Keep input/output zone mental model intact across all breakpoints.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-3.2]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Responsive-Design-&-Accessibility]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Chosen-Direction]
- [Source: _bmad-output/planning-artifacts/architecture.md#Project-Structure-&-Boundaries]
- [Source: _bmad-output/planning-artifacts/prd.md#Appearance-&-Responsiveness]
- [Source: _bmad-output/implementation-artifacts/3-1-dark-light-mode-with-system-preference.md]

## Dev Agent Record

### Agent Model Used

GPT-5.3 Codex

### Debug Log References

- Story created by create-story workflow.
- Updated responsive behavior in calculator and row components with mobile-safe wrapping and preserved desktop/tablet structure.
- Added Playwright viewport checks and component-level regression assertions for layout classes and target sizing.

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.
- Kept desktop/tablet side-by-side zones while improving mobile stacking behavior and spacing on narrow widths.
- Prevented horizontal overflow by adding wrapping/break-word safeguards on hero/result value rows.
- Raised control target heights to touch-friendly minimums (44px) across input/select/button controls.
- Added responsive E2E checks (`desktop/tablet/mobile/375px`) and validated no overflow regression.
- Verified implementation with `pnpm test` and `pnpm test:e2e`.

### File List

- `_bmad-output/implementation-artifacts/3-2-responsive-layout-for-tablet-mobile.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `src/components/Calculator.svelte`
- `src/components/HeroResultRow.svelte`
- `src/components/ResultRow.svelte`
- `src/components/OperationRow.svelte`
- `src/components/StartDateInput.svelte`
- `src/components/AddOperationButton.svelte`
- `src/components/ResetButton.svelte`
- `src/components/CopyButton.svelte`
- `src/components/Calculator.test.ts`
- `src/components/OperationRow.test.ts`
- `src/components/StartDateInput.test.ts`
- `src/components/AddOperationButton.test.ts`
- `src/components/ResetButton.test.ts`
- `playwright.config.ts`
- `e2e/responsive.spec.ts`
- `package.json`
- `pnpm-lock.yaml`

## Change Log

- 2026-02-16: Implemented responsive/touch-target improvements and added Playwright viewport regression tests.
- 2026-02-16: Applied review fixes to enforce >=44px touch targets through mobile breakpoints and expanded mobile interaction parity checks.
