import { statSync } from 'node:fs';
import { readFile, writeFile, fileExists, listFiles, huddleupPath, slug, removeFile } from './files.js';
import { buildFrontmatter, parseFrontmatter } from './markdown.js';

export type ThreadStatus = 'active' | 'blocked' | 'done';

export interface ThreadMeta {
  name: string;
  title: string;
  status: ThreadStatus;
  owner: string;
  created: string;
  updated: string;
  lastNote?: string;
}

export function threadPath(name: string): string {
  return huddleupPath('threads', `${slug(name)}.md`);
}

function readMeta(filename: string): ThreadMeta {
  const path = huddleupPath('threads', filename);
  const name = filename.replace(/\.md$/, '');
  let title = name;
  let status: ThreadStatus = 'active';
  let owner = 'unknown';
  let created = '';
  let updated = '';
  let lastNote: string | undefined;

  try {
    const raw = readFile(path);
    const { frontmatter, body } = parseFrontmatter(raw);
    if (frontmatter.title) title = frontmatter.title;
    if (frontmatter.status === 'blocked' || frontmatter.status === 'done') status = frontmatter.status;
    if (frontmatter.owner) owner = frontmatter.owner;
    if (frontmatter.created) created = frontmatter.created;
    if (frontmatter.updated) updated = frontmatter.updated;

    // Most recent **Note:** line wins.
    const noteMatches = body.match(/\*\*Note:\*\*\s*(.+)/g);
    if (noteMatches && noteMatches.length > 0) {
      lastNote = noteMatches[noteMatches.length - 1].replace(/\*\*Note:\*\*\s*/, '').trim();
    }
  } catch {
    // fall back to filesystem stats
  }

  if (!created || !updated) {
    try {
      const s = statSync(path);
      if (!created) created = new Date(s.birthtimeMs || s.ctimeMs).toISOString();
      if (!updated) updated = new Date(s.mtimeMs).toISOString();
    } catch {
      // leave empty
    }
  }

  return { name, title, status, owner, created, updated, lastNote };
}

export function listThreads(): ThreadMeta[] {
  const files = listFiles(huddleupPath('threads'), '.md');
  return files.map(readMeta).sort((a, b) => (b.updated > a.updated ? 1 : -1));
}

export function listArchivedThreads(): ThreadMeta[] {
  const files = listFiles(huddleupPath('threads', '_archive'), '.md');
  return files.map((f) => {
    const archivedPath = huddleupPath('threads', '_archive', f);
    const name = f.replace(/\.md$/, '');
    try {
      const raw = readFile(archivedPath);
      const { frontmatter } = parseFrontmatter(raw);
      return {
        name,
        title: frontmatter.title ?? name,
        status: 'done' as ThreadStatus,
        owner: frontmatter.owner ?? 'unknown',
        created: frontmatter.created ?? '',
        updated: frontmatter.updated ?? '',
      };
    } catch {
      return { name, title: name, status: 'done' as ThreadStatus, owner: 'unknown', created: '', updated: '' };
    }
  });
}

export function readThread(name: string): { meta: ThreadMeta; content: string } | null {
  const path = threadPath(name);
  if (!fileExists(path)) return null;
  const meta = readMeta(`${slug(name)}.md`);
  const content = readFile(path);
  return { meta, content };
}

export function createThread(name: string, owner: string): string {
  const path = threadPath(name);
  if (fileExists(path)) return path;

  const now = new Date().toISOString();
  const content =
    buildFrontmatter({
      title: name,
      status: 'active',
      owner,
      created: now,
      updated: now,
    }) +
    `# ${name}\n\n## Goal\n\n\n## Plan\n\n\n## Decisions\n\n\n## Dead Ends\n\n\n## Notes\n\n`;
  writeFile(path, content);
  return path;
}

/**
 * Move the thread file from threads/ to threads/_archive/ and mark its
 * frontmatter `status: done`. The original active file is removed
 * (rename, not copy), so it stops showing up in `standup` and `thread list`.
 */
export function archiveThread(name: string): boolean {
  const src = threadPath(name);
  if (!fileExists(src)) return false;

  const filename = `${slug(name)}.md`;
  const dest = huddleupPath('threads', '_archive', filename);

  const content = readFile(src);
  const { frontmatter, body } = parseFrontmatter(content);
  const now = new Date().toISOString();
  const updated = buildFrontmatter({
    ...frontmatter,
    status: 'done',
    updated: now,
    archivedAt: now,
  }) + body;

  writeFile(dest, updated);
  // Remove the source so it no longer appears in active listings.
  removeFile(src);
  return true;
}
