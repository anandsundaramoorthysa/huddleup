<p align="center">
  <img src="../assets/brand/logo.svg" width="96" alt="HuddleUp">
</p>

# Getting Started with HuddleUp

## Prerequisites

- Node.js 20+
- npm
- Git (for snapshot features)
- One of: Claude Code, Cursor, Codex, Copilot, Windsurf

## Installation

```bash
npm install -g huddleup
```

Or run directly:

```bash
npx huddleup init
```

## Setup

### 1. Initialize HuddleUp in your project

```bash
cd your-project
huddleup init
```

This creates:
- `.huddleup/charter.md` — your project's single source of truth
- `.huddleup/config.json` — per-project settings
- `.huddleup/threads/` — active work threads
- `.huddleup/history/` — append-only event log
- `CLAUDE.md` — for Claude Code
- `.cursor/rules/huddleup.mdc` — for Cursor
- `AGENTS.md` — for Codex/Copilot/generic
- `.windsurfrules` — for Windsurf

### 2. Edit your charter

Open `.huddleup/charter.md` and fill in your project's tech stack, conventions, and team info.

```markdown
## Tech Stack
- Language/Runtime: TypeScript, Node 20
- Framework: Next.js 14
- Database: PostgreSQL
```

### 3. Sync AI tool files

After editing the charter, regenerate the AI tool files:

```bash
huddleup sync
```

## Daily Workflow

### Start a new feature

```bash
huddleup thread new "streaming-chat-endpoint"
```

### Work with AI

Use your preferred AI coding tool normally. HuddleUp's config files are already active.

### Before a break

```bash
huddleup snapshot
```

Follow the prompts to add a note about where you left off.

### Resume work (you or a teammate)

```bash
huddleup resume streaming-chat-endpoint
```

Your AI tool will now have full context.

### Hand off explicitly

```bash
huddleup handoff @priya
```

This snapshots, commits, and notifies.

### Daily standup

```bash
huddleup standup
```

Shows all active threads and today's activity.

### Archive completed work

```bash
huddleup archive streaming-chat-endpoint
```

## Non-Interactive Mode

For CI/CD or scripting:

```bash
huddleup snapshot --note "Fixed CORS issue" --thread "streaming-chat-endpoint"
huddleup handoff priya --note "Ready for review" --thread "streaming-chat-endpoint"
```

## Token Exhaustion Auto-Trigger

HuddleUp's generated AI tool files include an instruction that tells the AI to auto-run `huddleup snapshot` when it senses the session is near its limit (~10% tokens remaining). This means you don't have to remember to snapshot — the AI does it for you.

## Questions?

- **Issues** — [github.com/anandsundaramoorthysa/huddleup/issues](https://github.com/anandsundaramoorthysa/huddleup/issues)
- **Discussions** — [github.com/anandsundaramoorthysa/huddleup/discussions](https://github.com/anandsundaramoorthysa/huddleup/discussions)
- **Email** — [sanand03072005@gmail.com](mailto:sanand03072005@gmail.com?subject=About%20HuddleUp%20-%20Getting%20Started)
