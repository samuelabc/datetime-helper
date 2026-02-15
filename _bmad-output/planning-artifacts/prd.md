---
stepsCompleted:
  - step-01-init
  - step-02-discovery
  - step-03-success
  - step-04-journeys
  - step-05-domain-skipped
  - step-06-innovation
  - step-07-project-type
  - step-08-scoping
  - step-09-functional
  - step-10-nonfunctional
  - step-11-polish
classification:
  projectType: web_app
  domain: general_developer_tooling
  complexity: low
  projectContext: greenfield
inputDocuments:
  - '_bmad-output/planning-artifacts/product-brief-datetime-helper-2026-02-13.md'
  - '_bmad-output/brainstorming/brainstorming-session-2026-02-12.md'
  - '_bmad-output/planning-artifacts/ux-design-specification.md'
documentCounts:
  briefs: 1
  research: 0
  brainstorming: 1
  uxDesign: 1
  projectDocs: 0
workflowType: 'prd'
---

# Product Requirements Document - datetime-helper

**Author:** Samuel
**Date:** 2026-02-14

## Executive Summary

datetime-helper is a single-page developer utility that combines date math calculation with multi-format output — critically including Unix timestamps — in one frictionless interface. It eliminates the multi-site workflow developers currently endure: epochconverter.com for timestamps, timeanddate.com for date math, and copy-pasting between them.

**Problem:** Backend and DevOps engineers regularly need datetime calculations with Unix timestamp output. No single tool handles both. Developers lose focus and time bouncing between 2-3 websites for a single operation during debugging, query writing, testing, and log analysis.

**Solution:** A structured date calculator where every input change produces instant results in Unix timestamp, ISO 8601, RFC 2822, and local human-readable formats. One-click copy. No submit buttons, no form filling, no second tab.

**Key Differentiators:**
- **Calculator-first architecture** — The structured calculator is the source of truth. Chrome AI (post-MVP) translates natural language into visible, editable calculator steps. Fully functional without AI.
- **Rust/Wasm for correctness** — jiff library handles DST, leap years, and calendar edge cases. Single computation engine, no JS datetime logic.
- **Zero-server, instant-loading** — Static site on Cloudflare CDN. No API server, no cold starts, no cost.

**Target User:** "The Timestamp Wrangler" — backend engineers, DevOps engineers, DBAs, and SREs who work with Unix timestamps daily. They already know what timestamps are; they need speed, not education.

**North Star Metric:** Page load to copied result in under 5 seconds.

**Tech Stack:** Astro + Rust/Wasm (jiff) + Tailwind CSS + Cloudflare Pages.

## Success Criteria

### User Success

- **Core task completion under 5 seconds** — Page load to copied result. If it takes longer, the tool has failed its purpose.
- **Single-tab workflow** — No user needs a second website to complete a datetime-to-Unix-timestamp operation.
- **Return usage** — Users come back via bookmark or direct navigation. 30%+ returning visitors by month 6.
- **Zero learning curve** — Self-evident on first visit. If a user has to figure out how it works, the design has failed.

### Business Success

| Timeframe | Objective |
|-----------|-----------|
| 1 month | Samuel uses datetime-helper as personal default tool, fully replacing the multi-site workflow |
| 3 months | Steady organic traffic from search. Tool ranks for "unix timestamp calculator" and "date math unix timestamp" |
| 6 months | 30%+ return visitor rate — the tool has earned a permanent spot in workflows |
| 12 months | Measurable monthly volume. AI agents constructing datetime-helper URLs — composable utility in the developer ecosystem |

### Technical Success

- Page load under 1 second (Lighthouse Performance > 95)
- Calculator operations under 100ms
- Datetime correctness: DST, leap years, calendar arithmetic handled by jiff
- Zero server infrastructure: static site, no API server, no ongoing cost

### Measurable Outcomes

