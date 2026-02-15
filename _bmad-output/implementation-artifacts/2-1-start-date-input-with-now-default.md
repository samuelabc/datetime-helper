# Story 2.1: Start Date Input with "Now" Default

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want to enter any date as my calculation starting point - or leave it as "now" for the current time,
so that I can get timestamp results for any date I'm working with.

## Acceptance Criteria

1. **Given** the page loads at default state, **When** I look at the input zone, **Then** the StartDateInput displays "now" in orange text, indicating the live default (FR3).

2. **Given** the StartDateInput is at the "now" default, **When** I click into the field, **Then** all text is selected for easy replacement, and an orange focus ring (2px) appears.

3. **Given** I type a valid date (e.g., "2026-03-15") into the StartDateInput, **When** the input value changes, **Then** all four result format values update instantly to reflect that date (instead of "now"), the live-ticking stops, and the "live" indicator disappears (FR2, FR9).

4. **Given** I type an invalid date (e.g., "2026-13-01") into the StartDateInput, **When** the input value changes, **Then** the input border turns red with a subtle error message below, and the result area continues showing the last valid calculation - no blank screen, no error dialog (FR5, FR18).

5. **Given** the StartDateInput is showing a validation error, **When** I correct the input to a valid date, **Then** the red border and error message clear instantly, and results snap to the corrected date.

6. **Given** I have entered a custom date in StartDateInput, **When** I clear the field (select all + delete) and blur, **Then** the input reverts to "now" in orange text, live-ticking resumes, and the "live" indicator reappears (FR19).

7. **Given** the Wasm engine validates the date, **When** I enter "2028-02-29" (a leap year), **Then** it is accepted as valid; and when I enter "2027-02-29" (not a leap year), **Then** it is rejected with an error (FR4).

## Tasks / Subtasks

