import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { Adapter, AdapterResult, registerAdapter, extractFilePaths } from './base.js';
import { warning } from '../utils/logger.js';

function candidateRoots(): string[] {
  const home = homedir();
  return [
    join(home, '.codex'),
    join(home, 'Library', 'Application Support', 'Codex'),
    join(home, '.config', 'Codex'),
    join(process.env.APPDATA || join(home, 'AppData', 'Roaming'), 'Codex'),
    join(process.env.LOCALAPPDATA || join(home, 'AppData', 'Local'), 'Codex'),
  ];
}

function pickRoot(): string | null {
  for (const r of candidateRoots()) {
    if (existsSync(r)) return r;
  }
  return null;
}

export const codexAdapter: Adapter = {
  name: 'codex',
  detect(): boolean {
    return pickRoot() !== null;
  },
  async capture(): Promise<AdapterResult> {
    const dir = pickRoot();
    const messages: string[] = [];

    if (dir) {
      try {
        const files = readdirSync(dir)
          .filter((f) => f.endsWith('.json') || f.endsWith('.jsonl') || f.endsWith('.log'))
          .map((f) => ({ name: f, time: statSync(join(dir, f)).mtimeMs }))
          .sort((a, b) => b.time - a.time);

        if (files.length > 0) {
          const latest = join(dir, files[0].name);
          const content = readFileSync(latest, 'utf-8');
          const lines = content.trim().split('\n').slice(-50);
          for (const line of lines) {
            try {
              const parsed = JSON.parse(line) as Record<string, unknown>;
              const text = (parsed.text ?? parsed.content ?? parsed.message ?? parsed.prompt ?? '') as unknown;
              if (text) messages.push(typeof text === 'string' ? text.slice(0, 500) : JSON.stringify(text).slice(0, 500));
            } catch {
              if (line.trim()) messages.push(line.slice(0, 500));
            }
          }
        }
      } catch (err) {
        warning(`codex adapter could not read session: ${(err as Error).message}`);
      }
    }

    const reversed = messages.reverse();
    return {
      name: 'codex',
      openFiles: extractFilePaths(reversed),
      lastMessages: reversed,
      rawSessionPath: dir || undefined,
    };
  },
};

registerAdapter(codexAdapter);
