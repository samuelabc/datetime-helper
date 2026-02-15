# Story 5.1: URL State Schema and Deterministic Encoder/Decoder

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want a stable URL schema for calculator state,
so that links are reproducible for both humans and AI agents.

## Acceptance Criteria

1. **Given** a calculator state (start date + ordered operations), **When** it is encoded, **Then** it produces a canonical query-string format with deterministic field ordering.
2. **Given** a canonical query string, **When** it is decoded, **Then** it reconstructs an equivalent calculator state with matching operation order and values.
3. **Given** unknown or unsupported query parameters are present, **When** decode runs, **Then** unknown fields are ignored safely without breaking valid state restoration.
4. **Given** malformed URL state is provided, **When** decode validation fails, **Then** the app falls back to the last known valid/default state and emits a typed validation error.

## Tasks / Subtasks

- [x] Task 1: Define canonical URL schema and deterministic ordering rules (AC: #1, #2)
  - [x] Specify stable parameter naming and ordered serialization for operations
  - [x] Ensure round-trip encode/decode equality for equivalent state
- [x] Task 2: Implement typed encoder/decoder with safe unknown-param handling (AC: #2, #3, #4)
  - [x] Decode only supported keys and ignore unknowns safely
  - [x] Return typed validation errors for malformed state
  - [x] Provide fallback to last-known-valid/default state on decode failure
- [x] Task 3: Add contract and fuzz-like test coverage (AC: #1-#4)
  - [x] Round-trip tests with multiple operations and order assertions
  - [x] Malformed query tests for resilience and fallback behavior

## Dev Notes

### Story Dependencies

- Can begin independently, but should align with existing calculator state shape from Epic 2.

### Technical Requirements

- URL becomes an explicit API contract; deterministic output is mandatory.
- Decoder must never crash app initialization or mutate into invalid state.

### Architecture Compliance

- Keep URL encode/decode logic in `src/lib`, not in UI templates.
- Preserve existing calculator constraints (non-negative amounts, valid units).

### File Structure Requirements

- Modify likely files:
  - `src/lib/types.ts`
  - `src/components/Calculator.svelte`
- Create likely files:
  - `src/lib/urlState.ts`
  - `src/lib/urlState.test.ts`

### Testing Requirements

- `pnpm test`
- Contract checks:
  - deterministic ordering across identical inputs
  - round-trip parity
  - malformed/unknown parameter safety

### Git Intelligence Summary

- Existing code favors strict, typed boundaries; keep URL schema strongly typed from start.

### Latest Tech Information

- Use `URLSearchParams` with explicit key-order serialization control to avoid cross-browser ordering drift.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-5.1]
- [Source: _bmad-output/planning-artifacts/prd.md#Zero-Server-URL-as-API]
- [Source: _bmad-output/planning-artifacts/architecture.md#State-Flow]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation-Patterns-&-Consistency-Rules]

## Dev Agent Record

### Agent Model Used

GPT-5.3 Codex

### Debug Log References

- Story created by create-story workflow.

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.
- Added canonical URL state schema and deterministic encoder/decoder with typed malformed-state errors and safe fallback behavior.
- Added URL contract tests for deterministic ordering, round-trip parity, and malformed input resilience.

### File List

- `_bmad-output/implementation-artifacts/5-1-url-state-schema-and-deterministic-encoder-decoder.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `src/lib/urlState.ts`
- `src/lib/urlState.test.ts`
- `src/lib/types.ts`

### Senior Developer Review (AI)

- Extended typed URL decode errors to emit `INVALID` for missing/empty required start-date state.
- Tightened decoder validation and added coverage for invalid contract shapes.
- Story remains in-progress for full-story validation against all URL-state edge cases.

