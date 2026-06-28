import { captureSnapshot } from '../core/snapshot.js';
import { stageAll, commit } from '../core/git.js';
import { listThreads, createThread } from '../core/thread.js';
import { promptSnapshot, SnapshotAnswers } from '../prompts/snapshot-prompts.js';
import { logEvent } from '../core/history.js';
import { readFile, fileExists, huddleupPath } from '../core/files.js';
import { colors } from '../utils/colors.js';
import * as logger from '../utils/logger.js';

interface HuddleupConfig {
  handoffWebhook?: string;
  team?: string[];
}

function readConfig(): HuddleupConfig {
  const path = huddleupPath('config.json');
  if (!fileExists(path)) return {};
  try {
    return JSON.parse(readFile(path)) as HuddleupConfig;
  } catch {
    return {};
  }
}

async function fireWebhook(url: string, payload: Record<string, unknown>): Promise<void> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      logger.warning(`Webhook returned HTTP ${res.status}`);
    }
  } catch (err) {
    logger.warning(`Webhook delivery failed: ${(err as Error).message}`);
  }
}

export async function handoff(teammate?: string, options?: { note?: string; thread?: string }): Promise<void> {
  logger.header('HuddleUp - Handoff');

  let answers: SnapshotAnswers;

  if (options?.note && options?.thread) {
    answers = { note: options.note, thread: options.thread, warnings: [], createNew: false };
  } else {
    const threads = listThreads();
    answers = await promptSnapshot(threads.map((t) => t.title));

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

  try {
    await stageAll();
    await commit(`huddleup handoff: ${answers.thread} - ${answers.note}`);
    logger.success('Changes committed to git');
  } catch {
    logger.warning('Could not auto-commit (not a git repo, or nothing to commit)');
  }

  const config = readConfig();
  if (teammate && config.handoffWebhook) {
    await fireWebhook(config.handoffWebhook, {
      type: 'handoff',
      from: author,
      to: teammate,
      thread: answers.thread,
      note: answers.note,
      tools: data.tools,
      branch: data.branch,
      timestamp: data.timestamp,
    });
    logger.success(`Webhook delivered (handoff to ${teammate})`);
  } else if (teammate) {
    logger.info(`Notified: ${teammate} (set \`handoffWebhook\` in .huddleup/config.json to enable Slack/Discord delivery)`);
  }

  logEvent({
    timestamp: data.timestamp,
    command: 'handoff',
    thread: answers.thread,
    author,
    tool: data.tools.join(','),
    note: teammate ? `Handed off to ${teammate}: ${answers.note}` : answers.note,
    details: { teammate },
  });

  logger.divider();
  logger.success(`Handoff snapshot saved to ${answers.thread}.md`);
  if (teammate) {
    logger.info(colors.dim(`They can run: huddleup resume ${answers.thread}`));
  } else {
    logger.info(colors.dim('Your teammate can run:'));
    logger.info(colors.primary(`  huddleup resume ${answers.thread}`));
  }
}
