import { readFile, fileExists, huddleupPath } from './files.js';

export interface Charter {
  projectName: string;
  stack: string;
  conventions: string;
  team: string;
  raw: string;
}

/**
 * Section heading synonyms — users may write `## Stack` or `## Tech Stack`,
 * `## Conventions` or `## Style`, etc. Both should parse the same.
 */
const SYNONYMS: Record<keyof Omit<Charter, 'raw'>, string[]> = {
  projectName: ['Project Name', 'Project', 'Name'],
  stack: ['Tech Stack', 'Stack', 'Technology', 'Tech'],
  conventions: ['Conventions', 'Style', 'How we work', 'Code style'],
  team: ['Team', 'Team members', 'People'],
};

export function readCharter(): Charter | null {
  const path = huddleupPath('charter.md');
  if (!fileExists(path)) return null;
  const raw = readFile(path);
  return {
    projectName: extractAny(raw, SYNONYMS.projectName),
    stack: extractAny(raw, SYNONYMS.stack),
    conventions: extractAny(raw, SYNONYMS.conventions),
    team: extractAny(raw, SYNONYMS.team),
    raw,
  };
}

function extractAny(content: string, titles: string[]): string {
  for (const title of titles) {
    const section = extractSection(content, title);
    if (section) return section;
  }
  return '';
}

function extractSection(content: string, title: string): string {
  // Escape regex special chars in the title.
  const safeTitle = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`##\\s+${safeTitle}\\s*\\n([\\s\\S]*?)(?=\\n##\\s|\\n---|$)`, 'i');
  const match = content.match(re);
  return match ? match[1].trim() : '';
}
