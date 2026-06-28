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
  inject?(context: string): Promise<void>;
}

const adapters: Adapter[] = [];

export function registerAdapter(adapter: Adapter): void {
  adapters.push(adapter);
}

export async function detectAdapter(): Promise<Adapter | null> {
  for (const adapter of adapters) {
    if (adapter.detect()) return adapter;
  }
  return null;
}

export function getAllAdapters(): Adapter[] {
  return [...adapters];
}
