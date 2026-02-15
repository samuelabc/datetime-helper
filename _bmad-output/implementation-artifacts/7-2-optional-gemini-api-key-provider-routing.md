# Story 7.2: Optional Gemini API Key & Provider Routing

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer outside supported on-device AI environments,
I want to provide an optional Gemini API key for AI parsing,
so that natural-language features still work when local browser AI is unavailable.

## Acceptance Criteria

1. **Given** local browser AI is unavailable, **When** I open AI settings, **Then** I can add or remove an optional Gemini API key stored locally on-device (not sent to project-owned servers).
2. **Given** a valid optional key is configured, **When** I submit a natural-language prompt, **Then** parsing routes to the configured provider and returns the same structured operation schema used by local AI mode.
3. **Given** the optional key is missing, invalid, or rate-limited, **When** parsing is attempted, **Then** the UI shows clear inline error feedback and keeps prior calculator state unchanged.
4. **Given** I clear the configured key, **When** I submit future prompts, **Then** the app reverts to local provider detection and graceful fallback messaging.

## Tasks / Subtasks

- [x] Task 1: Add optional API key settings model and local persistence (AC: #1, #4)
  - [x] Add local key storage helper and secure retrieval guardrails
  - [x] Add add/remove settings UI and validation hints
- [x] Task 2: Implement provider routing and unified parser contract (AC: #2)
  - [x] Route request to local provider or remote Gemini based on availability/settings
  - [x] Normalize provider outputs to existing calculator operation schema
- [x] Task 3: Add robust error handling and tests (AC: #3, #4)
  - [x] Surface typed provider errors with inline guidance
  - [x] Ensure prior calculator state remains unchanged on failure

## Dev Notes

### Story Dependencies

- Depends on Story 4.1 availability detection and Story 4.2 parser contract.

### Technical Requirements

- Optional API key remains local and user-controlled.
- No new backend service introduced; direct provider call path only.

### Architecture Compliance

- Keep provider selection logic in adapter/service layer under `src/lib`.
- Avoid leaking key material into logs, URL state, or telemetry payloads.
- Maintain single calculator state mutation path.

### File Structure Requirements

- Modify likely files:
  - `src/lib/aiAvailability.ts`
  - `src/lib/naturalLanguageParser.ts`
  - `src/lib/aiRequestController.ts`
  - `src/components/CommandPalette.svelte`
- Create likely files:
  - `src/lib/aiProviderRouter.ts`
  - `src/lib/aiProviderRouter.test.ts`
  - `src/lib/aiSettings.ts`
  - `src/lib/aiSettings.test.ts`
  - `src/components/AISettingsPanel.svelte`
  - `src/components/AISettingsPanel.test.ts`

### Testing Requirements

- `pnpm test`
- Manual checks:
  - Configure key and parse successfully in non-local-AI environment
  - Invalid key path shows error and preserves calculator state
  - Remove key returns to local detection behavior

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-7.2]
- [Source: _bmad-output/planning-artifacts/prd.md#Vision-Phase-3-Platform]
- [Source: _bmad-output/planning-artifacts/architecture.md#Error-Handling]

## Dev Agent Record

### Agent Model Used

GPT-5.3 Codex

### Debug Log References

- Story created from Epic 7 implementation planning.

### Completion Notes List

- Story scaffold created with provider routing and local-key constraints.
- Added local-only AI settings persistence, add/remove key UI, and guarded key retrieval.
- Implemented provider routing to local parser first and Gemini fallback using typed provider errors.
- Kept calculator mutation path atomic so failures preserve prior state.

### File List

- `_bmad-output/implementation-artifacts/7-2-optional-gemini-api-key-provider-routing.md`
- `src/lib/aiSettings.ts`
- `src/lib/aiSettings.test.ts`
- `src/lib/aiProviderRouter.ts`
- `src/lib/aiProviderRouter.test.ts`
- `src/components/AISettingsPanel.svelte`
- `src/components/AISettingsPanel.test.ts`
- `src/components/CommandPalette.svelte`
- `src/components/CommandPalette.test.ts`
- `src/components/Calculator.svelte`
