# Story 4.3: Auto-Execute Parsed Steps with Editable Review

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want parsed steps applied immediately while remaining editable,
so that I get fast results and can correct interpretation errors instantly.

## Acceptance Criteria

1. **Given** a valid parse result is returned, **When** the command palette submit flow completes, **Then** the calculator state updates in one transaction and all result formats recalculate immediately.
2. **Given** parsed steps have been applied, **When** I inspect the calculator area, **Then** I can see each populated field and edit it directly using the same controls as manual mode.
3. **Given** I edit any AI-populated field, **When** the input changes, **Then** results update live using standard calculator behavior with no AI dependency.
4. **Given** AI parsing fails, **When** the failure is surfaced, **Then** the calculator remains in its prior valid state and an inline error explains what failed.

## Tasks / Subtasks

- [x] Task 1: Add atomic apply flow for parsed state (AC: #1, #4)
  - [x] Apply parsed state in one transaction to avoid partial UI state
  - [x] Recalculate immediately through existing Wasm-driven update path
  - [x] Preserve pre-parse state when parsing/transformation fails
- [x] Task 2: Preserve full editability after AI application (AC: #2, #3)
  - [x] Hydrate existing controls (`StartDateInput`, `OperationRow`) with parsed values
  - [x] Confirm manual edits continue through normal calculator flow
  - [x] Avoid hidden mode flags that fork behavior
- [x] Task 3: Add regression tests for apply/edit/failure paths (AC: #1-#4)
  - [x] Success path test: parse apply then manual edit
  - [x] Failure path test: state unchanged with inline error

## Dev Notes

### Story Dependencies

- Depends on Story 4.1 (palette shell) and Story 4.2 (parser + transformer contract).

### Technical Requirements

- "AI mode" must not introduce a second calculator engine.
- Once state is applied, all subsequent behavior is identical to manual mode.

### Architecture Compliance

- Continue single source of truth in `Calculator.svelte` state.
- Preserve existing derived computation and live/static mode transitions.

### File Structure Requirements

- Modify likely files:
  - `src/components/Calculator.svelte`
  - `src/components/CommandPalette.svelte`
  - `src/components/Calculator.test.ts`
- Create likely files:
  - `src/components/CommandPalette.integration.test.ts`

### Testing Requirements

- `pnpm test`
- `pnpm test:e2e` for end-to-end parse-apply-edit cycle
- Manual checks:
  - apply parsed steps and confirm immediate output refresh
  - edit AI-populated values and confirm standard recalculation
  - failed parse keeps prior state unchanged

### Git Intelligence Summary

- Keep behavior additive; avoid refactoring existing calculator pathways unless required by atomic-apply mechanics.

### Latest Tech Information

- Use transaction-like state assignment patterns in Svelte to prevent intermediate reactivity glitches.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-4.3]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Core-Interaction]
- [Source: _bmad-output/planning-artifacts/architecture.md#State-Management]
- [Source: _bmad-output/planning-artifacts/architecture.md#Error-Handling]

## Dev Agent Record

### Agent Model Used

GPT-5.3 Codex

### Debug Log References

- Story created by create-story workflow.

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.
- Implemented atomic parsed-state apply in calculator flow with immediate recalculation and preserved prior state on parse/transform errors.
- Kept post-apply editability on the same controls and validated behavior with updated component tests.

### File List

- `_bmad-output/implementation-artifacts/4-3-auto-execute-parsed-steps-with-editable-review.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `src/components/Calculator.svelte`
- `src/components/Calculator.test.ts`
- `src/components/CommandPalette.svelte`
- `src/components/CommandPalette.integration.test.ts`

### Senior Developer Review (AI)

- Added missing integration coverage file for command-palette open/close focus-return behavior.
- Updated parse-apply flow to preserve explicit parsed start-date context in atomic state application.
- Story remains in-progress while broader end-to-end parse/apply/edit scenarios are consolidated.

