import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://huddleup-site.pages.dev',
  publicDir: 'public',
  output: 'static',
  build: {
    format: 'file',
    assets: '_assets',
  },
});
