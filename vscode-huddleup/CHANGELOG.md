# Changelog — HuddleUp for VS Code

All notable changes to the **HuddleUp** VS Code extension are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> The CLI has its own changelog: [`../CHANGELOG.md`](../CHANGELOG.md).

---

## [Unreleased]

### Planned
- Inline diff preview of the captured snapshot.
- "Show last snapshot" command that opens the most recent thread file in the editor.

---

## [0.1.2] — 2026-06-29

Security + reliability pass aligned with the CLI 0.1.2 release.

### Fixed
- **[Security] Shell-injection in `runHuddleup`** — thread names from the webview were interpolated into `execSync` command strings. Replaced with `spawnSync(cmd, args, { shell: false })` and an explicit whitelist (`/^[\w.\- ]{1,200}$/`) for thread names received via webview messages and the quick-pick.

### Changed
- **Sidebar reads `huddleup thread list --json`** instead of regex-parsing terminal text — future CLI-formatting changes won't break the panel.
- **Quick-pick "Resume a thread"** now shows status and the last snapshot note alongside the name.
- HTML thread names are HTML-escaped before rendering — prevents a crafted thread title from injecting markup into the webview.
- User-facing messages and buttons are emoji-free (matches the project's `CONTRIBUTING.md` rule).
- Removed the unused `updatePanel()` indirection.

### Packaged
- `vscode-huddleup-0.1.2.vsix` (18 files, ~130 KB) with the new README, CHANGELOG, and hardened code.

---

## [0.1.1] — 2026-06-29

Marketplace-quality README + correct cross-repo URLs. No extension behaviour changes — same sidebar, same commands, same settings.

### Changed
- **README rewritten for the Marketplace listing**: marketplace badges, comparison table against static rules files, requirements, settings, "how the snapshot is built" diagram, links to CHANGELOG / CONTRIBUTING / SECURITY.
- **All screenshots and cross-document links now use absolute `raw.githubusercontent.com/.../master/…` URLs** so they actually render on the Marketplace listing (relative paths and `/main/` paths both fail there).

### Fixed
- Cross-repo links updated from `/main/` to `/master/` — previously every link from this README to the parent repo 404'd.

### Packaged
- Repackaged `vscode-huddleup-0.1.1.vsix` (18 files, ≈130 KB) with the new README + CHANGELOG.

---

## [0.1.0] — 2026-06-29

First public release. Packaged as `vscode-huddleup-0.1.0.vsix`.

### Added

- **Sidebar webview panel** with quick-action buttons:
  - 📸 **Snapshot** — saves the current AI coding session via the HuddleUp CLI.
  - ▶ **Resume** — pick a thread and load its briefing back into your AI tool.
  - 📋 **Standup** — view all active threads in the panel.
  - ✨ **New Thread** — create a thread without leaving the editor.
- **Active threads list** in the sidebar, with per-thread **Resume** and **Archive** actions.
- **Command palette entries** for every action: snapshot, resume, standup, new thread, list threads, refresh.
- **Theme-aware activity bar icon** — the Hex Huddle mark inherits `currentColor`, so it matches both light and dark VS Code themes.
- **`huddleup.cliPath` setting** (default: `npx huddleup`) to point the extension at a custom CLI install path.
- **Marketplace assets**:
  - Hex Huddle icon (128×128 PNG).
  - Indigo `#EEF2FF` gallery banner.
  - Three screenshots wired into the README via absolute GitHub raw URLs so they render on the Marketplace listing.

### Requires
- VS Code **1.85+**.
- Node.js **20+** on the machine running the CLI.
- HuddleUp CLI installed globally (`npm install -g huddleup`) or accessible via `npx huddleup`.

---

[Unreleased]: https://github.com/anandsundaramoorthysa/huddleup/compare/v0.1.2...HEAD
[0.1.2]: https://github.com/anandsundaramoorthysa/huddleup/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/anandsundaramoorthysa/huddleup/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/anandsundaramoorthysa/huddleup/releases/tag/v0.1.0
