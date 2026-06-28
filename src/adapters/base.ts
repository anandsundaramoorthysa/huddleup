export interface AdapterResult {
  name: string;
  openFiles: string[];
  lastMessages: string[];
  rawSessionPath?: string;
}

export interface Adapter {
  name: string;
  detect(): boolean;
  capture(): Promise<AdapterResult>;
}

const adapters: Adapter[] = [];

export function registerAdapter(adapter: Adapter): void {
  adapters.push(adapter);
}

/**
 * Return the first adapter whose detect() succeeds.
 * Used as a fallback when callers want a single tool name.
 */
export async function detectAdapter(): Promise<Adapter | null> {
  for (const adapter of adapters) {
    if (adapter.detect()) return adapter;
  }
  return null;
}

/**
 * Return every adapter that currently detects its tool on this machine.
 * The generic adapter always detects, so it will always be in the list,
 * but as the last entry.
 */
export function detectAllAdapters(): Adapter[] {
  return adapters.filter((a) => a.detect());
}

export function getAllAdapters(): Adapter[] {
  return [...adapters];
}

/**
 * Extract repo-relative file paths that look real from an array of
 * AI messages. Used to populate AdapterResult.openFiles when the tool's
 * session file doesn't expose them directly.
 */
const KNOWN_EXTENSIONS = new Set([
  'ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs', 'json', 'md', 'mdx', 'mdc',
  'yml', 'yaml', 'toml', 'astro', 'vue', 'svelte', 'html', 'css', 'scss',
  'py', 'rb', 'go', 'rs', 'java', 'kt', 'swift', 'c', 'cc', 'cpp', 'h', 'hpp',
  'cs', 'sh', 'sql', 'graphql', 'gql', 'prisma', 'env',
]);

const PATH_BLACKLIST_PREFIX = ['node_modules/', '.git/', 'dist/', 'build/', '.next/', '.astro/'];

export function extractFilePaths(messages: string[], limit = 10): string[] {
  const seen = new Set<string>();
  // Match common file-path shapes: at least one folder OR a known extension.
  // Ignores bare numbers like 1.0.1 because they have no slash AND aren't in KNOWN_EXTENSIONS.
  const re = /(?:[\w.-]+\/)+[\w.-]+\.([a-z0-9]+)|(?:^|\s|[`'"])([\w.-]+\.([a-z0-9]+))(?:$|\s|[`'":,;)])/gi;
  for (const msg of messages) {
    for (const match of msg.matchAll(re)) {
      const candidate = (match[0] || '').trim().replace(/^[`'"]|[`'"]$/g, '');
      const ext = (match[1] || match[3] || '').toLowerCase();
      if (!candidate || !ext) continue;
      if (!KNOWN_EXTENSIONS.has(ext)) continue;
      if (PATH_BLACKLIST_PREFIX.some((p) => candidate.startsWith(p))) continue;
      seen.add(candidate);
      if (seen.size >= limit) return [...seen];
    }
  }
  return [...seen];
}
