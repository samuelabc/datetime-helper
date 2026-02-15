# Story 8.2: Cron Job Debugger Utility

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a backend engineer,
I want cron schedule debugging features adjacent to datetime calculations,
so that I can reason about execution windows and timestamps in one workflow.

## Acceptance Criteria

1. **Given** I enter a cron expression and reference timezone, **When** the cron utility evaluates it, **Then** it displays upcoming run instants and corresponding Unix timestamps using the same formatting/copy patterns as core results.
2. **Given** an invalid cron expression is provided, **When** validation runs, **Then** inline error feedback appears with no crash and prior valid outputs remain visible.
3. **Given** I select any computed run instant, **When** I apply it to calculator state, **Then** the base date/time updates and downstream operations recalculate immediately.
4. **Given** cron debugger is not needed, **When** the feature is collapsed or disabled, **Then** the main calculator remains uncluttered and performance budgets are preserved.

## Tasks / Subtasks

- [x] Task 1: Add cron parse/evaluation utility with timezone support (AC: #1, #2)
  - [x] Add expression validation and next-run computation
  - [x] Keep invalid-expression handling inline and non-destructive
- [x] Task 2: Integrate cron results with calculator state (AC: #3)
  - [x] Add "use this run" action to set calculator base time
  - [x] Trigger standard recalculation flow and preserve editability
- [x] Task 3: Implement opt-in/collapsible UX and performance guardrails (AC: #4)
  - [x] Keep cron UI collapsed/hidden by default
  - [x] Add tests for disabled mode and no-regression render cost

## Dev Notes

### Story Dependencies

- Builds on timezone and formatting capabilities from Epic 6.
- Must preserve main calculator speed and clarity from Epics 1-3.

### Technical Requirements

- Cron parsing should be deterministic and timezone-aware.
- Utility mode must not degrade default workflow performance.

### Architecture Compliance

- Isolate cron logic in `src/lib`; avoid spreading parsing across components.
- Reuse existing result-row and copy interaction patterns.

### File Structure Requirements

- Modify likely files:
  - `src/components/Calculator.svelte`
  - `src/components/ResultRow.svelte`
  - `src/lib/types.ts`
- Create likely files:
  - `src/components/CronDebugger.svelte`
  - `src/components/CronDebugger.test.ts`
  - `src/lib/cronDebugger.ts`
  - `src/lib/cronDebugger.test.ts`

### Testing Requirements

- `pnpm test`
- Manual checks:
  - Valid cron expressions show deterministic upcoming runs
  - Invalid expression path preserves prior valid outputs
  - Applying a run instant updates calculator immediately

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-8.2]
- [Source: _bmad-output/planning-artifacts/prd.md#Vision-Phase-3-Platform]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Flow-Optimization-Principles]

## Dev Agent Record

### Agent Model Used

GPT-5.3 Codex

### Debug Log References

- Story created from Epic 8 implementation planning.

### Completion Notes List

- Story scaffold created for cron parsing, calculator integration, and collapsed utility UX.
- Added deterministic cron parser/evaluator utility with typed invalid-expression errors.
- Added collapsible `CronDebugger` UI with inline validation and non-destructive failure path.
- Added "Use this run" integration to update base datetime and recalculate calculator outputs.

### File List

- `_bmad-output/implementation-artifacts/8-2-cron-job-debugger-utility.md`
- `src/lib/cronDebugger.ts`
- `src/lib/cronDebugger.test.ts`
- `src/components/CronDebugger.svelte`
- `src/components/CronDebugger.test.ts`
- `src/components/Calculator.svelte`
