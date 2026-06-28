import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, existsSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { extractFilePaths } from '../../src/adapters/base.js';

const ORIGINAL_CWD = process.cwd();

function makeWorkdir(prefix: string): string {
  const dir = join(tmpdir(), `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  mkdirSync(dir, { recursive: true });
  process.chdir(dir);
  return dir;
}

function cleanupWorkdir(dir: string): void {
  // Get out of the directory before removing it (Windows EBUSY guard).
  try { process.chdir(ORIGINAL_CWD); } catch { /* noop */ }
  if (existsSync(dir)) {
    try { rmSync(dir, { recursive: true, force: true }); } catch { /* noop */ }
  }
}

describe('extractFilePaths()', () => {
  it('extracts repo-relative paths with known extensions', () => {
    const messages = [
      'open src/index.ts and tests/cli.test.ts',
      'modified `routes/chat.js` plus README.md',
    ];
    const paths = extractFilePaths(messages);
    expect(paths).toContain('src/index.ts');
    expect(paths).toContain('tests/cli.test.ts');
    expect(paths).toContain('routes/chat.js');
    expect(paths).toContain('README.md');
  });

  it('ignores version numbers and unknown extensions', () => {
    const messages = ['bumped to 1.0.1 from 1.0.0', 'pinged api.example.com'];
    const paths = extractFilePaths(messages);
    expect(paths).toHaveLength(0);
  });

  it('ignores node_modules and build paths', () => {
    const messages = ['error in node_modules/react/index.js'];
    const paths = extractFilePaths(messages);
    expect(paths).toHaveLength(0);
  });

  it('respects the limit parameter', () => {
    const messages = ['a.ts b.ts c.ts d.ts e.ts f.ts'];
    const paths = extractFilePaths(messages, 3);
    expect(paths).toHaveLength(3);
  });
});

describe('Charter synonyms', () => {
  let workdir = '';

  beforeEach(() => {
    workdir = makeWorkdir('hu-charter');
    mkdirSync(join(workdir, '.huddleup'), { recursive: true });
  });

  afterEach(() => {
    cleanupWorkdir(workdir);
  });

  it('parses "## Stack" as a Tech Stack synonym', async () => {
    writeFileSync(
      join(workdir, '.huddleup', 'charter.md'),
      '# Project Charter\n\n## Stack\n- TypeScript\n- Node 20\n\n## Style\n- Two-space indent\n',
      'utf-8',
    );
    const { readCharter } = await import('../../src/core/charter.js');
    const c = readCharter();
    expect(c).not.toBeNull();
    expect(c!.stack).toContain('TypeScript');
    expect(c!.conventions).toContain('indent');
  });
});

describe('Archive moves, does not copy', () => {
  let workdir = '';

  beforeEach(() => {
    workdir = makeWorkdir('hu-arch');
    mkdirSync(join(workdir, '.huddleup', 'threads', '_archive'), { recursive: true });
    mkdirSync(join(workdir, '.huddleup', 'history'), { recursive: true });
    mkdirSync(join(workdir, '.huddleup', 'playbook'), { recursive: true });
    writeFileSync(join(workdir, '.huddleup', 'charter.md'), '# Project Charter\n', 'utf-8');
  });

  afterEach(() => {
    cleanupWorkdir(workdir);
  });

  it('removes the original file and writes a done version under _archive/', async () => {
    const { createThread, archiveThread, listThreads, listArchivedThreads } = await import('../../src/core/thread.js');
    createThread('Demo Feature', 'alice');
    expect(listThreads()).toHaveLength(1);

    const ok = archiveThread('Demo Feature');
    expect(ok).toBe(true);

    expect(listThreads()).toHaveLength(0);
    const archived = listArchivedThreads();
    expect(archived).toHaveLength(1);
    expect(archived[0].status).toBe('done');

    const archivedFile = join(workdir, '.huddleup', 'threads', '_archive', 'demo-feature.md');
    expect(existsSync(archivedFile)).toBe(true);
    expect(readFileSync(archivedFile, 'utf-8')).toContain('status: done');
    expect(existsSync(join(workdir, '.huddleup', 'threads', 'demo-feature.md'))).toBe(false);
  });
});

describe('History days filter', () => {
  let workdir = '';

  beforeEach(() => {
    workdir = makeWorkdir('hu-hist');
    mkdirSync(join(workdir, '.huddleup', 'history'), { recursive: true });
  });

  afterEach(() => {
    cleanupWorkdir(workdir);
  });

  it('returns only events within the given window', async () => {
    const today = new Date().toISOString().slice(0, 10);
    const old = new Date(Date.now() - 10 * 86400_000).toISOString().slice(0, 10);

    writeFileSync(
      join(workdir, '.huddleup', 'history', `${today}.jsonl`),
      JSON.stringify({ timestamp: `${today}T10:00:00Z`, command: 'snapshot', author: 'a' }) + '\n',
      'utf-8',
    );
    writeFileSync(
      join(workdir, '.huddleup', 'history', `${old}.jsonl`),
      JSON.stringify({ timestamp: `${old}T10:00:00Z`, command: 'snapshot', author: 'a' }) + '\n',
      'utf-8',
    );

    const { readHistory } = await import('../../src/core/history.js');
    const recent = readHistory(2);
    const all = readHistory();

    expect(recent).toHaveLength(1);
    expect(all).toHaveLength(2);
  });
});

describe('Version reads from package.json', () => {
  it('returns a non-zero semver string', async () => {
    const { getPackageVersion } = await import('../../src/core/files.js');
    const v = getPackageVersion();
    expect(v).toMatch(/^\d+\.\d+\.\d+/);
    expect(v).not.toBe('0.0.0');
  });
});
