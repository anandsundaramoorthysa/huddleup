import { captureSnapshot } from '../core/snapshot.js';
import { listThreads, createThread } from '../core/thread.js';
import { promptSnapshot, SnapshotAnswers } from '../prompts/snapshot-prompts.js';
import { colors } from '../utils/colors.js';
import * as logger from '../utils/logger.js';
import { detectAdapter } from '../adapters/base.js';

export async function snapshot(options?: { note?: string; thread?: string }): Promise<void> {
  logger.header('HuddleUp — Snapshot');

  let answers: SnapshotAnswers;

  if (options?.note && options?.thread) {
    answers = {
      note: options.note,
      thread: options.thread,
      warnings: [],
      createNew: false,
    };
  } else {
    const threads = listThreads();
    answers = await promptSnapshot(threads.map(t => t.name));

    if (answers.createNew && answers.newThreadName) {
      createThread(answers.newThreadName, process.env.USER || process.env.USERNAME || 'unknown');
      logger.success(`Created new thread: ${answers.newThreadName}`);
    }
  }

  const author = process.env.USER || process.env.USERNAME || 'unknown';

  const data = await captureSnapshot(
    author,
    answers.note,
    answers.thread,
    answers.warnings,
  );

  logger.divider();
  logger.success(`Snapshot saved to threads/${answers.thread}.md`);
  logger.info(`Author: ${data.author}`);
  logger.info(`Tool: ${data.tool}`);
  logger.info(`Branch: ${data.branch}`);
  logger.info(`Files changed: ${data.filesChanged.length}`);
  logger.info(`AI messages captured: ${data.lastMessages.length}`);

  if (data.warnings.length > 0) {
    for (const w of data.warnings) {
      logger.warning(w);
    }
  }

  logger.info(colors.dim('\nYour teammate can now run:'));
  logger.info(colors.primary(`  huddleup resume ${answers.thread}`));
}
