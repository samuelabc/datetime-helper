# datetime-helper

Unix timestamp calculator and date math toolkit.

`datetime-helper` is a fast, single-page utility for developers who need datetime math and copy-ready outputs in one place.

## Documentation

- Docs hub (web): `/docs`
- Developer workflows: `src/pages/docs/developer-workflows.md`
- Automation URL contract: `src/pages/docs/automation-url-contract.md`
- AI palette usage: `src/pages/docs/ai-palette-usage.md`
- Embedding guide: `docs/embed.md`

## Quick start

1. Open the app.
2. Keep `Start Date` as `now` or enter an explicit date.
3. Add one or more operations.
4. Copy Unix timestamp, ISO 8601, RFC 2822, or local output.

## Local development

```bash
pnpm install
pnpm dev
```

## Key capabilities

- Live Unix timestamp and multi-format output
- Date math with chained operations
- URL state encoding for share links and automation
- Reverse decode mode for pasted datetime values
- Optional AI command palette (Gemini key)
- Timezone, countdown, and cron helper tools
