import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, rmSync, renameSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

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

export function removeFile(path: string): void {
  if (existsSync(path)) rmSync(path, { force: true });
}

export function moveFile(src: string, dest: string): void {
  ensureDir(dirname(dest));
  renameSync(src, dest);
}

export function isHuddleupInit(): boolean {
  return existsSync(huddleupPath('charter.md'));
}

/**
 * Convert an arbitrary thread title into a filesystem-safe slug.
 * "Streaming Chat Endpoint!" -> "streaming-chat-endpoint"
 */
export function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/**
 * Read the version field of the CLI's own package.json.
 * Used by `huddleup --version` and by `init` when writing config.json.
 */
let cachedVersion: string | null = null;
export function getPackageVersion(): string {
  if (cachedVersion) return cachedVersion;
  try {
    const here = dirname(fileURLToPath(import.meta.url));
    // src/core/files.ts -> ../../package.json (src→.. and core→..)
    const candidates = [
      join(here, '..', '..', 'package.json'),         // running from src/
      join(here, '..', '..', '..', 'package.json'),   // running from dist/core/
    ];
    for (const p of candidates) {
      if (existsSync(p)) {
        const pkg = JSON.parse(readFileSync(p, 'utf-8')) as { version?: string };
        if (pkg.version) {
          cachedVersion = pkg.version;
          return cachedVersion;
        }
      }
    }
  } catch {
    // fall through
  }
  cachedVersion = '0.0.0';
  return cachedVersion;
}
