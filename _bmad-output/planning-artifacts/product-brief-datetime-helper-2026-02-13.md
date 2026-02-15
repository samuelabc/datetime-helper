---
stepsCompleted: [1, 2, 3, 4, 5, 6]
workflow_completed: true
inputDocuments:
  - '_bmad-output/brainstorming/brainstorming-session-2026-02-12.md'
date: 2026-02-13
author: Samuel
---

# Product Brief: datetime-helper

## Executive Summary

datetime-helper is a developer-focused datetime utility that lets you describe what you need in plain language and get the answer — including Unix timestamps — instantly. Built for backend and DevOps engineers who are tired of bouncing between multiple datetime websites just to convert "6 months ago" into a Unix timestamp, datetime-helper combines natural language input, date math calculation, and multi-format output in a single, frictionless interface.

The primary interaction is an AI-powered text input (Chrome built-in AI) that parses natural language into visible calculator operations, displaying results in Unix, ISO 8601, RFC 2822, and other formats with one-click copy. When AI is unavailable, a structured calculator provides the same capabilities manually. Built with Astro, Rust/Wasm (jiff), Tailwind CSS, and hosted on Cloudflare Pages — delivering instant page loads, mathematically correct datetime arithmetic, and zero server costs.

---

## Core Vision

### Problem Statement

Backend and DevOps engineers regularly need to perform datetime calculations and obtain Unix timestamps — when debugging database records, analyzing log timestamps, or generating test data. Today, no single tool handles both date math and Unix timestamp output, forcing developers to use multiple websites for a single operation.

### Problem Impact

The problem is persistent, low-grade friction. Developers lose seconds-to-minutes per occurrence across dozens of daily interactions: Googling for tools, navigating cluttered interfaces, copy-pasting results between sites. The cumulative cost is workflow interruption and unnecessary context-switching during debugging sessions where focus matters most.

### Why Existing Solutions Fall Short

| Tool | Strength | Gap |
|------|----------|-----|
| epochconverter.com | Unix timestamp conversion | No date math calculator — can't compute "6 months ago" |
| timeanddate.com | Date add/subtract calculator | No Unix timestamp output |
| calculator.net | Date difference and add/subtract | No Unix timestamp output |

Each tool covers part of the need. None cover it all. Developers are forced into a two-site workflow: calculate a date on one, convert to Unix timestamp on another.

### Proposed Solution

A single-page datetime utility where the developer types what they need — "6 months ago in Unix time" — and gets the answer. The AI text input parses natural language into visible, editable calculator operations, so the developer sees exactly how the tool interpreted their request. Results appear instantly in multiple formats with one-click copy. No form filling, no dropdowns, no second tab. One input, one answer, back to debugging.

When Chrome AI is unavailable, the structured calculator provides the same date math and Unix timestamp output through direct manipulation — no degraded experience, just a different path to the same result.

### Key Differentiators

- **Natural language as the primary interface** — Describe what you need; the tool figures out the operations. No other datetime tool offers AI-powered input that translates to transparent calculator steps
- **One tool, complete workflow** — Date math + Unix timestamp output + multiple format copy in a single interface, eliminating the multi-site bounce
- **Transparent operations** — AI doesn't produce a black-box answer. It generates visible, editable calculator steps the developer can verify and trust
- **Calculator-first architecture** — AI enhances but doesn't own the experience. Fully functional without any AI capability
- **Zero-server, instant-loading** — Static site on Cloudflare CDN. Rust/Wasm engine delivers mathematically correct datetime arithmetic (DST, leap years, calendar edge cases). No API server, no cold starts, no cost

---

## Target Users

### Primary Users

**The Timestamp Wrangler** — Technical professionals (software engineers, DevOps engineers, DBAs, SREs) at any seniority level who work with systems that store and process dates as Unix timestamps. They encounter datetime conversion and calculation needs across multiple contexts throughout their day:

- **Debugging:** "This database record has timestamp 1691539200 — is that before or after Friday's deploy?"
- **Writing queries:** "I need all records from the last 6 months. What's the cutoff Unix timestamp?"
- **Testing:** "I need a timestamp for March 1st to seed test data into the API"
- **Log analysis:** "These log entries span timestamps X to Y — what's the actual time range?"

**Profile:**
- Works with databases, API servers, and UIs that process dates in Unix timestamp form
- Already knows what a Unix timestamp is — doesn't need education, needs speed
- Currently bounces between 2-3 websites to complete a single datetime operation
- Values simplicity and responsiveness above all — the tool should feel instant
- Ranges from junior developers learning timestamp conventions to senior SREs debugging production at 2am

### Secondary Users

- **QA Engineers** — Testing time-dependent features, generating specific timestamps for edge case scenarios (end-of-month, leap year boundaries, DST transitions)
- **Business Stakeholders** — Non-technical users who could leverage the natural language input to answer date questions without learning Unix timestamps ("How many days between project start and deadline?")
- **AI Agents** — Automated systems that construct URLs using the structured query parameter format to perform datetime calculations programmatically — datetime-helper as a composable tool in agent workflows

### User Journey

**Discovery:** Developer Googles "unix timestamp calculator" or "date math to unix timestamp" and lands on datetime-helper. The clean, ad-free interface immediately signals "this is different."

