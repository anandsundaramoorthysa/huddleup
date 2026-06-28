# HuddleUp - Claude Code Configuration

This project uses HuddleUp to preserve and hand off AI coding sessions across the team.

{{charterBlock}}

## Active Threads
{{activeThreads}}

## Token Exhaustion Protocol
When you sense this session is approaching its limit (~{{tokenThreshold}}% tokens remaining), OR if the user says "last message", "wrapping up", or "handoff":
1. Run `huddleup snapshot` to save the full session state.
2. Include in the snapshot: this entire conversation, open files, key decisions made, dead ends explored, and what should be done next.
3. If `huddleup` is not available, write a summary manually to `.huddleup/threads/current-session.md`.

This ensures zero context loss when the next developer resumes the work.

## Handoff Format
When resuming a previous session, read `.huddleup/threads/<thread-name>.md` to understand where the last developer left off. The full canonical project context lives in `.huddleup/charter.md` - read it before editing files.
