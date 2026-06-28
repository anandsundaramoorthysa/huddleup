<p align="center">
  <img src="https://raw.githubusercontent.com/anandsundaramoorthysa/huddleup/master/vscode-huddleup/media/marketplace-icon.png" alt="HuddleUp" width="128" />
</p>

<h1 align="center">HuddleUp for VS Code</h1>

<p align="center">
  <strong>Git stash for your AI coding sessions.</strong>
  <br />
  Snapshot what your AI was doing. Your teammate runs one command and picks up exactly where you left off — in whichever AI tool they use.
</p>

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=AnandSundaramoorthySa.vscode-huddleup">
    <img alt="VS Code Marketplace Version" src="https://img.shields.io/visual-studio-marketplace/v/AnandSundaramoorthySa.vscode-huddleup?color=6366F1&label=marketplace" />
  </a>
  <a href="https://marketplace.visualstudio.com/items?itemName=AnandSundaramoorthySa.vscode-huddleup">
    <img alt="Installs" src="https://img.shields.io/visual-studio-marketplace/i/AnandSundaramoorthySa.vscode-huddleup?color=6366F1" />
  </a>
  <a href="https://github.com/anandsundaramoorthysa/huddleup">
    <img alt="GitHub stars" src="https://img.shields.io/github/stars/anandsundaramoorthysa/huddleup?color=6366F1" />
  </a>
  <a href="https://github.com/anandsundaramoorthysa/huddleup/blob/master/LICENSE">
    <img alt="License: AGPL-3.0" src="https://img.shields.io/badge/license-AGPL--3.0-6366F1" />
  </a>
</p>

---

## The problem

When teams "vibe code" with AI, context is lost at every handoff:

1. **Dev A** spends three hours building a feature with Claude Code. Plans, retries, dead ends.
2. **Dev A** stops for the day. The next morning **Dev B** opens Cursor — has no idea what was tried.
3. They ask the AI; the AI hallucinates (no shared memory).
4. Tokens wasted. Hours wasted. Dev A gets woken up on Slack.

The HuddleUp VS Code extension fixes this with **two buttons in your sidebar**.

---

## What it does

Two buttons. That's the whole pitch.

| Button | What happens |
|---|---|
| 📸 **Snapshot** | Captures your active AI session — git diff, open files, last messages from Claude / Cursor / Copilot / Codex / Windsurf, and a one-line note. Writes it to a thread file in `.huddleup/threads/`. Commits to git, ready for the next teammate to pull. |
| ▶ **Resume** | Pick a thread. Get a *"YOU ARE HERE"* briefing in your terminal. Relevant files auto-open. Full context injected into your AI tool so the next prompt has memory. |

Add **Standup** and **New Thread** and you've covered the daily loop.

---

## Screenshots

### Sidebar panel — Snapshot, Resume, Standup, threads at a glance

