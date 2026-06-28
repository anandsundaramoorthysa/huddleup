import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readCharter } from '../core/charter.js';
import { listThreads } from '../core/thread.js';
import { writeFile, huddleupPath, fileExists, readFile } from '../core/files.js';
import { renderTemplate } from '../core/markdown.js';
import * as logger from '../utils/logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadTemplate(name: string): string {
  const candidates = [
    join(__dirname, '..', 'templates', name),
    join(__dirname, '..', '..', 'src', 'templates', name),
    join(__dirname, '..', '..', '..', 'src', 'templates', name),
  ];
  for (const p of candidates) {
    try { return readFileSync(p, 'utf-8'); } catch { /* try next */ }
  }
  throw new Error(`Could not locate template ${name}`);
}

function buildCharterBlock(): string {
  const charter = readCharter();
  if (!charter || !charter.raw.trim()) {
    return '## Project Context\n*Run `huddleup sync` after editing `.huddleup/charter.md`.*';
  }
  const inlined = charter.raw
    .replace(/^#\s+Project Charter\s*/im, '')
    .replace(/^---\s*\*This is your project's[\s\S]*$/im, '')
    .trim();
  return '## Project Context (mirrored from `.huddleup/charter.md`)\n\n' + inlined;
}

function readTokenThreshold(): number {
  const path = huddleupPath('config.json');
  if (!fileExists(path)) return 10;
  try {
    const cfg = JSON.parse(readFile(path)) as { tokenExhaustionThresholdPercent?: number };
    if (typeof cfg.tokenExhaustionThresholdPercent === 'number' && cfg.tokenExhaustionThresholdPercent > 0) {
      return cfg.tokenExhaustionThresholdPercent;
    }
  } catch {
    // fall through
  }
  return 10;
}

export async function sync(): Promise<void> {
  logger.header('HuddleUp - Sync');

  const charter = readCharter();
  if (!charter) {
    logger.error('No charter found. Run "huddleup init" first.');
    process.exit(1);
  }

  const threads = listThreads();
  const activeThreads = threads.length > 0
    ? threads.map((t) => `- ${t.title} (${t.status}, owner: ${t.owner})`).join('\n')
    : 'No active threads.';

  const vars = {
    charterBlock: buildCharterBlock(),
    activeThreads,
    tokenThreshold: String(readTokenThreshold()),
  };

  writeFile(join(process.cwd(), 'CLAUDE.md'), renderTemplate(loadTemplate('claude.template.md'), vars));
  logger.success('Synced CLAUDE.md');

  writeFile(join(process.cwd(), '.cursor', 'rules', 'huddleup.mdc'), renderTemplate(loadTemplate('cursor.template.mdc'), vars));
  logger.success('Synced .cursor/rules/huddleup.mdc');

  const agentsContent = renderTemplate(loadTemplate('agents.template.md'), vars);
  writeFile(join(process.cwd(), 'AGENTS.md'), agentsContent);
  logger.success('Synced AGENTS.md');

  writeFile(join(process.cwd(), '.windsurfrules'), agentsContent);
  logger.success('Synced .windsurfrules');

  logger.success('\nAll AI tool files are in sync with your charter.');
}
