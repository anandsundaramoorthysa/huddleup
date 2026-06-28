#!/usr/bin/env node

// Import adapters to register them
import './adapters/claude-code.js';
import './adapters/cursor.js';
import './adapters/codex.js';
import './adapters/copilot.js';
import './adapters/windsurf.js';
import './adapters/generic.js'; // Must be last

import { createProgram } from './cli.js';

export async function run(): Promise<void> {
  const program = createProgram();
  await program.parseAsync(process.argv);
}
