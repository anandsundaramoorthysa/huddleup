import { listThreads } from '../core/thread.js';
import { readHistory } from '../core/history.js';
import { colors } from '../utils/colors.js';
import * as logger from '../utils/logger.js';

export async function standup(options?: { json?: boolean; days?: number }): Promise<void> {
  const days = options?.days ?? 1;
  const threads = listThreads();
  const todayEvents = readHistory(days);

  if (options?.json) {
    process.stdout.write(JSON.stringify({ threads, events: todayEvents }, null, 2) + '\n');
    return;
  }

  logger.header('HuddleUp - Standup');

  console.log(colors.bold('\n  Active Threads:'));
  if (threads.length === 0) {
    console.log('    No active threads.');
  } else {
    for (const t of threads) {
      const tag = `[${t.status}]`.padEnd(10);
      const note = t.lastNote ? colors.dim(` - "${t.lastNote.slice(0, 60)}"`) : '';
      const when = t.updated ? colors.dim(` (${t.updated.slice(0, 10)})`) : '';
      console.log(`    ${colors.dim(tag)} ${colors.bold(t.title)} ${colors.dim(`(${t.owner})`)}${when}${note}`);
    }
  }

  console.log(colors.bold(`\n  Activity (last ${days} day${days === 1 ? '' : 's'}):`));
  if (todayEvents.length === 0) {
    console.log('    No events.');
  } else {
    for (const e of todayEvents.slice(-10)) {
      const when = e.timestamp.slice(11, 16);
      const cmd = `[${e.command}]`.padEnd(11);
      const noteSuffix = e.note ? ` - ${e.note.slice(0, 60)}` : '';
      console.log(`    ${colors.dim(when)} ${colors.dim(cmd)} ${e.thread || ''}${colors.dim(noteSuffix)}`);
    }
  }

  logger.divider();
  logger.info(colors.dim('Run "huddleup resume <thread>" to pick up work.'));
}