![HuddleUp sidebar panel](https://raw.githubusercontent.com/anandsundaramoorthysa/huddleup/master/vscode-huddleup/media/screenshot-sidebar.png)

### Snapshot flow — capture without leaving the editor

![Snapshot flow](https://raw.githubusercontent.com/anandsundaramoorthysa/huddleup/master/vscode-huddleup/media/screenshot-snapshot.png)

### Resume briefing — every teammate gets the same picture

![Resume briefing](https://raw.githubusercontent.com/anandsundaramoorthysa/huddleup/master/vscode-huddleup/media/screenshot-resume.png)

---

## Why HuddleUp (vs. just CLAUDE.md or `.cursor/rules/`)

| | Static rules files (CLAUDE.md / `.cursor/rules/`) | **HuddleUp** |
|---|---|---|
| Tells the AI your project conventions | ✅ | ✅ |
| Captures *what you just tried* and *what failed* | ❌ | ✅ |
| Works across Claude, Cursor, Copilot, Codex, Windsurf | ❌ (one per tool) | ✅ |
| Teammate picks up mid-task without a Slack message | ❌ | ✅ |
| The AI auto-saves before tokens run out | ❌ | ✅ (Token Exhaustion Protocol) |

HuddleUp isn't a replacement for `CLAUDE.md` — it *generates* `CLAUDE.md`, plus `.cursor/rules/huddleup.mdc`, `AGENTS.md`, and `.windsurfrules` from one source of truth, and adds the live snapshot/resume layer on top.

---

## Quick start

### 1. Install the CLI (one-time, anywhere on your machine)

```bash
npm install -g huddleup
```

Or pin via `npx huddleup@latest` if you'd rather not install globally.

### 2. Install this extension

Search **HuddleUp** in the VS Code Extensions panel and click Install.

> Cursor / VSCodium / Windsurf users — coming on Open VSX shortly.

### 3. Initialize your project

```bash
cd your-project
huddleup init
```

This creates:

- `.huddleup/charter.md` — your project's single source of truth (stack, conventions).
- `.huddleup/threads/` — work threads.
- `.huddleup/history/` — append-only event log.
- `CLAUDE.md`, `.cursor/rules/huddleup.mdc`, `AGENTS.md`, `.windsurfrules` — auto-generated config for every AI tool.

### 4. Use the sidebar

Open the **HuddleUp** activity-bar icon. Hit **📸 Snapshot** before you walk away from your desk. Your teammate hits **▶ Resume** and is exactly where you left off.

---

## Commands

Every sidebar button has a command-palette twin (`Ctrl/Cmd + Shift + P`):

| Command | What it does |
|---|---|
| `HuddleUp: Snapshot current session` | Save current work state to a thread |
| `HuddleUp: Resume a thread` | Pick a thread; load briefing + open files + inject context |
| `HuddleUp: Show team standup` | Show all active threads + today's activity |
| `HuddleUp: Create new thread` | Start a new work item |
| `HuddleUp: List threads` | List every active thread |
| `HuddleUp: Refresh sidebar` | Refresh the HuddleUp panel |

---

## Settings

| Setting | Default | Description |
|---|---|---|
| `huddleup.cliPath` | `npx huddleup` | Command used to invoke the CLI. Change to an absolute path if `npx` is slow on first run, or to a project-local install. |

---

## Token Exhaustion Protocol

The config files generated by `huddleup init` carry this instruction for the AI:

> *"When this session is near token exhaustion (~10% remaining), execute `huddleup snapshot` to save the full session state before context is lost."*

So even if you forget to snapshot, the AI will. Tested with Claude Code and Cursor; relies on the model honoring the instruction in its system prompt.

---

## Requirements

- **VS Code 1.85+** (also runs in Cursor / VSCodium once we ship to Open VSX).
- **Node.js 20+** on your machine — needed by the CLI.
- **Git** in your project (snapshots include the diff).
- A project with `huddleup init` already run.

---

## How the snapshot is built

```
You click 📸 Snapshot
        │
        ▼
┌─────────────────────────────────────────┐
│  CLI auto-captures:                     │
│  • git diff (staged + unstaged)         │
│  • currently open files                 │
│  • last N AI messages (auto-detected    │
│    from Claude / Cursor / Copilot /     │
│    Codex / Windsurf session files)      │
└─────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────┐
│  CLI asks you 1 question (30 seconds):  │
│  "Where did you leave it?"              │
└─────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────┐
│  Writes to .huddleup/threads/<name>.md  │
│  Appends to .huddleup/history/          │
└─────────────────────────────────────────┘
        │
        ▼
   Commit + push → teammate runs ▶ Resume
```

Full architecture in the [main repo's CONTRIBUTING.md](https://github.com/anandsundaramoorthysa/huddleup/blob/master/CONTRIBUTING.md#architecture-overview).

---

## Building from source

```bash
git clone https://github.com/anandsundaramoorthysa/huddleup
cd huddleup/vscode-huddleup
npm install
npm run build
npm run package    # produces vscode-huddleup-<version>.vsix
```

Install the resulting `.vsix` via **Extensions → ⋯ → Install from VSIX…**.

---

## Changelog

See [CHANGELOG.md](https://github.com/anandsundaramoorthysa/huddleup/blob/master/vscode-huddleup/CHANGELOG.md).

## Contributing

Pull requests welcome — see [CONTRIBUTING.md](https://github.com/anandsundaramoorthysa/huddleup/blob/master/CONTRIBUTING.md). Bug reports and feature ideas go to [GitHub Issues](https://github.com/anandsundaramoorthysa/huddleup/issues).

## Security

Found a vulnerability? Please report it privately — see [SECURITY.md](https://github.com/anandsundaramoorthysa/huddleup/blob/master/SECURITY.md).

## Questions?

- 🐛 **Bugs** — [github.com/anandsundaramoorthysa/huddleup/issues](https://github.com/anandsundaramoorthysa/huddleup/issues)
- 💬 **Discussion** — [github.com/anandsundaramoorthysa/huddleup/discussions](https://github.com/anandsundaramoorthysa/huddleup/discussions)
- 📧 **Email** — [sanand03072005@gmail.com](mailto:sanand03072005@gmail.com?subject=About%20HuddleUp%20VS%20Code%20Extension)

---

<p align="center">
  <a href="https://github.com/anandsundaramoorthysa/huddleup">HuddleUp</a> is open source under <a href="https://github.com/anandsundaramoorthysa/huddleup/blob/master/LICENSE">AGPL-3.0</a>. Built by <a href="https://github.com/anandsundaramoorthysa">@anandsundaramoorthysa</a>.
</p>
