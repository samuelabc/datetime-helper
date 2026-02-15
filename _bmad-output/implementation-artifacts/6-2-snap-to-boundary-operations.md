# Story 6.2: Snap-to Boundary Operations

Status: in-progress

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want quick "snap-to" operations (for example start/end of day or month),
so that I can produce common boundary timestamps without manual multi-step edits.

## Acceptance Criteria

1. **Given** a valid base date/time, **When** I select a supported snap operation (for example startOfDay, endOfDay, startOfMonth, endOfMonth), **Then** the calculator applies it as a deterministic operation and results update instantly.
2. **Given** snap operations are chained with existing add/subtract operations, **When** calculation executes, **Then** operation order is preserved and output remains consistent.
3. **Given** a snap operation would produce an invalid intermediate state, **When** validation runs, **Then** the operation is rejected with inline feedback and prior valid state is preserved.
4. **Given** a snap operation is applied, **When** URL synchronization is enabled, **Then** the operation is represented in canonical shareable URL state.

## Tasks / Subtasks

- [x] Task 1: Extend operation schema with snap operations (AC: #1, #2)
  - [x] Define snap operation variants and deterministic application rules
  - [x] Integrate snap operations into ordered operation pipeline
- [x] Task 2: Add validation and resilience for invalid intermediate states (AC: #3)
  - [x] Reject invalid snap outcomes with typed errors
  - [x] Preserve last valid state and outputs
- [x] Task 3: Integrate snap operations into URL schema and tests (AC: #4)
  - [x] Encode/decode snap operations canonically in URL state
  - [x] Add round-trip + ordering tests for mixed operation chains

## Dev Notes

### Story Dependencies

- Depends on URL-state work from Epic 5 for AC #4.

### Technical Requirements

- Snap operations must compose with existing operations and preserve deterministic ordering.
- Validation must protect against invalid intermediate results without UI breakage.

### Architecture Compliance

- Keep operation typing centralized in `src/lib/types.ts`.
- Avoid introducing duplicate calculation paths; use existing sequential application model.

### File Structure Requirements

- Modify likely files:
  - `src/lib/types.ts`
  - `src/components/OperationRow.svelte`
  - `src/components/Calculator.svelte`
  - `src/lib/urlState.ts`
- Create likely files:
  - `src/lib/snapOperations.ts`
  - `src/lib/snapOperations.test.ts`

### Testing Requirements

- `pnpm test`
- Manual checks:
  - each snap operation on representative dates
  - mixed chains with add/subtract operations
  - URL round-trip including snap operations

### Git Intelligence Summary

- Existing operation-array model from Epic 2 is the right extension point for snap variants.

### Latest Tech Information

- Keep snap operation names stable and schema-safe (`startOfDay`, `endOfDay`, etc.) for URL/API compatibility.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-6.2]
- [Source: _bmad-output/planning-artifacts/architecture.md#State-Flow]
- [Source: _bmad-output/planning-artifacts/prd.md#Zero-Server-URL-as-API]

## Dev Agent Record

### Agent Model Used

GPT-5.3 Codex

### Debug Log References

- Story created by create-story workflow.

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.
- Extended operation schema and UI to support snap operations (`startOfDay`, `endOfDay`, `startOfMonth`, `endOfMonth`) in ordered chains.
- Added canonical URL support for snap operation serialization/deserialization with existing state validation behavior.

### File List

- `_bmad-output/implementation-artifacts/6-2-snap-to-boundary-operations.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `src/lib/types.ts`
- `src/lib/snapOperations.ts`
- `src/lib/snapOperations.test.ts`
- `src/components/OperationRow.svelte`
- `src/components/Calculator.svelte`
- `src/lib/urlState.ts`

### Senior Developer Review (AI)

- Added dedicated snap-operations module and tests for deterministic chain behavior and typed error handling.
- Replaced inline snap math in calculator with centralized operation-chain utility to improve maintainability and validation.
- Story remains in-progress until full mixed-operation E2E verification is completed.

