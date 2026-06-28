<p align="center">
  <img src="public/images/logo.svg" alt="HuddleUp" width="96" />
</p>

<h1 align="center">HuddleUp — Marketing Site</h1>

<p align="center">
  Static landing page for <a href="../README.md">HuddleUp</a>,
  the cross-tool AI coding session handoff CLI.
  <br />
  Live at <a href="https://huddleup-site.pages.dev">huddleup-site.pages.dev</a>.
</p>

---

## Tech stack

- **[Astro 5](https://astro.build/)** — zero JavaScript by default, single static `dist/`.
- **TypeScript** + Astro's bundled Vite pipeline.
- **System UI font stack** (no custom-font dependency) — keeps the site small and license-free.
- Brand tokens (indigo `#6366F1`) imported verbatim from the product brand kit (`../assets/brand/`).
- Deployed to **Cloudflare Pages** via `wrangler pages deploy`.

## Local development

```bash
npm install
npm run dev      # http://localhost:4321
```

## Production build

```bash
npm run build    # static export → ./dist
npm run preview  # preview the built site locally
```

The export emits `dist/404.html`, which Cloudflare Pages serves automatically for unknown routes.

## Deployment

### One-shot manual deploy

```bash
npm run build
npx wrangler pages deploy dist --project-name huddleup-site
```

### GitHub Actions (recommended)

Push to `main` triggers the workflow in the parent repo's `.github/workflows/` (planned). Required GitHub repository secrets:

| Secret | Description |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token with the **Cloudflare Pages: Edit** permission |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID |

Pages project name: **`huddleup-site`** (→ `huddleup-site.pages.dev`).

## Structure

```
landing/
├── astro.config.mjs           # Astro config
├── wrangler.toml              # Cloudflare Pages config
├── public/
│   ├── favicon.ico
│   ├── favicon.svg
│   ├── robots.txt
│   └── images/                # logos, OG image, screenshots
├── src/
│   ├── components/            # Hero, Features, HowItWorks, Adapters, QuickStart, CTA, Header, Footer
│   ├── config.ts              # SITE metadata + NAV
│   ├── layouts/BaseLayout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   └── 404.astro
│   └── styles/global.css
└── tsconfig.json
```

## SEO basics shipped

- `<title>` + `<meta name="description">` from `src/config.ts`.
- OG tags (`og:title`, `og:description`, `og:image`, `og:url`) — image is `public/images/og-image.png` (1200×630).
- Twitter card (`summary_large_image`).
- Canonical URL.
- Favicons (`.ico`, `.svg`, Apple touch).
- `robots.txt` allowing all crawlers.
- Custom 404 page.

**Not yet wired** (post-launch):
- Google Search Console verification + sitemap submission.
- GA4 / Plausible analytics tag.

## Assets

All logos and screenshots in `public/images/` are sourced from the product brand kit at `../assets/brand/` and from the VS Code extension's `vscode-huddleup/media/`. Don't redraw — re-export via `npm run build:assets` in the project root and copy the resulting PNGs in.

## License

AGPL-3.0 — same as the rest of HuddleUp. See [`../LICENSE`](../LICENSE).
