import { createThread, listThreads, readThread } from '../core/thread.js';
import { colors } from '../utils/colors.js';
import * as logger from '../utils/logger.js';

export async function threadNew(name: string): Promise<void> {
  if (!name || name.trim().length === 0) {
    logger.error('Thread name is required.');
    process.exit(1);
  }
  const author = process.env.USER || process.env.USERNAME || 'unknown';
  const path = createThread(name, author);
  logger.success(`Thread "${name}" created at ${path}`);
  logger.info('Edit it directly, or start working and run "huddleup snapshot" to update it.');
}

export async function threadList(): Promise<void> {
  logger.header('Active Threads');
  const threads = listThreads();
  if (threads.length === 0) {
    logger.info('No active threads. Run "huddleup thread new <name>" to create one.');
    return;
  }
  for (const t of threads) {
    const statusIcon = t.status === 'blocked' ? '🔴' : t.status === 'done' ? '✅' : '🟡';
    console.log(`  ${statusIcon}  ${colors.bold(t.name)}  ${colors.dim(`(${t.owner})`)}`);
  }
}

export async function threadShow(name: string): Promise<void> {
  const thread = readThread(name);
  if (!thread) {
    logger.error(`Thread "${name}" not found.`);
    return;
  }
  console.log(`\n${colors.header(thread.meta.name)}\n`);
  console.log(thread.content);
}


