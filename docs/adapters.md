<p align="center">
  <img src="../assets/brand/logo.svg" width="96" alt="HuddleUp" />
</p>

<h1 align="center">HuddleUp Adapters</h1>

<p align="center">
  How HuddleUp talks to each AI coding tool, and how to add a new one.
</p>

---

## Table of contents

1. [What an adapter is](#1-what-an-adapter-is)
2. [Adapter lifecycle](#2-adapter-lifecycle)
3. [Adapter interface](#3-adapter-interface)
4. [Existing adapters](#4-existing-adapters)
5. [Writing a new adapter](#5-writing-a-new-adapter)
6. [Detection patterns](#6-detection-patterns)
7. [Parsing session files](#7-parsing-session-files)
8. [Testing your adapter](#8-testing-your-adapter)
9. [Submitting a PR](#9-submitting-a-pr)

---

## 1. What an adapter is

An adapter is the **bridge between HuddleUp and a single AI coding tool**. It does three things:

1. **Detects** whether the tool is installed and has session data on this machine.
2. **Captures** the latest session — open files, recent messages, raw session path.
3. *(Optional)* **Injects** thread context back into the tool's config files so the next prompt has memory.

Every supported AI tool is one file in [`src/adapters/`](../src/adapters/). Adding a new tool = one PR, ~80 lines.

---

## 2. Adapter lifecycle

```
   CLI startup
        │
        ▼
┌──────────────────────────────┐
│  src/index.ts imports every  │
│  adapter file, each calls    │
│  registerAdapter(self)       │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│  huddleup snapshot           │
│                              │
│  for each registered adapter:│
│    if adapter.detect():      │
│      result = adapter        │
│        .capture()            │
│      merge into snapshot     │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│  huddleup resume <thread>    │
│                              │
│  for each registered adapter:│
│    if adapter.detect() and   │
│       adapter.inject:        │
│      adapter.inject(briefing)│
└──────────────────────────────┘
```

Multiple adapters can match. A user with both Claude Code and Cursor installed gets both captured into the same snapshot.

---

## 3. Adapter interface

Defined in [`src/adapters/base.ts`](../src/adapters/base.ts):

```typescript
export interface Adapter {
  /** Stable identifier — used in thread files and history events. */
  name: string;

  /** Sync, fast (< 50ms). No I/O beyond `existsSync`. */
  detect(): boolean;

  /** Async, may read multiple session files. Should not throw — return empty on failure. */
  capture(): Promise<AdapterResult>;

  /** Optional. Writes the resume briefing into the tool's config so the next prompt sees it. */
  inject?(context: string): Promise<void>;
}

export interface AdapterResult {
  name: string;
  openFiles: string[];           // absolute or repo-relative paths
  lastMessages: string[];        // newest first, plain text
  rawSessionPath?: string;       // for debugging / `--verbose`
}
```

Rules:

- **`detect()` must be sync and fast.** It's called on every CLI invocation.
- **`capture()` must not throw.** A broken adapter shouldn't break the snapshot — return an empty result and log.
- **Paths returned in `openFiles` should be repo-relative** when possible, so they're portable across teammates' machines.
- **`lastMessages` newest first.** The snapshot writer truncates to the last N (default 10).

---

## 4. Existing adapters

| Adapter | File | Detection paths checked | Status |
|---|---|---|---|
| **Claude Code** | [`claude-code.ts`](../src/adapters/claude-code.ts) | `~/.claude/projects/<hash>/*.jsonl` (modern), `~/.claude/sessions/*.jsonl` (legacy) | Production |
| **Cursor** | [`cursor.ts`](../src/adapters/cursor.ts) | `~/.cursor/{sessions,chats}/`, `~/Library/Application Support/Cursor/User/workspaceStorage/`, `~/.config/Cursor/User/workspaceStorage/`, `%APPDATA%/Cursor/User/workspaceStorage/`, `%LOCALAPPDATA%/Cursor/User/workspaceStorage/` | Production |
| **GitHub Copilot** | [`copilot.ts`](../src/adapters/copilot.ts) | VS Code global storage (`github.copilot-chat`) for Code, Code Insiders, and Cursor across macOS / Linux / Windows; `~/.github/copilot/`; `~/.copilot/`; `~/.vscode/copilot/` | Production |
| **Codex** | [`codex.ts`](../src/adapters/codex.ts) | `~/.codex/`, `~/Library/Application Support/Codex/`, `~/.config/Codex/`, `%APPDATA%/Codex/`, `%LOCALAPPDATA%/Codex/` | Production |
| **Windsurf** | [`windsurf.ts`](../src/adapters/windsurf.ts) | `~/.windsurf/`, `~/.codeium/`, `~/Library/Application Support/Windsurf/`, `~/.config/Windsurf/`, `%APPDATA%/{Windsurf,Codeium}/`, `%LOCALAPPDATA%/Windsurf/` | Production |
| **Generic** | [`generic.ts`](../src/adapters/generic.ts) | Always detects (fallback that ensures `AGENTS.md` exists even when no specific tool is installed) | Production |

Every adapter is **read-only** with respect to the AI tool's own data. We never write into the tool's session directory.

**Multiple adapters can match.** `huddleup snapshot` uses `detectAllAdapters()` and merges `lastMessages` and `openFiles` from every detected tool into a single snapshot. The thread's `Tools:` field lists all contributors.

---

## 5. Writing a new adapter

### Step 1 — create the file

```typescript
// src/adapters/my-tool.ts
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { type Adapter, type AdapterResult, registerAdapter } from './base.js';

const sessionDir = join(homedir(), '.my-tool', 'sessions');

export const myToolAdapter: Adapter = {
  name: 'my-tool',

  detect(): boolean {
    return existsSync(sessionDir);
  },

  async capture(): Promise<AdapterResult> {
    try {
      const latest = await findLatestSession(sessionDir);
      if (!latest) return emptyResult();

      const raw = await readFile(latest, 'utf8');
      const lines = raw.trim().split('\n');
      const messages = lines
        .map(safeParseLine)
        .filter((m): m is string => m !== null)
        .reverse()                 // newest first
        .slice(0, 10);

      return {
        name: 'my-tool',
        openFiles: extractOpenFiles(lines),
        lastMessages: messages,
        rawSessionPath: latest,
      };
    } catch {
      return emptyResult();
    }
  },

  async inject(context: string): Promise<void> {
    // Optional. Most adapters write a CLAUDE.md-style config file
    // that the tool reads at the start of each session. See claude-code.ts
    // for a reference implementation.
  },
};

function emptyResult(): AdapterResult {
  return { name: 'my-tool', openFiles: [], lastMessages: [] };
}

function safeParseLine(line: string): string | null { /* ... */ return null; }
function extractOpenFiles(lines: string[]): string[] { /* ... */ return []; }
async function findLatestSession(dir: string): Promise<string | null> { /* ... */ return null; }

registerAdapter(myToolAdapter);
```

### Step 2 — wire it into the CLI

```typescript
// src/index.ts
import './adapters/my-tool.js';
```

That's it — `huddleup snapshot` now probes your tool on every run.

---

## 6. Detection patterns

Robust `detect()` implementations check **multiple OS-specific paths**.

```typescript
function candidatePaths(): string[] {
  const paths: string[] = [];

  // Unix-ish home directory
  paths.push(join(homedir(), '.my-tool'));

  // Windows roaming
  if (process.env.APPDATA) paths.push(join(process.env.APPDATA, 'MyTool'));

  // Windows local
  if (process.env.LOCALAPPDATA) paths.push(join(process.env.LOCALAPPDATA, 'MyTool'));

  // VS Code global storage (for chat extensions)
  paths.push(
    join(homedir(), 'AppData', 'Roaming', 'Code', 'User', 'globalStorage', 'my-vendor.my-extension'),
    join(homedir(), '.config', 'Code', 'User', 'globalStorage', 'my-vendor.my-extension'),
    join(homedir(), 'Library', 'Application Support', 'Code', 'User', 'globalStorage', 'my-vendor.my-extension'),
  );

  return paths;
}

detect(): boolean {
  return candidatePaths().some((p) => existsSync(p));
}
```

---

## 7. Parsing session files

Most AI tools use one of three formats:

| Format | Example tool | Notes |
|---|---|---|
| **JSONL** (one JSON object per line) | Claude Code, Cursor | Easy to stream-parse; latest message = last line |
| **NDJSON** | Some Copilot variants | Same as JSONL with newline framing |
| **Plain log** | Codex CLI | Usually `[timestamp] role: text` — regex it |

Robust parsing rules:

1. **Use `try/catch` per line.** Half-written session files are common.
2. **Sort by modification time.** Pick the most recent file in the directory.
3. **Cap message length.** A single message can be 50 KB — truncate to e.g. 4 KB.
4. **Strip secrets.** If you see `Authorization:` or `Bearer …` patterns, redact before storing.
5. **Don't follow symlinks** outside the expected directory.

A skeleton:

```typescript
async function readJsonl<T = unknown>(path: string): Promise<T[]> {
  const raw = await readFile(path, 'utf8');
  return raw
    .split('\n')
    .filter((line) => line.trim().length > 0)
    .flatMap((line) => {
      try {
        return [JSON.parse(line) as T];
      } catch {
        return [];
      }
    });
}

async function findLatestFile(dir: string, ext = '.jsonl'): Promise<string | null> {
  if (!existsSync(dir)) return null;
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries
      .filter((e) => e.isFile() && e.name.endsWith(ext))
      .map(async (e) => ({
        path: join(dir, e.name),
        mtime: (await stat(join(dir, e.name))).mtimeMs,
      })),
  );
  files.sort((a, b) => b.mtime - a.mtime);
  return files[0]?.path ?? null;
}
```

---

## 8. Testing your adapter

### Unit test (interface shape)

```typescript
// tests/unit/adapters.test.ts (extend the existing file)
import { myToolAdapter } from '../../src/adapters/my-tool.js';
import { describe, it, expect } from 'vitest';

describe('my-tool adapter', () => {
  it('has the required shape', () => {
    expect(myToolAdapter.name).toBe('my-tool');
    expect(typeof myToolAdapter.detect).toBe('function');
    expect(typeof myToolAdapter.capture).toBe('function');
  });
});
```

### Integration test (fuzz against a fixture)

Capture a real session file from your tool (anonymise any sensitive content!) and add it under `tests/fixtures/my-tool/`. Then extend the integration test:

```typescript
// tests/integration/adapters.integration.test.ts
it('parses my-tool fixture without throwing', async () => {
  const fixture = join('tests', 'fixtures', 'my-tool', 'session-2026-06-29.jsonl');
  const result = await captureFromFixture(myToolAdapter, fixture);
  expect(result.name).toBe('my-tool');
  expect(result.lastMessages.length).toBeGreaterThan(0);
});
```

Run:

```bash
npm test
```

---

## 9. Submitting a PR

Before opening the PR:

- [ ] `npm run typecheck` — zero errors
- [ ] `npm test` — all tests pass (including your new ones)
- [ ] Add a row to the **Existing adapters** table in this file
- [ ] Add a bullet to `CHANGELOG.md` under `[Unreleased] → Added`
- [ ] If the tool stores sessions somewhere unusual, document the path in your adapter file's top-comment
- [ ] If you wrote an `inject()`, make sure it never overwrites user-edited regions of the generated config (use the marker comments — see `claude-code.ts`)

PR title: `feat(adapters): add <my-tool> adapter`

Welcome to the maintainer crew. 🎉
