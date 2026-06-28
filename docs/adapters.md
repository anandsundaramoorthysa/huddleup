<p align="center">
  <img src="../assets/brand/logo.svg" width="96" alt="HuddleUp">
</p>

# HuddleUp Adapters

Adapters are the integration layer between HuddleUp and AI coding tools. Each adapter knows how to detect its tool and capture session data (open files, recent messages).

## How Adapters Work

1. **Registration** — Each adapter calls `registerAdapter()` at import time
2. **Detection** — `detect()` checks if the tool's session data exists on disk
3. **Capture** — `capture()` reads the latest session files and returns structured data
4. **Injection** — `inject()` writes context back into the tool (optional)

The adapter system is in `src/adapters/base.ts`.

## Adapter Interface

```typescript
interface Adapter {
  name: string;
  detect(): boolean;
  capture(): Promise<AdapterResult>;
  inject?(context: string): Promise<void>;
}

interface AdapterResult {
  name: string;
  openFiles: string[];
  lastMessages: string[];
  rawSessionPath?: string;
}
```

## Existing Adapters

| Adapter | Detection | Status |
|---|---|---|
| Claude Code | `~/.claude/sessions/` | ✅ Production |
| Cursor | `.cursor/sessions/` | ✅ Production |
| Codex | `~/.codex/` | ✅ Implemented |
| Copilot | VS Code globalStorage | ✅ Implemented |
| Windsurf | `~/.windsurf/`, `%APPDATA%/Windsurf` | ✅ Implemented |
| Generic | Always returns true (fallback) | ✅ Production |

## Writing a New Adapter

Create a file in `src/adapters/`:

```typescript
import { Adapter, AdapterResult, registerAdapter } from './base.js';

export const myToolAdapter: Adapter = {
  name: 'my-tool',
  detect(): boolean {
    // Check if the tool's data directory exists
    return existsSync('~/.my-tool/');
  },
  async capture(): Promise<AdapterResult> {
    // Read session files and return structured data
    return {
      name: 'my-tool',
      openFiles: [],
      lastMessages: [],
    };
  },
  async inject(context: string): Promise<void> {
    // Write context back into the tool's config
  },
};

registerAdapter(myToolAdapter);
```

Then import it in `src/index.ts`:

```typescript
import './adapters/my-tool.js';
```

## Detection Tips

- Check multiple OS paths (Windows/Linux/macOS)
- Use `homedir()` and `process.env.APPDATA` / `process.env.LOCALAPPDATA`
- Sort session files by modification time to get the latest
- Parse both JSON and JSONL formats
- Handle parse errors gracefully — session files may be partially written or corrupted

## Questions?

- **Issues** — [github.com/anandsundaramoorthysa/huddleup/issues](https://github.com/anandsundaramoorthysa/huddleup/issues)
- **Discussions** — [github.com/anandsundaramoorthysa/huddleup/discussions](https://github.com/anandsundaramoorthysa/huddleup/discussions)
- **Email** — [sanand03072005@gmail.com](mailto:sanand03072005@gmail.com?subject=About%20HuddleUp%20-%20Adapters)
