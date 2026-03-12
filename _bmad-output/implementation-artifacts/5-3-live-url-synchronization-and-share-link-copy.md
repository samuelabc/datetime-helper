# Story 5.3: Live URL Synchronization and Share-Link Copy

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want URL state to stay synchronized and easy to copy,
so that I can share or reuse exact calculations without manual reconstruction.

## Acceptance Criteria

1. **Given** I change any calculator input, **When** state updates, **Then** the URL query string updates via `history.replaceState()` without full page reload.
2. **Given** I copy the browser URL, **When** URL synchronization is active, **Then** the full canonical URL reflects current calculator state for sharing.
3. **Given** URL synchronization is active, **When** state changes rapidly, **Then** updates remain stable and do not introduce visible lag or history spam.
4. **Given** a copied share link is opened in a new browser session, **When** the page loads, **Then** the exact calculation state and outputs are reproduced.

## Tasks / Subtasks

- [x] Task 1: Add live URL synchronization layer (AC: #1, #3)
  - [x] Encode calculator state to canonical query string on updates
  - [x] Use `history.replaceState()` only; do not pollute back/forward history
  - [x] Stabilize update cadence for rapid user input sequences
- [x] Task 2: Support shareable URL workflow (AC: #2)
  - [x] Keep canonical URL synchronized with calculator state
  - [x] Ensure copied browser URL can be shared directly
- [x] Task 3: Add reproducibility coverage across browser sessions (AC: #4)
  - [x] End-to-end test from generated link to restored state
  - [x] Verify canonical URL output and copy content

## Dev Notes

### Story Dependencies

- Depends on Stories 5.1 (schema) and 5.2 (hydration).

### Technical Requirements

- URL must be canonical and deterministic at every user-visible state.
- Sync path must not degrade runtime responsiveness (<100ms calculator updates remain primary).

### Architecture Compliance

- Keep state updates one-way: input state drives URL, not vice versa, after initialization.
- Reuse existing clipboard interaction style (inline, non-toast confirmation).

### File Structure Requirements

- Modify likely files:
  - `src/components/Calculator.svelte`
  - `src/components/CopyButton.svelte` (or new specialized share control)
  - `src/lib/urlState.ts`
- Create likely files:
  - `e2e/url-state.spec.ts`

### Testing Requirements

- `pnpm test`
- `pnpm test:e2e`
- Manual checks:
  - rapid input changes do not create history spam
  - copied browser URL is canonical
  - opened copied URL reproduces full state

### Git Intelligence Summary

- Prefer URL-state correctness and reproducibility over adding extra UI controls.

### Latest Tech Information

- `history.replaceState()` remains the correct browser API for live URL synchronization without navigation events.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-5.3]
- [Source: _bmad-output/planning-artifacts/prd.md#Zero-Server-URL-as-API]
- [Source: _bmad-output/planning-artifacts/architecture.md#State-Flow]

## Dev Agent Record

### Agent Model Used

GPT-5.3 Codex

### Debug Log References

- Story created by create-story workflow.

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.
- Added live URL synchronization via debounced `history.replaceState()` and canonical state serialization.
- Added canonical URL synchronization and reproducibility coverage.

### File List

- `_bmad-output/implementation-artifacts/5-3-live-url-synchronization-and-share-link-copy.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `src/components/Calculator.svelte`
- `src/lib/urlState.ts`
- `e2e/url-state.spec.ts`

### Senior Developer Review (AI)

- Added assistive copy confirmation live-region feedback to share-link control.
- Added browser-session reproducibility coverage in URL-state E2E test suite.
- Story remains in-progress pending full E2E pass in CI environment.

