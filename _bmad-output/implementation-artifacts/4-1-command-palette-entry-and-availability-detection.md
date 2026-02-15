# Story 4.1: Command Palette Entry and Availability Detection

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want to open a natural-language command palette quickly and understand whether AI is available,
so that I can start AI-assisted datetime input without breaking flow.

## Acceptance Criteria

1. **Given** the calculator page is loaded, **When** I press Cmd+K (or Ctrl+K on non-macOS), **Then** a command palette opens, focus moves to its input, and background content is dimmed but still visible.
2. **Given** the command palette is open, **When** I press Escape or click outside the panel, **Then** the palette closes and focus returns to the previously focused element.
3. **Given** the browser environment supports the configured AI provider, **When** the palette initializes, **Then** it shows ready state and accepts natural-language prompts.
4. **Given** the browser environment does not support the configured AI provider, **When** the palette initializes, **Then** it shows a non-blocking "AI unavailable" message and offers "use calculator directly" guidance.

## Tasks / Subtasks

- [x] Task 1: Implement command palette visibility, keyboard shortcut entry, and close behaviors (AC: #1, #2)
  - [x] Register Cmd+K/Ctrl+K shortcut without overriding browser-reserved shortcuts
  - [x] Open/close modal state with focus handoff and focus return
  - [x] Support Escape and backdrop click close paths
- [x] Task 2: Implement AI availability detection and user-facing states (AC: #3, #4)
  - [x] Add feature detection adapter for configured browser AI provider
  - [x] Render `ready` and `unavailable` states with clear inline guidance
  - [x] Keep core calculator usable when AI is unavailable
- [x] Task 3: Add accessibility and interaction tests (AC: #1-#4)
  - [x] Add component tests for open/close/focus behaviors
  - [x] Add E2E coverage for Cmd+K/Ctrl+K plus unavailable messaging

## Dev Notes

### Story Dependencies

- Epic 3 accessibility baseline is complete and must be preserved for overlay interactions.

### Technical Requirements

- Command palette is an accelerator only; calculator remains primary interaction path.
- Overlay must be non-blocking and short-lived with predictable keyboard behavior.

### Architecture Compliance

- Keep a single interactive island with state owned in `src/components/Calculator.svelte`.
- Use Svelte 5 runes; no new global store unless unavoidable.
- Keep Tailwind utility-class approach and semantic control patterns.

### File Structure Requirements

- Modify likely files:
  - `src/components/Calculator.svelte`
  - `src/components/Calculator.test.ts`
  - `e2e/accessibility.spec.ts`
- Create likely files:
  - `src/components/CommandPalette.svelte`
  - `src/components/CommandPalette.test.ts`
  - `src/lib/aiAvailability.ts`

### Testing Requirements

- `pnpm test`
- `pnpm test:e2e`
- Manual checks:
  - Cmd+K and Ctrl+K open behavior
  - Escape/backdrop close and focus return
  - AI unavailable fallback keeps calculator fully usable

### Git Intelligence Summary

- Recent commits show incremental, test-backed component work by epic.
- Follow current patterns: focused component changes with co-located tests.

### Latest Tech Information

- Keep implementation compatible with current Astro + Svelte stack; avoid introducing SDK lock-in in this story.
- Treat provider detection as an adapter boundary to support future AI provider changes.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-4.1]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#CommandPalette]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Overlay-Pattern]
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend-Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation-Patterns-&-Consistency-Rules]

## Dev Agent Record

### Agent Model Used

GPT-5.3 Codex

### Debug Log References

- Story created by create-story workflow.

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.
- Implemented command palette component with keyboard shortcut entry, focus return, Escape/backdrop close handling, and browser AI availability messaging.
- Added test coverage for command palette behavior and keyboard accessibility in unit and Playwright suites.

### File List

- `_bmad-output/implementation-artifacts/4-1-command-palette-entry-and-availability-detection.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `src/components/CommandPalette.svelte`
- `src/components/CommandPalette.test.ts`
- `src/lib/aiAvailability.ts`
- `src/components/Calculator.svelte`
- `e2e/accessibility.spec.ts`

### Senior Developer Review (AI)

- Fixed shortcut handling to avoid opening command palette while typing in editable controls.
- Strengthened AI availability detection to use provider-capability checks, reducing false-positive ready states.
- Story remains in-progress pending full end-to-end regression pass across all Epic 4 flows.

