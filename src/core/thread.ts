import { readFile, writeFile, fileExists, listFiles, huddleupPath } from './files.js';
import { buildFrontmatter } from './markdown.js';

export interface ThreadMeta {
  name: string;
  status: 'active' | 'blocked' | 'done';
  owner: string;
  created: string;
  updated: string;
}

export function threadPath(name: string): string {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return huddleupPath('threads', `${slug}.md`);
}

export function listThreads(): ThreadMeta[] {
  const files = listFiles(huddleupPath('threads'), '.md');
  return files.map(f => {
    const name = f.replace('.md', '');
    const [date, time] = new Date().toISOString().split('T');
    return {
      name,
      status: 'active',
      owner: 'unknown',
      created: date,
      updated: date,
    };
  });
}

export function readThread(name: string): { meta: ThreadMeta; content: string } | null {
  const path = threadPath(name);
  if (!fileExists(path)) return null;
  const raw = readFile(path);
  const lines = raw.split('\n');
  const content = raw;
  return {
    meta: {
      name,
      status: 'active',
      owner: 'unknown',
      created: '',
      updated: '',
    },
    content,
  };
}

export function createThread(name: string, owner: string): string {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const path = huddleupPath('threads', `${slug}.md`);
  if (fileExists(path)) return path;

  const now = new Date().toISOString();
  const content = buildFrontmatter({
    title: name,
    status: 'active',
    owner,
    created: now,
    updated: now,
  }) + `# ${name}\n\n## Goal\n\n\n## Plan\n\n\n## Decisions\n\n\n## Dead Ends\n\n\n## Notes\n\n`;
  writeFile(path, content);
  return path;
}

export function archiveThread(name: string): boolean {
  const src = threadPath(name);
  if (!fileExists(src)) return false;
  const dest = huddleupPath('threads', '_archive', `${name}.md`);
  const content = readFile(src);
  // Mark as done
  const updated = content.replace(/status: .+/, 'status: done');
  writeFile(dest, updated);
  return true;
}
