import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
import icon from 'astro-icon';
import lottie from 'astro-integration-lottie';
import react from '@astrojs/react';
import sanity from '@sanity/astro';
import tailwindcss from '@tailwindcss/vite';

const { PUBLIC_SANITY_PROJECT_ID, PUBLIC_SANITY_DATASET } = loadEnv(
    process.env.NODE_ENV ?? 'development',
    process.cwd(),
    ''
);

// https://astro.build/config
export default defineConfig({
    site: 'https://tangiblecoach.com',
    output: 'static',
    i18n: {
        defaultLocale: 'fr',
        locales: ['fr', 'en'],
        routing: {
            prefixDefaultLocale: false
        }
    },
    /**
     * `<ClientRouter />` turns prefetching on by default, but on the `hover`
     * strategy: the destination is only fetched 80ms after the pointer lands on
     * a link, which a quick click beats and a touch never triggers at all. The
     * router has to hold the whole document before it can start the transition,
     * so whatever is left of that fetch is dead time on screen.
     *
     * `viewport` fetches each link once it scrolls into view, so by click time
     * the page is in the cache. It costs one request per visible link — cheap
     * here, where the whole site is seven static documents, and Astro skips it
     * on save-data and 2g connections regardless.
     */
    prefetch: {
        prefetchAll: true,
        defaultStrategy: 'viewport'
    },
    vite: {
        plugins: [tailwindcss()]
    },
    integrations: [
        sanity({
            projectId: PUBLIC_SANITY_PROJECT_ID,
            dataset: PUBLIC_SANITY_DATASET,
            useCdn: true,
            // Embedded Studio, served at /studio (client-rendered SPA route).
            studioBasePath: '/studio'
        }),
        react(),
        icon({
            iconDir: './src/assets/svgs'
        }),
        lottie()
    ],
    devToolbar: {
        enabled: false
    },
    image: {
        remotePatterns: [{ protocol: 'https' }]
    }
});
