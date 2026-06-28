import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { mkdirSync, writeFileSync, rmSync, readFileSync, readdirSync } from 'node:fs';

const FIXTURES = join(import.meta.dirname, '..', 'fixtures');

let fakeHome = '';
let prevFakeHome = '';

vi.mock('node:os', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:os')>();
  return {
    ...actual,
    homedir: () => fakeHome,
  };
});

function copyFixture(srcDir: string, destDir: string): void {
  mkdirSync(destDir, { recursive: true });
  const files = readdirSync(srcDir);
  for (const f of files) {
    const content = readFileSync(join(srcDir, f), 'utf-8');
    writeFileSync(join(destDir, f), content, 'utf-8');
  }
}

describe('Adapter integration tests', () => {
  let origLocalAppData: string | undefined;
  let origAppData: string | undefined;

  beforeEach(() => {
    if (prevFakeHome) {
      rmSync(prevFakeHome, { recursive: true, force: true });
    }
    fakeHome = join(tmpdir(), `huddleup-int-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    prevFakeHome = fakeHome;
    origLocalAppData = process.env.LOCALAPPDATA;
    origAppData = process.env.APPDATA;
    process.env.LOCALAPPDATA = join(fakeHome, 'nonexistent-appdata');
    process.env.APPDATA = join(fakeHome, 'nonexistent-appdata');
    vi.resetModules();
  });

  afterEach(() => {
    if (prevFakeHome) {
      rmSync(prevFakeHome, { recursive: true, force: true });
    }
    fakeHome = '';
    prevFakeHome = '';
    process.env.LOCALAPPDATA = origLocalAppData;
    process.env.APPDATA = origAppData;
  });

  describe('Claude Code', () => {
    it('captures messages from fixture session', async () => {
      const sessionDir = join(fakeHome, '.claude', 'sessions');
      copyFixture(join(FIXTURES, 'claude-code'), sessionDir);
      const { claudeCodeAdapter } = await import('../../src/adapters/claude-code.js');

      expect(claudeCodeAdapter.detect()).toBe(true);
      const result = await claudeCodeAdapter.capture();

      expect(result.name).toBe('claude-code');
      expect(result.lastMessages.length).toBeGreaterThan(0);
      expect(result.lastMessages[result.lastMessages.length - 1]).toContain('streaming chat endpoint');
      expect(result.rawSessionPath).toBeTruthy();
    });

    it('returns empty messages when no session dir exists', async () => {
      const { claudeCodeAdapter } = await import('../../src/adapters/claude-code.js');

      expect(claudeCodeAdapter.detect()).toBe(false);
      const result = await claudeCodeAdapter.capture();

      expect(result.lastMessages).toHaveLength(0);
    });
  });

  describe('Cursor', () => {
    it('captures messages from fixture chat', async () => {
      const chatDir = join(fakeHome, '.cursor', 'chats');
      copyFixture(join(FIXTURES, 'cursor'), chatDir);
      const { cursorAdapter } = await import('../../src/adapters/cursor.js');

      expect(cursorAdapter.detect()).toBe(true);
      const result = await cursorAdapter.capture();

      expect(result.name).toBe('cursor');
      expect(result.lastMessages.length).toBeGreaterThan(0);
      expect(result.lastMessages.some(m => m.includes('Chat component'))).toBe(true);
    });

    it('reads from the first matching path in priority order', async () => {
      const sessionDir = join(fakeHome, '.cursor', 'sessions');
      copyFixture(join(FIXTURES, 'cursor'), sessionDir);
      const { cursorAdapter } = await import('../../src/adapters/cursor.js');

      expect(cursorAdapter.detect()).toBe(true);
      const result = await cursorAdapter.capture();

      expect(result.lastMessages.length).toBeGreaterThan(0);
    });
  });

  describe('Codex', () => {
    it('captures messages from fixture session', async () => {
      const sessionDir = join(fakeHome, '.codex');
      copyFixture(join(FIXTURES, 'codex'), sessionDir);
      const { codexAdapter } = await import('../../src/adapters/codex.js');

      expect(codexAdapter.detect()).toBe(true);
      const result = await codexAdapter.capture();

      expect(result.name).toBe('codex');
      expect(result.lastMessages.length).toBeGreaterThan(0);
      expect(result.lastMessages.some(m => m.includes('input validation'))).toBe(true);
    });
  });

  describe('Copilot', () => {
    it('captures messages from fixture chat', async () => {
      const chatDir = join(fakeHome, '.copilot');
      copyFixture(join(FIXTURES, 'copilot'), chatDir);
      const { copilotAdapter } = await import('../../src/adapters/copilot.js');

      expect(copilotAdapter.detect()).toBe(true);
      const result = await copilotAdapter.capture();

      expect(result.name).toBe('copilot');
      expect(result.lastMessages.length).toBeGreaterThan(0);
      expect(result.lastMessages.some(m => m.includes('SQL'))).toBe(true);
    });
  });

  describe('Windsurf', () => {
    it('captures messages from fixture chat', async () => {
      const sessionDir = join(fakeHome, '.windsurf');
      copyFixture(join(FIXTURES, 'windsurf'), sessionDir);
      const { windsurfAdapter } = await import('../../src/adapters/windsurf.js');

      expect(windsurfAdapter.detect()).toBe(true);
      const result = await windsurfAdapter.capture();

      expect(result.name).toBe('windsurf');
      expect(result.lastMessages.length).toBeGreaterThan(0);
      expect(result.lastMessages.some(m => m.includes('Docker'))).toBe(true);
    });
  });

  describe('Generic adapter', () => {
    it('always detects and returns empty capture', async () => {
      const { genericAdapter } = await import('../../src/adapters/generic.js');

      expect(genericAdapter.detect()).toBe(true);
      const result = await genericAdapter.capture();

      expect(result.name).toBe('generic');
      expect(result.lastMessages).toHaveLength(0);
    });
  });

  describe('Fuzz resilience', () => {
    it('handles malformed JSONL lines gracefully', async () => {
      const sessionDir = join(fakeHome, '.claude', 'sessions');
      mkdirSync(sessionDir, { recursive: true });
      writeFileSync(join(sessionDir, 'session.jsonl'), [
        '{"role":"user","content":"valid message"}',
        'not valid json at all',
        '{"role":"assistant","content":"partial line',
        '',
        '{"role":"user","content":"back to valid"}',
      ].join('\n'), 'utf-8');

      const { claudeCodeAdapter } = await import('../../src/adapters/claude-code.js');
      const result = await claudeCodeAdapter.capture();

      expect(result.lastMessages.length).toBeGreaterThan(0);
      expect(result.lastMessages.some(m => m === 'valid message')).toBe(true);
      expect(result.lastMessages.some(m => m === 'back to valid')).toBe(true);
    });

    it('handles empty session file', async () => {
      const sessionDir = join(fakeHome, '.cursor', 'chats');
      mkdirSync(sessionDir, { recursive: true });
      writeFileSync(join(sessionDir, 'empty.jsonl'), '', 'utf-8');

      const { cursorAdapter } = await import('../../src/adapters/cursor.js');
      const result = await cursorAdapter.capture();

      expect(result.lastMessages.every(m => m === '')).toBe(true);
    });

    it('handles nonexistent directory gracefully', async () => {
      const { codexAdapter } = await import('../../src/adapters/codex.js');

      expect(codexAdapter.detect()).toBe(false);
      const result = await codexAdapter.capture();

      expect(result.lastMessages).toHaveLength(0);
    });

    it('handles very large message content without crashing', async () => {
      const sessionDir = join(fakeHome, '.windsurf');
      mkdirSync(sessionDir, { recursive: true });
      const hugeContent = 'x'.repeat(10000);
      writeFileSync(join(sessionDir, 'huge.jsonl'), JSON.stringify({ query: hugeContent }), 'utf-8');

      const { windsurfAdapter } = await import('../../src/adapters/windsurf.js');
      const result = await windsurfAdapter.capture();

      expect(result.lastMessages.length).toBeGreaterThan(0);
      expect(result.lastMessages.every(m => m.length <= 500)).toBe(true);
    });
  });
});
