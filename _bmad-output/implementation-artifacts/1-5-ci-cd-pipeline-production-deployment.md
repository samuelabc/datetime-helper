# Story 1.5: CI/CD Pipeline & Production Deployment

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want datetime-helper deployed and accessible on the web,
so that I can use it from any browser without local setup.

## Acceptance Criteria

1. **Given** a GitHub Actions workflow file exists at `.github/workflows/deploy.yml`, **When** code is pushed to the main branch, **Then** the pipeline executes in order: `cargo test` → `wasm-pack build --target web` → `pnpm install` → `pnpm test` → `pnpm build` → deploy `dist/` to Cloudflare Pages.

2. **Given** the pipeline runs, **When** any step fails (cargo test, wasm-pack, pnpm test, or pnpm build), **Then** the pipeline halts and does not deploy, with clear error output identifying the failing step.

3. **Given** the build succeeds and deployment completes, **When** I navigate to the Cloudflare Pages URL, **Then** the site loads and all functionality works: live-ticking timestamp, multi-format display, one-click copy (FR21).

4. **Given** the CI pipeline runs repeatedly, **When** Rust source hasn't changed, **Then** Rust/cargo dependencies and pnpm store are restored from cache, reducing build time.

5. **Given** the deployed site has loaded all static assets, **When** I disconnect from the network and continue using the tool, **Then** it continues to function — all computation is client-side via Wasm with no further network requests needed (FR21, FR22).

## Tasks / Subtasks

