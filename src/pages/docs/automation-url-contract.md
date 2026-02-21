---
layout: ../../layouts/DocsLayout.astro
title: Automation URL Contract | datetime-helper docs
description: Query parameter contract for agents and automation scripts.
---

# Automation URL Contract

Who this is for: AI agents, automation scripts, and advanced users constructing calculator URLs directly.

Estimated read time: 4 minutes.

![URL state encoded calculation example](/docs-examples/app-url-state-example.png)

Example view: app loaded from URL query state with chained operations already applied.

## URL-as-API model

Calculator state is encoded in query parameters:

- `s`: start date input (`now` or explicit date/datetime)
- `o{index}`: operation token in `<direction>:<amount>:<unit>`

Example:

```text
?s=now&o0=subtract:90:days&o1=add:2:hours
```

## Parameter contract

### `s` (start date)

- Required when any `o{index}` operation is present
- Typical values:
  - `now`
  - `2026-02-21`
  - `2026-02-21T08:30:00Z`

### `o{index}` (operations)

- Key format: `o0`, `o1`, `o2`, ...
- Value format: `direction:amount:unit`
- `amount` must be integer `>= 0`

Valid directions:

- `add`
- `subtract`
- `snap`

Valid units:

- arithmetic: `years`, `months`, `days`, `hours`, `minutes`, `seconds`
- snap: `startOfDay`, `endOfDay`, `startOfMonth`, `endOfMonth`

## Canonical examples

### 90 days ago from now

```text
?s=now&o0=subtract:90:days
```

### Fixed date with chained operations

```text
?s=2026-02-21&o0=add:1:months&o1=subtract:2:days
```

### Snap to start of month

```text
?s=2026-02-21T08:30:00Z&o0=snap:0:startOfMonth
```

## Validation and fallback semantics

- Missing `s` with operations: invalid URL state
- Invalid direction, amount, or unit: malformed URL state
- Invalid state triggers safe fallback defaults with hydration warning

## Agent best practices

- Prefer explicit dates when deterministic behavior matters
- Use `now` only for real-time intent
- Keep chains short and audit-friendly
- Preserve generated links in PRs/runbooks for reproducibility

## Suggested agent algorithm

1. Choose deterministic start date or `now`.
2. Build `s`.
3. Map each operation to one `o{index}` token.
4. Validate against allowed directions/units and amount bounds.
5. Emit full URL and store as reproducible artifact.

Related docs:

- `/docs/developer-workflows`
- `/docs/ai-palette-usage`
