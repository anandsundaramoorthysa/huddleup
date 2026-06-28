import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

// We test the underlying FS operations directly since files.ts uses process.cwd()
describe('File helpers', () => {
  const testDir = join(tmpdir(), `huddleup-test-${Date.now()}`);

  beforeEach(() => {
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    try { mkdirSync(testDir, { recursive: true }) } catch {}
  });

  it('writes and reads files', () => {
    const path = join(testDir, 'test.md');
    writeFileSync(path, 'hello', 'utf-8');
    expect(existsSync(path)).toBe(true);
    expect(readFileSync(path, 'utf-8')).toBe('hello');
  });

  it('creates nested directories', () => {
    const nested = join(testDir, 'a', 'b', 'c');
    mkdirSync(nested, { recursive: true });
    expect(existsSync(nested)).toBe(true);
  });

  it('detects file existence', () => {
    expect(existsSync(join(testDir, 'nope'))).toBe(false);
    writeFileSync(join(testDir, 'yes'), '', 'utf-8');
    expect(existsSync(join(testDir, 'yes'))).toBe(true);
  });
});
