<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)"  srcset="assets/brand/logo-mono-white.svg">
    <source media="(prefers-color-scheme: light)" srcset="assets/brand/logo.svg">
    <img src="assets/brand/logo.svg" alt="HuddleUp" width="120" />
  </picture>
</p>

<h1 align="center">HuddleUp</h1>

<p align="center">
  <strong>Git stash for your AI coding sessions.</strong>
  <br />
  Snapshot what your AI was doing. Your teammate runs one command and picks up exactly where you left off — in whichever AI tool they use.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/huddleup">
    <img alt="npm" src="https://img.shields.io/npm/v/huddleup?color=6366F1&label=npm" />
  </a>
  <a href="https://www.npmjs.com/package/huddleup">
    <img alt="npm downloads" src="https://img.shields.io/npm/dm/huddleup?color=6366F1" />
  </a>
  <a href="https://marketplace.visualstudio.com/items?itemName=AnandSundaramoorthySa.vscode-huddleup">
    <img alt="VS Code" src="https://img.shields.io/visual-studio-marketplace/v/AnandSundaramoorthySa.vscode-huddleup?color=6366F1&label=vs%20code" />
  </a>
  <a href="LICENSE">
    <img alt="License" src="https://img.shields.io/badge/license-AGPL--3.0-6366F1" />
  </a>
  <img alt="Node 20+" src="https://img.shields.io/badge/node-%3E%3D20-6366F1" />
  <a href="https://github.com/anandsundaramoorthysa/huddleup/actions">
    <img alt="CI" src="https://img.shields.io/github/actions/workflow/status/anandsundaramoorthysa/huddleup/ci.yml?branch=master&label=CI" />
  </a>
</p>

<p align="center">
  <a href="https://huddleup-site.pages.dev"><strong>Website</strong></a> ·
  <a href="docs/getting-started.md"><strong>Quick Start</strong></a> ·
  <a href="docs/adapters.md"><strong>Adapters</strong></a> ·
  <a href="CHANGELOG.md"><strong>Changelog</strong></a> ·
  <a href="CONTRIBUTING.md"><strong>Contributing</strong></a>
</p>

---

## The problem

When teams "vibe code" with AI, context evaporates at every handoff:

1. **Dev A** spends three hours building a feature with Claude Code — plans, retries, dead ends, half-baked decisions.
2. **Dev A** stops for the day. **Dev B** opens Cursor the next morning. No idea what was tried.
3. They ask the AI; the AI hallucinates because it has no shared memory.
4. Tokens wasted. Hours wasted. Dev A gets pinged at midnight.

Static rules files (`CLAUDE.md`, `.cursor/rules/`, `AGENTS.md`) help, but they only carry **conventions** — never the **live state of work in progress**. That's the gap HuddleUp fills.

---

## The solution

```bash
# Dev A — before walking away
huddleup snapshot

# Dev B — picks up exactly where Dev A left off, in any AI tool
huddleup resume streaming-chat-endpoint
```

The `resume` command prints a full *YOU ARE HERE* briefing, opens the relevant files in your editor, and injects the captured context into your active AI tool. Next prompt has memory of everything. Zero hallucination handoff.

> 💡 **Token Exhaustion Protocol** — the AI tool config files HuddleUp generates carry an instruction telling the AI to auto-run `huddleup snapshot` when it's near token exhaustion (~10% remaining). So even if a human forgets, the AI doesn't.

---

## Screenshots (VS Code extension)

