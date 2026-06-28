# Changelog

All notable changes to **HuddleUp** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> The VS Code extension has its own changelog: [`vscode-huddleup/CHANGELOG.md`](vscode-huddleup/CHANGELOG.md).

---

## [Unreleased]

### Planned
- Demo screencast embedded in landing site + README.
- Pre-commit hook (`husky` + `lint-staged`) so PRs don't ship typecheck regressions.
- More detailed `huddleup snapshot --verbose` output (parsed message roles, token estimates).

---

## [0.1.2] — 2026-06-29

Quality + security pass after a full audit. **No breaking changes** — `huddleup snapshot`, `resume`, `init`, `sync`, `thread`, `standup`, `handoff`, `archive` all keep the same UX. Adapters keep the same on-disk layout. New CLI flags are additive.

### Added
- `huddleup snapshot --verbose` — prints detected adapters and diagnostics.
- `huddleup thread list --json` and `huddleup standup --json` — structured output for scripts and the VS Code extension.
- `huddleup standup --days <n>` — control the history window (default `1`).
- **Webhook delivery for `huddleup handoff`** — set `handoffWebhook` in `.huddleup/config.json` to POST a JSON payload (Slack / Discord / generic webhook) when handing off to a specific teammate.
- **Charter passthrough** — `huddleup init` and `huddleup sync` now inline your `.huddleup/charter.md` content into the generated `CLAUDE.md`, `.cursor/rules/huddleup.mdc`, `AGENTS.md`, `.windsurfrules`. The AI tool sees your actual stack and conventions without having to open a second file.
- **Multi-adapter capture** — `huddleup snapshot` now captures messages from *every* detected AI tool, not just the first match. The thread's `Tools` field lists all contributors.
- **Charter heading synonyms** — `## Stack` and `## Tech Stack` are both recognised. Same for `## Style` / `## Conventions`. Custom charter layouts no longer silently fail to parse.
- **Open-file inference** — the new `extractFilePaths` helper pulls plausible repo-relative paths out of recent AI messages so `snapshot` and `resume` know which files to open.
- **History `days` filter** — `readHistory(days)` finally honours its parameter. `huddleup standup` uses it.
- `scripts/copy-templates.mjs` runs on every `npm run build` so `dist/templates/` always exists (no more fragile fallback to `src/templates/` at runtime).
- New community files: `.editorconfig`, `.gitattributes`, `.eslintrc.cjs`, `.github/PULL_REQUEST_TEMPLATE.md`, `.github/CODEOWNERS`.
- Eleven new unit + integration tests (44 total, up from 35) covering open-file extraction, charter synonyms, archive move semantics, history window, and version-from-package.json.

### Changed
- **`huddleup --version`** and the version written into `.huddleup/config.json` now read from the package's own `package.json` (`getPackageVersion()`) instead of a hardcoded string. No more drift between code and `package.json`.
- **Generated AI-tool config files** carry the **configurable** Token Exhaustion threshold (`tokenExhaustionThresholdPercent`, default `10`). Was hardcoded to `10` in the templates.
- **`huddleup standup` / `huddleup thread list`** show real `status`, `owner`, `updated`, and `lastNote` parsed from each thread's YAML frontmatter (previously every thread reported `active` / `unknown` / today's date).
- **Adapters** now cover macOS, Linux, and Windows paths. Modern Claude Code (`~/.claude/projects/<hash>/*.jsonl`) is detected in addition to the legacy `~/.claude/sessions/`. Cursor on macOS (`~/Library/Application Support/Cursor/...`) and Linux (`~/.config/Cursor/...`) now detect.
- **Snapshot block** now includes the short commit hash, the commit message, and the inferred open files (previously captured but silently dropped).
- **Release workflow** (`.github/workflows/release.yml`) now runs typecheck + tests before `npm publish`, adds `permissions: contents: write` for the GitHub release, attaches the `.vsix` to the release, and (when `VSCE_PAT` / `OVSX_PAT` secrets are set) publishes the VS Code extension to both VS Code Marketplace and Open VSX in the same run.
- **CLI output** is now emoji-free (per `CONTRIBUTING.md`). Status is shown as `[active]` / `[blocked]` / `[done]` text tags. Same in the VS Code extension's user-facing messages.
- **Config keys aligned with docs**: `tokenExhaustionThresholdPercent`, `handoffWebhook`, `team` — matches the schema documented in `docs/getting-started.md`.
- **VS Code extension** consumes `huddleup thread list --json` instead of regex-parsing terminal text, so future CLI-formatting changes won't break the sidebar.
- Charter & thread reads now use the shared `slug()` helper in `src/core/files.ts`. Slug logic deduplicated across three call sites.
- Vitest pool switched to `forks` so tests that legitimately need `process.chdir()` (charter / history / archive workdir setup) can run.

