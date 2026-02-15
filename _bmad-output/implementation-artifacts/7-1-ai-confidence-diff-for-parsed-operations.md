# Story 7.1: AI Confidence Diff for Parsed Operations

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want to see confidence and interpretation details for AI-generated calculator steps,
so that I can quickly trust or correct parsed results before using them.

## Acceptance Criteria

1. **Given** I submit a natural-language prompt in the command palette, **When** parsing succeeds, **Then** the response includes per-step confidence metadata and a normalized intent summary suitable for UI display.
2. **Given** confidence metadata is present, **When** the calculator applies parsed operations, **Then** the UI highlights low-confidence fields without blocking execution, and all fields remain editable.
3. **Given** a user expands confidence details, **When** the diff view opens, **Then** it shows prompt-to-operation mapping (what text mapped to which structured step) in a compact, scannable format.
4. **Given** confidence metadata is absent from a provider, **When** results are rendered, **Then** the UI falls back to a neutral "confidence unavailable" state and preserves core calculator flow.

## Tasks / Subtasks

- [x] Task 1: Define confidence metadata schema and parser output contract (AC: #1, #4)
  - [x] Extend parse result types with optional per-step confidence and summary fields
  - [x] Keep backward compatibility with providers that do not return confidence
- [x] Task 2: Implement confidence-aware UI in calculator review layer (AC: #2, #3)
  - [x] Add low-confidence visual annotations without blocking edits
  - [x] Add expandable compact diff view mapping prompt fragments to operations
- [x] Task 3: Add tests for confidence-present and confidence-absent paths (AC: #1-#4)
  - [x] Unit tests for metadata mapping and fallback behavior
  - [x] Integration test for editable low-confidence steps

## Dev Notes

### Story Dependencies

- Depends on Epic 4 parser and command palette flow.
- Reuses existing calculator editability contract from Story 4.3.

### Technical Requirements

- Confidence signals are informational only; never block apply/edit flows.
- Provider-agnostic metadata shape with optional fields.

### Architecture Compliance

- Keep parser output and adapter boundaries in `src/lib` modules.
- Keep state ownership in `src/components/Calculator.svelte`.
- Preserve current accessibility semantics and reduced-motion behavior.

### File Structure Requirements

- Modify likely files:
  - `src/lib/naturalLanguageParser.ts`
  - `src/lib/types.ts`
  - `src/components/Calculator.svelte`
  - `src/components/CommandPalette.svelte`
- Create likely files:
  - `src/lib/aiConfidence.ts`
  - `src/lib/aiConfidence.test.ts`
  - `src/components/AIConfidenceDiff.svelte`
  - `src/components/AIConfidenceDiff.test.ts`

### Testing Requirements

- `pnpm test`
- Manual checks:
  - Confidence-present parse result displays labels and diff
  - Confidence-missing provider response renders neutral fallback

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-7.1]
- [Source: _bmad-output/planning-artifacts/prd.md#Vision-Phase-3-Platform]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Trust-through-transparency]
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend-Architecture]

## Dev Agent Record

### Agent Model Used

GPT-5.3 Codex

### Debug Log References

- Story created from Epic 7 implementation planning.

### Completion Notes List

- Story scaffold created and linked to existing Epic 4 parsing flow.
- Added optional confidence metadata to parser outputs and mapped confidence to a UI diff panel.
- Added low-confidence row highlighting while preserving editable apply flow.
- Added tests for confidence available and unavailable rendering paths.

### File List

- `_bmad-output/implementation-artifacts/7-1-ai-confidence-diff-for-parsed-operations.md`
- `src/lib/naturalLanguageParser.ts`
- `src/lib/aiConfidence.ts`
- `src/lib/aiConfidence.test.ts`
- `src/components/AIConfidenceDiff.svelte`
- `src/components/AIConfidenceDiff.test.ts`
- `src/components/Calculator.svelte`
