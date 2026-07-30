# Tangible

Marketing site for Tangible — bilingual (FR/EN), built with **Astro + GSAP + Lenis + Tailwind v4**, with content managed in **Sanity** (embedded Studio at `/studio`).

## Stack

| Concern         | Tool                                                        |
| --------------- | ----------------------------------------------------------- |
| Framework       | Astro 5 (`output: 'static'`)                                |
| Styling         | Tailwind CSS v4 (`@tailwindcss/vite`, tokens in `global.css`) |
| Animation       | GSAP (ScrollTrigger, SplitText) as custom elements          |
| Smooth scroll   | Lenis                                                        |
| Page transitions| Astro View Transitions (`<ClientRouter />`)                 |
| CMS             | Sanity, field-level i18n (`sanity-plugin-internationalized-array`) |
| Video           | Mux (`sanity-plugin-mux-input` upload + `<mux-player>` playback)  |
| Fonts           | Astro Fonts API (local `.woff` in `src/assets/fonts`)       |

## Getting started

```bash
npm install

# 1. Create / connect a Sanity project (writes projectId + dataset)
npx sanity login
npx sanity init --env        # creates a project + dataset, fills .env

# 2. Import the existing bilingual copy into the dataset
npm run content:build        # → sanity/migrations/content.ndjson
npx sanity dataset import sanity/migrations/content.ndjson production

# 3. Run
npm run dev                  # site on :4321, Studio on :4321/studio
```

Copy `.env.example` to `.env` if `sanity init` didn't create it:

```
PUBLIC_SANITY_PROJECT_ID="..."
PUBLIC_SANITY_DATASET="production"
```

## Scripts

| Script                 | Description                                        |
| ---------------------- | -------------------------------------------------- |
| `npm run dev`          | Dev server (site + embedded Studio at `/studio`)   |
| `npm run build`        | `astro check` + static build to `dist/`            |
| `npm run preview`      | Preview the production build                       |
| `npm run sanity:typegen` | Extract schema + generate `sanity.types.ts`      |
| `npm run content:build`| Rebuild the NDJSON content import from source JSON |
| `npm run format`       | Prettier                                           |

## Structure

```
astro.config.ts          Astro + Sanity + Tailwind + fonts + i18n routing
sanity.config.ts         Embedded Studio config (singletons, i18n arrays)
sanity/
  lib/locales.ts         Shared locale list (FR default, EN)
  structure.ts           Studio desk: one singleton per page + Site Settings
  schemaTypes/           documents/ (pages, settings) + objects/ (slides…)
  migrations/            Legacy JSON → NDJSON importer
src/
  layouts/BaseLayout     <head>, SEO, fonts, ClientRouter, Navbar, Footer
  pages/                 Routes: FR at root, EN under /en/*
  components/
    pages/               One data-driven component per page (FR + EN reuse it)
    sections/            RevealHeader, SplitReveal, ServiceSlider, ContactFooter…
    ui/                  Button, Image, FadeUp, MuxVideo
    layout/              Navbar, Footer
    animation/           Hands + Circles custom elements
  lib/
    sanity/              client queries, image url builder, i18n pick(), Mux helpers
    i18n/                locale detection + path helpers
  scripts/motion.ts      Lenis + GSAP/ScrollTrigger bootstrap (VT-aware)
  styles/global.css      Tailwind v4 @theme tokens + base styles
```

### Content model

Every page is a **singleton** document (fixed id = type name). Translatable fields
use internationalized arrays so FR + EN are edited side by side. The frontend
fetches the whole document at build time and resolves the active locale with
`pick(field, locale)` (falls back to FR).

### Video (Mux)

The site shows a single film, so it lives on **Site Settings → Video** rather
than on a page document, and every page that needs it reads the same asset.

One-time setup, done from the Studio (credentials are stored in the dataset, not
in `.env`):

1. In [Mux](https://dashboard.mux.com) create an **Access Token** with *Mux Video*
   read/write permissions.
2. Open `/studio` → **Site Settings** → **Video** tab → the video field's settings
   (gear) icon → paste the token ID + secret.
3. Upload the file. Playback stays disabled until Mux finishes encoding — the
   frontend skips the player until the asset reports `ready`.

Playback is rendered by `src/components/ui/MuxVideo.astro`. The caller owns the
frame; the player fills and crops to it:

```astro
<MuxVideo playbackId={videoPlaybackId} title={videoTitle} class="aspect-1512/902 w-full" />
```

`autoplay`, `loop`, `muted`, `controls` and `thumbnailTime` are available as
props (autoplay forces muted — browsers block sound-on autoplay).

## Deploy

Static output — deploy `dist/` to any static host (Netlify, Vercel, GitHub
Pages, Cloudflare Pages). No server adapter required. The embedded Studio at
`/studio` is client-rendered and ships with the static build.
# tangible-v2
