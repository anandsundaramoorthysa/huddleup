import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { Adapter, AdapterResult, registerAdapter, extractFilePaths } from './base.js';
import { warning } from '../utils/logger.js';

function candidateRoots(): string[] {
  const home = homedir();
  return [
    join(process.env.APPDATA || join(home, 'AppData', 'Roaming'), 'Code', 'User', 'globalStorage', 'github.copilot-chat'),
    join(process.env.APPDATA || join(home, 'AppData', 'Roaming'), 'Code - Insiders', 'User', 'globalStorage', 'github.copilot-chat'),
    join(process.env.APPDATA || join(home, 'AppData', 'Roaming'), 'Cursor', 'User', 'globalStorage', 'github.copilot-chat'),
    join(home, 'Library', 'Application Support', 'Code', 'User', 'globalStorage', 'github.copilot-chat'),
    join(home, 'Library', 'Application Support', 'Code - Insiders', 'User', 'globalStorage', 'github.copilot-chat'),
    join(home, '.config', 'Code', 'User', 'globalStorage', 'github.copilot-chat'),
    join(home, '.github', 'copilot'),
    join(home, '.copilot'),
    join(home, '.vscode', 'copilot'),
  ];
}

function pickRoot(): string | null {
  for (const r of candidateRoots()) {
    if (existsSync(r)) return r;
  }
  return null;
}

function findLatestChat(dir: string): string | null {
  try {
    const files = readdirSync(dir)
      .filter((f) => f.endsWith('.json') || f.endsWith('.jsonl') || f.endsWith('.ndjson'))
      .map((f) => ({ name: f, time: statSync(join(dir, f)).mtimeMs }))
      .sort((a, b) => b.time - a.time);
    return files.length > 0 ? join(dir, files[0].name) : null;
  } catch {
    return null;
  }
}

export const copilotAdapter: Adapter = {
  name: 'copilot',
  detect(): boolean {
    return pickRoot() !== null;
  },
  async capture(): Promise<AdapterResult> {
    const dir = pickRoot();
    const messages: string[] = [];

    if (dir) {
      const chat = findLatestChat(dir);
      if (chat) {
        try {
          const content = readFileSync(chat, 'utf-8');
          const lines = content.trim().split('\n').slice(-50);
          for (const line of lines) {
            try {
              const parsed = JSON.parse(line) as Record<string, unknown>;
              const text = (parsed.text ?? parsed.content ?? parsed.message ?? parsed.assistantMessage ?? parsed.userMessage ?? '') as unknown;
              if (text) messages.push(typeof text === 'string' ? text.slice(0, 500) : JSON.stringify(text).slice(0, 500));
            } catch {
              if (line.trim()) messages.push(line.slice(0, 500));
            }
          }
        } catch (err) {
          warning(`copilot adapter could not read chat: ${(err as Error).message}`);
        }
      }
    }

    const reversed = messages.reverse();
    return {
      name: 'copilot',
      openFiles: extractFilePaths(reversed),
      lastMessages: reversed,
      rawSessionPath: dir || undefined,
    };
  },
};

registerAdapter(copilotAdapter);
