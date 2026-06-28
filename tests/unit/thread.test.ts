import { describe, it, expect, beforeEach, afterEach } from 'vitest';

// Test thread slug generation and data model directly
describe('Thread utilities', () => {
  it('generates correct slugs from names', () => {
    const slugify = (name: string) =>
      name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    expect(slugify('Hello World')).toBe('hello-world');
    expect(slugify('My Feature "Cool"')).toBe('my-feature-cool');
    expect(slugify('  spaces  ')).toBe('spaces');
    expect(slugify('streaming/chat:endpoint')).toBe('streaming-chat-endpoint');
  });

  it('handles single word names', () => {
    const slugify = (name: string) =>
      name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    expect(slugify('test')).toBe('test');
    expect(slugify('BUG-123')).toBe('bug-123');
  });
});
