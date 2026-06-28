<p align="center">
  <img src="../assets/brand/logo.svg" width="96" alt="HuddleUp" />
</p>

<h1 align="center">Getting Started with HuddleUp</h1>

<p align="center">
  From zero to your first cross-tool AI session handoff in under 5 minutes.
</p>

---

## Table of contents

1. [Prerequisites](#1-prerequisites)
2. [Install](#2-install)
3. [Initialise your project](#3-initialise-your-project)
4. [Edit your charter](#4-edit-your-charter)
5. [The daily loop](#5-the-daily-loop)
6. [Sharing with teammates](#6-sharing-with-teammates)
7. [Token Exhaustion Protocol](#7-token-exhaustion-protocol)
8. [Non-interactive / CI usage](#8-non-interactive--ci-usage)
9. [Troubleshooting](#9-troubleshooting)
10. [Next steps](#10-next-steps)

---

## 1. Prerequisites

| Requirement | Version | Why |
|---|---|---|
| Node.js | 20+ (LTS) | The CLI is an ESM TypeScript project |
| npm | 9+ | Comes with Node 20 |
| Git | any recent | Snapshots embed `git diff`; thread state is committed |
| An AI tool | one of: Claude Code, Cursor, GitHub Copilot, Codex, Windsurf | Otherwise there's nothing to snapshot |

If you'd rather not install globally, every example below works with `npx huddleup` instead of `huddleup`.

---

## 2. Install

### Global install (recommended)

```bash
npm install -g huddleup
huddleup --version
```

### One-off via npx

```bash
npx huddleup init
```

### VS Code / Cursor users

Also install the [**HuddleUp** extension](https://marketplace.visualstudio.com/items?itemName=AnandSundaramoorthySa.vscode-huddleup) for sidebar Snapshot / Resume / Standup buttons. The extension wraps the CLI — you still need the CLI installed.

---

## 3. Initialise your project

```bash
cd your-project
huddleup init
```

The CLI creates:

```
your-project/
├── .huddleup/
│   ├── charter.md          ← project's single source of truth (you edit this)
│   ├── config.json         ← per-project settings
│   ├── threads/            ← active work threads
│   ├── history/            ← append-only event log (JSONL)
│   └── playbook/           ← reusable team patterns (how-we-test, how-we-auth, …)
├── CLAUDE.md               ← generated for Claude Code
├── .cursor/rules/huddleup.mdc ← generated for Cursor
├── AGENTS.md               ← generated for Codex / Copilot / generic
└── .windsurfrules          ← generated for Windsurf
```

Everything in `.huddleup/` is **plain markdown + JSON** and meant to be **committed to git** so teammates pick it up via a normal pull.

---

## 4. Edit your charter

Open `.huddleup/charter.md`. This is the single source of truth — when you change it, the four AI tool config files regenerate from it.

A good charter is small. Examples:

```markdown
# Acme — chat-API service

## Stack
- TypeScript, Node 20, Fastify, Postgres (Prisma)
- Tests: Vitest
- Deploy: Cloudflare Workers

## Conventions
- Branches: `feat/<name>`, `fix/<name>`
- All HTTP routes return `{ ok: boolean, data?, error? }`
- DB migrations live in `prisma/migrations/`; never edit a shipped migration

## Don't suggest
- jQuery
- Anything from `lodash` (we use native ES methods)
```

After editing the charter:

```bash
huddleup sync
```

This regenerates `CLAUDE.md`, `.cursor/rules/huddleup.mdc`, `AGENTS.md`, and `.windsurfrules`. All four AI tools now read the same conventions.

---

## 5. The daily loop

```
┌────────────────────────────────────────┐
│  Start of feature                      │
│                                        │
│  huddleup thread new "feature-name"    │
└────────────────┬───────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────┐
│  Work with your AI tool as usual       │
└────────────────┬───────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────┐
│  Before a break / EOD / handoff        │
│                                        │
│  huddleup snapshot                     │
│  → answer 1 question: "where left?"    │
└────────────────┬───────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────┐
│  Returning (you OR a teammate):        │
│                                        │
│  huddleup resume <feature-name>        │
│  → briefing prints                     │
│  → relevant files auto-open            │
│  → AI tool has full context            │
└────────────────┬───────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────┐
│  When the feature is done              │
│                                        │
│  huddleup archive <feature-name>       │
└────────────────────────────────────────┘
```

### Worked example

```bash
# Monday morning, Anand
huddleup thread new "streaming-chat-endpoint"
#  ↳ creates .huddleup/threads/streaming-chat-endpoint.md
#  ↳ logs to .huddleup/history/2026-06-29.jsonl

# ... work with Claude Code for 3 hours ...

huddleup snapshot
# ? Where did you left it?
# > Streaming works for short responses but breaks on >2KB payloads.
#   Suspect transform stream buffering. Try replacing through2 with a
#   plain Transform next.

# ... walks away ...

# Tuesday morning, Priya (different machine, different AI tool)
git pull
huddleup standup
#   IN PROGRESS (1)
#     streaming-chat-endpoint   anand   yesterday   "Streaming works for short …"
#   DONE TODAY (0)

huddleup resume streaming-chat-endpoint
# ──────────────────────────────────────────
#   YOU ARE HERE  ·  streaming-chat-endpoint
# ──────────────────────────────────────────
#   Last touched by: anand · 14h ago
#   Last note: Streaming works for short responses but breaks on …
#
#   Files reopened:
#     src/routes/chat.ts
#     src/lib/stream.ts
#     tests/routes/chat.test.ts
#
#   Last 5 AI exchanges replayed into your Cursor session.
# ──────────────────────────────────────────

# Cursor's next reply already knows the through2 hypothesis. No re-explanation.
```

---

## 6. Sharing with teammates

HuddleUp doesn't need a server. The whole `.huddleup/` folder lives in git — sharing is just `git push`.

```bash
huddleup snapshot
git add .huddleup/
git commit -m "Snapshot: streaming endpoint stuck on >2KB payloads"
git push
```

If you'd rather skip the manual commit, use `handoff`:

```bash
huddleup handoff priya
# = snapshot + git add .huddleup/ + git commit + git push
```

`handoff` can also fire a webhook (Slack / Discord / email) — set the URL in `.huddleup/config.json`:

```json
{
  "handoffWebhook": "https://hooks.slack.com/services/T.../B.../..."
}
```

---

## 7. Token Exhaustion Protocol

The config files `huddleup init` generates carry this instruction for the AI:

> *"When this session is near token exhaustion (~10% remaining), execute `huddleup snapshot` to save the full session state before context is lost."*

So even if **you forget**, **the AI will snapshot itself** before the context window collapses. Works best in tools that respect inline system instructions (Claude Code, Cursor).

You can change the threshold in `.huddleup/config.json`:

```json
{
  "tokenExhaustionThresholdPercent": 10
}
```

---

## 8. Non-interactive / CI usage

Every interactive prompt has a flag. Useful for shell scripts, pre-commit hooks, and CI.

```bash
# Snapshot without the "where left?" prompt
huddleup snapshot \
  --thread "streaming-chat-endpoint" \
  --note "Fixed buffering; coverage 91%."

# Handoff non-interactively
huddleup handoff priya \
  --thread "streaming-chat-endpoint" \
  --note "Ready for review."

# List threads as JSON (for scripts)
huddleup thread list --json
```

### Example: pre-push git hook that snapshots first

```bash
# .git/hooks/pre-push (chmod +x)
#!/usr/bin/env bash
huddleup snapshot \
  --thread "$(git symbolic-ref --short HEAD)" \
  --note "Auto-snapshot before push." \
  || true   # don't block the push if huddleup is missing
```

---

## 9. Troubleshooting

### `huddleup` command not found
Global install didn't link the binary. Try:
```bash
npm config get prefix     # check this is on PATH
which huddleup            # or `where huddleup` on Windows
```
Workaround: use `npx huddleup` everywhere.

### Adapter didn't pick up my AI tool
Run `huddleup snapshot --verbose` to see which adapters were probed and which paths they checked. If your tool stores sessions in a non-default location, file a [bug](https://github.com/anandsundaramoorthysa/huddleup/issues) — we'll widen the detection.

### "No AI session data captured" warning
Three common causes:
1. The AI tool was never opened on this machine.
2. The session file lives in an unusual location (see above).
3. The session file is locked because the tool is still open — close it or accept the warning; the rest of the snapshot still works.

### Resume opens the wrong files
File paths are captured at snapshot time. If the repo was restructured between snapshot and resume, the `Files reopened` list may 404. Edit the thread file (`.huddleup/threads/<name>.md`) and fix the paths under `## Files`.

### Token Exhaustion auto-snapshot isn't firing
Some models drop earlier system messages first. Keep your `CLAUDE.md` / `.cursor/rules/huddleup.mdc` short — under 2,000 tokens is reliable. The Protocol instruction is auto-pinned at the top of the generated files.

### Generated config files diverged from charter
You hand-edited `CLAUDE.md` (or `.cursor/rules/huddleup.mdc`, etc.). Either move the edit into `charter.md` and run `huddleup sync`, or accept the divergence — sync only overwrites the auto-generated section between the marker comments.

---

## 10. Next steps

- 📦 [Install the VS Code extension](https://marketplace.visualstudio.com/items?itemName=AnandSundaramoorthySa.vscode-huddleup) for sidebar buttons.
- 🔌 [Write a new adapter](adapters.md) for a tool we don't support yet.
- 🤝 [Contribute](../CONTRIBUTING.md) — bug fixes, adapters, docs.
- 🔒 [Read the security policy](../SECURITY.md) before reporting vulnerabilities.
- 📰 [Read the changelog](../CHANGELOG.md) to see what's shipped.

Issues, ideas, and questions: [github.com/anandsundaramoorthysa/huddleup/issues](https://github.com/anandsundaramoorthysa/huddleup/issues).
