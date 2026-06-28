import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { Adapter, AdapterResult, registerAdapter, extractFilePaths } from './base.js';
import { warning } from '../utils/logger.js';

/**
 * Modern Claude Code stores per-project session JSONLs in
 *   ~/.claude/projects/<hash>/*.jsonl
 * Older builds used ~/.claude/sessions/*.jsonl. We check both.
 */
function candidateRoots(): string[] {
  return [
    join(homedir(), '.claude', 'projects'),
    join(homedir(), '.claude', 'sessions'),
  ];
}

function findLatestJsonl(root: string): string | null {
  if (!existsSync(root)) return null;
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
      } else if (name.endsWith('.jsonl')) {
        if (!latest || stat.mtimeMs > latest.mtime) {
          latest = { path: full, mtime: stat.mtimeMs };
        }
      }
    }
  };
  walk(root, 0);
  return latest ? (latest as { path: string; mtime: number }).path : null;
}

export const claudeCodeAdapter: Adapter = {
  name: 'claude-code',
  detect(): boolean {
    return candidateRoots().some((r) => existsSync(r));
  },
  async capture(): Promise<AdapterResult> {
    let latest: string | null = null;
    for (const root of candidateRoots()) {
      latest = findLatestJsonl(root);
      if (latest) break;
    }

    const messages: string[] = [];
    if (latest) {
      try {
        const content = readFileSync(latest, 'utf-8');
        const lines = content.trim().split('\n').slice(-50);
        for (const line of lines) {
          try {
            const parsed = JSON.parse(line) as { content?: unknown; message?: { content?: unknown } };
            const c = parsed.content ?? parsed.message?.content;
            if (c) messages.push(typeof c === 'string' ? c.slice(0, 500) : JSON.stringify(c).slice(0, 500));
          } catch {
            if (line.trim()) messages.push(line.slice(0, 500));
          }
        }
      } catch (err) {
        warning(`claude-code adapter could not read session file: ${(err as Error).message}`);
      }
    }

    const reversed = messages.reverse();
    return {
      name: 'claude-code',
      openFiles: extractFilePaths(reversed),
      lastMessages: reversed,
      rawSessionPath: latest || undefined,
    };
  },
};

registerAdapter(claudeCodeAdapter);