### Fixed
- **[Security] Shell-injection in `src/utils/editor.ts`** — file paths were passed through `execSync` with a shell. Replaced with `execFileSync(editor, [files])` (no shell, array args). A crafted thread file can no longer execute arbitrary commands when opened.
- **[Security] Shell-injection in the VS Code extension** — thread names from webview messages flowed into `execSync` interpolated strings. Replaced with `spawnSync(cmd, args, { shell: false })` and a `validateInput` strict whitelist for thread names.
- **[Cross-platform] `src/utils/editor.ts`** used `where` (Windows-only) to locate `code`/`cursor`. Now uses `command -v` on POSIX and `where` on Windows. File-open feature works on macOS and Linux.
- **`huddleup archive <name>`** previously copied the thread to `_archive/` while leaving the original file in `threads/`, so archived threads never disappeared from `standup` and `thread list`. Archive now **moves**: writes the `status: done` copy to `_archive/`, then deletes the source.
- Adapters no longer swallow IO errors silently — each emits a warning when its session file can't be parsed.
- Tighter `extractFilePaths` regex stops version numbers (`1.0.1`), bare extensions, and `node_modules/` paths from being treated as "open files" in `resume`.
- `huddleup resume` no longer relies on a `await import()` mid-function; all imports are hoisted.
- `softprops/action-gh-release` upgraded from v1 to v2 (v1 ignores `generate_release_notes`).

### Security
- Hardened the CLI and the VS Code extension against the *"Arbitrary code execution via crafted `.huddleup/` files"* attack class explicitly listed as in-scope in `SECURITY.md`. See the two Fixed entries above.

---

## [0.1.1] — 2026-06-29

Documentation, branding, and broken-link cleanup release. No functional CLI changes — existing scripts and adapters work unchanged.

