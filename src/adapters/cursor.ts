import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { Adapter, AdapterResult, registerAdapter } from './base.js';

// Cursor stores chat history in various locations depending on version
const POSSIBLE_PATHS = [
  join(homedir(), '.cursor', 'sessions'),
  join(homedir(), '.cursor', 'chats'),
  join(process.env.LOCALAPPDATA || '', 'Cursor', 'User', 'workspaceStorage'),
];

function findCursorSessionDir(): string | null {
  for (const p of POSSIBLE_PATHS) {
    if (existsSync(p)) return p;
  }
  return null;
}

export const cursorAdapter: Adapter = {
  name: 'cursor',
  detect(): boolean {
    return findCursorSessionDir() !== null;
  },
  async capture(): Promise<AdapterResult> {
    const dir = findCursorSessionDir();
    const messages: string[] = [];

    if (dir) {
      try {
        const files = readdirSync(dir)
          .filter(f => f.endsWith('.json') || f.endsWith('.jsonl'))
          .map(f => ({ name: f, time: statSync(join(dir, f)).mtimeMs }))
          .sort((a, b) => b.time - a.time);

        if (files.length > 0) {
          const latest = join(dir, files[0].name);
          const content = readFileSync(latest, 'utf-8');
          const lines = content.trim().split('\n').slice(-50);
          for (const line of lines) {
            try {
              const parsed = JSON.parse(line);
              const text = parsed.text || parsed.content || parsed.message || '';
              if (text) messages.push(typeof text === 'string' ? text.slice(0, 500) : JSON.stringify(text).slice(0, 500));
            } catch {
              messages.push(line.slice(0, 500));
            }
          }
        }
      } catch {
        // couldn't read cursor data
      }
    }

    return {
      name: 'cursor',
      openFiles: [],
      lastMessages: messages.reverse(),
      rawSessionPath: dir || undefined,
    };
  },
  async inject(context: string): Promise<void> {
    // Cursor uses .cursor/rules/huddleup.mdc for context injection
    // The context is written there by the `resume` command via its template
    console.log(context);
  },
};

registerAdapter(cursorAdapter);
