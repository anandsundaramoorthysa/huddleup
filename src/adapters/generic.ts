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
  async inject(context: string): Promise<void> {
    console.log(context);
  },
};

registerAdapter(genericAdapter);
