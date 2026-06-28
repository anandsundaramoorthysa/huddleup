import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { Adapter, AdapterResult, registerAdapter, extractFilePaths } from './base.js';
import { warning } from '../utils/logger.js';

function candidateRoots(): string[] {
  const home = homedir();
  return [
    join(home, '.windsurf'),
    join(home, '.codeium'),
    join(home, 'Library', 'Application Support', 'Windsurf'),
    join(home, '.config', 'Windsurf'),
    join(process.env.APPDATA || join(home, 'AppData', 'Roaming'), 'Windsurf'),
    join(process.env.LOCALAPPDATA || join(home, 'AppData', 'Local'), 'Windsurf'),
    join(process.env.APPDATA || join(home, 'AppData', 'Roaming'), 'Codeium'),
  ];
}

function pickRoot(): string | null {
  for (const r of candidateRoots()) {
    if (existsSync(r)) return r;
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
    return pickRoot() !== null;
  },
  async capture(): Promise<AdapterResult> {
    const dir = pickRoot();
    const messages: string[] = [];

    if (dir) {
      const files = findChatHistoryFiles(dir);
      if (files.length > 0) {
        try {
          const content = readFileSync(files[0], 'utf-8');
          const lines = content.trim().split('\n').slice(-50);
          for (const line of lines) {
            try {
              const parsed = JSON.parse(line) as Record<string, unknown>;
              const text = (parsed.text ?? parsed.content ?? parsed.message ?? parsed.response ?? parsed.query ?? '') as unknown;
              if (text) messages.push(typeof text === 'string' ? text.slice(0, 500) : JSON.stringify(text).slice(0, 500));
            } catch {
              if (line.trim()) messages.push(line.slice(0, 500));
            }
          }
        } catch (err) {
          warning(`windsurf adapter could not read session: ${(err as Error).message}`);
        }
      }
    }

    const reversed = messages.reverse();
    return {
      name: 'windsurf',
      openFiles: extractFilePaths(reversed),
      lastMessages: reversed,
      rawSessionPath: dir || undefined,
    };
  },
};

registerAdapter(windsurfAdapter);
