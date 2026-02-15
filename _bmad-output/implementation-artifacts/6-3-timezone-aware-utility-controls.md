# Story 6.3: Timezone-Aware Utility Controls

Status: in-progress

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer working across regions,
I want timezone-aware display controls for advanced inspection,
so that I can reason about the same instant in context without external tools.

## Acceptance Criteria

1. **Given** timezone controls are available, **When** I choose UTC or Local display mode, **Then** output labels and values reflect the selected context consistently.
2. **Given** I select a supported IANA timezone (if enabled in this phase), **When** results render, **Then** displayed local-human context updates to that timezone while preserving the same instant.
3. **Given** timezone selection changes, **When** I copy any output value, **Then** copied content matches the currently displayed timezone context.
4. **Given** timezone controls are unsupported in a constrained environment, **When** feature detection runs, **Then** controls degrade gracefully to UTC/Local baseline without blocking core calculator usage.

## Tasks / Subtasks

- [x] Task 1: Add timezone control model and display-state integration (AC: #1, #2)
  - [x] Add UTC/Local baseline mode control
  - [x] Optionally add IANA selection model behind capability flag
  - [x] Ensure same instant is preserved while display context changes
- [x] Task 2: Align copy behavior with timezone context (AC: #3)
  - [x] Ensure copied output always reflects current display mode/zone
  - [x] Add format labeling updates for selected timezone
- [x] Task 3: Add feature-detection fallback and tests (AC: #4)
  - [x] Detect constrained environments and degrade safely
  - [x] Keep core calculator and existing copy flows fully functional

## Dev Notes

### Story Dependencies

- Depends on reverse decode/snap operation foundation only if those features share output-format layers.

### Technical Requirements

- Preserve instant identity across timezone rendering choices.
- Avoid misleading label/value combinations by updating both together.

### Architecture Compliance

- Centralize timezone context in calculator state; avoid ad-hoc per-row timezone logic.
- Keep Wasm/format boundary explicit; do not leak timezone conversion hacks into UI components.

### File Structure Requirements

- Modify likely files:
  - `src/components/Calculator.svelte`
  - `src/components/HeroResultRow.svelte`
  - `src/components/ResultRow.svelte`
  - `src/lib/types.ts`
- Create likely files:
  - `src/components/TimezoneControls.svelte`
  - `src/components/TimezoneControls.test.ts`
  - `src/lib/timezoneContext.ts`
  - `src/lib/timezoneContext.test.ts`

### Testing Requirements

- `pnpm test`
- Manual checks:
  - UTC vs Local mode correctness
  - copy output matches current timezone context
  - constrained environment fallback path

### Git Intelligence Summary

- Keep timezone support incremental, starting with UTC/Local baseline before broad IANA mode.

### Latest Tech Information

- Prefer `Intl` timezone capabilities for display-layer rendering when environment supports it.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-6.3]
- [Source: _bmad-output/planning-artifacts/architecture.md#Correctness]
- [Source: _bmad-output/planning-artifacts/prd.md#NFR14]

## Dev Agent Record

### Agent Model Used

GPT-5.3 Codex

### Debug Log References

- Story created by create-story workflow.

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.
- Added timezone control model (UTC/Local baseline + optional IANA) and display-context formatting while preserving instant identity.
- Updated output labeling and copy-path consistency with timezone context plus utility tests.

### File List

- `_bmad-output/implementation-artifacts/6-3-timezone-aware-utility-controls.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `src/components/TimezoneControls.svelte`
- `src/components/TimezoneControls.test.ts`
- `src/lib/timezoneContext.ts`
- `src/lib/timezoneContext.test.ts`
- `src/components/Calculator.svelte`

### Senior Developer Review (AI)

- Added missing timezone-controls component test coverage for mode and IANA selector behavior.
- Preserved timezone-context formatting pipeline with updated validation and regression checks.
- Story remains in-progress pending full-story integration validation in CI/browser matrix.

