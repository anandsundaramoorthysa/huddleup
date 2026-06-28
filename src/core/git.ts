import simpleGit from 'simple-git';

const git = simpleGit();

export interface GitDiff {
  diff: string;
  files: string[];
  staged: string[];
  branch: string;
  commitHash: string;
  commitMessage: string;
}

export async function getDiff(): Promise<GitDiff> {
  const [diff, stagedDiff, status, log, branch] = await Promise.all([
    git.diff(['--no-color']),
    git.diff(['--cached', '--no-color']),
    git.status(),
    git.log(['-1']),
    git.branch(),
  ]);

  return {
    diff: diff + stagedDiff,
    files: status.files.map(f => f.path),
    staged: status.staged,
    branch: branch.current || 'unknown',
    commitHash: log.latest?.hash || 'no-commits',
    commitMessage: log.latest?.message || 'no-commits',
  };
}

export async function getStatus(): Promise<string> {
  const status = await git.status();
  return status.files.map(f => `  ${f.working_dir}  ${f.path}`).join('\n');
}

export async function stageAll(): Promise<void> {
  await git.add('.');
}

export async function commit(message: string): Promise<void> {
  await git.commit(message);
}

export async function isRepo(): Promise<boolean> {
  try {
    await git.status();
    return true;
  } catch {
    return false;
  }
}
