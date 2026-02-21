# Embed datetime-helper

Use the custom element bundle to embed datetime-helper in any host page.

## Install

```html
<script type="module" src="/dist/datetime-helper-element.js"></script>
```

Build the bundle with:

```bash
pnpm build:web-component
```

## Usage

```html
<datetime-helper base-url="https://your-domain.example/" state="s=now&o0=add%3A1%3Adays"></datetime-helper>
```

- `base-url`: App URL to open inside the component frame (`http`/`https` only).
- `state`: Optional encoded URL state query string (same format as share links).

The component isolates host-page styles by rendering in a shadow-root iframe.

## Related docs

- Developer workflows: `/docs/developer-workflows`
- Automation URL contract: `/docs/automation-url-contract`
- AI palette usage: `/docs/ai-palette-usage`
