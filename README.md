<p align="center">
  <img src="assets/brand/logo.svg" width="120" alt="HuddleUp">
</p>

<h1 align="center">HuddleUp</h1>

<p align="center">
  <strong>Huddle up your team's AI coding sessions.</strong>
</p>

<p align="center">
  <a href="LICENSE"><img alt="License: AGPL-3.0" src="https://img.shields.io/badge/license-AGPL--3.0-6366F1"></a>
  <a href="https://www.npmjs.com/package/huddleup"><img alt="npm" src="https://img.shields.io/npm/v/huddleup?color=6366F1"></a>
  <img alt="Node 20+" src="https://img.shields.io/badge/node-%3E=20-6366F1">
</p>

HuddleUp is an open-source CLI tool that lets teams hand off work-in-progress AI coding sessions across any AI tool — Claude Code, Cursor, Codex, Copilot, Windsurf.

## The Problem

When teams use AI to code, context is lost at every handoff. One dev builds a feature with Claude Code for 3 hours. The next dev opens Cursor — has no idea what was done, what was tried, what failed. They ask the AI; it hallucinates. They waste tokens, waste time, wake up the first dev.

## The Solution

```
# Dev A: save your session before a break
huddleup snapshot

# Dev B: pick up exactly where they left off
huddleup resume streaming-chat-endpoint
```

The resume command prints a full briefing, opens the relevant files, and injects all context into the AI tool. Zero context loss.

## Features

- **Cross-tool** — works with Claude Code, Cursor, Codex, Copilot, Windsurf
- **Lightweight** — just files + a CLI. No backend, no MCP server, no setup pain
- **Auto-capture** — git diff, open files, last AI messages, all captured automatically
- **Token exhaustion auto-trigger** — the AI tool config tells the AI to auto-snapshot before token runs out
- **Team standup** — see what everyone is working on with `huddleup standup`
- **Handoff** — snapshot + auto-commit + notify with `huddleup handoff @teammate`

## Quick Start

```bash
# Install
npm install -g huddleup

# Setup in your project
cd my-project
huddleup init

# Create a work thread
huddleup thread new "streaming-chat-endpoint"

# Work with your AI tool...
# Before a break, save your state
huddleup snapshot

# Your teammate resumes later
huddleup resume streaming-chat-endpoint
```

## Commands

| Command | Description |
|---|---|
| `huddleup init` | Setup HuddleUp in your project |
| `huddleup snapshot` | Save current work state to a thread |
| `huddleup resume <thread>` | Load saved state into your AI tool |
| `huddleup sync` | Regenerate AI tool files from charter |
| `huddleup thread new <name>` | Create a new work thread |
| `huddleup thread list` | List active threads |
| `huddleup standup` | Show team status |
| `huddleup handoff [user]` | Snapshot + commit + notify |
| `huddleup archive <thread>` | Mark thread as done |

## How It Works

1. `huddleup init` scaffolds a `.huddleup/` folder in your project and generates AI tool config files (`CLAUDE.md`, `.cursor/rules/huddleup.mdc`, `AGENTS.md`, `.windsurfrules`)
2. These config files carry a **Token Exhaustion Protocol** — telling the AI to auto-run `huddleup snapshot` when tokens run low
3. `snapshot` captures git diff, open files, last AI messages, and your notes into a thread file
4. `resume` reads the thread, prints a "you are here" briefing, opens files, and injects context

## Token Exhaustion Auto-Trigger

The generated AI tool files include an instruction telling the AI:

> *"When this session is near token exhaustion (~10% remaining), execute `huddleup snapshot` to save the full session state before context is lost."*

This means no human needs to remember to snapshot — the AI does it proactively.

## Brand

Logo, colours, and brand kit live in [`assets/brand/`](assets/brand/). See [`assets/brand/brand.md`](assets/brand/brand.md) for guidelines.

The mark is **Hex Huddle** — six teammates arranged in a hexagonal ring around a central huddle point. Primary colour: indigo `#6366F1`.

## Contributing

Contributions are welcome — bug fixes, new adapters, features, or docs.

- **Discuss first** — open an [issue](https://github.com/anandsundaramoorthysa/huddleup/issues) for any non-trivial change
- **Understand the codebase** — adapters are in `src/adapters/`, commands in `src/commands/`, core logic in `src/core/`
- **Match the style** — TypeScript, no emoji in code

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full contribution workflow and development setup.

## Questions?

- **Issues** — [github.com/anandsundaramoorthysa/huddleup/issues](https://github.com/anandsundaramoorthysa/huddleup/issues)
- **Discussions** — [github.com/anandsundaramoorthysa/huddleup/discussions](https://github.com/anandsundaramoorthysa/huddleup/discussions)
- **Email** — [sanand03072005@gmail.com](mailto:sanand03072005@gmail.com?subject=About%20HuddleUp)

## License

AGPL-3.0 + CLA. See [`LICENSE`](LICENSE).
