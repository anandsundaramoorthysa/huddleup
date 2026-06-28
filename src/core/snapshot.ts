import { getDiff } from './git.js';
import { readFile, huddleupPath, fileExists, writeFile, slug } from './files.js';
import { buildFrontmatter, parseFrontmatter } from './markdown.js';
import { logEvent } from './history.js';
import { detectAllAdapters } from '../adapters/base.js';

export interface SnapshotData {
  timestamp: string;
  author: string;
  tools: string[];
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

export async function captureSnapshot(
  author: string,
  note: string,
  thread: string,
  warnings: string[],
): Promise<SnapshotData> {
  const gitData = await getDiff();
  const adapters = detectAllAdapters();

  const openFiles = new Set<string>();
  const lastMessages: string[] = [];
  const toolNames: string[] = [];

  for (const adapter of adapters) {
    const result = await adapter.capture();
    if (result.name !== 'generic' || adapters.length === 1) toolNames.push(result.name);
    for (const f of result.openFiles) openFiles.add(f);
    for (const m of result.lastMessages) lastMessages.push(m);
  }

  const data: SnapshotData = {
    timestamp: new Date().toISOString(),
    author,
    tools: toolNames.length > 0 ? toolNames : ['unknown'],
    branch: gitData.branch,
    commitHash: gitData.commitHash,
    commitMessage: gitData.commitMessage,
    diff: gitData.diff,
    filesChanged: gitData.files,
    openFiles: [...openFiles],
    lastMessages,
    note,
    thread,
    warnings,
  };

  const threadFile = huddleupPath('threads', `${slug(thread)}.md`);

  const snapshotBlock = [
    `## Snapshot - ${data.timestamp}`,
    `**Author:** ${data.author}`,
    `**Tools:** ${data.tools.join(', ')}`,
    `**Branch:** ${data.branch}`,
    `**Last commit:** ${data.commitHash.slice(0, 8)} ${data.commitMessage}`,
    `**Note:** ${data.note}`,
    warnings.length ? `**Warnings:** ${warnings.join('; ')}` : '',
    data.filesChanged.length ? `**Files changed:**\n${data.filesChanged.map((f) => `- ${f}`).join('\n')}` : '',
    data.openFiles.length ? `**Open files:**\n${data.openFiles.map((f) => `- ${f}`).join('\n')}` : '',
    data.diff ? `\n**Diff (first 2 KB):**\n\`\`\`diff\n${data.diff.slice(0, 2000)}\n\`\`\`` : '',
    data.lastMessages.length ? `\n**Last AI messages:**\n${data.lastMessages.slice(-5).map((m) => `> ${m.slice(0, 300)}`).join('\n\n')}` : '',
  ].filter(Boolean).join('\n');

  if (fileExists(threadFile)) {
    const existing = readFile(threadFile);
    const { frontmatter, body } = parseFrontmatter(existing);
    const updated = buildFrontmatter({
      ...frontmatter,
      updated: data.timestamp,
      owner: frontmatter.owner || data.author,
    }) + body + '\n\n---\n\n' + snapshotBlock + '\n';
    writeFile(threadFile, updated);
  } else {
    const content =
      buildFrontmatter({
        title: thread,
        status: 'active',
        owner: author,
        created: data.timestamp,
        updated: data.timestamp,
      }) + `# ${thread}\n\n${snapshotBlock}\n`;
    writeFile(threadFile, content);
  }

  logEvent({
    timestamp: data.timestamp,
    command: 'snapshot',
    thread,
    author,
    tool: data.tools.join(','),
    note,
    details: {
      filesChanged: data.filesChanged.length,
      branch: data.branch,
      commitHash: data.commitHash.slice(0, 8),
    },
  });

  return data;
}
