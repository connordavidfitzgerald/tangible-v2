import metaImage from '@images/thumbnail-preview.jpg';
import { copy } from '@lib/content/siteCopy';
import { resolveImage } from '@lib/sanity/image';
import type { LocaleId } from '@lib/i18n/locales';

export interface SeoProps {
    title?: string;
    description?: string;
    image?: string;
    noindex?: boolean;
}

/** The site name, appended to every page title. Overridden by Site Settings. */
const DEFAULT_SITE_NAME = 'Tangible';

/**
 * Build the props object consumed by <SEO> from astro-seo.
 *
 * A page passes whatever it has authored; anything it leaves blank comes from
 * Site Settings, and failing that from the committed defaults — so a page with
 * nothing particular to say still gets a complete head.
 */
export function buildSeo(
    { title, description, image, noindex }: SeoProps = {},
    settings?: Record<string, any> | null,
    locale: LocaleId = 'fr'
) {
    const siteName = (settings?.seoSiteName as string) || DEFAULT_SITE_NAME;
    const finalTitle = title ? `${title} — ${siteName}` : siteName;
    const finalDescription = description || copy(settings, 'seoDescription', locale);

    const share = resolveImage(settings?.seoImage, metaImage, locale);
    const finalImage =
        image ?? (typeof share?.src === 'string' ? share.src : (share?.src.src ?? metaImage.src));

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