- [ ] Task 1: Create GitHub Actions workflow file (AC: #1, #2)
  - [ ] 1.1 Create `.github/workflows/deploy.yml` with production deployment pipeline
  - [ ] 1.2 Configure trigger: `push` to `main` branch only
  - [ ] 1.3 Add Rust toolchain setup with `wasm32-unknown-unknown` target
  - [ ] 1.4 Add wasm-pack installation
  - [ ] 1.5 Add `cargo test` step (working directory: `crates/datetime-engine`)
  - [ ] 1.6 Add `wasm-pack build --target web` step (working directory: `crates/datetime-engine`)
  - [ ] 1.7 Add pnpm setup and `pnpm install` step
  - [ ] 1.8 Add `pnpm test` step (Vitest suite)
  - [ ] 1.9 Add `pnpm build` step (Astro production build)
  - [ ] 1.10 Add Cloudflare Pages deployment step using `wrangler-action`
  - [ ] 1.11 Ensure pipeline halts on any step failure (default GitHub Actions behavior — verify `set -e`)

- [ ] Task 2: Configure dependency caching (AC: #4)
  - [ ] 2.1 Add Rust/cargo dependency caching via `Swatinem/rust-cache`
  - [ ] 2.2 Add pnpm store caching via `pnpm/action-setup` built-in cache + `actions/setup-node` cache
  - [ ] 2.3 Verify cache keys include lockfile hashes (`Cargo.lock`, `pnpm-lock.yaml`)

- [ ] Task 3: Add PR preview deployment workflow (AC: #1, #2)
  - [ ] 3.1 Add `pull_request` trigger for preview builds (build + test, no deploy)
  - [ ] 3.2 Ensure PR builds run the full pipeline except deployment
  - [ ] 3.3 Add clear naming for job steps for readable error output

- [ ] Task 4: Update package.json with CI-friendly scripts (AC: #1)
  - [ ] 4.1 Add `build:ci` script that chains `build:wasm` and `build` if needed
  - [ ] 4.2 Verify existing `build:wasm`, `test`, and `build` scripts work in CI context
  - [ ] 4.3 Ensure `pnpm build` references Wasm output from correct path after `build:wasm`

- [ ] Task 5: Verify end-to-end pipeline (AC: #1–#5)
  - [ ] 5.1 Verify workflow YAML is valid with `actionlint` or manual review
  - [ ] 5.2 Verify: all existing tests pass locally (`cargo test` — 80 tests, `pnpm test` — all Vitest tests)
  - [ ] 5.3 Verify: `pnpm build` produces `dist/` with HTML, CSS, JS, Wasm binary
  - [ ] 5.4 Verify: `pnpm preview` serves the production build and site works (live-ticking, copy, all formats)
  - [ ] 5.5 Verify: site functions offline after initial load (disable network in DevTools, verify calculator still works)
  - [ ] 5.6 Verify: no deployment secrets are hardcoded in the workflow file

## Dev Notes

### Critical: Build Wasm Before Dev Server

**The Wasm module must be built before running the dev server.** The `pkg/` directory is gitignored and built from source.

```bash
pnpm build:wasm    # Builds to crates/datetime-engine/pkg/
pnpm dev           # Astro dev server at localhost:4321
```

### Story 1.1 + 1.2 + 1.3 + 1.4 Learnings (CRITICAL — DO NOT VIOLATE)

| Decision | Detail | Impact |
|----------|--------|--------|
| Manual JSON serialization | serde removed from Wasm for bundle size (~94KB gzipped) | Do NOT add serde back |
| localHuman = UTC | jiff timezone database excluded for NFR5 | Intentional — MVP outputs UTC |
| wasm-opt disabled | Uses Rust LTO instead (`wasm-opt = false` in Cargo.toml) | Do NOT enable wasm-opt |
| wasmBridge import path | `../../crates/datetime-engine/pkg/datetime_engine.js` | Correct relative from `src/lib/` |
| 80 Rust tests passing | correctness + format + edge cases | Run `cargo test` — zero regressions |
| json_utils.rs module | Shared JSON escape utility | Use for any new Rust JSON output |
| Responsive breakpoints | `md:` prefix for tablet side-by-side (NOT `lg:`) | Story 1.2 review fix — do not revert |
| Hero font size | `text-[2rem]` with `leading-tight` | 32px per UX spec, NOT text-2xl (24px) |
| Sections have aria-labels | `aria-label="Input"` and `aria-label="Results"` | Story 1.2 review fix — preserve |
| Vitest config | `resolve.conditions: ['browser']` for Svelte 5 | Required in vitest.config.ts |
| Timer testing | `vi.advanceTimersByTimeAsync(0)` NOT `vi.runAllTimersAsync()` | runAllTimersAsync causes infinite loop with setInterval |
| $state initializers | Initialize with primitive, let $effect set real value | Avoids Svelte `state_referenced_locally` warning |
| Screen reader throttle | Uses `untrack()` in HeroResultRow $effect | Prevents $effect from re-running on every tick |
| 23+ Vitest tests passing | HeroResultRow (8), ResultRow (6), Calculator (9), CopyButton (new) | Run `pnpm test` — zero regressions |
| CopyButton + clipboard.ts | Story 1.4 adds copy functionality | Ensure these work in production build |
| getrandom wasm_js | `.cargo/config.toml` with rustflags for wasm32 target | CI must have this config available |

### Files to CREATE

| File | Purpose |
|------|---------|
| `.github/workflows/deploy.yml` | CI/CD pipeline: test → build → deploy to Cloudflare Pages |

### Files that MAY be MODIFIED

| File | Changes |
|------|---------|
| `package.json` | May need CI-specific scripts if current scripts are insufficient |

### Files NOT to Modify (Already Correct)

| File | Reason |
|------|--------|
| `src/lib/types.ts` | FormattedResult, Operation, ValidationResult already defined |
| `src/lib/wasmBridge.ts` | Bridge fully implemented — init(), calculate(), validateDate(), nowUnix() |
| `src/lib/clipboard.ts` | Clipboard API helper with fallback (Story 1.4) |
| `astro.config.mjs` | Svelte + Tailwind already configured |
| `crates/datetime-engine/*` | No Rust changes needed for this story |
| `src/layouts/Layout.astro` | SEO, fonts, body classes already correct |
| `src/pages/index.astro` | Calculator island + page structure already correct |
| `src/styles/global.css` | @theme block with font definitions already correct |
| `src/components/*.svelte` | All UI components already correct |
| `vitest.config.ts` | Test configuration already correct |
| `.cargo/config.toml` | getrandom wasm_js rustflags already configured |

### GitHub Actions Workflow Specification (EXACT)

The workflow file MUST be at `.github/workflows/deploy.yml`. Below is the **exact specification** the developer must follow.

**Trigger:**

```yaml
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
```

- `push` to `main` triggers full pipeline INCLUDING deployment
- `pull_request` to `main` triggers full pipeline WITHOUT deployment (build + test only)

**Job Structure — Single Job:**

Use a single job to avoid passing artifacts between jobs. All steps run sequentially on one runner. This matches the architecture requirement: `cargo test → wasm-pack build → pnpm install → pnpm test → pnpm build → deploy`.

**Required GitHub Actions:**

| Action | Version | Purpose |
|--------|---------|---------|
| `actions/checkout` | `v4` | Check out repository |
| `dtolnay/rust-toolchain` | `@stable` | Install Rust stable with wasm32-unknown-unknown target |
| `Swatinem/rust-cache` | `v2` | Cache Rust/cargo dependencies |
| `jetli/wasm-pack-action` | `v0.4.0` | Install wasm-pack (prebuilt binary, faster than cargo install) |
| `pnpm/action-setup` | `v4` | Install pnpm |
| `actions/setup-node` | `v4` | Setup Node.js with pnpm cache |
| `cloudflare/wrangler-action` | `v3` | Deploy to Cloudflare Pages |

**Required Secrets (must be configured in GitHub repo settings):**

| Secret | Description |
|--------|-------------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token with "Cloudflare Pages:Edit" permission |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID (from dashboard overview) |

**CRITICAL: The Cloudflare project name must match the project created in the Cloudflare Pages dashboard.** The developer should use `datetime-helper` as the project name. If the project doesn't exist yet, the first deployment via `wrangler pages deploy` will create it.

### Complete Workflow Template (deploy.yml)

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      deployments: write
    steps:
      # 1. Checkout
      - name: Checkout repository
        uses: actions/checkout@v4

      # 2. Rust toolchain + wasm target
      - name: Install Rust toolchain
        uses: dtolnay/rust-toolchain@stable
        with:
          targets: wasm32-unknown-unknown

      # 3. Rust dependency caching
      - name: Cache Rust dependencies
        uses: Swatinem/rust-cache@v2
        with:
          workspaces: "crates/datetime-engine -> target"

      # 4. Install wasm-pack
      - name: Install wasm-pack
        uses: jetli/wasm-pack-action@v0.4.0
        with:
          version: 'v0.14.0'

      # 5. Rust tests (MUST pass before Wasm build)
      - name: Run Rust tests
        working-directory: crates/datetime-engine
        run: cargo test

      # 6. Build Wasm module
      - name: Build Wasm module
        working-directory: crates/datetime-engine
        run: wasm-pack build --target web

      # 7. Setup pnpm
      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 10

      # 8. Setup Node.js with pnpm cache
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      # 9. Install Node dependencies
      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      # 10. Run Vitest suite
      - name: Run frontend tests
        run: pnpm test

      # 11. Build Astro production site
      - name: Build site
        run: pnpm build

      # 12. Deploy to Cloudflare Pages (main branch only)
      - name: Deploy to Cloudflare Pages
        if: github.event_name == 'push' && github.ref == 'refs/heads/main'
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy dist --project-name=datetime-helper
```

### Pipeline Flow Diagram

```
Push to main / PR to main
        │
        ▼
  ┌─────────────┐
  │  Checkout    │
  └──────┬──────┘
         │
  ┌──────▼──────┐
  │ Rust Setup  │ ← dtolnay/rust-toolchain@stable + wasm32-unknown-unknown
  │ + Cache     │ ← Swatinem/rust-cache@v2 (Cargo.lock-based)
  │ + wasm-pack │ ← jetli/wasm-pack-action@v0.4.0
  └──────┬──────┘
         │
  ┌──────▼──────┐
  │ cargo test  │ ← 80 Rust tests (DST, leap years, boundaries, formats, edges)
  │  (PASS?)    │ ← HALT on failure — do NOT proceed
  └──────┬──────┘
         │
  ┌──────▼──────┐
  │ wasm-pack   │ ← build --target web → crates/datetime-engine/pkg/
  │ build       │ ← Produces .wasm + JS bindings (~94KB gzipped)
  └──────┬──────┘
         │
  ┌──────▼──────┐
  │ pnpm setup  │ ← pnpm/action-setup@v4 + actions/setup-node@v4
  │ + install   │ ← pnpm install --frozen-lockfile (cache from pnpm-lock.yaml)
  └──────┬──────┘
         │
  ┌──────▼──────┐
  │ pnpm test   │ ← Vitest: HeroResultRow, ResultRow, Calculator, CopyButton tests
  │  (PASS?)    │ ← HALT on failure — do NOT proceed
  └──────┬──────┘
         │
  ┌──────▼──────┐
  │ pnpm build  │ ← Astro static build → dist/ (HTML, CSS, JS, Wasm)
  └──────┬──────┘
         │
  ┌──────▼──────────────┐
  │ Deploy to CF Pages  │ ← ONLY on push to main (skipped for PRs)
  │ (if push to main)   │ ← cloudflare/wrangler-action@v3
  └─────────────────────┘
```

### Caching Strategy (AC #4)

**Rust/Cargo caching:**
- `Swatinem/rust-cache@v2` automatically caches `~/.cargo/registry`, `~/.cargo/git`, and `target/`
- Cache key is based on `Cargo.lock` hash + Rust toolchain version
- When Rust source hasn't changed, `cargo test` and `wasm-pack build` skip recompilation
- `workspaces` parameter set to `"crates/datetime-engine -> target"` to correctly cache the workspace target

**pnpm caching:**
- `pnpm/action-setup@v4` with pnpm store
- `actions/setup-node@v4` with `cache: 'pnpm'` caches the pnpm store based on `pnpm-lock.yaml`
- `pnpm install --frozen-lockfile` ensures reproducible builds (fails if lockfile doesn't match)

**wasm-pack caching:**
- `jetli/wasm-pack-action@v0.4.0` downloads a prebuilt binary (fast, no cargo install overhead)
- Binary cached by GitHub Actions' built-in tool cache

### Offline Functionality (AC #5, FR21, FR22)

The offline functionality is **inherently satisfied by the architecture** — no special service worker or offline configuration is needed in CI/CD:

1. **Static site:** Astro builds to pure static files (`dist/`). No server-side computation.
2. **Client-side Wasm:** All datetime computation happens via the Wasm module in the browser. No API calls after initial page load.
3. **No network dependencies:** After the initial page load (HTML + CSS + JS + Wasm), the tool has everything it needs. `setInterval` calls `calculate()` locally via Wasm.
4. **Cache headers:** Cloudflare Pages automatically serves static assets with appropriate cache headers (long-lived for hashed assets).

**Verification:** After deployment, open the site → verify it loads → open DevTools → Network tab → enable offline mode → verify the calculator still ticks and copy still works. The only thing that breaks offline is the initial page load itself (needs the first fetch).

**Note:** A service worker for explicit offline-first caching is listed as "optional future enhancement" in the architecture. The MVP relies on Cloudflare's built-in caching and the fact that all computation is client-side.

### Cloudflare Pages Setup Requirements

Before the CI/CD pipeline can deploy, the following must be configured:

1. **Cloudflare Account:** An active Cloudflare account (free tier is sufficient)
2. **API Token:** Create an API token in the Cloudflare dashboard with:
   - Permission: `Cloudflare Pages:Edit`
   - Zone: All zones (or specific zone if configured)
3. **Account ID:** Found in the Cloudflare dashboard overview page (top-right area)
4. **GitHub Secrets:** Add `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` in the GitHub repository Settings → Secrets and variables → Actions
5. **Project Creation:** The first `wrangler pages deploy` command with `--project-name=datetime-helper` will auto-create the Pages project if it doesn't exist

**IMPORTANT:** The developer should NOT hardcode any secrets in the workflow file. All sensitive values must come from GitHub Secrets.

### Build Order Rationale

The pipeline order is architecturally mandated and each step depends on the previous:

1. **`cargo test` first** — Validates Rust correctness (DST, leap years, boundaries). If the engine is broken, nothing else matters. Fast feedback.
2. **`wasm-pack build` second** — Produces the Wasm binary + JS bindings to `crates/datetime-engine/pkg/`. This output is needed by the Astro build.
3. **`pnpm install` third** — Installs Node dependencies. Needs to happen before any JS tooling runs.
4. **`pnpm test` fourth** — Runs Vitest component tests. Requires both Wasm output (for wasmBridge tests) and node_modules.
5. **`pnpm build` fifth** — Astro production build. Imports from `crates/datetime-engine/pkg/` for the Wasm binary. Outputs to `dist/`.
6. **Deploy last** — Only after all tests pass and build succeeds. Only on `push` to `main`, not on PRs.

### .cargo/config.toml (CRITICAL for CI)

The `.cargo/config.toml` file at the project root contains critical rustflags for Wasm compilation:

```toml
[target.wasm32-unknown-unknown]
rustflags = ['--cfg', 'getrandom_backend="wasm_js"']
```

This file is already committed to the repository and will be picked up automatically by `cargo test` and `wasm-pack build` in CI. **Do NOT modify it.** Without it, the Wasm build fails with getrandom compatibility errors.

### `pnpm install --frozen-lockfile` (CRITICAL for CI)

The `--frozen-lockfile` flag is mandatory in CI:
- Ensures `pnpm-lock.yaml` is the source of truth
- Fails the build if dependencies have drifted from the lockfile
- Prevents accidental dependency updates during CI
- Guarantees reproducible builds

### Wasm Binary in Astro Build

The Astro build step (`pnpm build`) must find the Wasm output at `crates/datetime-engine/pkg/`. The build order ensures this:
- `wasm-pack build --target web` produces `pkg/datetime_engine.js`, `pkg/datetime_engine.wasm`, and type definitions
- `wasmBridge.ts` imports from `../../crates/datetime-engine/pkg/datetime_engine.js`
- Astro's Vite bundler resolves this import and includes the Wasm binary in `dist/`

The `pkg/` directory is gitignored (built from source), so CI must always run `wasm-pack build` before `pnpm build`.

### PR vs. Main Branch Behavior

| Event | Tests | Build | Deploy |
|-------|-------|-------|--------|
| Push to `main` | All tests run | Full build | Deploy to Cloudflare Pages (production) |
| Pull request to `main` | All tests run | Full build | **No deployment** (build verification only) |

The conditional deployment is handled by:
```yaml
if: github.event_name == 'push' && github.ref == 'refs/heads/main'
```

This ensures PRs get full validation without deploying broken code.

### Failure Behavior (AC #2)

GitHub Actions halts by default when any step fails (non-zero exit code). No special configuration needed. Each step has a clear `name` for readable error output:

- `Run Rust tests` — if `cargo test` fails, pipeline stops. Developer sees which Rust test failed.
- `Build Wasm module` — if `wasm-pack build` fails, pipeline stops. Compilation error is visible.
- `Run frontend tests` — if `pnpm test` (Vitest) fails, pipeline stops. Test failure details visible.
- `Build site` — if `pnpm build` (Astro) fails, pipeline stops. Build error is visible.

### Performance Considerations for CI

**Expected build times (approximate):**

| Step | Cold Cache | Warm Cache |
|------|-----------|------------|
| Rust toolchain setup | ~30s | ~10s |
| cargo test | ~60s | ~15s (incremental) |
| wasm-pack build | ~45s | ~10s (incremental) |
| pnpm install | ~15s | ~5s (cached) |
| pnpm test | ~10s | ~10s |
| pnpm build | ~15s | ~15s |
| Deploy | ~10s | ~10s |
| **Total** | **~3 min** | **~1.5 min** |

Caching is critical for developer experience — fast feedback on PRs.

### Scope Boundaries (What This Story Does NOT Include)

| Feature | Deferred To | Reason |
|---------|------------|--------|
| Lighthouse CI performance checks | Future enhancement | Architecture mentions it but not in AC |
| Service worker for offline-first | Future enhancement | Architecture lists as optional |
| Custom domain setup | Post-deployment | DNS configuration is manual |
| Branch preview deployments | Future enhancement | Could add `wrangler pages deploy` with branch naming |
| E2E tests (Playwright) in CI | Epic 3 stories | Playwright tests not yet written |
| Wasm bundle size assertion in CI | Future enhancement | Could add `gzip -c pkg/*.wasm | wc -c` check |

### Anti-Patterns (FORBIDDEN)

- Do NOT hardcode any secrets (API tokens, account IDs) in the workflow file
- Do NOT use `npm` or `yarn` — this project uses `pnpm` exclusively
- Do NOT skip `--frozen-lockfile` in CI — reproducible builds are mandatory
- Do NOT combine `cargo test` and `wasm-pack build` into a single step — they must be separate for clear failure identification
- Do NOT deploy on pull requests — only deploy on push to main
- Do NOT modify any existing source files (Rust, TypeScript, Svelte) — this story is infrastructure only
- Do NOT use `continue-on-error: true` on any step — failures must halt the pipeline
- Do NOT use `cargo install wasm-pack` — use `jetli/wasm-pack-action` for speed
- Do NOT skip Rust tests — they validate the core architectural bet (Wasm correctness)

### Naming Conventions

| Context | Convention | Example |
|---------|-----------|---------|
| Workflow file | kebab-case | `deploy.yml` |
| Job names | kebab-case | `build-and-deploy` |
| Step names | Sentence case, descriptive | `Run Rust tests`, `Build Wasm module` |
| Secret names | UPPER_SNAKE_CASE | `CLOUDFLARE_API_TOKEN` |

### Project Structure Notes

Alignment with canonical architecture:

```
datetime-helper/
├── .github/
│   └── workflows/
│       └── deploy.yml               # NEW — CI/CD pipeline
├── crates/
│   └── datetime-engine/             # NO CHANGES — Rust/Wasm engine
├── src/                              # NO CHANGES — Frontend source
├── .cargo/
│   └── config.toml                  # NO CHANGES — getrandom rustflags
├── package.json                     # MAY be modified — CI scripts
└── ...                              # All other files unchanged
```

Single new file: `.github/workflows/deploy.yml`. Minimal footprint for maximum impact.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-1.5] — Acceptance criteria, story statement, all 5 ACs
- [Source: _bmad-output/planning-artifacts/architecture.md#Infrastructure-&-Deployment] — CI/CD pipeline order, caching strategy, Cloudflare Pages, Wrangler
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation-Patterns] — Build pipeline: cargo test → wasm-pack → pnpm install → pnpm test → pnpm build → deploy
- [Source: _bmad-output/planning-artifacts/architecture.md#Project-Structure-&-Boundaries] — `.github/workflows/deploy.yml` in canonical directory structure
- [Source: _bmad-output/planning-artifacts/architecture.md#Decision-Impact-Analysis] — Wasm engine must be built before Astro build (build pipeline dependency)
- [Source: _bmad-output/planning-artifacts/architecture.md#Architecture-Validation-Results] — CI/CD pipeline documented, monitoring via Cloudflare Analytics + Lighthouse CI
- [Source: _bmad-output/planning-artifacts/prd.md#Technical-Success] — Zero server infrastructure, static site, no ongoing cost
- [Source: _bmad-output/planning-artifacts/prd.md#Risk-Mitigation] — Wasm bundle size risk (High), validated in Story 1.1 at ~94KB
- [Source: _bmad-output/planning-artifacts/prd.md#Functional-Requirements] — FR21 (fully functional after load), FR22 (offline after cache)
- [Source: _bmad-output/planning-artifacts/prd.md#Non-Functional-Requirements] — NFR1 (TTI < 1s), NFR2 (FCP < 0.5s), NFR5 (Wasm < 100KB gzip)
- [Source: _bmad-output/implementation-artifacts/1-1-project-scaffolding-wasm-engine-validation.md] — Wasm bundle ~94KB, wasm-opt disabled, manual JSON, .cargo/config.toml, 80 Rust tests
- [Source: _bmad-output/implementation-artifacts/1-2-page-layout-wasm-bridge-integration.md] — Layout, Wasm bridge integration, SEO meta tags, responsive breakpoints
- [Source: _bmad-output/implementation-artifacts/1-3-live-ticking-hero-timestamp-multi-format-results.md] — Live-ticking, Vitest setup, 23 component tests, vitest.config.ts
- [Source: _bmad-output/implementation-artifacts/1-4-one-click-copy-to-clipboard.md] — CopyButton, clipboard.ts, additional Vitest tests
- [Source: crates/datetime-engine/Cargo.toml] — Rust dependencies: jiff v0.2 (std, js), wasm-bindgen v0.2, wasm-opt = false, release profile (opt-level z, lto, strip)
- [Source: package.json] — Scripts: dev, build, build:wasm, test, preview; devDependencies: astro, svelte, tailwindcss, vitest
- [Source: .cargo/config.toml] — getrandom_backend="wasm_js" rustflags for wasm32-unknown-unknown
- [Source: .gitignore] — dist/, target/, crates/*/pkg/, node_modules/ all gitignored
- [Source: GitHub Actions docs] — dtolnay/rust-toolchain, Swatinem/rust-cache, jetli/wasm-pack-action, pnpm/action-setup, actions/setup-node, cloudflare/wrangler-action
- [Source: Cloudflare Pages docs] — wrangler pages deploy, API token permissions, project auto-creation

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
