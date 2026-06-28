import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { warning } from './logger.js';

function detectEditor(): string {
  const editors = [
    { cmd: 'code', name: 'VS Code' },
    { cmd: 'cursor', name: 'Cursor' },
    { cmd: 'windsurf', name: 'Windsurf' },
    { cmd: 'code-insiders', name: 'VS Code Insiders' },
  ];
  for (const editor of editors) {
    try {
      execSync(`where ${editor.cmd}`, { stdio: 'ignore' });
      return editor.cmd;
    } catch {
      continue;
    }
  }
  return '';
}

export function openFiles(files: string[]): void {
  if (files.length === 0) return;
  const editor = detectEditor();
  if (!editor) {
    warning('No supported editor found. Install VS Code or Cursor to auto-open files.');
    return;
  }
  for (const file of files) {
    if (existsSync(file)) {
      try {
        execSync(`"${editor}" "${file}"`, { stdio: 'ignore' });
      } catch {
        warning(`Failed to open ${file}`);
      }
    }
  }
}
