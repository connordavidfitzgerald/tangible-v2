import imageUrlBuilder from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';
import { sanityClient } from 'sanity:client';
import { pick, type I18nField } from './i18n';
import type { LocaleId } from '../i18n/locales';

const builder = imageUrlBuilder(sanityClient);

/** Build an optimized image URL for a Sanity image source. */
export function urlFor(source: SanityImageSource) {
    return builder.image(source);
}

/** An image field as authored in the Studio: the asset plus a translated alt. */
export interface SanityImage {
    asset?: { _ref?: string | null } | null;
    alt?: I18nField;
}

/**
 * The intrinsic size of an asset, read off its `_ref`.
 *
 * Sanity encodes it in the reference itself — `image-<id>-2000x1333-jpg` — so
 * the dimensions are there for the taking. Astro needs them: `<Picture>` will
 * not accept a remote `src` without either an explicit width/height pair or
 * `inferSize`, and `inferSize` downloads every image at build time to learn
 * what this string already says.
 */
export function assetDimensions(ref?: string | null): { width: number; height: number } | null {
    const match = /-(\d+)x(\d+)-[a-z]+$/.exec(ref ?? '');
    if (!match) return null;
    return { width: Number(match[1]), height: Number(match[2]) };
}

/**
 * The widest file we ever ask Sanity for.
 *
 * The page frame stops at 1920 (`--container-page`), so 2400 covers a full-bleed
 * image on that frame with room to spare on a dense display, and caps the
 * originals — which are uploaded straight off a camera, up to 2560×1708 PNG —
 * before they are downloaded at build time and re-encoded. Astro derives the
 * responsive set below this from the same URL.
 */
const MAX_SOURCE_WIDTH = 2400;

/**
 * Quality for that intermediate file. Deliberately high: this image is not what
 * ships — Astro re-encodes it into the srcset it emits — so the number is a
 * ceiling on generation loss rather than a size/quality trade of its own.
 */
const SOURCE_QUALITY = 90;

/**
 * And webp rather than `auto('format')`.
 *
 * `auto` decides from the request's `Accept` header, which the build's fetch
 * does not send — so Sanity fell back to the asset's own format and handed
 * Astro the 9.4MB PNG straight off the camera, once per variant. Naming the
 * format takes the negotiation out of it. Every image on this site is a
 * photograph, so there is no transparency to preserve.
 */
const SOURCE_FORMAT = 'webp';

/**
 * Either an uploaded asset (a URL, which Astro requires dimensions for) or a
 * committed default (`ImageMetadata`, which carries its own and must *not* be
 * given a width/height pair). The two are a union rather than one shape with
 * optional dimensions so the caller's `typeof src === 'string'` check narrows
 * them, instead of every call site having to assert the pair is present.
 */
export type UploadedImage = { src: string; width: number; height: number; alt: string };
export type DefaultImage = { src: ImageMetadata; alt: string };
export type ResolvedImage = UploadedImage | DefaultImage;

/**
 * Which of the two a resolved image is. A written-out guard rather than an
 * inline `typeof resolved.src === 'string'`, because narrowing a union by the
 * type of one of its properties only works when that property is a literal
 * discriminant — `string` against `ImageMetadata` is not one, so the check
 * reads correctly but tells the compiler nothing.
 */
export function isUploaded(image: ResolvedImage): image is UploadedImage {
    return typeof image.src === 'string';
}

/**
 * What `<SanityPicture>` needs to draw an image: either the uploaded asset or
 * the drawn default committed alongside the code.
 *
 * Every image on the site keeps its local fallback, so a page renders complete
 * before anything is uploaded and an editor's upload takes over from then on —
 * the same arrangement `video.ts` has with its playback id. Returns `null` only
 * when there is neither, which is the caller's cue to skip the element.
 */
export function resolveImage(
    image: SanityImage | null | undefined,
    fallback: ImageMetadata | null | undefined,
    locale: LocaleId,
    fallbackAlt = ''
): ResolvedImage | null {
    const ref = image?.asset?._ref;
    const size = assetDimensions(ref);
    const alt = pick(image?.alt, locale) || fallbackAlt;

    if (ref && size) {
        // Held to `MAX_SOURCE_WIDTH`, and the reported dimensions scaled with it
        // so the ratio Astro lays out against still matches the file it fetches.
        const scale = Math.min(1, MAX_SOURCE_WIDTH / size.width);
        const width = Math.round(size.width * scale);
        const height = Math.round(size.height * scale);

        return {
            src: urlFor(image as SanityImageSource)
                .width(width)
                .quality(SOURCE_QUALITY)
                .format(SOURCE_FORMAT)
                .url(),
            width,
            height,
            alt
        };
    }

    if (!fallback) return null;
    return { src: fallback, alt };
}
