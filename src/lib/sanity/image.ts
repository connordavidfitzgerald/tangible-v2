import imageUrlBuilder from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';
import { sanityClient } from 'sanity:client';

const builder = imageUrlBuilder(sanityClient);

/** Build an optimized image URL for a Sanity image source. */
export function urlFor(source: SanityImageSource) {
    return builder.image(source);
}
