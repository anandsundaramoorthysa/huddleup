import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { Adapter, AdapterResult, registerAdapter, extractFilePaths } from './base.js';
import { warning } from '../utils/logger.js';

/**
 * Cursor stores chat history differently across versions and OSes:
 *   - macOS:   ~/Library/Application Support/Cursor/User/workspaceStorage
 *   - Windows: %APPDATA%\Cursor\User\workspaceStorage  (or %LOCALAPPDATA%)
 *   - Linux:   ~/.config/Cursor/User/workspaceStorage
 *   - Legacy:  ~/.cursor/{sessions,chats}/
 */
function candidateRoots(): string[] {
  const home = homedir();
  return [
    join(home, '.cursor', 'sessions'),
    join(home, '.cursor', 'chats'),
    join(home, 'Library', 'Application Support', 'Cursor', 'User', 'workspaceStorage'),
    join(home, '.config', 'Cursor', 'User', 'workspaceStorage'),
    join(process.env.APPDATA || join(home, 'AppData', 'Roaming'), 'Cursor', 'User', 'workspaceStorage'),
    join(process.env.LOCALAPPDATA || join(home, 'AppData', 'Local'), 'Cursor', 'User', 'workspaceStorage'),
  ];
}

function pickRoot(): string | null {
  for (const r of candidateRoots()) {
    if (existsSync(r)) return r;
  }
  return null;
}

function findLatestChat(root: string): string | null {
  let latest: { path: string; mtime: number } | null = null;
  const walk = (dir: string, depth: number) => {
    if (depth > 2) return;
    let entries: string[];
    try { entries = readdirSync(dir); } catch { return; }
    for (const name of entries) {
      const full = join(dir, name);
      let stat;
      try { stat = statSync(full); } catch { continue; }
      if (stat.isDirectory()) {
        walk(full, depth + 1);
      } else if (name.endsWith('.jsonl') || name.endsWith('.json') || name.endsWith('.ndjson')) {
        if (!latest || stat.mtimeMs > latest.mtime) {
          latest = { path: full, mtime: stat.mtimeMs };
        }
      }
    }
  };
  walk(root, 0);
  return latest ? (latest as { path: string; mtime: number }).path : null;
}

export const cursorAdapter: Adapter = {
  name: 'cursor',
  detect(): boolean {
    return pickRoot() !== null;
  },
  async capture(): Promise<AdapterResult> {
    const root = pickRoot();
    const messages: string[] = [];
    let rawPath: string | undefined;

    if (root) {
      const chat = findLatestChat(root);
      rawPath = chat || root;
      if (chat) {
        try {
          const content = readFileSync(chat, 'utf-8');
          const lines = content.trim().split('\n').slice(-50);
          for (const line of lines) {
            try {
              const parsed = JSON.parse(line) as Record<string, unknown>;
              const text = (parsed.text ?? parsed.content ?? parsed.message ?? '') as unknown;
              if (text) messages.push(typeof text === 'string' ? text.slice(0, 500) : JSON.stringify(text).slice(0, 500));
            } catch {
              if (line.trim()) messages.push(line.slice(0, 500));
            }
          }
        } catch (err) {
          warning(`cursor adapter could not read session: ${(err as Error).message}`);
        }
      }
    }

    const reversed = messages.reverse();
    return {
      name: 'cursor',
      openFiles: extractFilePaths(reversed),
      lastMessages: reversed,
      rawSessionPath: rawPath,
    };
  },
};

registerAdapter(cursorAdapter);
