import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ensureHuddleupDirs, writeFile, huddleupPath } from '../core/files.js';
import { renderTemplate } from '../core/markdown.js';
import { colors } from '../utils/colors.js';
import * as logger from '../utils/logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = join(__dirname, '..', 'templates');

function loadTemplate(name: string): string {
  const path = join(TEMPLATES_DIR, name);
  try {
    return readFileSync(path, 'utf-8');
  } catch {
    // If running from dist, try relative to dist
    const altPath = join(__dirname, '..', '..', 'src', 'templates', name);
    return readFileSync(altPath, 'utf-8');
  }
}

export async function init(projectName?: string): Promise<void> {
  logger.header('HuddleUp — Initializing');

  const name = projectName || process.cwd().split(/[/\\]/).pop() || 'my-project';
  const now = new Date().toISOString();

  ensureHuddleupDirs();

  // Write charter template
  const charterContent = renderTemplate(loadTemplate('charter.template.md'), {
    projectName: name,
  });
  writeFile(huddleupPath('charter.md'), charterContent);
  logger.success('Created .huddleup/charter.md');

  // Write config
  const config = {
    projectName: name,
    version: '0.1.0',
    createdAt: now,
    adapters: ['claude-code', 'cursor', 'codex', 'copilot', 'windsurf'],
    tokenExhaustionThreshold: 10,
    team: [],
    slackWebhook: '',
  };
  writeFile(huddleupPath('config.json'), JSON.stringify(config, null, 2));
  logger.success('Created .huddleup/config.json');

  // Write playbook README
  writeFile(
    huddleupPath('playbook', 'README.md'),
    '# Playbook\n\nStore reusable team patterns here:\n- how-we-test.md\n- how-we-auth.md\n- how-we-deploy.md\n',
  );
  logger.success('Created .huddleup/playbook/');

  // Generate CLAUDE.md
  const activeThreads = 'No active threads yet. Run `huddleup thread new "name"` to create one.';
  const claudeContent = renderTemplate(loadTemplate('claude.template.md'), {
    activeThreads,
  });
  writeFile(join(process.cwd(), 'CLAUDE.md'), claudeContent);
  logger.success('Generated CLAUDE.md (for Claude Code)');

  // Generate .cursor/rules/huddleup.mdc
  const cursorDir = join(process.cwd(), '.cursor', 'rules');
  const cursorContent = renderTemplate(loadTemplate('cursor.template.mdc'), {
    activeThreads,
  });
  writeFile(join(cursorDir, 'huddleup.mdc'), cursorContent);
  logger.success('Generated .cursor/rules/huddleup.mdc (for Cursor)');

  // Generate AGENTS.md
  const agentsContent = renderTemplate(loadTemplate('agents.template.md'), {
    activeThreads,
  });
  writeFile(join(process.cwd(), 'AGENTS.md'), agentsContent);
  logger.success('Generated AGENTS.md (for Codex/Copilot/generic)');

  // Generate .windsurfrules
  writeFile(join(process.cwd(), '.windsurfrules'), agentsContent);
  logger.success('Generated .windsurfrules (for Windsurf)');

  logger.success(colors.bold('\nHuddleUp is ready!'));
  logger.info('Next steps:');
  logger.info('  1. Edit .huddleup/charter.md with your project info');
  logger.info('  2. Run "huddleup thread new <name>" to create your first work item');
  logger.info('  3. Start coding! Run "huddleup snapshot" before breaks');
}
