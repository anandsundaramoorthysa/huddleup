import { describe, it, expect } from 'vitest';

describe('Snapshot data model', () => {
  it('creates snapshot with required fields', () => {
    const snapshot = {
      timestamp: new Date().toISOString(),
      author: 'dev1',
      tools: ['claude-code'],
      branch: 'master',
      commitHash: 'abc123',
      commitMessage: 'fix: streaming',
      diff: 'diff --git a/test.js b/test.js\nindex abc..def 100644\n--- a/test.js\n+++ b/test.js\n@@ -1 +1 @@\n-hello\n+world',
      filesChanged: ['test.js'],
      openFiles: ['test.js'],
      lastMessages: ['User: fix this', 'AI: here is the fix'],
      note: 'WIP on streaming endpoint',
      thread: 'streaming-chat',
      warnings: ['CORS issue not resolved'],
    };

    expect(snapshot.author).toBe('dev1');
    expect(snapshot.tools).toContain('claude-code');
    expect(snapshot.filesChanged).toContain('test.js');
    expect(snapshot.lastMessages).toHaveLength(2);
    expect(snapshot.warnings).toHaveLength(1);
    expect(snapshot.diff).toContain('diff --git');
    expect(snapshot.commitMessage).toBeTruthy();
    expect(snapshot.timestamp).toBeTruthy();
  });

  it('handles empty optional fields', () => {
    const snapshot = {
      timestamp: new Date().toISOString(),
      author: 'dev1',
      tools: ['unknown'],
      branch: 'master',
      commitHash: 'abc',
      commitMessage: '',
      diff: '',
      filesChanged: [],
      openFiles: [],
      lastMessages: [],
      note: 'quick save',
      thread: 'test',
      warnings: [],
    };

    expect(snapshot.filesChanged).toHaveLength(0);
    expect(snapshot.lastMessages).toHaveLength(0);
    expect(snapshot.warnings).toHaveLength(0);
    expect(snapshot.diff).toBe('');
  });
});
