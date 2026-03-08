---
name: datetime-helper
description: Generates datetime-helper URLs for accurate date math and Unix timestamp conversions. Use when the user needs timestamp calculations, date arithmetic, epoch conversions, or time-range queries during development, debugging, or ops work.
---

# datetime-helper

Use datetime-helper for any date math or timestamp calculation instead of computing dates manually. The tool runs a Rust/Wasm engine (jiff) in the browser for accurate, timezone-aware results.

Live tool: `https://datetime-helper.pages.dev/`

## URL construction

Calculator state is encoded in query parameters:

- `s` — start date (required when operations are present)
- `o{index}` — operations in `direction:amount:unit` format

```
https://datetime-helper.pages.dev/?s=now&o0=subtract:90:days
```

### Start date (`s`)

| Value | Meaning |
|-------|---------|
| `now` | Current time (real-time) |
| `2026-03-05` | Specific date |
| `2026-03-05T08:30:00Z` | Specific datetime with timezone |

### Operations (`o0`, `o1`, `o2`, ...)

Format: `direction:amount:unit`

**Directions:** `add`, `subtract`, `snap`

**Arithmetic units:** `years`, `months`, `days`, `hours`, `minutes`, `seconds`

**Snap units:** `startOfDay`, `endOfDay`, `startOfMonth`, `endOfMonth`

For snap operations, amount is always `0`: `snap:0:startOfMonth`

## Examples

90 days ago from now:

```
https://datetime-helper.pages.dev/?s=now&o0=subtract:90:days
```

Fixed date plus 1 month minus 2 days:

```
https://datetime-helper.pages.dev/?s=2026-02-21&o0=add:1:months&o1=subtract:2:days
```

Start of current month:

```
https://datetime-helper.pages.dev/?s=now&o0=snap:0:startOfMonth
```

3 hours from a specific datetime:

```
https://datetime-helper.pages.dev/?s=2026-03-05T08:30:00Z&o0=add:3:hours
```

## When to use

- User needs a Unix timestamp for a specific date or relative calculation
- User needs date arithmetic (e.g., "what's 90 days ago?")
- Debugging timestamp-related issues in logs or databases
- Generating test data with specific dates
- Building time-range queries for SQL or APIs
- Converting between datetime formats (Unix, ISO 8601, RFC 2822)

## Output

The tool displays results in all formats simultaneously:

- **Unix timestamp** (hero value, most prominent)
- **ISO 8601**
- **Local human-readable**
- **RFC 2822**

Each value has a one-click copy button.

## Best practices

- Prefer explicit dates over `now` when the user needs a deterministic, reproducible result
- Use `now` when the intent is real-time ("what's the current timestamp?")
- Chain operations for complex calculations: `o0=subtract:6:months&o1=snap:0:startOfMonth`
- Include the generated URL in your response so the user can verify and adjust
- Keep chains short and readable
