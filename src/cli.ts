import { Command } from 'commander';
import { init } from './commands/init.js';
import { snapshot } from './commands/snapshot.js';
import { resume } from './commands/resume.js';
import { sync } from './commands/sync.js';
import { threadNew, threadList, threadShow } from './commands/thread.js';
import { standup } from './commands/standup.js';
import { handoff } from './commands/handoff.js';
import { archive } from './commands/archive.js';
import { isHuddleupInit, getPackageVersion } from './core/files.js';

function requireInit(): void {
  if (!isHuddleupInit()) {
    console.error('No .huddleup/ found. Run "huddleup init" first.');
    process.exit(1);
  }
}

export function createProgram(): Command {
  const program = new Command();

  program
    .name('huddleup')
    .description("Huddle up your team's AI coding sessions.")
    .version(getPackageVersion());

  program
    .command('init')
    .description('Setup HuddleUp in this project')
    .argument('[project-name]', 'Optional project name')
    .action(async (projectName?: string) => {
      await init(projectName);
    });

  program
    .command('snapshot')
    .description('Save current work state to a thread')
    .option('-n, --note <note>', 'One-line summary (non-interactive)')
    .option('-t, --thread <thread>', 'Thread name (non-interactive)')
    .option('-v, --verbose', 'Print detected adapters and extra diagnostics')
    .action(async (options: { note?: string; thread?: string; verbose?: boolean }) => {
      requireInit();
      await snapshot(options);
    });

  program
    .command('resume')
    .description('Load a saved thread back into your AI tool')
    .argument('<thread>', 'Thread name to resume')
    .action(async (thread: string) => {
      requireInit();
      await resume(thread);
    });

  program
    .command('sync')
    .description('Regenerate all AI tool files from charter')
    .action(async () => {
      requireInit();
      await sync();
    });

  const threadCmd = program
    .command('thread')
    .description('Manage work threads');

  threadCmd
    .command('new')
    .description('Create a new work thread')
    .argument('<name>', 'Thread name')
    .action(async (name: string) => {
      requireInit();
      await threadNew(name);
    });

  threadCmd
    .command('list')
    .description('List all active threads')
    .option('--json', 'Output as JSON (for scripts and the VS Code extension)')
    .action(async (options: { json?: boolean }) => {
      requireInit();
      await threadList(options);
    });

  threadCmd
    .command('show')
    .description('Show thread details')
    .argument('<name>', 'Thread name')
    .action(async (name: string) => {
      requireInit();
      await threadShow(name);
    });

  program
    .command('standup')
    .description('Show team status from all threads')
    .option('--json', 'Output as JSON')
    .option('--days <n>', 'Number of past days to include in activity (default 1)', (v) => parseInt(v, 10))
    .action(async (options: { json?: boolean; days?: number }) => {
      requireInit();
      await standup(options);
    });

  program
    .command('handoff')
    .description('Snapshot + auto-commit + notify a teammate')
    .argument('[teammate]', 'Teammate to hand off to')
    .option('-n, --note <note>', 'One-line summary (non-interactive)')
    .option('-t, --thread <thread>', 'Thread name (non-interactive)')
    .action(async (teammate: string | undefined, options: { note?: string; thread?: string }) => {
      requireInit();
      await handoff(teammate, { note: options.note, thread: options.thread });
    });

  program
    .command('archive')
    .description('Mark a thread as done and archive it')
    .argument('<name>', 'Thread name to archive')
    .action(async (name: string) => {
      requireInit();
      await archive(name);
    });

  return program;
}