| KPI | Measurement | Target |
|-----|-------------|--------|
| Task completion time | Page load to first copy action | < 5 seconds |
| Dogfooding adoption | Creator stops using other datetime tools | Within 1 month |
| Monthly visits | Cloudflare analytics | Growth trend MoM |
| Return visitor rate | Returning vs new visitors | > 30% by month 6 |
| Shared/agent URLs | Requests with non-empty query parameters | Upward trend |
| Page load time | Lighthouse / Web Vitals | < 1 second TTI |
| Calculation latency | Input change to result display | < 100ms |

## Product Scope

### MVP (Phase 1)

The smallest version that solves the core problem: **one tool, one tab, one answer.**

| Capability | Rationale |
|-----------|-----------|
| Structured date calculator (single operation) | Core interaction — add/subtract days, months, years from a start date |
| Multi-format output (Unix, ISO 8601, RFC 2822, local) | The differentiator — all formats in one place, Unix as hero |
| Live calculation (no submit button) | Defining experience — input changes produce instant results |
| "Now" default with live-ticking Unix timestamp | Zero-interaction value on page load |
| One-click copy per format | The hero interaction — value to clipboard in one action |
| Arbitrary start date entry | Supports all four MVP user journeys |
| Inline error handling | Non-blocking validation, instant recovery |
| Dark/light mode (system preference) | Developer expectation, Tailwind built-in |
| Rust/Wasm engine (jiff) | Single source of truth for datetime correctness |
| Static site on Cloudflare Pages | Zero-server, instant loading, zero cost |
| GitHub Actions CI/CD | Automated build and deploy pipeline |

**MVP Strategy:** Problem-solving MVP built by a solo developer (Samuel) who is also the first user. Weeks-not-months timeline. Validation: dogfooding first, organic traffic second.

**User Journeys Supported:** Debugging Session, Quick Lookup, Error Recovery, Edge Case Generation.

### Growth (Phase 2 — AI + Sharing)

| Feature | Dependencies |
|---------|-------------|
| Chrome AI natural language input (Cmd+K) | Calculator must be stable first |
| Query parameter state encoding | Defines the URL-as-API contract |
| Shareable URLs (copy as link) | Requires query param encoding |
| Chainable operation steps | Extends single-operation calculator |
| Snap-to operations (start/end of day/week/month) | Extends operation types |
| Keyboard-first navigation | UX polish layer |
| Reverse mode (paste timestamp → decode) | New input paradigm, same engine |

### Vision (Phase 3 — Platform)

| Feature | Rationale |
|---------|-----------|
| AI confidence diff | Advanced AI trust layer |
| Optional Gemini API key | Broader browser AI support |
| Timezone picker UI | Beyond UTC + local |
| Web component extraction | `<datetime-helper>` embeddable |
| Cron job debugger | Adjacent developer tool |
| Countdown / time-until calculator | Reverse direction use case |
| Datetime bookmarklet | Tool goes to the developer |

## User Journeys

### Journey 1: The Debugging Session — "What time was that record created?"

**Persona:** Marcus, a mid-level backend engineer at a fintech startup. Investigating a duplicate payment bug — three tabs deep in database queries, Slack messages piling up, working memory full of transaction IDs.

**Opening Scene:** Marcus is staring at `created_at: 1738886400`. He needs the Unix timestamp for "7 days ago" to pull all related records.

**Rising Action:** He opens datetime-helper. The page loads instantly — current Unix timestamp ticking in large orange text. He leaves start date as "now," selects "subtract," types "7," picks "days." Results snap into place — all formats updated simultaneously. No submit button, no spinner.

**Climax:** He clicks copy on the Unix timestamp. "Copied!" flashes. He pastes into his SQL query: `WHERE created_at >= 1738281600`. The whole interaction took about 4 seconds — no cluttered interface, no ads, no second site.

**Resolution:** Marcus has his query running without losing his train of thought. By the third visit, datetime-helper is a bookmark.

**Requirements Revealed:** Live calculation, "now" default, operation controls (+/- days/months/years), Unix timestamp prominence, one-click copy, sub-1-second page load.

---

