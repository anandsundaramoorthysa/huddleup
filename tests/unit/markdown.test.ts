import { describe, it, expect } from 'vitest';
import { renderTemplate, parseFrontmatter, buildFrontmatter } from '../../src/core/markdown.js';

describe('renderTemplate', () => {
  it('replaces {{var}} placeholders', () => {
    const result = renderTemplate('Hello {{name}}', { name: 'World' });
    expect(result).toBe('Hello World');
  });

  it('replaces multiple variables', () => {
    const result = renderTemplate('{{a}} + {{b}} = {{c}}', { a: '1', b: '2', c: '3' });
    expect(result).toBe('1 + 2 = 3');
  });

  it('leaves unknown vars as-is', () => {
    const result = renderTemplate('Hi {{name}}', {});
    expect(result).toBe('Hi {{name}}');
  });

  it('handles empty template', () => {
    expect(renderTemplate('', { a: 'b' })).toBe('');
  });
});

describe('parseFrontmatter', () => {
  it('parses frontmatter and body', () => {
    const { frontmatter, body } = parseFrontmatter('---\ntitle: Test\nstatus: active\n---\n\n# Content');
    expect(frontmatter).toEqual({ title: 'Test', status: 'active' });
    expect(body).toBe('# Content');
  });

  it('returns empty frontmatter if no --- delimiters', () => {
    const { frontmatter, body } = parseFrontmatter('Just content');
    expect(frontmatter).toEqual({});
    expect(body).toBe('Just content');
  });

  it('handles multiline body', () => {
    const { frontmatter, body } = parseFrontmatter('---\nkey: val\n---\n\nLine 1\nLine 2\n');
    expect(frontmatter).toEqual({ key: 'val' });
    expect(body).toBe('Line 1\nLine 2');
  });

  it('handles empty frontmatter', () => {
    const { frontmatter, body } = parseFrontmatter('------\n\nBody');
    expect(frontmatter).toEqual({});
    expect(body).toBe('Body');
  });
});

describe('buildFrontmatter', () => {
  it('builds YAML frontmatter from object', () => {
    const result = buildFrontmatter({ title: 'My Thread', status: 'active' });
    expect(result).toContain('title: My Thread');
    expect(result).toContain('status: active');
    expect(result).toMatch(/^---/);
  });

  it('handles empty object', () => {
    const result = buildFrontmatter({});
    expect(result).toContain('---');
  });
});