**First Use:** They type "6 months ago" into the AI input. The tool parses it into visible calculator steps and displays the result in multiple formats — including Unix timestamp — with one-click copy. They get what they need in under 5 seconds without navigating a single dropdown.

**The "Aha!" Moment:** "I typed what I needed and got the Unix timestamp in one step." No second website. No copy-paste between tools. One input, one answer.

**Becoming a Habit:** The simplicity and responsiveness bring them back. The page loads instantly (static site), the interaction is frictionless, and the URL captures their calculation — so they bookmark it. Over time, datetime-helper becomes the permanent browser tab they reach for instead of Googling.

**Long-term:** They share calculation URLs with teammates in Slack. The tool quietly becomes a team standard — not through a mandate, but because the link someone shared just worked.

---

## Success Metrics

### User Success

- **Core task completion under 5 seconds** — From page load to copied result, the developer gets their answer in under 5 seconds. This is the north star metric. If it takes longer, the tool has failed its purpose.
- **Single-tab workflow** — The user never needs to open a second website to complete a datetime calculation with Unix timestamp output. One tab, one result.
- **Return usage** — Users come back instead of Googling again. Bookmark rate and direct traffic serve as proxies for "this tool earned a permanent spot in my workflow."

### Business Objectives

| Timeframe | Objective |
|-----------|-----------|
| 1 month | Creator (Samuel) uses datetime-helper as personal default tool — fully replacing the multi-site workflow |
| 3 months | Steady organic traffic from search engines. Tool ranks for key terms like "unix timestamp calculator" and "date math unix timestamp" |
| 6 months | Monthly recurring visitors — people who bookmarked it and return regularly |
| 12 months | Measurable monthly visit volume demonstrating the tool has found its audience. Calculation URLs shared organically in developer communities (Stack Overflow, Slack, GitHub issues) |

### Key Performance Indicators

| KPI | Measurement | Target |
|-----|-------------|--------|
| Task completion time | Time from page load to first copy action | < 5 seconds |
| Dogfooding adoption | Creator stops using other datetime tools | Within 1 month of launch |
| Monthly visits | Cloudflare analytics | Growth trend month-over-month |
| Return visitor rate | Ratio of returning vs new visitors | > 30% returning visitors by month 6 |
| Shared URLs | Calculation URLs loaded with query parameters (non-empty `ops` param) | Upward trend indicating organic sharing |
| Page load time | Lighthouse / Web Vitals | < 1 second to interactive |

---

## MVP Scope

### Core Features

The MVP delivers the smallest version that solves the core problem: **one tool, one tab, one answer.**

1. **Structured Date Calculator** — Date math operations (+/- days, months, years) with a clean input interface. The calculator is the computation engine and the source of truth for all results.

2. **Multi-Format Output with Unix Timestamp** — Results displayed simultaneously in Unix timestamp, ISO 8601, RFC 2822, and local human-readable formats. One-click copy for each format. This is the feature gap that no existing tool fills.

3. **AI Natural Language Input** — Chrome built-in AI (Gemini Nano) parses plain language like "6 months ago" into structured calculator operations. Operations are visible and editable. When Chrome AI is unavailable, the calculator works standalone.

**Infrastructure (implicit in MVP):**
- Single-page static site (Astro + Tailwind CSS)
- Rust/Wasm datetime engine (jiff library)
- Cloudflare Pages hosting
- GitHub Actions CI/CD pipeline

### Out of Scope for MVP

| Feature | Rationale for Deferral |
|---------|----------------------|
| Keyboard-first navigation | UX polish, not core functionality |
| Snap-to operations (start/end of day/week/month) | Enhancement to calculator, not required for core date math |
| Chainable operation steps | Multi-step chains add complexity; single operations solve the primary use case |
| Copy as shareable link | Nice-to-have sharing feature, not core problem-solving |
| Reverse mode (paste timestamp → decode) | Valuable but separate use case from date math → timestamp |
| Query parameter state encoding (URL-as-API) | Can be added when shareable links are implemented |
| NLP confidence scoring / confidence diff | v2 with expanded AI capabilities |
| Timezone picker UI | UTC + local browser time only in MVP |
| Visual timeline | UX delight feature, not essential |
| Week-start configuration | User preference, not core |
| Web component extraction | Future platform play |
| Cron job debugger | Adjacent feature, not core |

### MVP Success Criteria

The MVP is successful when:

1. **Samuel uses it daily** — Creator replaces personal multi-site workflow within 1 month of launch
2. **Under 5 seconds** — A developer can go from page load to copied Unix timestamp in under 5 seconds
3. **Single-tab completion** — No user needs a second website to complete a datetime-to-Unix-timestamp operation
4. **Page loads under 1 second** — Lighthouse performance score validates the static-first, Wasm architecture

### Future Vision

**v1.1 — UX Polish:**
- Snap-to operations, inline step results, keyboard navigation
- Reverse mode (paste timestamp → decode context)
- Query parameter state encoding + shareable URLs

**v2 — AI Layer:**
- Chrome AI command palette (Cmd+K)
- NLP confidence scoring with confidence diff
- LLM-as-macro-recorder: visible, editable operation chains from natural language
- Optional Gemini API key for non-Chrome browsers

**v3+ — Platform:**
- Timezone picker UI
- Web component extraction (`<datetime-helper>`)
- Cron job debugger
- Countdown / time-until calculator
- Bookmarklet for timestamp decoding on any page
