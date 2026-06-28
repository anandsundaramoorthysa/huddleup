import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readCharter } from '../core/charter.js';
import { listThreads } from '../core/thread.js';
import { writeFile } from '../core/files.js';
import { renderTemplate } from '../core/markdown.js';
import * as logger from '../utils/logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadTemplate(name: string): string {
  try {
    return readFileSync(join(__dirname, '..', 'templates', name), 'utf-8');
  } catch {
    return readFileSync(join(__dirname, '..', '..', 'src', 'templates', name), 'utf-8');
  }
}

export async function sync(): Promise<void> {
  logger.header('HuddleUp — Sync');

  const charter = readCharter();
  if (!charter) {
    logger.error('No charter found. Run "huddleup init" first.');
    process.exit(1);
  }

  const threads = listThreads();
  const activeThreads = threads.length > 0
    ? threads.map(t => `- ${t.name}`).join('\n')
    : 'No active threads.';

  const vars = { activeThreads };

  // Regenerate CLAUDE.md
  const claudeContent = renderTemplate(loadTemplate('claude.template.md'), vars);
  writeFile(join(process.cwd(), 'CLAUDE.md'), claudeContent);
  logger.success('Synced CLAUDE.md');

  // Regenerate .cursor/rules/huddleup.mdc
  const cursorDir = join(process.cwd(), '.cursor', 'rules');
  const cursorContent = renderTemplate(loadTemplate('cursor.template.mdc'), vars);
  writeFile(join(cursorDir, 'huddleup.mdc'), cursorContent);
  logger.success('Synced .cursor/rules/huddleup.mdc');

  // Regenerate AGENTS.md
  const agentsContent = renderTemplate(loadTemplate('agents.template.md'), vars);
  writeFile(join(process.cwd(), 'AGENTS.md'), agentsContent);
  logger.success('Synced AGENTS.md');

  // Regenerate .windsurfrules
  writeFile(join(process.cwd(), '.windsurfrules'), agentsContent);
  logger.success('Synced .windsurfrules');

  logger.success('\nAll AI tool files are in sync with your charter.');
}
