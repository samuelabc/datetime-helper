# Story 2.3: Multi-Step Operations & Reset

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer performing complex date calculations,
I want to chain multiple operations and easily reset to start over,
so that I can build multi-step calculations (e.g., "6 months ago, minus 3 days") without starting from scratch.

## Acceptance Criteria

1. **Given** the calculator shows one operation row, **When** I click "+ Add operation," **Then** a new operation row appears below with defaults (subtract, 0, days), and the new row direction select receives focus.

2. **Given** multiple operation rows exist, **When** I view results, **Then** operations are applied sequentially to start date and all four format outputs reflect the final datetime.

3. **Given** multiple rows exist, **When** any field in any row changes, **Then** calculation re-runs and results update instantly.

4. **Given** two or more operation rows, **When** I inspect each row, **Then** each row has a remove button; clicking removes that row and recalculates.

5. **Given** only one operation row exists, **When** I inspect it, **Then** remove control is hidden; at least one row always remains.

6. **Given** calculator state differs from default (custom date or any operation amount > 0), **When** I inspect input zone, **Then** a reset button is visible.

7. **Given** I click reset, **When** action completes, **Then** start date returns to "now", extra operation rows are removed, remaining row resets to defaults, live mode resumes, and results return to current datetime with no confirmation dialog (FR19).

8. **Given** calculator is in default state (now, single operation at 0), **When** I inspect input zone, **Then** reset button is hidden.

## Tasks / Subtasks

