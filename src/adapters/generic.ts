import { Adapter, AdapterResult, registerAdapter } from './base.js';

export const genericAdapter: Adapter = {
  name: 'generic',
  detect(): boolean {
    return true;
  },
  async capture(): Promise<AdapterResult> {
    return {
      name: 'generic',
      openFiles: [],
      lastMessages: [],
    };
  },
};

registerAdapter(genericAdapter);
