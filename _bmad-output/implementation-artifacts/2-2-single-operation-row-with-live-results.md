# Story 2.2: Single Operation Row with Live Results

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer debugging a time-range issue,
I want to add or subtract days, months, or years from my start date and see instant results,
so that I can get the exact timestamp I need for my database query or log analysis.

## Acceptance Criteria

1. **Given** the calculator displays an operation row below the start date input, **When** I look at it, **Then** I see three controls: direction select (+/-), amount input (number), and unit select (days/months/years), with defaults of subtract, 0, days (FR15, FR16, FR17).

2. **Given** I change operation fields to subtract, 7, days, **When** the start date is "now," **Then** all four result formats update instantly (< 100ms) to show the datetime 7 days ago (FR1, FR9, NFR4).

3. **Given** I change any operation field (direction, amount, unit), **When** input changes, **Then** results recalculate live with no submit action.

4. **Given** the start date is "now" and an operation is applied (amount > 0), **When** I view the hero row, **Then** live-ticking stops and the result is static.

5. **Given** I enter non-numeric or negative amount input, **When** the field changes, **Then** invalid input is prevented; only non-negative integers are accepted (FR16).

6. **Given** I set amount back to 0 while start date is "now," **When** recalculation runs, **Then** result is equivalent to now and live mode resumes.

7. **Given** I enter "1 month" with start date "2026-01-31," **When** calculation runs, **Then** month boundary arithmetic is handled correctly (e.g., Feb 28, 2026), without invalid states (FR4, NFR16).

## Tasks / Subtasks

- [x] Task 1: Create single `OperationRow` component and integrate into input zone (AC: #1, #5)
  - [x] Add `src/components/OperationRow.svelte`
  - [x] Props: `direction`, `amount`, `unit`, `onDirectionChange`, `onAmountChange`, `onUnitChange`
  - [x] Default values: subtract, 0, days
  - [x] Restrict amount to non-negative integer input

- [x] Task 2: Add operation state and live recalculation wiring in calculator (AC: #2, #3, #4, #6)
  - [x] Add single operation state in `src/components/Calculator.svelte`
  - [x] Remove Story 2.2 placeholder and mount `OperationRow`
  - [x] Recompute via `calculate()` on operation changes
  - [x] Determine `isLive` from composite state: `isNowMode && amount === 0`

- [x] Task 3: Preserve architecture constraints for arithmetic and validation (AC: #2, #7)
  - [x] Keep all computation in Wasm (`calculate`) with operation array payload
  - [x] Ensure no JavaScript Date arithmetic path is introduced
  - [x] Validate month-boundary edge case via tests

- [x] Task 4: Add tests for operation behavior and live/static mode transitions (AC: #1-#7)
  - [x] Create `src/components/OperationRow.test.ts`
  - [x] Update `src/components/Calculator.test.ts` to cover operation-driven state changes
  - [x] Assert 100ms-level responsiveness expectation through synchronous update assertions
  - [x] Assert static/live mode toggle logic for zero vs non-zero amount

## Dev Notes

### Story 2.1 Dependency

- Story 2.1 should be implemented first because this story relies on start-date state (`isNowMode`, validation behavior, and start-date reset semantics).
- If Story 2.1 is not yet merged, implement both in a single branch with Story 2.1 completed first.

### Required Architecture Compliance

- Keep operation state in `Calculator.svelte` as the single source of truth.
- Child component `OperationRow` remains stateless/presentation plus callback props.
- Preserve Svelte component ordering convention: imports -> props -> state -> derived -> effects -> handlers.
- Keep `calculate()` calls within calculator state flow; no direct Wasm calls from child components.

### Previous Story Intelligence

- Epic 1 established stable output rendering and copy behavior; operation updates must not regress result row rendering or copy interactions.
- Existing test stack is in place; follow the same co-located test pattern.
- Maintain reduced-motion and accessibility conventions already present in component markup.

### Git Intelligence Summary

- Latest commits indicate CI and copy infrastructure are stabilized.
- Prefer focused scope: operation row + calculation wiring only, avoid touching unrelated deployment files.

### Files to Create

- `src/components/OperationRow.svelte`
- `src/components/OperationRow.test.ts`

### Files to Modify

- `src/components/Calculator.svelte`
- `src/components/Calculator.test.ts`

### Files to Reference (No Intended Changes)

- `src/lib/wasmBridge.ts`
- `src/lib/types.ts`
- `src/components/StartDateInput.svelte` (from Story 2.1)
- `src/components/HeroResultRow.svelte`
- `src/components/ResultRow.svelte`

### Testing Requirements

- Unit/component:
  - `pnpm test`
  - cover direction, amount, unit changes and mode transitions
- Rust regression:
  - `cd crates/datetime-engine && cargo test`
- Manual checks:
  - start=now + amount 0 -> live indicator visible
  - start=now + amount > 0 -> live indicator hidden/static
  - `2026-01-31 + 1 month` reflects valid boundary behavior

### Project Structure Notes

- Keep operation UI in `src/components` and state orchestration in `Calculator.svelte`.
- Avoid introducing new state management layers or store files for this scope.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-2.2]
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend-Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md#Wasm-Integration-Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md#Process-Patterns]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Component-Strategy]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Defining-Experience]
- [Source: _bmad-output/planning-artifacts/prd.md#Functional-Requirements]
- [Source: _bmad-output/implementation-artifacts/2-1-start-date-input-with-now-default.md]

## Dev Agent Record

### Agent Model Used

GPT-5.3 Codex

### Debug Log References

- `pnpm test` (Vitest): PASS with operation row behavior and calculator recalculation assertions.
- `cargo test` in `crates/datetime-engine`: PASS including month-boundary correctness coverage.

### Completion Notes List

- Added `OperationRow.svelte` with direction/amount/unit controls, defaults (subtract/0/days), and strict non-negative integer amount handling.
- Replaced operation placeholder in `Calculator.svelte` and wired live recalculation through Wasm `calculate()` on every operation change.
- Implemented live/static mode logic based on composite state (`isNowMode && amount === 0` behavior generalized across operation rows).
- Added operation-focused tests validating input restrictions, recalculation responsiveness, and live indicator transitions.

### File List

- `_bmad-output/implementation-artifacts/2-2-single-operation-row-with-live-results.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `src/components/Calculator.svelte`
- `src/components/Calculator.test.ts`
- `src/components/OperationRow.svelte`
- `src/components/OperationRow.test.ts`

## Change Log

| Date | Change |
|------|--------|
| 2026-02-15 | Implemented Story 2.2 single operation row with live result recalculation, non-negative input constraints, Wasm-only arithmetic flow, and automated tests. |
| 2026-02-16 | Senior code review fixes: tightened invalid amount handling and added explicit month-boundary UI test coverage. |

## Senior Developer Review (AI)

### Reviewer

Samuel (AI-assisted) on 2026-02-16

### Findings Addressed

- Updated `OperationRow.svelte` so invalid amount strings are rejected instead of being transformed into unintended positive values.
- Updated `OperationRow.test.ts` to assert invalid amount prevention behavior.
- Added calculator-level month-boundary test coverage for `2026-01-31 + 1 month` to validate frontend wiring against expected arithmetic behavior.
