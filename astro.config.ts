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
    vite: {
        plugins: [tailwindcss()]
    },
    integrations: [
        sanity({
            projectId: PUBLIC_SANITY_PROJECT_ID,
            dataset: PUBLIC_SANITY_DATASET,
            useCdn: false,
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
