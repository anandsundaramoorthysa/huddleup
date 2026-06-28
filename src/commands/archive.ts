import { archiveThread } from '../core/thread.js';
import { logEvent } from '../core/history.js';
import * as logger from '../utils/logger.js';

export async function archive(name: string): Promise<void> {
  const ok = archiveThread(name);
  if (!ok) {
    logger.error(`Thread "${name}" not found.`);
    process.exit(1);
  }

  const author = process.env.USER || process.env.USERNAME || 'unknown';

  logEvent({
    timestamp: new Date().toISOString(),
    command: 'archive',
    thread: name,
    author,
  });

  logger.success(`Thread "${name}" archived (moved to .huddleup/threads/_archive/).`);
  logger.info('Run "huddleup sync" to update AI tool files.');
}