### Journey 2: The Quick Lookup — "What's the current timestamp?"

**Persona:** Priya, a senior SRE writing a post-incident report on a video call. Needs the current Unix timestamp without breaking flow.

**Opening Scene:** Priya opens datetime-helper. No date math needed — just "right now" as a Unix timestamp.

**Rising Action:** The page loads. Hero row shows the current Unix timestamp in large monospace text, ticking live. All other formats visible below.

**Climax:** One click on the copy button. "Copied!" Total time: under 3 seconds. Zero interaction beyond a single click.

**Resolution:** Nobody on the call noticed she left. The tool appeared, delivered, and disappeared.

**Requirements Revealed:** "Now" pre-filled on load, live-ticking hero timestamp, copy without prior interaction, useful with zero interaction.

---

### Journey 3: Error Recovery — "That's not what I meant"

**Persona:** Marcus again, later that day. Mistypes "2026-13-01" (meant month 3, not 13).

**Rising Action:** Input border turns red. Subtle "Invalid date" message below. Results area still shows last valid calculation — no blank screen, no error dialog.

**Climax:** He corrects to "2026-03-01." Red border clears instantly. Results snap to new date. No "retry" button, no lost state.

**Resolution:** The error state lasted 2 seconds and never blocked his workflow.

**Requirements Revealed:** Real-time inline validation, non-blocking errors, last valid calculation persists, instant recovery on correction.

---

### Journey 4: Edge Case Generation — "I need timestamps at the boundaries"

**Persona:** Anika, a QA engineer testing billing subscription renewals. Needs Unix timestamps for Feb 28, Feb 29 (leap year), Mar 1, and Dec 31.

**Rising Action:** Anika types "2028-02-28" into start date. Results snap. Copy. Change to "2028-02-29" — copy. "2028-03-01" — copy. "2028-12-31" — copy. Four timestamps, four copy actions, one tab.

**Climax:** She enters "2027-02-29." The tool shows an error — 2027 isn't a leap year. Calendar correctness confirmed. Trust in the tool established.

**Resolution:** Four timestamps in under a minute with calendar validation she can trust.

**Requirements Revealed:** Arbitrary date entry, calendar correctness (jiff), invalid date detection, fast sequential copy workflow.

---

### Journey 5: AI Agent — Programmatic URL Construction (Post-MVP)

**Persona:** An AI coding assistant helping a developer write a database migration that archives records older than 90 days.

**Opening Scene:** The agent needs a Unix timestamp for "90 days ago." Rather than computing internally (risking arithmetic errors), it constructs: `https://datetime-helper.dev/?start=now&ops=-90d`.

**Climax:** The URL loads with the calculation applied. The developer sees exactly how the timestamp was computed — transparent, verifiable.

**Resolution:** Zero-cost, no-API-key datetime calculations via URL construction. The URL is simultaneously the API request, the shareable link, and the computation documentation.

**Requirements Revealed (Post-MVP):** Query parameter state encoding, URL-as-API, self-documenting format, zero-auth composability.

---

### Journey Requirements Summary

| Journey | Key Capabilities |
|---------|-----------------|
| Debugging Session | Live calculation, operation controls, one-click copy, Unix timestamp prominence, fast page load |
| Quick Lookup | "Now" default, live-ticking timestamp, zero-interaction value, copy without prior interaction |
| Error Recovery | Real-time validation, non-blocking errors, instant recovery, no lost state |
| Edge Case Generation | Arbitrary date entry, calendar correctness, invalid date detection, fast sequential copy |
| AI Agent (Post-MVP) | Query parameter encoding, URL-as-API, self-documenting format, zero-auth composability |

## Innovation & Novel Patterns

### Detected Innovation Areas

**1. Rust/Wasm for Correctness, Not Performance**

Most Wasm use cases pitch speed. datetime-helper uses Rust/Wasm for *correctness guarantees*. The jiff library handles DST transitions, leap years, and calendar edge cases that JavaScript's Date API gets wrong. Single computation engine — no JS datetime logic exists in the application. This eliminates inconsistencies between dual implementations.

