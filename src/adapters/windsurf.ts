import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { Adapter, AdapterResult, registerAdapter } from './base.js';

// Windsurf (Codeium) stores sessions in various locations
const POSSIBLE_PATHS = [
  join(process.env.APPDATA || join(homedir(), 'AppData', 'Roaming'), 'Windsurf'),
  join(process.env.LOCALAPPDATA || join(homedir(), 'AppData', 'Local'), 'Windsurf'),
  join(homedir(), '.windsurf'),
  // VS Code extensions storage if Windsurf uses it
  join(process.env.APPDATA || join(homedir(), 'AppData', 'Roaming'), 'Windsurf', 'User', 'globalStorage'),
  join(homedir(), '.codeium'),
  join(process.env.APPDATA || join(homedir(), 'AppData', 'Roaming'), 'Codeium'),
];

function findWindsurfSessionDir(): string | null {
  for (const p of POSSIBLE_PATHS) {
    if (existsSync(p)) return p;
  }
  return null;
}

function findChatHistoryFiles(dir: string): string[] {
  const results: string[] = [];
  try {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      if (entry.endsWith('.json') || entry.endsWith('.jsonl')) {
        results.push(join(dir, entry));
      }
    }
  } catch {
    // skip
  }
  return results.sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs);
}

export const windsurfAdapter: Adapter = {
  name: 'windsurf',
  detect(): boolean {
    return findWindsurfSessionDir() !== null;
  },
  async capture(): Promise<AdapterResult> {
    const dir = findWindsurfSessionDir();
    const messages: string[] = [];

    if (dir) {
      const files = findChatHistoryFiles(dir);
      if (files.length > 0) {
        try {
          const content = readFileSync(files[0], 'utf-8');
          const lines = content.trim().split('\n').slice(-50);
          for (const line of lines) {
            try {
              const parsed = JSON.parse(line);
              const text = parsed.text || parsed.content || parsed.message || parsed.response || parsed.query || '';
              if (text) messages.push(typeof text === 'string' ? text.slice(0, 500) : JSON.stringify(text).slice(0, 500));
            } catch {
              if (line.trim()) messages.push(line.slice(0, 500));
            }
          }
        } catch {
          // couldn't read windsurf session
        }
      }
    }

    return {
      name: 'windsurf',
      openFiles: [],
      lastMessages: messages.reverse(),
      rawSessionPath: dir || undefined,
    };
  },
};

registerAdapter(windsurfAdapter);
