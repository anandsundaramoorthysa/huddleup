#!/usr/bin/env node
/**
 * Copy src/templates/ -> dist/templates/ after `tsc`.
 * Templates are markdown files, so tsc doesn't move them on its own.
 */
import { mkdirSync, readdirSync, copyFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const src = join(root, 'src', 'templates');
const dest = join(root, 'dist', 'templates');

if (!existsSync(src)) {
  console.error(`No templates at ${src}`);
  process.exit(0);
}

mkdirSync(dest, { recursive: true });
let count = 0;
for (const f of readdirSync(src)) {
  copyFileSync(join(src, f), join(dest, f));
  count++;
}
console.log(`Copied ${count} template(s) to dist/templates/`);