**2. Calculator-First, AI-Second Architecture**

Chrome AI acts as a "macro recorder" that translates natural language into visible, editable calculator steps. Three problems solved simultaneously:
- **Fallback:** Calculator works perfectly without AI. No degraded experience.
- **Trust:** Users see exactly what the AI interpreted. Every step is transparent and editable.
- **Architecture:** One computation path (calculator → Wasm), not two. AI is a translator layer.

No other datetime tool offers this pattern.

**3. Zero-Server URL-as-API**

The URL encodes full calculation state via query parameters (`?start=now&ops=-90d`). No API server. An AI agent's "API call" is constructing a hyperlink. The page renders the result client-side. Eliminates an entire infrastructure layer: no Workers, no cold starts, no rate limits, no auth, no cost. The URL is simultaneously the request, the shareable link, and the computation documentation.

### Innovation Validation

- **Wasm correctness:** Validated by jiff library's test suite plus custom edge case tests.
- **Calculator-first architecture:** Validated by MVP launch without AI. If the calculator is satisfying alone, the architecture is proven.
- **URL-as-API:** Validated post-MVP when query parameters ship. Success signal: AI agents constructing URLs without human intervention.

## Web App Technical Requirements

### Architecture

- Single Astro page (`index.astro`) with one interactive island component
- Rust/Wasm module (jiff) compiled via wasm-pack as the datetime computation engine
- No server-side runtime — all computation client-side via Wasm
- No JavaScript datetime logic — Wasm is the single source of truth
- State: calculator inputs drive Wasm computation; output is derived, never stored independently
- No client-side router — query parameter changes use `history.replaceState()`

### Browser Support

| Browser | Tier | Calculator | AI Input | Wasm | Clipboard |
|---------|------|-----------|----------|------|-----------|
| Chrome (latest 2) | 1 | Full | Full (Gemini Nano) | Full | Full |
| Edge (latest 2) | 1 | Full | Possible | Full | Full |
| Firefox (latest 2) | 2 | Full | Unavailable | Full | Full |
| Safari (latest 2) | 2 | Full | Unavailable | Full | Full |

### Responsive Layout

| Breakpoint | Width | Layout |
|-----------|-------|--------|
| Desktop (primary) | >= 1024px | Side-by-side 40/60 split, max-width 960px centered |
| Tablet | 768px–1023px | Side-by-side, tighter spacing |
| Mobile | < 768px | Stacked vertical, input top, results below |

Desktop-first. Mobile is functional, not a design driver.

### SEO Strategy

- Astro renders full HTML shell at build time — indexable without JS execution
- Meta tags optimized for "unix timestamp calculator," "date math unix timestamp," "datetime calculator"
- Semantic HTML in static shell (`<h1>`, descriptive content)
- Advertise URL-as-API capability to attract AI agent developers

### Implementation Notes

- **Island hydration:** `client:load` for immediate interactivity
- **Wasm loading:** Parallel with page render. Static shell displays placeholder values; Wasm hydrates with live-computed values.
- **Build pipeline:** Astro build → Rust/wasm-pack compile → Cloudflare Pages deploy via GitHub Actions
- **Offline:** Zero network requests after initial load (excluding Wasm fetch). Fully offline-capable once cached.

## Risk Mitigation

### Technical Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Wasm bundle size exceeds 100KB gzipped | High | **Unknown — first development task.** Build minimal Rust/jiff Wasm module before UI. If too large: tree-shake jiff features, evaluate alternative libraries, or consider hybrid approach. |
| Astro + Wasm island integration friction | Medium | Prototype island hydration early. Wasm may need thin JS wrapper. |
| Clipboard API inconsistencies | Low | Broad support in 2026. Fallback: `document.execCommand('copy')`. |

### Market Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Developers don't find the tool | Medium | Targeted meta tags, clean design as differentiator in search results. |
| Users don't return | Medium | Under-5-second task completion is the retention mechanism. |

