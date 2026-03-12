# Story 8.3: Countdown / Time-Until and Share Launch

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer in fast operational workflows,
I want countdown/time-until outputs and a share-link entry point,
so that I can launch and use datetime-helper from any context in seconds.

## Acceptance Criteria

1. **Given** I choose a target instant, **When** countdown mode is active, **Then** the app shows deterministic "time until" and "time since" representations alongside standard format outputs.
2. **Given** countdown values update over time, **When** live updates run, **Then** they respect reduced-motion and accessibility constraints and avoid layout jank.
3. **Given** share-link launch state is present, **When** datetime-helper opens, **Then** it restores encoded context/state when valid and gracefully falls back to default "now" state when invalid.

## Tasks / Subtasks

- [x] Task 1: Add countdown/time-until calculation and display model (AC: #1)
  - [x] Add deterministic countdown formatter utilities
  - [x] Integrate outputs into existing result hierarchy without clutter
- [x] Task 2: Implement live updates with accessibility-safe behavior (AC: #2)
  - [x] Respect reduced-motion preferences and live-region throttling
  - [x] Ensure no layout jank from ticking updates
- [x] Task 3: Add share-link launch flow and fallback handling (AC: #3)
  - [x] Preserve URL encoding rules for launch state
  - [x] Parse inbound context safely with graceful fallback to default state

## Dev Notes

### Story Dependencies

- Depends on URL encoding/state hydration capabilities from Epic 5.
- Reuses live-update and accessibility patterns from Epics 1 and 3.

### Technical Requirements

- Countdown output must be deterministic and testable.
- Share-link path must remain optional and non-intrusive.

### Architecture Compliance

- Keep countdown math in `src/lib` utilities, not inline in components.
- Reuse existing URL-state decode path where possible.

### File Structure Requirements

- Modify likely files:
  - `src/components/Calculator.svelte`
  - `src/lib/urlState.ts`
  - `src/lib/types.ts`
- Create likely files:
  - `src/components/CountdownPanel.svelte`
  - `src/components/CountdownPanel.test.ts`
  - `src/lib/countdown.ts`
  - `src/lib/countdown.test.ts`

### Testing Requirements

- `pnpm test`
- Manual checks:
  - Countdown values render and tick predictably
  - Reduced-motion mode suppresses motion-heavy transitions
  - Share link opens app with encoded state when available
  - Invalid launch context falls back cleanly to default state

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-8.3]
- [Source: _bmad-output/planning-artifacts/prd.md#Vision-Phase-3-Platform]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Effortless-Interactions]

## Dev Agent Record

### Agent Model Used

GPT-5.3 Codex

### Debug Log References

- Story created from Epic 8 implementation planning.

### Completion Notes List

- Story scaffold created for countdown utilities and share launch path.
- Added deterministic countdown utility and lightweight countdown result panels.
- Added reduced-motion-safe countdown tick behavior with non-janky text updates.
- Consolidated around share-link launch using existing URL-encoded state.

### File List

- `src/lib/countdown.ts`
- `src/lib/countdown.test.ts`
- `src/components/CountdownPanel.svelte`
- `src/components/CountdownPanel.test.ts`
- `src/components/Calculator.svelte`
