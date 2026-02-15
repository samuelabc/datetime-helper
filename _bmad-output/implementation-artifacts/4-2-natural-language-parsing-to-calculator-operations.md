# Story 4.2: Natural Language Parsing to Calculator Operations

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want my natural-language date request translated into structured calculator inputs,
so that I can verify and use AI output without black-box behavior.

## Acceptance Criteria

1. **Given** I submit a prompt such as "6 months ago from now", **When** the AI parse completes, **Then** the system returns a structured result containing start date intent and ordered operations compatible with the existing calculator schema.
2. **Given** the parse result includes multiple operations, **When** it is transformed to calculator state, **Then** operation order is preserved exactly as parsed.
3. **Given** the parse result is ambiguous or incomplete, **When** transformation validation runs, **Then** the system returns a typed parse error and does not mutate the existing calculator state.
4. **Given** parsing succeeds, **When** the transformed state is inspected, **Then** all fields conform to calculator constraints (direction, non-negative integer amount, valid unit).

## Tasks / Subtasks

- [x] Task 1: Define parse result contract and transformation pipeline (AC: #1, #2, #4)
  - [x] Add TypeScript interfaces for natural-language parse result and normalized operation payload
  - [x] Implement deterministic transformer from AI output to calculator state
  - [x] Preserve operation order and map intent to existing `Operation` schema
- [x] Task 2: Add validation and typed parse errors (AC: #3, #4)
  - [x] Validate direction, unit, and non-negative integer amount rules
  - [x] Reject ambiguous/incomplete parse output with explicit typed errors
  - [x] Ensure failed parses never mutate current calculator state
- [x] Task 3: Add unit/component tests for parser integration (AC: #1-#4)
  - [x] Cover single-step and multi-step phrases
  - [x] Cover error paths for ambiguity and malformed provider output

## Dev Notes

### Story Dependencies

- Depends on Story 4.1 command palette entry and provider availability state.

### Technical Requirements

- Keep calculator schema as source of truth; natural language maps into existing structured model.
- Parsing errors must be typed and recoverable, with inline user feedback.

### Architecture Compliance

- No direct AI parsing logic scattered in UI components; keep translation in `src/lib`.
- Maintain no-`any` policy in TypeScript for parsed payload handling.

### File Structure Requirements

- Modify likely files:
  - `src/components/Calculator.svelte`
  - `src/components/CommandPalette.svelte`
  - `src/lib/types.ts`
- Create likely files:
  - `src/lib/naturalLanguageParser.ts`
  - `src/lib/naturalLanguageParser.test.ts`

### Testing Requirements

- `pnpm test`
- Targeted parser fixtures:
  - "6 months ago from now"
  - multi-operation prompts with strict order assertions
  - invalid/ambiguous prompts that preserve current state

### Git Intelligence Summary

- Prior stories favor strict interface contracts before UI wiring; follow same sequence here.

### Latest Tech Information

- Keep provider-specific response parsing behind adapter functions so API changes do not leak into calculator state logic.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-4.2]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Core-Interaction]
- [Source: _bmad-output/planning-artifacts/architecture.md#State-Flow]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation-Patterns-&-Consistency-Rules]

## Dev Agent Record

### Agent Model Used

GPT-5.3 Codex

### Debug Log References

- Story created by create-story workflow.

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.
- Added natural language parse contracts, typed parse errors, deterministic transformation to ordered calculator operations, and validation guards.
- Added parser unit tests for single-step, multi-step order preservation, and ambiguous prompt failures.

### File List

- `_bmad-output/implementation-artifacts/4-2-natural-language-parsing-to-calculator-operations.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `src/lib/naturalLanguageParser.ts`
- `src/lib/naturalLanguageParser.test.ts`
- `src/lib/types.ts`
- `src/components/Calculator.svelte`

### Senior Developer Review (AI)

- Added explicit start-date intent extraction in parser output for typed contract completeness.
- Added AI-provider output adapter boundary with typed validation errors.
- Expanded parser tests for explicit intent and adapter mapping; story remains in-progress for final integrated validation.

