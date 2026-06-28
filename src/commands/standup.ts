import { listThreads } from '../core/thread.js';
import { readHistory, HistoryEvent } from '../core/history.js';
import { colors } from '../utils/colors.js';
import * as logger from '../utils/logger.js';

export async function standup(): Promise<void> {
  logger.header('HuddleUp — Standup');

  const threads = listThreads();
  const history = readHistory(1);

  console.log(colors.bold('\n  Active Threads:'));
  if (threads.length === 0) {
    console.log('    No active threads.');
  } else {
    for (const t of threads) {
      const icon = t.status === 'blocked' ? '🔴' : '🟡';
      console.log(`    ${icon} ${colors.bold(t.name)} ${colors.dim(`(${t.owner})`)}`);
    }
  }

  const todayEvents = history.filter(e => {
    const today = new Date().toISOString().slice(0, 10);
    return e.timestamp.slice(0, 10) === today;
  });

  console.log(colors.bold('\n  Today\'s Activity:'));
  if (todayEvents.length === 0) {
    console.log('    No events today.');
  } else {
    for (const e of todayEvents.slice(-10)) {
      const icon = e.command === 'snapshot' ? '📸' : e.command === 'handoff' ? '🤝' : '📝';
      console.log(`    ${icon} ${e.command} ${e.thread ? `→ ${e.thread}` : ''} ${e.note ? `— ${e.note.slice(0, 60)}` : ''}`);
    }
  }

  logger.divider();
  logger.info(colors.dim('Run "huddleup resume <thread>" to pick up work.'));
}