### Added
- `CHANGELOG.md` (this file) following [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format.
- `SECURITY.md` with private disclosure policy, scope table, and hardening notes.
- `landing/README.md` — tech stack, dev/build/deploy commands, structure, SEO checklist.
- `landing/.gitignore` for `.astro/`, `dist/`, `node_modules/`, `.wrangler/`.

### Changed
- **Main `README.md` rewritten** to match the project's documentation quality bar: theme-aware logo, badges, navigation links, embedded screenshots, status table, adapter table, architecture diagram, acknowledgements.
- **`docs/getting-started.md` rewritten** with a 10-section TOC, prerequisites table, worked Anand → Priya handoff example, non-interactive / CI usage, pre-push hook example, and a six-item troubleshooting section.
- **`docs/adapters.md` rewritten** with a 9-section TOC, lifecycle diagram, full TypeScript interface, OS-specific detection patterns, reusable parsing helpers, and integration-test snippets.
- Landing footer "AGPL-3.0" link now resolves: was `…/blob/main/LICENSE.txt` (404 — wrong branch *and* wrong filename), is now `…/blob/master/LICENSE`.
- `rel="noopener"` added to external links in the landing footer.
- Publisher name corrected in `docs/awesome-list-submissions.md` to `AnandSundaramoorthySa.vscode-huddleup`.

### Fixed
- **Every cross-repo documentation link** updated from `/main/` to `/master/` (16 instances across 4 files) — previously *all* 404'd because the repo default branch is `master`, not `main`. This includes CI status badge, README screenshots, and all CONTRIBUTING / SECURITY / CHANGELOG / LICENSE cross-links.
- **`.github/workflows/ci.yml`** trigger branches changed from `[main]` to `[master]` — previously CI ran on no pushes or PRs because it watched a non-existent branch.
- **`CONTRIBUTING.md`** "create your branch from `main`" → "create your branch from `master`" to match the actual default branch.
- **`landing/README.md`** deploy hook description corrected from `main` to `master`.

---

## [0.1.0] — 2026-06-29

The first public release of HuddleUp — CLI + VS Code extension + brand kit + landing site.

### Added

#### CLI (`huddleup`)
- `huddleup init` — scaffolds `.huddleup/` (charter, threads, history, playbook) and generates `CLAUDE.md`, `.cursor/rules/huddleup.mdc`, `AGENTS.md`, `.windsurfrules` for whichever AI tool the team uses.
- `huddleup snapshot` — captures git diff, open files, last N AI messages, and a one-line note into a thread file. Auto-detects the active AI tool. Non-interactive mode via `--note` / `--thread` for scripts and CI.
- `huddleup resume <thread>` — prints a *YOU ARE HERE* briefing, opens the relevant files in the active editor, and injects the thread context into the AI tool so the next prompt has full memory.
- `huddleup sync` — regenerates the four AI-tool config files from `.huddleup/charter.md` whenever the charter changes.
- `huddleup thread new|list|show` — work-thread management.
- `huddleup standup` — terminal-friendly status board across all active threads.
- `huddleup handoff [user]` — snapshot + auto-commit + (optional) notify hook for explicit teammate handoffs.
- `huddleup archive <thread>` — closes a thread, moves it to `_archive/`, logs to history.
- `hup` short alias for every command.

#### Adapters
- **Claude Code** — reads `~/.claude/sessions/*.jsonl`.
- **Cursor** — reads `.cursor/sessions/*.jsonl`.
- **Codex** — detects `~/.codex/` and Windows `%APPDATA%/Codex`.
- **GitHub Copilot** — reads VS Code global storage (`github.copilot-chat`).
- **Windsurf** — detects `%APPDATA%/Windsurf`, `~/.windsurf/`, `~/.codeium/`.
- **Generic** — fallback adapter; ensures `AGENTS.md` is always written.

#### Token Exhaustion Protocol
- All generated AI-tool config files carry an instruction telling the agent to run `huddleup snapshot` when the session is near its limit (~10% tokens remaining), so context is captured *before* it gets dropped.

#### VS Code extension
- Sidebar webview panel with Snapshot, Resume, Standup, New Thread buttons.
- Active threads list with per-thread Resume / Archive actions.
- Theme-aware activity bar icon (`currentColor`).
- Packaged as `.vsix`; ready for VS Code Marketplace and Open VSX.

#### Brand kit (`assets/brand/`)
- Master logo **Hex Huddle** plus mono dark / mono white / `currentColor` / favicon / horizontal lockup variants.
- 1200×630 OG image, 1280×640 GitHub social preview, 128×128 VS Code Marketplace icon.
- Generated rasters (`favicon.ico`, `apple-touch-icon.png`, `og-image.png`, `github-social.png`, `marketplace-icon.png`) built by `npm run build:assets` (sharp + to-ico).
- Brand guidelines in `assets/brand/brand.md` (colours, type, do/don't).

#### Landing site (`landing/`)
- Astro 5 static site: Hero / Features / How it works / Adapters / Quick start / CTA / Footer.
- Cloudflare Pages-ready (`wrangler.toml`).
- All SEO basics: meta title/description, OG tags, canonical URL, favicons, robots.txt, 404 page.

#### Documentation
- Quick-start, adapter authoring guide, awesome-list submission templates.
- `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md` (Contributor Covenant 2.1), `SECURITY.md`.

#### Tests
- 23 unit tests covering markdown templating, file helpers, thread model, snapshot model, history events, adapter interface.
- 12 integration tests fuzzing every adapter against captured-shape fixture session files for Claude Code, Cursor, Codex, Copilot, Windsurf.
- Vitest in CI on every push and PR.

### Tooling
- TypeScript 5.4 strict mode, ES2022 target, ESM output.
- npm scripts: `build`, `build:assets`, `dev`, `start`, `test`, `test:watch`, `lint`, `typecheck`, `prepublishOnly`.
- GitHub Actions: `ci.yml` (typecheck + test on push/PR) and `release.yml` (auto-publish to npm on `v*` tag).

---

## Release tags

- [`v0.1.2`](https://github.com/anandsundaramoorthysa/huddleup/releases/tag/v0.1.2)
- [`v0.1.1`](https://github.com/anandsundaramoorthysa/huddleup/releases/tag/v0.1.1)
- [`v0.1.0`](https://github.com/anandsundaramoorthysa/huddleup/releases/tag/v0.1.0)

[Unreleased]: https://github.com/anandsundaramoorthysa/huddleup/compare/v0.1.2...HEAD
[0.1.2]: https://github.com/anandsundaramoorthysa/huddleup/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/anandsundaramoorthysa/huddleup/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/anandsundaramoorthysa/huddleup/releases/tag/v0.1.0
