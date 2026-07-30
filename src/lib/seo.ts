import metaImage from '@images/thumbnail-preview.jpg';

export interface SeoProps {
    title?: string;
    description?: string;
    image?: string;
    noindex?: boolean;
}

const DEFAULTS = {
    title: 'Tangible',
    description: 'Concrétisez votre leadership authentique',
    image: metaImage.src
};

/** Build the props object consumed by <SEO> from astro-seo. */
export function buildSeo({ title, description, image, noindex }: SeoProps = {}) {
    const finalTitle = title ? `${title} — Tangible` : DEFAULTS.title;
    const finalDescription = description || DEFAULTS.description;
    const finalImage = image || DEFAULTS.image;

    return {
        title: finalTitle,
        description: finalDescription,
        noindex,
        nofollow: noindex,
        openGraph: {
            basic: {
                type: 'website',
                title: finalTitle,
                image: finalImage
            },
            optional: {
                description: finalDescription
            }
        }
    };
}
