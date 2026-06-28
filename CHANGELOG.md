# Changelog

All notable changes to **HuddleUp** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> The VS Code extension has its own changelog: [`vscode-huddleup/CHANGELOG.md`](vscode-huddleup/CHANGELOG.md).

---

## [Unreleased]

### Planned
- Open VSX publish so Cursor / VSCodium / Windsurf users can install the VS Code extension.
- Demo screencast embedded in landing site + README.
- Pre-commit hook (`husky` + `lint-staged`) so PRs don't ship typecheck regressions.
- Slack webhook payload templates for `huddleup standup` and `huddleup handoff`.

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

- [`v0.1.1`](https://github.com/anandsundaramoorthysa/huddleup/releases/tag/v0.1.1)
- [`v0.1.0`](https://github.com/anandsundaramoorthysa/huddleup/releases/tag/v0.1.0)

[Unreleased]: https://github.com/anandsundaramoorthysa/huddleup/compare/v0.1.1...HEAD
[0.1.1]: https://github.com/anandsundaramoorthysa/huddleup/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/anandsundaramoorthysa/huddleup/releases/tag/v0.1.0