### Resource Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Solo developer bandwidth | Low | Deliberately small scope. Dark mode and mobile responsiveness can ship as fast-follow patches if needed. |

## Functional Requirements

### Date Calculation

- **FR1:** User can add or subtract a specified number of days, months, or years from a start date
- **FR2:** User can set the start date to any valid calendar date
- **FR3:** System defaults start date to current datetime ("now") when unspecified
- **FR4:** System validates calendar correctness for all inputs and operations (leap years, month boundaries, invalid dates)
- **FR5:** System rejects invalid date inputs with error messaging while preserving the last valid calculation
- **FR6:** System computes results using a single datetime engine with no secondary computation path

### Result Display

- **FR7:** System displays results simultaneously in Unix timestamp, ISO 8601, RFC 2822, and local human-readable formats
- **FR8:** Unix timestamp is displayed with greater visual prominence than other formats
- **FR9:** All output formats update instantly on any input change, without manual submit
- **FR10:** When start date is "now" with no operations, system displays a live-updating Unix timestamp
- **FR11:** System indicates whether the Unix timestamp is live-updating or static

### Copy & Export

- **FR12:** User can copy any individual format value to clipboard with a single action
- **FR13:** System provides brief visual confirmation on copy
- **FR14:** Format values are selectable via standard text selection as an alternative to dedicated copy

### Input & Interaction

- **FR15:** User can select operation direction (add or subtract)
- **FR16:** User can specify operation amount as a non-negative integer
- **FR17:** User can select operation unit (days, months, or years)
- **FR18:** System validates input in real-time as user types
- **FR19:** Clearing the start date input reverts to "now" default

### Page Lifecycle

- **FR20:** System displays current datetime in all formats immediately on page load, before any interaction
- **FR21:** System is fully functional after initial load with no further network requests
- **FR22:** System functions offline after initial page cache

### Appearance & Responsiveness

- **FR23:** System supports dark and light modes, matching user's system preference
- **FR24:** System presents functional layout on desktop, tablet, and mobile viewports
- **FR25:** Complete calculator and results fit within a single desktop viewport without scrolling

### Accessibility

- **FR26:** All interactive elements reachable and operable via keyboard
- **FR27:** All interactive elements display visible focus indicator on keyboard focus
- **FR28:** System provides screen reader announcements for dynamic content changes
- **FR29:** System respects `prefers-reduced-motion` by disabling animations
- **FR30:** All text and interactive elements meet WCAG 2.1 AA contrast requirements
- **FR31:** System does not rely on color alone to convey information or state

## Non-Functional Requirements

### Performance

- **NFR1:** Time to Interactive under 1 second (Lighthouse Performance > 95)
- **NFR2:** First Contentful Paint under 0.5 seconds
- **NFR3:** Cumulative Layout Shift below 0.1
- **NFR4:** Calculator operations complete within 100ms (input change to result display)
- **NFR5:** Wasm module under 100KB gzipped
- **NFR6:** Copy-to-clipboard under 50ms
- **NFR7:** Live-ticking timestamp updates at 1-second intervals without jank or layout shift

### Accessibility

- **NFR8:** All text/background combinations meet WCAG 2.1 AA contrast (4.5:1 normal text, 3:1 large text)
- **NFR9:** Keyboard tab order is logical and predictable
- **NFR10:** Focus indicators minimum 2px width on all interactive elements
- **NFR11:** Screen reader live region updates for ticking timestamp max once per 10 seconds
- **NFR12:** All animations pause when `prefers-reduced-motion` is active
- **NFR13:** Copy confirmations delivered via assertive live regions

### Correctness

- **NFR14:** Datetime engine correctly handles all DST transitions for any IANA timezone
- **NFR15:** Datetime engine correctly handles leap year calculations
- **NFR16:** Datetime engine correctly handles month boundary arithmetic (e.g., Jan 31 + 1 month)
- **NFR17:** All output formats are internally consistent — same instant in time
- **NFR18:** Identical inputs produce identical results across all supported browsers
