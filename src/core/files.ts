import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';

const HUDDLEUP_DIR = '.huddleup';

export function huddleupPath(...parts: string[]): string {
  return join(process.cwd(), HUDDLEUP_DIR, ...parts);
}

export function ensureDir(dir: string): void {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

export function ensureHuddleupDirs(): void {
  ensureDir(huddleupPath());
  ensureDir(huddleupPath('threads'));
  ensureDir(huddleupPath('threads', '_archive'));
  ensureDir(huddleupPath('history'));
  ensureDir(huddleupPath('playbook'));
}

export function readFile(path: string): string {
  return readFileSync(path, 'utf-8');
}

export function writeFile(path: string, content: string): void {
  const dir = dirname(path);
  ensureDir(dir);
  writeFileSync(path, content, 'utf-8');
}

export function fileExists(path: string): boolean {
  return existsSync(path);
}

export function listFiles(dir: string, ext?: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter(f => !ext || f.endsWith(ext));
}

export function isHuddleupInit(): boolean {
  return existsSync(huddleupPath('charter.md'));
}
