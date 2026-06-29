import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';

export default defineConfig({
  site: 'https://huddleup-site.pages.dev',
  trailingSlash: 'ignore',
  output: 'static',
  build: {
    format: 'file',
    assets: '_assets',
  },
  integrations: [
    sitemap(),
    icon({
      include: {
        lucide: ['*'],
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
