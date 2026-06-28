import { captureSnapshot } from '../core/snapshot.js';
import { stageAll, commit } from '../core/git.js';
import { listThreads, createThread } from '../core/thread.js';
import { promptSnapshot, SnapshotAnswers } from '../prompts/snapshot-prompts.js';
import { logEvent } from '../core/history.js';
import { colors } from '../utils/colors.js';
import * as logger from '../utils/logger.js';

export async function handoff(teammate?: string, options?: { note?: string; thread?: string }): Promise<void> {
  logger.header('HuddleUp — Handoff');

  let answers: SnapshotAnswers;

  if (options?.note && options?.thread) {
    answers = { note: options.note, thread: options.thread, warnings: [], createNew: false };
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

  // Auto-commit
  try {
    await stageAll();
    await commit(`huddleup handoff: ${answers.thread} — ${answers.note}`);
    logger.success('Changes committed to git');
  } catch {
    logger.warning('Could not auto-commit (not a git repo?)');
  }

  // Log handoff event
  logEvent({
    timestamp: data.timestamp,
    command: 'handoff',
    thread: answers.thread,
    author,
    tool: data.tool,
    note: teammate ? `Handed off to ${teammate}: ${answers.note}` : answers.note,
    details: { teammate },
  });

  logger.divider();
  logger.success(`Handoff snapshot saved to ${answers.thread}.md`);

  if (teammate) {
    logger.info(`Notified: ${teammate} (Slack/email integration coming in Phase 6)`);
    logger.info(colors.dim(`They can run: huddleup resume ${answers.thread}`));
  } else {
    logger.info(colors.dim('Your teammate can run:'));
    logger.info(colors.primary(`  huddleup resume ${answers.thread}`));
  }
}
