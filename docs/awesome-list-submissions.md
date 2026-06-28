# Awesome List Submissions

PR templates for submitting HuddleUp to curated awesome lists.

---

## 1. awesome-claude-code

**Repo:** `hesreallyhim/awesome-claude-code` (currently under reconstruction — submit when README is stable)

**Suggested section:** Tools / Integrations

```markdown
### [HuddleUp](https://github.com/anandsundaramoorthysa/huddleup)
Open-source CLI tool to snapshot and resume AI coding sessions across Claude Code, Cursor, Codex, Copilot, and Windsurf. Captures git diff, open files, last AI messages, and notes — lets teammates pick up exactly where you left off.
```

---

## 2. awesome-cursor

**Repo:** `prezire/awesome-cursor`

**Suggested section:** Add a new "Teams & Collaboration" section after "Other", or place under "Projects".

```markdown
## Teams & Collaboration

- [HuddleUp](https://github.com/anandsundaramoorthysa/huddleup): Open-source CLI tool that lets teams hand off work-in-progress Cursor sessions. Snapshot your session (git diff, open files, chat history) — teammates resume in one command. ![GitHub Repo stars](https://img.shields.io/github/stars/anandsundaramoorthysa/huddleup)
```

---

## 3. awesome-ai-agents

**Repo:** `e2b-dev/awesome-ai-agents`

**Suggested section:** Coding (under Open-source projects)

```markdown
## [HuddleUp](https://github.com/anandsundaramoorthysa/huddleup)
Session handoff tool for AI coding agents — snapshot and resume work across Claude Code, Cursor, Codex, Copilot, Windsurf.

<details>

![Image](https://raw.githubusercontent.com/anandsundaramoorthysa/huddleup/main/assets/brand/logo.svg)

### Category
Coding

### Description
- Open-source CLI tool for teams using AI coding tools.
- Captures git diff, open files, last N AI messages, author, and progress note.
- Resume command prints a full "you are here" briefing, opens relevant files, and injects context into the AI tool.
- Token Exhaustion Auto-Trigger: AI tool config tells the agent to auto-snapshot before tokens run out.
- Works across Claude Code, Cursor, Codex, Copilot, Windsurf.
- VS Code extension available for sidebar-based workflow.
- No backend, no MCP server, no setup pain — just files + a CLI.

### Links
- [GitHub](https://github.com/anandsundaramoorthysa/huddleup)
- [VS Code Extension](https://marketplace.visualstudio.com/items?itemName=huddleup.vscode-huddleup)
- [Docs](https://github.com/anandsundaramoorthysa/huddleup#readme)
</details>
```

---

## 4. ProductHunt

**Title:** HuddleUp — Git stash for AI coding sessions

**Tagline:** Snapshot your AI coding session. Your teammate runs one command and picks up exactly where you left off — in whichever AI tool they use.

**Description:**
HuddleUp is an open-source CLI tool that lets AI-coding teammates hand off work-in-progress sessions across any AI tool — Claude Code, Cursor, Codex, Copilot, and Windsurf.

When teams use AI to code, context is lost at every handoff:
- Dev A builds a feature with Claude Code for 3 hours
- Dev B opens Cursor — has no idea what was done, what was tried, what failed
- They ask the AI; it hallucinates (no context)
- They waste tokens, waste time

HuddleUp fixes this with one command:

```
# Dev A: save state before a break
huddleup snapshot

# Dev B: pick up exactly where they left off
huddleup resume streaming-chat-endpoint
```

**Key features:**
- Cross-tool: works with Claude Code, Cursor, Codex, Copilot, Windsurf
- Auto-captures git diff, open files, last AI messages
- Token exhaustion auto-trigger — AI saves context before tokens run out
- Team standup: see what everyone is working on
- VS Code extension for sidebar-based workflow
- No backend, no MCP server, just files + a CLI
- Open source (AGPL-3.0)

**Links:**
- GitHub: https://github.com/anandsundaramoorthysa/huddleup
- VS Code Extension: https://marketplace.visualstudio.com/items?itemName=huddleup.vscode-huddleup