- [x] Task 1: Create `StartDateInput` component and wire calculator input state (AC: #1, #2)
  - [x] Add `src/components/StartDateInput.svelte` using Svelte 5 runes (`$props`, `$state`, `$derived`)
  - [x] Props: `value`, `error`, `isNow`, `onInput`, `onBlur`
  - [x] Apply required focus styling: `focus:ring-2 focus:ring-orange-400`
  - [x] Implement "select all on focus" behavior

- [x] Task 2: Extend calculator state for start-date mode and validation flow (AC: #1, #3, #4, #5, #6)
  - [x] In `src/components/Calculator.svelte`, add start-date state (`startDateInput`, `isNowMode`, `startDateError`)
  - [x] Replace "Coming in Story 2.1..." placeholder with mounted `StartDateInput`
  - [x] Preserve last valid `FormattedResult` when validation fails
  - [x] Ensure `isLive` toggles off for valid custom date and back on for "now"

- [x] Task 3: Use Wasm validation for calendar correctness (AC: #4, #5, #7)
  - [x] Use `validateDate()` from `src/lib/wasmBridge.ts` on input changes
  - [x] Accept leap-year date `2028-02-29`, reject non-leap `2027-02-29`
  - [x] Keep validation non-blocking and inline only (no modal, no toast)

- [x] Task 4: Update calculation trigger logic to follow start-date semantics (AC: #3, #6)
  - [x] For "now" mode, continue live-ticking behavior
  - [x] For valid explicit date, compute static results immediately via `calculate()`
  - [x] On empty input blur, restore "now" mode and resume ticking

- [x] Task 5: Tests for start-date behavior and regression safety (AC: #1-#7)
  - [x] Add `src/components/StartDateInput.test.ts`
  - [x] Update `src/components/Calculator.test.ts` for new start-date scenarios
  - [x] Assert: last valid result is preserved on invalid entry
  - [x] Assert: `isLive` transitions correctly between "now" and explicit date

## Dev Notes

### Relevant Existing Architecture and Guardrails

- Svelte 5 runes only; no legacy `export let`, no `$:` statements.
- Keep all Wasm calls behind `src/lib/wasmBridge.ts`; components do not import Wasm directly.
- Tailwind utility classes only in templates; no custom class architecture changes.
- JSON/result shape must stay aligned to `FormattedResult` in `src/lib/types.ts`.
- Preserve existing section semantics and `aria-label` values on input/results zones.

### Existing Code Reality to Build On

- `src/components/Calculator.svelte` currently has input placeholders for Story 2.x and already handles:
  - Wasm init lifecycle
  - output rendering via `HeroResultRow` and `ResultRow`
  - live ticking effect in default mode
- `src/lib/wasmBridge.ts` already exposes:
  - `init()`
  - `calculate(startDate, operations)`
  - `validateDate(input)`
  - `nowUnix()`

### Previous Story Intelligence (Epic 1)

- Do not reintroduce serde in Wasm output path; bundle budget guardrail still applies.
- Respect tested `md:` breakpoint decisions and current output layout.
- Existing copy functionality and result rows are stable; avoid regressions while wiring input state.
- Keep accessibility patterns already in place (focus ring, live region behavior, reduced motion handling).

### Git Intelligence Summary

- Recent commits show infrastructure and copy flow completed for Epic 1.
- Current branch conventions use story-scoped commits and preserve architecture constraints.
- Story implementation should be incremental and avoid broad refactors outside input/date flow.

### Files to Create

- `src/components/StartDateInput.svelte`
- `src/components/StartDateInput.test.ts`

### Files to Modify

- `src/components/Calculator.svelte`
- `src/components/Calculator.test.ts`

### Files to Reference (No Intended Changes)

- `src/lib/wasmBridge.ts`
- `src/lib/types.ts`
- `src/components/HeroResultRow.svelte`
- `src/components/ResultRow.svelte`

### Testing Requirements

- Unit/component:
  - `pnpm test` for Svelte/Vitest coverage updates
- Rust/Wasm correctness regression:
  - `cd crates/datetime-engine && cargo test`
- Manual behavior checks:
  - default "now" state visible and orange-styled
  - invalid date keeps previous result visible
  - empty-on-blur returns to "now" and resumes live updates

### Project Structure Notes

- Keep feature additions inside existing canonical folders:
  - `src/components/` for UI components
  - `src/lib/` for typed bridge calls
- Do not create new top-level directories for this story.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-2.1]
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend-Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md#Wasm-Integration-Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation-Patterns-&-Consistency-Rules]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Component-Strategy]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Feedback-Patterns]
- [Source: _bmad-output/planning-artifacts/prd.md#Functional-Requirements]
- [Source: _bmad-output/implementation-artifacts/1-5-ci-cd-pipeline-production-deployment.md]

## Dev Agent Record

### Agent Model Used

GPT-5.3 Codex

### Debug Log References

- `pnpm test` (Vitest): PASS, including new StartDateInput and Calculator start-date scenarios.
- `cargo test` in `crates/datetime-engine`: PASS (all suites green).

### Completion Notes List

- Implemented `StartDateInput` with now-default styling, focus-select behavior, inline error rendering, and callback-based wiring.
- Integrated start-date state into `Calculator.svelte` using Wasm `validateDate()` for inline validation and preserving last valid result on invalid entries.
- Added explicit date/static mode transitions and empty-on-blur reset back to live now mode.
- Added tests covering valid/invalid/leap handling, last-valid preservation, and live-state transitions.

### File List

- `_bmad-output/implementation-artifacts/2-1-start-date-input-with-now-default.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `src/components/Calculator.svelte`
- `src/components/Calculator.test.ts`
- `src/components/StartDateInput.svelte`
- `src/components/StartDateInput.test.ts`

## Change Log

| Date | Change |
|------|--------|
| 2026-02-15 | Implemented Story 2.1 start-date input flow with now-default mode, Wasm validation, inline errors, live/static transitions, and test coverage updates. |
| 2026-02-16 | Senior code review fixes: guarded date validation when Wasm is unavailable, improved click-selection robustness, and expanded AC-level result update assertions. |

## Senior Developer Review (AI)

### Reviewer

Samuel (AI-assisted) on 2026-02-16

### Findings Addressed

- Added validation guard/exception handling around `validateDate()` path in `Calculator.svelte` to avoid runtime exceptions when engine state is unavailable.
- Improved StartDateInput click behavior by preserving full text selection on mouse up, aligning better with replacement-first UX intent.
- Strengthened calculator tests to verify explicit date updates propagate across all four rendered formats, not only Unix output.