- [x] Task 1: Extend operation model to support ordered multi-row calculations (AC: #1, #2, #3)
  - [x] Store operations as array in `Calculator.svelte`
  - [x] Preserve stable row identity (`id`) for update/remove actions
  - [x] Recompute from full ordered list on every operation mutation

- [x] Task 2: Add AddOperation and Remove controls with one-row minimum rule (AC: #1, #4, #5)
  - [x] Add `src/components/AddOperationButton.svelte`
  - [x] Update or extend `OperationRow.svelte` to support row-level remove action
  - [x] Hide remove when only one row remains
  - [x] Focus newly added row direction control

- [x] Task 3: Add Reset behavior and visibility rules (AC: #6, #7, #8)
  - [x] Add `src/components/ResetButton.svelte`
  - [x] Show reset only when state differs from defaults
  - [x] Reset action restores:
    - [x] start date mode -> now
    - [x] operations -> single default row
    - [x] live state -> true
    - [x] last result -> recomputed current datetime

- [x] Task 4: Maintain existing output and accessibility behavior (AC: #2, #3, #7)
  - [x] Ensure Hero and standard result rows still update in lockstep
  - [x] Preserve keyboard tab order consistency as rows are added/removed
  - [x] Keep inline/no-modal interaction model

- [x] Task 5: Add comprehensive tests for dynamic rows and reset flow (AC: #1-#8)
  - [x] Add `src/components/AddOperationButton.test.ts`
  - [x] Add `src/components/ResetButton.test.ts`
  - [x] Update `src/components/OperationRow.test.ts` and `src/components/Calculator.test.ts`
  - [x] Verify sequential operation application and reset restoration

## Dev Notes

### Story Dependencies

- Story 2.1 and Story 2.2 should already be implemented before this story.
- This story extends the single-row operation model into an ordered array with add/remove/reset orchestration.

### Critical Implementation Guardrails

- Continue using Wasm as the only computation engine; no JS datetime arithmetic.
- Operations must be applied in user-visible order.
- Keep at least one operation row at all times.
- Reset is immediate and silent; no dialog or toast confirmation.
- Preserve existing result rendering and copy behavior from Epic 1.

### File and Architecture Alignment

- Root state owner remains `src/components/Calculator.svelte`.
- Child components remain focused and reusable:
  - `OperationRow.svelte`
  - `AddOperationButton.svelte`
  - `ResetButton.svelte`
- No new app-level store introduced for this story scope.

### Previous Story Intelligence

- Existing baseline includes stable Wasm bridge, output rows, and copy flow; this story must not regress those behaviors.
- Prior learnings emphasize preserving current accessibility and layout semantics.
- Keep test strategy co-located and exhaustive for dynamic UI behavior.

### Git Intelligence Summary

- Recent work patterns favor explicit, test-backed component changes.
- Use focused changes in `src/components` with minimal unrelated file churn.

### Files to Create

- `src/components/AddOperationButton.svelte`
- `src/components/AddOperationButton.test.ts`
- `src/components/ResetButton.svelte`
- `src/components/ResetButton.test.ts`

### Files to Modify

- `src/components/Calculator.svelte`
- `src/components/Calculator.test.ts`
- `src/components/OperationRow.svelte`
- `src/components/OperationRow.test.ts`

### Files to Reference (No Intended Changes)

- `src/lib/wasmBridge.ts`
- `src/lib/types.ts`
- `src/components/HeroResultRow.svelte`
- `src/components/ResultRow.svelte`
- `src/components/CopyButton.svelte`

### Testing Requirements

- Unit/component:
  - `pnpm test`
  - add/remove/focus/reset assertions
- Rust/Wasm regression:
  - `cd crates/datetime-engine && cargo test`
- Manual checks:
  - add two rows and verify sequential arithmetic
  - remove middle/last row and verify recalculation
  - reset returns full default state and live mode

### Project Structure Notes

- Keep all new UI pieces in existing `src/components` directory.
- Maintain current naming conventions: PascalCase components, co-located `.test.ts`.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-2.3]
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend-Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md#State-Flow]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation-Patterns-&-Consistency-Rules]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Component-Strategy]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Flow-Optimization-Principles]
- [Source: _bmad-output/planning-artifacts/prd.md#Functional-Requirements]
- [Source: _bmad-output/implementation-artifacts/2-2-single-operation-row-with-live-results.md]

## Dev Agent Record

### Agent Model Used

GPT-5.3 Codex

### Debug Log References

- `pnpm test` (Vitest): PASS, including add/remove/focus/reset coverage in calculator and component-level tests.
- `cargo test` in `crates/datetime-engine`: PASS, preserving arithmetic correctness guarantees.

### Completion Notes List

- Refactored calculator operation model to ordered array state with stable row IDs and Wasm-driven recomputation on every mutation.
- Added `AddOperationButton` and row-level remove controls with enforced one-row minimum.
- Added `ResetButton` with conditional visibility and full default-state restoration (now mode, single default row, live resumption, current result recompute).
- Preserved existing result rendering/copy interactions and inline non-modal UX semantics while adding dynamic row behavior.
- Added tests for add/remove controls, focus transfer on add, reset visibility/action, and dynamic operation row behavior.

### File List

- `_bmad-output/implementation-artifacts/2-3-multi-step-operations-reset.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `src/components/Calculator.svelte`
- `src/components/Calculator.test.ts`
- `src/components/OperationRow.svelte`
- `src/components/OperationRow.test.ts`
- `src/components/AddOperationButton.svelte`
- `src/components/AddOperationButton.test.ts`
- `src/components/ResetButton.svelte`
- `src/components/ResetButton.test.ts`

## Change Log

| Date | Change |
|------|--------|
| 2026-02-15 | Implemented Story 2.3 multi-step operation arrays, add/remove operation controls, reset flow, focus behavior, and comprehensive dynamic-state tests. |
| 2026-02-16 | Senior code review fixes: corrected reset ID generation and added sequential multi-step order verification tests. |

## Senior Developer Review (AI)

### Reviewer

Samuel (AI-assisted) on 2026-02-16

### Findings Addressed

- Fixed operation ID generation on reset in `Calculator.svelte` to prevent duplicate keyed row IDs after reset/add sequences.
- Added calculator test coverage that verifies multi-step operations are sent to calculation in user-visible order.
- Strengthened dynamic behavior evidence by asserting chained-operation output for ordered operation arrays.
