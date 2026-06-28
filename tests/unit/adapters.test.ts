import { describe, it, expect } from 'vitest';

describe('Adapter interface', () => {
  it('defines correct adapter result shape', () => {
    const result = {
      name: 'test-adapter',
      openFiles: ['src/index.ts'],
      lastMessages: ['msg1', 'msg2'],
      rawSessionPath: '/tmp/session.jsonl',
    };

    expect(result).toHaveProperty('name');
    expect(result).toHaveProperty('openFiles');
    expect(result).toHaveProperty('lastMessages');
    expect(Array.isArray(result.openFiles)).toBe(true);
    expect(Array.isArray(result.lastMessages)).toBe(true);
  });

  it('handles adapter result with no session path', () => {
    const result = {
      name: 'generic',
      openFiles: [],
      lastMessages: [],
    };

    expect(result.name).toBe('generic');
    expect(result.rawSessionPath).toBeUndefined();
  });

  it('adapter has required methods', () => {
    const adapter = {
      name: 'test',
      detect: () => false,
      capture: async () => ({ name: 'test', openFiles: [], lastMessages: [] }),
    };

    expect(typeof adapter.detect).toBe('function');
    expect(typeof adapter.capture).toBe('function');
    expect(adapter.name).toBe('test');
  });
});
