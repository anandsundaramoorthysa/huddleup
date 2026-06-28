import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { warning } from './logger.js';

const IS_WINDOWS = process.platform === 'win32';

/**
 * Detect which CLI editor is installed by checking each candidate against
 * the platform's "which"-equivalent. Never invokes a shell, so it can't
 * be tricked by command-injection.
 */
function detectEditor(): string {
  const candidates = ['code', 'cursor', 'windsurf', 'code-insiders'];
  const probe = IS_WINDOWS ? 'where' : 'command';
  const probeArgs = (cmd: string) => (IS_WINDOWS ? [cmd] : ['-v', cmd]);

  for (const cmd of candidates) {
    const result = spawnSync(probe, probeArgs(cmd), { stdio: 'ignore', shell: false });
    if (result.status === 0) return cmd;
  }
  return '';
}

/**
 * Open files in the user's editor. File paths are passed as separate
 * arguments via execFileSync — no shell interpretation, so a malicious
 * thread file cannot inject a command via a crafted filename.
 */
export function openFiles(files: string[]): void {
  if (files.length === 0) return;
  const editor = detectEditor();
  if (!editor) {
    warning('No supported editor found on PATH. Install VS Code, Cursor, or Windsurf to auto-open files.');
    return;
  }
  const safeFiles = files.filter(f => existsSync(f) && !f.startsWith('-'));
  if (safeFiles.length === 0) return;
  try {
    execFileSync(editor, safeFiles, { stdio: 'ignore', shell: false });
  } catch {
    warning(`Failed to open files in ${editor}.`);
  }
}
