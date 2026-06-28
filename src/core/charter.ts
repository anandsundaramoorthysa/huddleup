import { readFile, fileExists, huddleupPath } from './files.js';

export interface Charter {
  projectName: string;
  stack: string;
  conventions: string;
  team: string;
  raw: string;
}

export function readCharter(): Charter | null {
  const path = huddleupPath('charter.md');
  if (!fileExists(path)) return null;
  const raw = readFile(path);
  return {
    projectName: extractSection(raw, 'Project Name'),
    stack: extractSection(raw, 'Tech Stack'),
    conventions: extractSection(raw, 'Conventions'),
    team: extractSection(raw, 'Team'),
    raw,
  };
}

function extractSection(content: string, title: string): string {
  const re = new RegExp(`##\\s*${title}[\\s\\S]*?(?=\\n##|$)`, 'i');
  const match = content.match(re);
  if (!match) return '';
  return match[0].split('\n').slice(1).join('\n').trim();
}
