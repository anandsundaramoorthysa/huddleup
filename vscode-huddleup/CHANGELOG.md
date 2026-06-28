# Changelog — HuddleUp for VS Code

All notable changes to the **HuddleUp** VS Code extension are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> The CLI has its own changelog: [`../CHANGELOG.md`](../CHANGELOG.md).

---

## [Unreleased]

### Planned
- Open VSX publish so the extension installs in Cursor, VSCodium, and Windsurf.
- Inline diff preview of the captured snapshot.
- Quick-pick command palette for thread resume (no sidebar click required).

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

[Unreleased]: https://github.com/anandsundaramoorthysa/huddleup/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/anandsundaramoorthysa/huddleup/releases/tag/v0.1.0
