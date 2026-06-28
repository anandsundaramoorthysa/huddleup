import { describe, it, expect } from 'vitest';
import { slug } from '../../src/core/files.js';

describe('slug()', () => {
  it('produces filesystem-safe slugs', () => {
    expect(slug('Hello World')).toBe('hello-world');
    expect(slug('My Feature "Cool"')).toBe('my-feature-cool');
    expect(slug('  spaces  ')).toBe('spaces');
    expect(slug('streaming/chat:endpoint')).toBe('streaming-chat-endpoint');
  });

  it('handles single-word and alphanumeric names', () => {
    expect(slug('test')).toBe('test');
    expect(slug('BUG-123')).toBe('bug-123');
  });

  it('returns empty string for input that is entirely punctuation', () => {
    expect(slug('!!!---???')).toBe('');
  });
});
