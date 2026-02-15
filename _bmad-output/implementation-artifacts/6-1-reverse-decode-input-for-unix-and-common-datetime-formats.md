# Story 6.1: Reverse Decode Input for Unix and Common Datetime Formats

Status: in-progress

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want to paste an existing timestamp or datetime string and decode it,
so that I can quickly inspect equivalent values across supported output formats.

## Acceptance Criteria

1. **Given** reverse mode is available, **When** I paste a valid Unix timestamp, **Then** the app parses it and displays equivalent ISO 8601, RFC 2822, and local-human outputs.
2. **Given** I paste a valid ISO 8601 string, **When** parsing completes, **Then** the Unix timestamp and other formats render as the same instant.
3. **Given** I paste an invalid or unsupported value, **When** validation runs, **Then** an inline error is shown and the last valid output remains visible.
4. **Given** reverse mode output is displayed, **When** I click a copy button on any row, **Then** copy behavior and confirmation match the existing forward-calculation UX.

## Tasks / Subtasks

- [x] Task 1: Add reverse decode input mode and parser routing (AC: #1, #2)
  - [x] Add reverse-input control and mode-specific parsing path
  - [x] Support Unix and ISO 8601 decode at minimum
  - [x] Produce existing `FormattedResult` shape for display reuse
- [x] Task 2: Add validation and fallback behaviors (AC: #3)
  - [x] Inline errors for invalid decode input
  - [x] Preserve last-valid outputs on parse failures
- [x] Task 3: Reuse copy-first output UX and add tests (AC: #4)
  - [x] Confirm result rows and copy behavior remain identical
  - [x] Add tests for reverse decode success and failure paths

## Dev Notes

### Story Dependencies

- Builds on existing result row/copy architecture from Epic 1 and validation patterns from Epic 2.

### Technical Requirements

- Reverse decode must not fork result rendering into a separate UI model.
- Output consistency across formats remains mandatory (same instant represented everywhere).

### Architecture Compliance

- Keep parsing/normalization in `src/lib`; UI should consume typed result model.
- If Rust/Wasm decoding is introduced, keep `wasmBridge.ts` as the only Wasm contact point.

### File Structure Requirements

- Modify likely files:
  - `src/components/Calculator.svelte`
  - `src/components/ResultRow.svelte`
  - `src/lib/types.ts`
- Create likely files:
  - `src/components/ReverseDecodeInput.svelte`
  - `src/components/ReverseDecodeInput.test.ts`
  - `src/lib/reverseDecode.ts`
  - `src/lib/reverseDecode.test.ts`

### Testing Requirements

- `pnpm test`
- Manual checks:
  - valid Unix decode
  - valid ISO decode
  - invalid input keeps prior valid result
  - copy interactions unchanged

### Git Intelligence Summary

- Maintain composable component strategy; introduce reverse mode as additive input surface.

### Latest Tech Information

- Prefer explicit parse format detection order (Unix vs ISO) to avoid ambiguous coercion.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-6.1]
- [Source: _bmad-output/planning-artifacts/architecture.md#Error-Handling]
- [Source: _bmad-output/planning-artifacts/architecture.md#State-Flow]

## Dev Agent Record

### Agent Model Used

GPT-5.3 Codex

### Debug Log References

- Story created by create-story workflow.

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.
- Added reverse decode mode and input component with Unix/ISO parser routing and shared formatted-output rendering path.
- Added reverse decode error handling that preserves last valid result and new parser unit tests.

### File List

- `_bmad-output/implementation-artifacts/6-1-reverse-decode-input-for-unix-and-common-datetime-formats.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `src/components/ReverseDecodeInput.svelte`
- `src/components/ReverseDecodeInput.test.ts`
- `src/lib/reverseDecode.ts`
- `src/lib/reverseDecode.test.ts`
- `src/components/Calculator.svelte`

### Senior Developer Review (AI)

- Added missing component test coverage for reverse decode input forwarding and inline error rendering.
- Story remains in-progress pending consolidated reverse-mode integration regression with result/copy flows.

