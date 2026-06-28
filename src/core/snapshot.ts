import { getDiff, GitDiff } from './git.js';
import { readFile, huddleupPath, fileExists, writeFile } from './files.js';
import { buildFrontmatter } from './markdown.js';
import { logEvent } from './history.js';
import { detectAdapter, AdapterResult } from '../adapters/base.js';

export interface SnapshotData {
  timestamp: string;
  author: string;
  tool: string;
  branch: string;
  commitHash: string;
  commitMessage: string;
  diff: string;
  filesChanged: string[];
  openFiles: string[];
  lastMessages: string[];
  note: string;
  thread: string;
  warnings: string[];
}

export async function captureSnapshot(author: string, note: string, thread: string, warnings: string[]): Promise<SnapshotData> {
  const gitData = await getDiff();
  const adapter = await detectAdapter();
  const adapterData = adapter ? await adapter.capture() : null;

  const data: SnapshotData = {
    timestamp: new Date().toISOString(),
    author,
    tool: adapter?.name || 'unknown',
    branch: gitData.branch,
    commitHash: gitData.commitHash,
    commitMessage: gitData.commitMessage,
    diff: gitData.diff,
    filesChanged: gitData.files,
    openFiles: adapterData?.openFiles || [],
    lastMessages: adapterData?.lastMessages || [],
    note,
    thread,
    warnings,
  };

  // Save to thread file
  const slug = thread.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const threadFile = huddleupPath('threads', `${slug}.md`);

  const snapshotBlock = [
    `## Snapshot — ${data.timestamp}`,
    `**Author:** ${data.author}`,
    `**Tool:** ${data.tool}`,
    `**Branch:** ${data.branch}`,
    `**Note:** ${data.note}`,
    warnings.length ? `**Warnings:** ${warnings.join('; ')}` : '',
    `**Files changed:**`,
    ...data.filesChanged.map(f => `- ${f}`),
    data.diff ? `\n**Diff:**\n\`\`\`diff\n${data.diff.slice(0, 2000)}\n\`\`\`` : '',
    data.lastMessages.length ? `\n**Last AI messages:**\n${data.lastMessages.slice(-5).map(m => `> ${m.slice(0, 300)}`).join('\n\n')}` : '',
  ].filter(Boolean).join('\n');

  if (fileExists(threadFile)) {
    const existing = readFile(threadFile);
    writeFile(threadFile, existing + '\n\n---\n\n' + snapshotBlock);
  } else {
    const content = buildFrontmatter({
      title: thread,
      status: 'active',
      owner: author,
      created: data.timestamp,
      updated: data.timestamp,
    }) + `# ${thread}\n\n${snapshotBlock}\n`;
    writeFile(threadFile, content);
  }

  // Log to history
  logEvent({
    timestamp: data.timestamp,
    command: 'snapshot',
    thread,
    author,
    tool: data.tool,
    note,
    details: {
      filesChanged: data.filesChanged.length,
      branch: data.branch,
    },
  });

  return data;
}
