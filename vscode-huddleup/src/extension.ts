import * as vscode from 'vscode';
import { execSync } from 'child_process';

function getHuddleupCmd(): string {
  const config = vscode.workspace.getConfiguration('huddleup');
  return config.get<string>('cliPath') || 'npx huddleup';
}

function runHuddleup(args: string, cwd?: string): string {
  try {
    const dir = cwd || vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || process.cwd();
    const cmd = `${getHuddleupCmd()} ${args}`;
    return execSync(cmd, { cwd: dir, encoding: 'utf-8', timeout: 30000 });
  } catch (err: any) {
    if (err.stdout) return err.stdout.toString();
    if (err.stderr) return err.stderr.toString();
    return `Error: ${err.message}`;
  }
}

function getThreads(): { name: string; status: string }[] {
  try {
    const output = runHuddleup('thread list');
    const threads: { name: string; status: string }[] = [];
    for (const line of output.split('\n')) {
      const match = line.match(/[🟡🔴✅]\s+(.+?)\s+\(/);
      if (match) {
        threads.push({
          name: match[1].trim(),
          status: line.includes('🔴') ? 'blocked' : line.includes('✅') ? 'done' : 'active',
        });
      }
    }
    return threads;
  } catch {
    return [];
  }
}

function getHtmlContent(): string {
  const threads = getThreads();
  const threadsHtml = threads.length === 0
    ? '<p class="muted">No active threads.</p>'
    : threads.map(t => `
      <div class="thread ${t.status}">
        <span class="status-dot ${t.status}"></span>
        <span class="thread-name">${t.name}</span>
        <div class="thread-actions">
          <button class="btn btn-sm" data-action="resume" data-thread="${t.name}">Resume</button>
          <button class="btn btn-sm btn-outline" data-action="archive" data-thread="${t.name}">Archive</button>
        </div>
      </div>`).join('');

  return `<!DOCTYPE html>
<html>
<head>
<style>
body { font-family: var(--vscode-font-family); padding: 0; margin: 0; color: var(--vscode-editor-foreground); background: var(--vscode-sideBar-background); }
.header { padding: 12px 16px; border-bottom: 1px solid var(--vscode-panel-border); }
.header h2 { margin: 0; font-size: 14px; font-weight: 600; }
.content { padding: 12px 16px; }
.actions { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
.btn { display: flex; align-items: center; justify-content: center; gap: 6px; padding: 8px 12px; border: none; border-radius: 4px; cursor: pointer; font-size: 13px; font-family: inherit; background: var(--vscode-button-background); color: var(--vscode-button-foreground); }
.btn:hover { background: var(--vscode-button-hoverBackground); }
.btn-sm { padding: 4px 8px; font-size: 11px; display: inline-flex; }
.btn-outline { background: transparent; border: 1px solid var(--vscode-panel-border); color: var(--vscode-editor-foreground); }
.btn-outline:hover { background: var(--vscode-list-hoverBackground); }
.section-title { font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--vscode-descriptionForeground); margin: 16px 0 8px; }
.thread { display: flex; align-items: center; gap: 8px; padding: 8px; border-radius: 4px; margin-bottom: 4px; }
.thread:hover { background: var(--vscode-list-hoverBackground); }
.thread .thread-name { flex: 1; font-size: 13px; }
.thread-actions { display: flex; gap: 4px; }
.status-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.status-dot.active { background: #eab308; }
.status-dot.blocked { background: #ef4444; }
.status-dot.done { background: #22c55e; }
.muted { color: var(--vscode-descriptionForeground); font-size: 12px; }
.output { margin-top: 12px; padding: 8px; background: var(--vscode-input-background); border-radius: 4px; font-size: 12px; white-space: pre-wrap; word-break: break-word; max-height: 200px; overflow-y: auto; display: none; }
</style>
</head>
<body>
  <div class="header">
    <h2>HuddleUp</h2>
  </div>
  <div class="content">
    <div class="actions">
      <button class="btn" id="snapshotBtn">📸 Snapshot</button>
      <button class="btn btn-outline" id="standupBtn">📋 Standup</button>
      <button class="btn btn-outline" id="newThreadBtn">✨ New Thread</button>
    </div>
    <div class="section-title">Active Threads</div>
    <div id="threads">${threadsHtml}</div>
    <div id="output" class="output"></div>
  </div>
<script>
const vscode = acquireVsCodeApi();
const output = document.getElementById('output');
function showOutput(text) { output.textContent = text; output.style.display = 'block'; }
document.getElementById('snapshotBtn').addEventListener('click', () => vscode.postMessage({ command: 'snapshot' }));
document.getElementById('standupBtn').addEventListener('click', () => vscode.postMessage({ command: 'standup' }));
document.getElementById('newThreadBtn').addEventListener('click', () => vscode.postMessage({ command: 'newThread' }));
document.querySelectorAll('[data-action]').forEach(btn => {
  btn.addEventListener('click', () => vscode.postMessage({ command: btn.dataset.action, thread: btn.dataset.thread }));
});
window.addEventListener('message', event => {
  const msg = event.data;
  if (msg.type === 'output') showOutput(msg.text);
  else if (msg.type === 'refresh') location.reload();
});
</script>
</body>
</html>`;
}

function updatePanel() {
  vscode.commands.executeCommand('huddleup.refresh');
}

export function activate(context: vscode.ExtensionContext) {
  // Register sidebar webview provider
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('huddleup.panel', {
      resolveWebviewView(webviewView) {
        webviewView.webview.options = { enableScripts: true };
        webviewView.webview.html = getHtmlContent();

        webviewView.webview.onDidReceiveMessage(async (msg) => {
          let output = '';
          switch (msg.command) {
            case 'snapshot':
              output = runHuddleup('snapshot');
              break;
            case 'standup':
              output = runHuddleup('standup');
              break;
            case 'newThread': {
              const name = await vscode.window.showInputBox({ prompt: 'Thread name', placeHolder: 'e.g. streaming-chat-endpoint' });
              if (name) output = runHuddleup(`thread new "${name}"`);
              break;
            }
            case 'resume':
              output = runHuddleup(`resume ${msg.thread}`);
              break;
            case 'archive':
              output = runHuddleup(`archive ${msg.thread}`);
              break;
          }
          if (output) {
            webviewView.webview.postMessage({ type: 'output', text: output });
            setTimeout(() => webviewView.webview.postMessage({ type: 'refresh' }), 1500);
          }
        });
      }
    })
  );

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('huddleup.snapshot', () => {
      runHuddleup('snapshot');
      vscode.window.showInformationMessage('📸 Snapshot captured');
      updatePanel();
    }),
    vscode.commands.registerCommand('huddleup.resume', async () => {
      const threads = getThreads();
      if (threads.length === 0) {
        vscode.window.showInformationMessage('No active threads.');
        return;
      }
      const picked = await vscode.window.showQuickPick(threads.map(t => t.name), { placeHolder: 'Select thread to resume' });
      if (picked) {
        runHuddleup(`resume "${picked}"`);
        vscode.window.showInformationMessage(`▶ Resumed: ${picked}`);
      }
    }),
    vscode.commands.registerCommand('huddleup.standup', () => {
      const output = runHuddleup('standup');
      vscode.window.showInformationMessage('📋 Standup ready');
    }),
    vscode.commands.registerCommand('huddleup.threadNew', async () => {
      const name = await vscode.window.showInputBox({ prompt: 'New thread name', placeHolder: 'e.g. streaming-chat-endpoint' });
      if (name) {
        runHuddleup(`thread new "${name}"`);
        vscode.window.showInformationMessage(`✨ Thread "${name}" created`);
        updatePanel();
      }
    }),
    vscode.commands.registerCommand('huddleup.refresh', () => {
      vscode.commands.executeCommand('workbench.view.extension.huddleup-sidebar');
    })
  );
}

export function deactivate() {}
