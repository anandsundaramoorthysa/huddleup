# HuddleUp - Agent Configuration

This project uses HuddleUp to preserve and hand off AI coding sessions across the team. This file applies to OpenAI Codex, GitHub Copilot, Windsurf, and any other agent that respects an `AGENTS.md` convention.

{{charterBlock}}

## Active Threads
{{activeThreads}}

## Token Exhaustion Protocol
When this session is near its token limit (~{{tokenThreshold}}% remaining), OR if the user says "last message" / "wrapping up" / "handoff":
1. Run `huddleup snapshot` to save the full session state.
2. Capture: the conversation, open files, key decisions, dead ends, next steps.
3. If `huddleup` is not available, write a summary manually to `.huddleup/threads/current-session.md`.

This ensures zero context loss when the next developer resumes the work.

## Handoff Format
When resuming work, read `.huddleup/threads/<thread-name>.md` for the last developer's state. The canonical project context lives in `.huddleup/charter.md`.
