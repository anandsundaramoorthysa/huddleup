#!/usr/bin/env node
/**
 * Build raster assets (PNG, ICO) from the SVG masters in assets/brand/.
 *
 * Run with:  node scripts/build-raster-assets.mjs
 *
 * SVG is the source of truth. Re-run this whenever a master SVG changes.
 */

import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import sharp from 'sharp';
import toIco from 'to-ico';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const brand = join(root, 'assets', 'brand');
const vscodeMedia = join(root, 'vscode-huddleup', 'media');

async function ensureDir(d) {
  await mkdir(d, { recursive: true });
}

async function svgToPng(svgPath, pngPath, size) {
  const svg = await readFile(svgPath);
  await sharp(svg, { density: 384 })
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toFile(pngPath);
  console.log(`✓ ${pngPath}  (${size}×${size})`);
}

async function svgToPngRect(svgPath, pngPath, width, height) {
  const svg = await readFile(svgPath);
  await sharp(svg, { density: 384 })
    .resize(width, height, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toFile(pngPath);
  console.log(`✓ ${pngPath}  (${width}×${height})`);
}

async function svgToIco(svgPath, icoPath, sizes) {
  const svg = await readFile(svgPath);
  const buffers = await Promise.all(
    sizes.map((s) =>
      sharp(svg, { density: 384 })
        .resize(s, s, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer(),
    ),
  );
  const ico = await toIco(buffers);
  await writeFile(icoPath, ico);
  console.log(`✓ ${icoPath}  (${sizes.join('/')})`);
}

async function main() {
  await ensureDir(brand);
  await ensureDir(vscodeMedia);

  // favicon.ico — multi-resolution
  await svgToIco(join(brand, 'favicon.svg'), join(brand, 'favicon.ico'), [16, 32, 48]);

  // apple-touch-icon.png — 180×180
  await svgToPng(join(brand, 'favicon.svg'), join(brand, 'apple-touch-icon.png'), 180);

  // og-image.png — 1200×630
  await svgToPngRect(join(brand, 'og-image.svg'), join(brand, 'og-image.png'), 1200, 630);

  // github-social.png — 1280×640
  await svgToPngRect(
    join(brand, 'github-social.svg'),
    join(brand, 'github-social.png'),
    1280,
    640,
  );

  // VS Code Marketplace icon — 128×128, into the extension's media folder
  await svgToPng(
    join(brand, 'vscode-marketplace-icon.svg'),
    join(vscodeMedia, 'marketplace-icon.png'),
    128,
  );

  console.log('\nAll raster assets built.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
