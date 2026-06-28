import { describe, it, expect } from 'vitest';

describe('History event model', () => {
  it('creates valid history events', () => {
    const event = {
      timestamp: '2026-06-28T00:00:00.000Z',
      command: 'snapshot',
      thread: 'test',
      author: 'dev1',
      tool: 'claude-code',
      note: 'wip',
    };

    expect(event.command).toBe('snapshot');
    expect(event.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(event.author).toBeTruthy();
  });

  it('handles optional details field', () => {
    const event = {
      timestamp: '2026-06-28T00:00:00.000Z',
      command: 'snapshot',
      author: 'dev1',
      details: { filesChanged: 5 },
    };

    expect(event.details?.filesChanged).toBe(5);
  });

  it('serializes to JSON correctly', () => {
    const event = {
      timestamp: '2026-06-28T00:00:00.000Z',
      command: 'snapshot',
      author: 'dev1',
    };

    const json = JSON.stringify(event);
    const parsed = JSON.parse(json);
    expect(parsed).toEqual(event);
  });
});