| Sidebar | Snapshot | Resume |
|---|---|---|
| ![Sidebar](https://raw.githubusercontent.com/anandsundaramoorthysa/huddleup/master/vscode-huddleup/media/screenshot-sidebar.png) | ![Snapshot](https://raw.githubusercontent.com/anandsundaramoorthysa/huddleup/master/vscode-huddleup/media/screenshot-snapshot.png) | ![Resume](https://raw.githubusercontent.com/anandsundaramoorthysa/huddleup/master/vscode-huddleup/media/screenshot-resume.png) |

The CLI works headlessly too — same commands, same data, same `.huddleup/` folder. Use whichever fits your loop.

---

## Quick start

### 1. Install

```bash
# CLI
npm install -g huddleup

# Or use without installing
npx huddleup init
```

### 2. Initialise in your project

```bash
cd your-project
huddleup init
```

This scaffolds `.huddleup/` and generates one config file per AI tool:

```
your-project/
├── .huddleup/
│   ├── charter.md          # your project's single source of truth
│   ├── config.json
│   ├── threads/            # active work threads
│   ├── history/            # append-only event log
│   └── playbook/           # reusable team patterns
├── CLAUDE.md               # for Claude Code
├── .cursor/rules/huddleup.mdc   # for Cursor
├── AGENTS.md               # for Codex / Copilot / generic
└── .windsurfrules          # for Windsurf
```

### 3. Daily loop

```bash
huddleup thread new "streaming-chat-endpoint"   # start a feature
# ...code with your AI tool as usual...
huddleup snapshot                               # save before a break
huddleup resume streaming-chat-endpoint         # tomorrow / teammate picks up
huddleup standup                                # see what the whole team is mid-stream on
huddleup archive streaming-chat-endpoint        # done — file it away
```

Full walkthrough in [`docs/getting-started.md`](docs/getting-started.md).

---

## Commands

| Command | What it does | Frequency |
|---|---|---|
| `huddleup init` | Scaffold `.huddleup/` and AI tool config files | Once per project |
| `huddleup snapshot` | Save current work state to a thread | Multiple times daily |
| `huddleup resume <thread>` | Load briefing + open files + inject context | Multiple times daily |
| `huddleup sync` | Regenerate AI tool files from charter | After charter edits |
| `huddleup thread new <name>` | Create a new work thread | Per feature/bug |
| `huddleup thread list` | List active threads | As needed |
| `huddleup thread show <name>` | Print a thread | As needed |
| `huddleup standup` | Team status board (active threads + today's events) | Daily |
| `huddleup handoff [user]` | Snapshot + auto-commit + notify | Explicit handoffs |
| `huddleup archive <thread>` | Mark thread complete | Per feature/bug |

`hup` is a short alias for everything: `hup snapshot`, `hup resume`, etc.

---

## How a snapshot is built

```
You run: huddleup snapshot
        │
        ▼
┌──────────────────────────────────────────────┐
│  AUTO-CAPTURE (zero effort):                 │
│  • git diff (staged + unstaged)              │
│  • currently open files                      │
│  • last N AI messages, detected from         │
│    Claude / Cursor / Copilot / Codex /       │
│    Windsurf session files on disk            │
│  • author, timestamp, tool used              │
└──────────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────┐
│  ONE QUESTION (30 seconds):                  │
│  "Where did you leave it?"                   │
└──────────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────┐
│  .huddleup/threads/<name>.md  (markdown)     │
│  .huddleup/history/<date>.jsonl  (event log) │
└──────────────────────────────────────────────┘
        │
        ▼
   git commit & push → teammate runs `huddleup resume`
```

Everything is **plain markdown + git** — no proprietary format, no backend, no MCP server, no lock-in.

---

## Supported AI tools

| Tool | Adapter | Detection | Status |
|---|---|---|---|
| **Claude Code** | `src/adapters/claude-code.ts` | `~/.claude/sessions/*.jsonl` | ✅ Production |
| **Cursor** | `src/adapters/cursor.ts` | `.cursor/sessions/*.jsonl` | ✅ Production |
| **GitHub Copilot** | `src/adapters/copilot.ts` | VS Code globalStorage (`github.copilot-chat`) | ✅ Production |
| **Codex** | `src/adapters/codex.ts` | `~/.codex/` and `%APPDATA%/Codex` | ✅ Production |
| **Windsurf** | `src/adapters/windsurf.ts` | `%APPDATA%/Windsurf`, `~/.windsurf/`, `~/.codeium/` | ✅ Production |
| **Generic** | `src/adapters/generic.ts` | Fallback — always writes `AGENTS.md` | ✅ Production |

Adding a new tool is one PR (≈80 LOC). See [`docs/adapters.md`](docs/adapters.md).

---

## What lives where

```
huddleup/
├── bin/                   CLI entry binary
├── src/                   CLI source (TypeScript, ESM)
│   ├── commands/          one file per command
│   ├── adapters/          one file per AI tool
│   ├── core/              git, files, thread, snapshot, charter, history, markdown
│   ├── templates/         default content for generated files
│   ├── prompts/           interactive CLI prompts
│   └── utils/             logger, colors, editor
├── tests/                 unit + integration tests, captured fixtures
├── scripts/               build-raster-assets.mjs (sharp + to-ico)
├── assets/brand/          logo, colour, type, raster exports, brand.md
├── docs/                  getting-started, adapters, awesome-list-submissions
├── vscode-huddleup/       VS Code extension (separate npm project + .vsix)
└── landing/               Astro 5 static marketing site
```

---

## Install the VS Code extension

Search **HuddleUp** in VS Code Extensions, or get it from the [Marketplace](https://marketplace.visualstudio.com/items?itemName=AnandSundaramoorthySa.vscode-huddleup).

Cursor / VSCodium / Windsurf users — Open VSX publish is in [the roadmap](CHANGELOG.md#unreleased).

---

## Brand

Logo, colours, and the full brand kit live in [`assets/brand/`](assets/brand/). See [`assets/brand/brand.md`](assets/brand/brand.md) for guidelines.

The mark is **Hex Huddle** — six teammates arranged in a hexagonal ring around a central huddle point. Primary colour: indigo `#6366F1`.

Re-export rasters with:

```bash
npm run build:assets
```

---

## Development

### Prerequisites
- Node.js 20+ (LTS)
- npm 9+
- Git

### Setup
```bash
git clone https://github.com/anandsundaramoorthysa/huddleup
cd huddleup
npm install
npm run build
npm test
```

### Scripts

| Script | What it does |
|---|---|
| `npm run build` | TypeScript compile (`dist/`) |
| `npm run build:assets` | Regenerate raster brand assets (PNG/ICO) |
| `npm run dev` | TypeScript watch mode |
| `npm test` | Run all 35 tests (Vitest) |
| `npm run test:watch` | Vitest in watch mode |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run start` | Run the CLI from `bin/huddleup.js` |

### Tests

```bash
npm test
# Test Files  7 passed (7)
#      Tests  35 passed (35)
```

Unit tests cover the data model and templating; integration tests fuzz every adapter against captured-shape session fixtures for all five supported AI tools.

Full contributor workflow in [`CONTRIBUTING.md`](CONTRIBUTING.md).

---

## Contributing

Bug reports, new adapters, features, and doc fixes are all welcome.

- **Discuss first** for non-trivial changes — open an [issue](https://github.com/anandsundaramoorthysa/huddleup/issues).
- **Match the style** — TypeScript strict, no emoji in source code, Conventional Commits in PR titles.
- See [`CONTRIBUTING.md`](CONTRIBUTING.md) for setup, project structure, testing conventions, and the PR checklist.

This project follows the [Contributor Covenant 2.1](CODE_OF_CONDUCT.md).

---

## Security

If you find a security issue, **don't open a public issue** — email [sanand03072005@gmail.com](mailto:sanand03072005@gmail.com?subject=%5BSECURITY%5D%20HuddleUp%20-%20). Full disclosure policy in [`SECURITY.md`](SECURITY.md).

---

## Status

| Phase | Status |
|---|---|
| CLI (8 commands, 6 adapters, Token Exhaustion Protocol) | ✅ Shipped |
| Tests (35 passing — 23 unit + 12 integration) | ✅ Shipped |
| Documentation + community files (CHANGELOG, CONTRIBUTING, CoC, SECURITY) | ✅ Shipped |
| Brand kit (SVG + PNG + ICO, brand guidelines) | ✅ Shipped |
| VS Code extension (`.vsix` packaged, hardened) | ✅ Shipped — Marketplace publish + Open VSX pending |
| Landing site (Astro 5, Cloudflare Pages-ready) | ✅ Built — deploy pending |
| npm publish + Show HN launch | 🟡 Imminent |
| Hosted team dashboard (Phase 6) | 🔲 Gated until ≥500 stars or ≥50 installs |

For the live roadmap and discussion of upcoming features, see the [GitHub Issues](https://github.com/anandsundaramoorthysa/huddleup/issues) and the **Planned** section of [`CHANGELOG.md`](CHANGELOG.md).

---

## Acknowledgements

Built by [@anandsundaramoorthysa](https://github.com/anandsundaramoorthysa). Inspired by the OSS dev-tools tradition of `git stash`, `git rerere`, `tmux` session save/restore, and the recent surge of "AI coding context" tools — none of which solve cross-tool team handoff.

Honourable mentions to projects that explore adjacent space:
- [vibecode-pro-max-kit](https://github.com/withkynam/vibecode-pro-max-kit)
- [cursor-memory-bank](https://github.com/vanzan01/cursor-memory-bank)
- [memory-bank-mcp](https://github.com/alioshr/memory-bank-mcp)

---

## License

Released under [**AGPL-3.0**](LICENSE) with a CLA.

- **You** can use HuddleUp commercially in-house.
- **You** can fork and modify, including for hosted services, *as long as you publish your changes under AGPL-3.0*.
- **We** retain relicensing rights via the CLA for a future hosted/SaaS layer.

---

<p align="center">
  <a href="https://github.com/anandsundaramoorthysa/huddleup">GitHub</a> ·
  <a href="https://www.npmjs.com/package/huddleup">npm</a> ·
  <a href="https://marketplace.visualstudio.com/items?itemName=AnandSundaramoorthySa.vscode-huddleup">VS Code Marketplace</a> ·
  <a href="https://huddleup-site.pages.dev">Website</a>
</p>
