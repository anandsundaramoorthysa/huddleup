import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ensureHuddleupDirs, writeFile, huddleupPath, fileExists, getPackageVersion } from '../core/files.js';
import { renderTemplate } from '../core/markdown.js';
import { readCharter } from '../core/charter.js';
import { listThreads } from '../core/thread.js';
import { colors } from '../utils/colors.js';
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

function formatActiveThreads(): string {
  const threads = listThreads();
  if (threads.length === 0) {
    return 'No active threads yet. Run `huddleup thread new "name"` to create one.';
  }
  return threads.map((t) => `- ${t.title} (${t.status}, owner: ${t.owner})`).join('\n');
}

export async function init(projectName?: string): Promise<void> {
  logger.header('HuddleUp - Initializing');

  const name = projectName || process.cwd().split(/[/\\]/).pop() || 'my-project';
  const now = new Date().toISOString();

  ensureHuddleupDirs();

  // Charter
  const charterPath = huddleupPath('charter.md');
  if (!fileExists(charterPath)) {
    const charterContent = renderTemplate(loadTemplate('charter.template.md'), { projectName: name });
    writeFile(charterPath, charterContent);
    logger.success('Created .huddleup/charter.md');
  } else {
    logger.info('.huddleup/charter.md already exists - preserved');
  }

  // Config
  const tokenThreshold = 10;
  const config = {
    projectName: name,
    version: getPackageVersion(),
    createdAt: now,
    adapters: ['claude-code', 'cursor', 'codex', 'copilot', 'windsurf'],
    tokenExhaustionThresholdPercent: tokenThreshold,
    team: [] as string[],
    handoffWebhook: '',
  };
  writeFile(huddleupPath('config.json'), JSON.stringify(config, null, 2) + '\n');
  logger.success('Created .huddleup/config.json');

  // Playbook
  writeFile(
    huddleupPath('playbook', 'README.md'),
    '# Playbook\n\nStore reusable team patterns here:\n- how-we-test.md\n- how-we-auth.md\n- how-we-deploy.md\n',
  );
  logger.success('Created .huddleup/playbook/');

  // Generated AI tool files
  const vars = {
    charterBlock: buildCharterBlock(),
    activeThreads: formatActiveThreads(),
    tokenThreshold: String(tokenThreshold),
  };

  writeFile(join(process.cwd(), 'CLAUDE.md'), renderTemplate(loadTemplate('claude.template.md'), vars));
  logger.success('Generated CLAUDE.md (for Claude Code)');

  writeFile(join(process.cwd(), '.cursor', 'rules', 'huddleup.mdc'), renderTemplate(loadTemplate('cursor.template.mdc'), vars));
  logger.success('Generated .cursor/rules/huddleup.mdc (for Cursor)');

  const agentsContent = renderTemplate(loadTemplate('agents.template.md'), vars);
  writeFile(join(process.cwd(), 'AGENTS.md'), agentsContent);
  logger.success('Generated AGENTS.md (for Codex/Copilot/generic)');

  writeFile(join(process.cwd(), '.windsurfrules'), agentsContent);
  logger.success('Generated .windsurfrules (for Windsurf)');

  logger.success(colors.bold('\nHuddleUp is ready!'));
  logger.info('Next steps:');
  logger.info('  1. Edit .huddleup/charter.md with your project info');
  logger.info('  2. Run "huddleup sync" after editing the charter');
  logger.info('  3. Run "huddleup thread new <name>" to create your first work item');
  logger.info('  4. Start coding! Run "huddleup snapshot" before breaks');
}
