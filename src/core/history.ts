import { appendFileSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { huddleupPath, ensureDir } from './files.js';

export interface HistoryEvent {
  timestamp: string;
  command: string;
  thread?: string;
  author: string;
  tool?: string;
  note?: string;
  details?: Record<string, unknown>;
}

export function logEvent(event: HistoryEvent): void {
  const date = event.timestamp.slice(0, 10);
  const dir = huddleupPath('history');
  ensureDir(dir);
  const path = huddleupPath('history', `${date}.jsonl`);
  appendFileSync(path, JSON.stringify(event) + '\n', 'utf-8');
}

export function readHistory(_days?: number): HistoryEvent[] {
  const dir = huddleupPath('history');
  ensureDir(dir);
  const files = readdirSync(dir).filter((f: string) => f.endsWith('.jsonl'));

  const events: HistoryEvent[] = [];
  for (const file of files) {
    const content = readFileSync(join(dir, file), 'utf-8');
    for (const line of content.trim().split('\n')) {
      if (line) {
        try {
          events.push(JSON.parse(line));
        } catch {
          // skip malformed lines
        }
      }
    }
  }
  return events;
}
