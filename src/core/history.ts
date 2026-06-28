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

/**
 * Read history events. If `days` is given, only events from the last
 * `days` calendar days are returned (UTC date comparison).
 */
export function readHistory(days?: number): HistoryEvent[] {
  const dir = huddleupPath('history');
  ensureDir(dir);
  const files = readdirSync(dir).filter((f: string) => f.endsWith('.jsonl'));

  let cutoff: string | null = null;
  if (typeof days === 'number' && days > 0) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - days);
    cutoff = d.toISOString().slice(0, 10);
  }

  const events: HistoryEvent[] = [];
  for (const file of files) {
    const dateFromName = file.replace('.jsonl', '');
    if (cutoff && dateFromName < cutoff) continue;
    const content = readFileSync(join(dir, file), 'utf-8');
    for (const line of content.trim().split('\n')) {
      if (!line) continue;
      try {
        const event = JSON.parse(line) as HistoryEvent;
        if (cutoff && event.timestamp.slice(0, 10) < cutoff) continue;
        events.push(event);
      } catch {
        // skip malformed lines
      }
    }
  }
  return events;
}
