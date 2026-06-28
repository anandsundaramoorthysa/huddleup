import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { Adapter, AdapterResult, registerAdapter } from './base.js';

const POSSIBLE_PATHS = [
  join(homedir(), '.codex'),
  join(process.env.APPDATA || join(homedir(), 'AppData', 'Roaming'), 'Codex'),
  join(process.env.LOCALAPPDATA || join(homedir(), 'AppData', 'Local'), 'Codex'),
];

function findCodexSessionDir(): string | null {
  for (const p of POSSIBLE_PATHS) {
    if (existsSync(p)) return p;
  }
  return null;
}

export const codexAdapter: Adapter = {
  name: 'codex',
  detect(): boolean {
    return findCodexSessionDir() !== null;
  },
  async capture(): Promise<AdapterResult> {
    const dir = findCodexSessionDir();
    const messages: string[] = [];

    if (dir) {
      try {
        const files = readdirSync(dir)
          .filter(f => f.endsWith('.json') || f.endsWith('.jsonl') || f.endsWith('.log'))
          .map(f => ({ name: f, time: statSync(join(dir, f)).mtimeMs }))
          .sort((a, b) => b.time - a.time);

        if (files.length > 0) {
          const latest = join(dir, files[0].name);
          const content = readFileSync(latest, 'utf-8');
          const lines = content.trim().split('\n').slice(-50);
          for (const line of lines) {
            try {
              const parsed = JSON.parse(line);
              const text = parsed.text || parsed.content || parsed.message || parsed.prompt || '';
              if (text) messages.push(typeof text === 'string' ? text.slice(0, 500) : JSON.stringify(text).slice(0, 500));
            } catch {
              if (line.trim()) messages.push(line.slice(0, 500));
            }
          }
        }
      } catch {
        // couldn't read codex data
      }
    }

    return {
      name: 'codex',
      openFiles: [],
      lastMessages: messages.reverse(),
      rawSessionPath: dir || undefined,
    };
  },
};

registerAdapter(codexAdapter);
