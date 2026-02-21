---
layout: ../../layouts/DocsLayout.astro
title: Developer Workflows | datetime-helper docs
description: Practical workflows for using datetime-helper as a developer.
---

# Developer Workflows

Who this is for: developers who need fast datetime calculations during debugging, SQL work, ops, and testing.

Estimated read time: 3 minutes.

![Calculator overview example](/docs-examples/app-calculator-overview.png)

Example view: calculator input controls on the left and copy-ready outputs on the right.

## Get current Unix timestamp

1. Open the app.
2. Leave `Start Date` as `now`.
3. Copy the Unix value from the hero result row.

Use this when you need a timestamp immediately for logs, filters, or ticket notes.

## Perform date math

1. Keep `Start Date` as `now` or enter a specific date.
2. In `Operations`, choose:
   - direction (`add` or `subtract`)
   - amount (integer)
   - unit (days, months, years, and more)
3. Add additional rows for chained steps.
4. Copy your target output format.

Example: subtract 7 days from now for a SQL cutoff window.

## Decode mode (reverse lookup)

1. Switch to `Decode`.
2. Paste a timestamp or datetime value.
3. Review converted outputs in all formats.

Use this for inspecting values pulled from logs, payloads, and database records.

## Output formats

- `Unix Timestamp`: primary backend/API copy target
- `ISO 8601`: machine-safe datetime format
- `RFC 2822`: email/header-oriented format
- `Local Time`: readable display in selected timezone context

## Power features

- `Share link`: copy URL with encoded calculator state
- `Install bookmarklet`: launch with saved state from any page
- `Timezone controls`: use UTC, local, or IANA modes
- `Cron debugger`: preview next run times
- `Countdown`: set current result as target

## AI command palette (optional)

- Open with `Cmd/Ctrl + K`
- Enter operation-oriented prompt text
- Requires optional Gemini key in AI settings

Related: `/docs/ai-palette-usage`

## Validation behavior

- Invalid dates show inline feedback
- Last valid result remains visible during invalid input
- Empty start date reverts to `now` on blur
- Invalid URL state falls back safely to defaults

## Practical recommendations

- Use explicit start dates for deterministic results in PRs/runbooks
- Use share links for handoff and auditability
- Keep long chains readable by splitting intent into clear steps
