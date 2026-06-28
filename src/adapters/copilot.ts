import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { Adapter, AdapterResult, registerAdapter } from './base.js';

// Copilot chat history locations across editors and OS
const POSSIBLE_PATHS = [
  // VS Code global storage
  join(process.env.APPDATA || join(homedir(), 'AppData', 'Roaming'), 'Code', 'User', 'globalStorage', 'github.copilot-chat'),
  join(process.env.APPDATA || join(homedir(), 'AppData', 'Roaming'), 'Code - Insiders', 'User', 'globalStorage', 'github.copilot-chat'),
  join(process.env.APPDATA || join(homedir(), 'AppData', 'Roaming'), 'Cursor', 'User', 'globalStorage', 'github.copilot-chat'),
  // Generic copilot data dirs
  join(homedir(), '.github', 'copilot'),
  join(homedir(), '.copilot'),
  // Linux/macOS VS Code
  join(homedir(), '.config', 'Code', 'User', 'globalStorage', 'github.copilot-chat'),
  join(homedir(), '.vscode', 'copilot'),
];

function findCopilotSessionDir(): string | null {
  for (const p of POSSIBLE_PATHS) {
    if (existsSync(p)) return p;
  }
  return null;
}

function findLatestChatFile(dir: string): string | null {
  try {
    const files = readdirSync(dir)
      .filter(f => f.endsWith('.json') || f.endsWith('.jsonl') || f.endsWith('.ndjson'))
      .map(f => ({ name: f, time: statSync(join(dir, f)).mtimeMs }))
      .sort((a, b) => b.time - a.time);
    return files.length > 0 ? join(dir, files[0].name) : null;
  } catch {
    return null;
  }
}

export const copilotAdapter: Adapter = {
  name: 'copilot',
  detect(): boolean {
    return findCopilotSessionDir() !== null;
  },
  async capture(): Promise<AdapterResult> {
    const dir = findCopilotSessionDir();
    const messages: string[] = [];

    if (dir) {
      const chatFile = findLatestChatFile(dir);
      if (chatFile) {
        try {
          const content = readFileSync(chatFile, 'utf-8');
          const lines = content.trim().split('\n').slice(-50);
          for (const line of lines) {
            try {
              const parsed = JSON.parse(line);
              const text = parsed.text || parsed.content || parsed.message || parsed.assistantMessage || parsed.userMessage || '';
              if (text) messages.push(typeof text === 'string' ? text.slice(0, 500) : JSON.stringify(text).slice(0, 500));
            } catch {
              if (line.trim()) messages.push(line.slice(0, 500));
            }
          }
        } catch {
          // couldn't read copilot chat
        }
      }
    }

    return {
      name: 'copilot',
      openFiles: [],
      lastMessages: messages.reverse(),
      rawSessionPath: dir || undefined,
    };
  },
};

registerAdapter(copilotAdapter);
