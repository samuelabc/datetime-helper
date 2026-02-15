# Story 8.1: Web Component Extraction (`<datetime-helper>`)

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a platform integrator,
I want datetime-helper available as an embeddable web component,
so that I can reuse the calculator in docs, internal dashboards, and other web apps.

## Acceptance Criteria

1. **Given** the project build pipeline runs, **When** web component packaging is enabled, **Then** it outputs a standards-based `<datetime-helper>` custom element bundle with documented import and usage instructions.
2. **Given** a host page includes the component, **When** it initializes, **Then** core calculator functionality (input, live results, copy actions) works without requiring framework-specific adapters.
3. **Given** host page styles differ from datetime-helper defaults, **When** the component renders, **Then** it avoids destructive style leakage and remains visually/functionally stable.
4. **Given** integrators pass initial state attributes or props, **When** the component mounts, **Then** it hydrates deterministically and reflects equivalent behavior to first-party URL/state initialization rules.

## Tasks / Subtasks

- [x] Task 1: Define custom element packaging strategy and build outputs (AC: #1)
  - [x] Add build target for custom element bundle
  - [x] Provide import and usage docs with examples
- [x] Task 2: Ensure runtime parity for embedded mode (AC: #2, #4)
  - [x] Support attribute/prop initialization mapping to calculator state
  - [x] Preserve copy/live/result behavior in host pages
- [x] Task 3: Implement style-isolation and compatibility checks (AC: #3)
  - [x] Prevent host CSS from breaking core component rendering
  - [x] Add embed-focused tests and sample host harness

## Dev Notes

### Story Dependencies

- Depends on stable calculator state model from Epics 1-3.
- Reuses URL/state initialization behavior from Epic 5 where applicable.

### Technical Requirements

- Web component must be framework-agnostic and easy to consume.
- Deterministic initialization and predictable lifecycle behavior required.

### Architecture Compliance

- Keep computation and parser layers unchanged; wrap only UI bootstrapping.
- Avoid forking calculator logic for web component mode.

### File Structure Requirements

- Modify likely files:
  - `package.json`
  - `astro.config.mjs`
  - `src/components/Calculator.svelte`
- Create likely files:
  - `src/web-component/datetime-helper-element.ts`
  - `src/web-component/datetime-helper-element.test.ts`
  - `docs/embed.md`
  - `examples/embed-host.html`

### Testing Requirements

- `pnpm test`
- Manual checks:
  - Embed works in a plain HTML page with no framework
  - Initial attributes hydrate expected calculator state
  - Host page CSS does not break key component visuals

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-8.1]
- [Source: _bmad-output/planning-artifacts/architecture.md#Project-Structure-&-Boundaries]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Component-Strategy]

## Dev Agent Record

### Agent Model Used

GPT-5.3 Codex

### Debug Log References

- Story created from Epic 8 implementation planning.

### Completion Notes List

- Story scaffold created for packaging, initialization parity, and style isolation.
- Added a standards-based `<datetime-helper>` custom element implementation and packaging script.
- Added attribute-based base URL/state mapping and isolation via shadow-root iframe host.
- Added embed docs, sample host page, and custom element tests.

### File List

- `_bmad-output/implementation-artifacts/8-1-web-component-extraction-datetime-helper.md`
- `package.json`
- `src/web-component/datetime-helper-element.ts`
- `src/web-component/datetime-helper-element.test.ts`
- `docs/embed.md`
- `examples/embed-host.html`
