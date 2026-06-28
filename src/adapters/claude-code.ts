import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { Adapter, AdapterResult, registerAdapter } from './base.js';

function findLatestSession(dir: string): string | null {
  if (!existsSync(dir)) return null;
  const entries = readdirSync(dir)
    .filter(f => f.endsWith('.jsonl'))
    .map(f => ({ name: f, time: statSync(join(dir, f)).mtimeMs }))
    .sort((a, b) => b.time - a.time);
  return entries.length > 0 ? join(dir, entries[0].name) : null;
}

export const claudeCodeAdapter: Adapter = {
  name: 'claude-code',
  detect(): boolean {
    const sessionDir = join(homedir(), '.claude', 'sessions');
    return existsSync(sessionDir);
  },
  async capture(): Promise<AdapterResult> {
    const sessionDir = join(homedir(), '.claude', 'sessions');
    const latest = findLatestSession(sessionDir);
    const messages: string[] = [];

    if (latest) {
      try {
        const content = readFileSync(latest, 'utf-8');
        const lines = content.trim().split('\n').slice(-50);
        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            if (parsed.content) {
              messages.push(typeof parsed.content === 'string' ? parsed.content : JSON.stringify(parsed.content));
            }
          } catch {
            messages.push(line.slice(0, 500));
          }
        }
      } catch {
        // couldn't read session
      }
    }

    return {
      name: 'claude-code',
      openFiles: [],
      lastMessages: messages.reverse(),
      rawSessionPath: latest || undefined,
    };
  },
  async inject(context: string): Promise<void> {
    // For Claude Code, context is injected via CLAUDE.md template
    // The user just needs to run `huddleup resume` which prints the briefing
    // and Claude Code reads CLAUDE.md automatically
    console.log(context);
  },
};

registerAdapter(claudeCodeAdapter);
