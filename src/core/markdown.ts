export function renderTemplate(template: string, vars: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replaceAll(`{{${key}}}`, value);
  }
  return result;
}

export function parseFrontmatter(content: string): { frontmatter: Record<string, string>; body: string } {
  const frontmatter: Record<string, string> = {};
  let body = content;

  if (content.startsWith('---')) {
    const end = content.indexOf('---', 3);
    if (end !== -1) {
      const fm = content.slice(3, end).trim();
      for (const line of fm.split('\n')) {
        const colon = line.indexOf(':');
        if (colon !== -1) {
          frontmatter[line.slice(0, colon).trim()] = line.slice(colon + 1).trim();
        }
      }
      body = content.slice(end + 3).trim();
    }
  }

  return { frontmatter, body };
}

export function buildFrontmatter(entries: Record<string, string>): string {
  const lines = Object.entries(entries)
    .map(([k, v]) => `${k}: ${v}`);
  return `---\n${lines.join('\n')}\n---\n\n`;
}
