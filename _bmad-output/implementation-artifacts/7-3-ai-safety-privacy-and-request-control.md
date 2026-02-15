# Story 7.3: AI Safety, Privacy, and Request Control

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a privacy-conscious developer,
I want explicit controls over AI request behavior,
so that I can use AI acceleration without losing data or execution safety.

## Acceptance Criteria

1. **Given** multiple prompts are submitted in rapid succession, **When** requests overlap, **Then** prior in-flight requests are cancelled and only the latest successful response can mutate calculator state.
2. **Given** AI request/response handling runs, **When** sensitive input handling policy is applied, **Then** no prompt or response content is persisted beyond session-scoped state unless explicitly user-enabled.
3. **Given** an AI request fails due to timeout or network/provider error, **When** failure is returned, **Then** the app surfaces a typed error with retry guidance and preserves current calculator outputs.
4. **Given** AI behavior telemetry is enabled for diagnostics, **When** events are emitted, **Then** they contain only operational metadata (timing/status/source) and exclude raw prompt content by default.

## Tasks / Subtasks

- [x] Task 1: Harden request concurrency and cancellation semantics (AC: #1)
  - [x] Enforce latest-request-wins mutation policy
  - [x] Add explicit cancellation hooks for in-flight requests
- [x] Task 2: Implement privacy-safe persistence and telemetry policy (AC: #2, #4)
  - [x] Restrict storage to session-scoped state unless opt-in is enabled
  - [x] Emit redacted telemetry payloads with operational metadata only
- [x] Task 3: Improve typed error and retry UX path (AC: #3)
  - [x] Normalize timeout/network/provider errors
  - [x] Add retry guidance and non-destructive failure handling

## Dev Notes

### Story Dependencies

- Depends on existing `aiRequestController` behavior from Epic 4.
- Aligns with optional provider routing from Story 7.2.

### Technical Requirements

- Cancellation must prevent stale responses from mutating calculator state.
- Privacy defaults are strict; opt-in toggles must be explicit and reversible.

### Architecture Compliance

- Keep request orchestration in `src/lib/aiRequestController.ts`.
- Keep UI concerns in command palette and helper components.
- Preserve typed boundaries and avoid `any`.

### File Structure Requirements

- Modify likely files:
  - `src/lib/aiRequestController.ts`
  - `src/lib/aiRequestController.test.ts`
  - `src/components/CommandPalette.svelte`
- Create likely files:
  - `src/lib/aiTelemetry.ts`
  - `src/lib/aiTelemetry.test.ts`
  - `src/lib/aiPrivacyPolicy.ts`
  - `src/lib/aiPrivacyPolicy.test.ts`

### Testing Requirements

- `pnpm test`
- Manual checks:
  - Rapid prompt submissions only apply final response
  - Timeout/provider errors preserve prior outputs and show retry guidance
  - Telemetry payloads never include raw prompt content by default

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-7.3]
- [Source: _bmad-output/planning-artifacts/architecture.md#Error-Handling]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation-Patterns-&-Consistency-Rules]

## Dev Agent Record

### Agent Model Used

GPT-5.3 Codex

### Debug Log References

- Story created from Epic 7 implementation planning.

### Completion Notes List

- Story scaffold created with cancellation, privacy defaults, and telemetry constraints.
- Added abort-driven request cancellation with latest-request-wins behavior in request controller and calculator flow.
- Added explicit privacy policy utility so prompt persistence is opt-in only.
- Added telemetry utility that records operational metadata only (source/status/duration) without prompt content.

### File List

- `_bmad-output/implementation-artifacts/7-3-ai-safety-privacy-and-request-control.md`
- `src/lib/aiRequestController.ts`
- `src/lib/aiRequestController.test.ts`
- `src/lib/aiPrivacyPolicy.ts`
- `src/lib/aiPrivacyPolicy.test.ts`
- `src/lib/aiTelemetry.ts`
- `src/lib/aiTelemetry.test.ts`
- `src/lib/aiProviderRouter.ts`
- `src/components/Calculator.svelte`
