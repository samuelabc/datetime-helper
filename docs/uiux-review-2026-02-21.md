# UI/UX Review Handoff (2026-02-21)

This document captures a critical UI/UX audit of `datetime-helper` for follow-up in a separate session.

## Scope and Method

- Reviewed live app at `/` and docs at `/docs` and `/docs/developer-workflows`.
- Tested desktop and mobile viewports.
- Tested primary interaction flows (calculate/decode, command palette, cron debugger, docs navigation).
- Reviewed dark mode rendering and readability.
- Spot-checked related implementation files for likely root causes.

## Findings (Priority Ordered)

### 1) Critical: Dark mode readability regression on docs pages

- **Severity:** Critical
- **Area:** Docs detail pages (`/docs/*`)
- **Observed behavior:** In dark mode, body text and section content on docs pages become extremely low contrast against the dark card/background, making large portions of the page hard to read.
- **Impact:** Major accessibility and usability failure (content effectively unreadable for many users).
- **Likely root cause:** Conflict between dark theme class usage and docs typography/colors, plus layered dark backgrounds and reduced contrast in text classes.
- **Recommended fixes:**
  - Audit contrast for all docs typography tokens in dark mode (target WCAG AA at minimum).
  - Raise foreground contrast for paragraph/list/code text and secondary labels.
  - Reduce background layering opacity where it lowers perceived contrast.
  - Add visual regression snapshots for dark docs pages in CI.

### 2) High: Mobile docs lose section navigation

- **Severity:** High
- **Area:** `DocsLayout` detail pages
- **Observed behavior:** “On this page” navigation is hidden on mobile (`hidden lg:block`), leaving long pages without quick section jumps.
- **Impact:** Increased scrolling friction and higher cognitive load for mobile readers.
- **Recommended fixes:**
  - Add a mobile TOC variant (sticky “Jump to section” control, bottom sheet, or anchored select).
  - Preserve heading anchor behavior across desktop and mobile.

### 3) High: No skip-to-content affordance

- **Severity:** High
- **Area:** Site-wide layout/navigation
- **Observed behavior:** No skip link before repeated navigation/chrome.
- **Impact:** Keyboard and screen-reader users must tab through repeated controls on every page.
- **Recommended fixes:**
  - Add a “Skip to main content” link visible on focus.
  - Ensure each page has a stable `main` landmark target.

### 4) High: Homepage primary task competes with secondary actions

- **Severity:** High
- **Area:** Homepage header and top-level controls
- **Observed behavior:** Docs and repository links are visually prominent before and around core calculator workflow.
- **Impact:** Dilutes “calculate now” intent for first-time users.
- **Recommended fixes:**
  - Reduce visual weight of docs/repo links on app page.
  - Keep docs discoverable, but demote from primary visual hierarchy.

### 5) Medium: Action hierarchy in tool row is unclear

- **Severity:** Medium
- **Area:** Calculator utility action cluster
- **Observed behavior:** `Open command palette`, `Copy share link`, and `Install bookmarklet` appear similarly weighted.
- **Impact:** Users must parse multiple same-priority actions before acting.
- **Recommended fixes:**
  - Keep one clear secondary CTA.
  - Group advanced actions under “More tools”.
  - Add short helper text for what each tool is best for.

### 6) Medium: Command palette discoverability can improve

- **Severity:** Medium
- **Area:** AI command palette entry points
- **Observed behavior:** Shortcut exists (`Cmd/Ctrl + K`) but is not strongly signposted near the control.
- **Impact:** Power feature adoption remains lower than potential.
- **Recommended fixes:**
  - Label button with shortcut hint.
  - Add one-line “Try: ...” helper near operations.

### 7) Medium: Timezone label wording is ambiguous

- **Severity:** Medium
- **Area:** Result labeling
- **Observed behavior:** Labeling like `Local Time (UTC)` mixes two concepts.
- **Impact:** Precision/trust issue in a date-time utility.
- **Recommended fixes:**
  - Use explicit naming: `UTC Time` when UTC is selected.
  - Reserve `Local Time` only for local-time mode.

### 8) Medium: Live hero timestamp may feel unstable while copying/reading

- **Severity:** Medium
- **Area:** Hero Unix timestamp card
- **Observed behavior:** Value updates every second in live mode, which can feel like a moving target.
- **Impact:** Lower confidence for users verifying exact values.
- **Recommended fixes:**
  - Freeze updates while hovered/focused, or add a “pause live” toggle.
  - Keep “live” indicator but reduce motion pressure.

### 9) Low: Form metadata/autocomplete hints are incomplete

- **Severity:** Low
- **Area:** Inputs in command palette/settings/debugger
- **Observed behavior:** Browser reports missing `autocomplete` hints on some inputs.
- **Impact:** Minor accessibility and form UX degradation.
- **Recommended fixes:**
  - Add explicit `autocomplete` attributes where appropriate.
  - Review labels/descriptions for assistive technology clarity.

## Dark Mode Readability Follow-up Checklist

1. Build a contrast token matrix for docs/app text in dark mode.
2. Verify WCAG contrast for:
   - body text
   - secondary text
   - muted labels
   - code inline/pre blocks
   - TOC links (normal/hover/active)
3. Tune dark surfaces to reduce stacked translucency that lowers legibility.
4. Add screenshot regression checks for:
   - `/`
   - `/docs`
   - `/docs/developer-workflows`
5. Run keyboard-only pass in dark mode after color adjustments.

## Suggested Next Session Plan

1. Fix critical dark-mode contrast first (docs detail pages).
2. Add mobile TOC for docs detail pages.
3. Add global skip link + verify focus order.
4. Rebalance homepage action hierarchy and CTA prominence.
5. Tighten terminology and microcopy (timezone labels, command palette hints).
6. Add a11y + visual regression checks in CI.

## Notes

- This is a handoff-only review; no UI changes were applied in this pass.
- Dark mode readability issue is the top priority and should block release of docs updates until addressed.
