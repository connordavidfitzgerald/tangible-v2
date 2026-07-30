/**
 * The site has a single film, uploaded to Mux and stored on the `siteSettings`
 * singleton, so every page reads it from the same place. `SITE_SETTINGS_QUERY`
 * already dereferences the asset — these helpers just narrow the result.
 */
export interface MuxAsset {
    playbackId?: string | null;
    assetId?: string | null;
    status?: string | null;
    thumbTime?: number | null;
    aspectRatio?: string | null;
    duration?: number | null;
}

export interface MuxVideoField {
    asset?: MuxAsset | null;
}

/**
 * The film as uploaded directly on mux.com, rather than through the Studio's
 * Mux plugin. Kept here so the site plays something without a Studio edit;
 * both fields below take precedence over it. Playback ids are public — they
 * ship in the page markup — so this is not a secret.
 */
const FALLBACK_PLAYBACK_ID = 'AqIGdBkVFxJBaRMBlCxOvyZ9AAGDLtAgvy7JQZFyTTc';

/**
 * Playback id for the site video, or null when none is configured — callers
 * skip rendering in that case. A video uploaded through the Studio wins;
 * failing that, an id pasted into Site Settings; failing that, the id above.
 */
export function muxPlaybackId(settings: Record<string, any> | null | undefined): string | null {
    const asset = (settings?.video as MuxVideoField | undefined)?.asset;
    // An asset that is still transcoding has a playback id that will not play yet.
    if (asset?.playbackId && (!asset.status || asset.status === 'ready')) {
        return asset.playbackId;
    }

    const pasted = settings?.videoPlaybackId;
    return (typeof pasted === 'string' && pasted.trim()) || FALLBACK_PLAYBACK_ID || null;
}

/**
 * The films behind the services slider, in Studio order. Each entry keeps its
 * own title so the player reports something meaningful to Mux Data.
 *
 * The array is optional content: until the reels are uploaded it comes back
 * empty, and the slider would render nothing at all. So an empty array falls
 * back to the single site film repeated `fallbackCount` times — the page keeps
 * its shape, and the first upload replaces the placeholders wholesale.
 */
export function muxSliderVideos(
    settings: Record<string, any> | null | undefined,
    fallbackCount = 3
): { playbackId: string; title: unknown }[] {
    const entries = Array.isArray(settings?.videos) ? settings.videos : [];

    const resolved = entries
        .map((entry: any) => {
            const asset = (entry?.video as MuxVideoField | undefined)?.asset;
            if (!asset?.playbackId || (asset.status && asset.status !== 'ready')) return null;
            return { playbackId: asset.playbackId, title: entry?.title ?? '' };
        })
        .filter((v): v is { playbackId: string; title: any } => v !== null);

    if (resolved.length > 0) return resolved;

    const fallback = muxPlaybackId(settings);
    if (!fallback) return [];
    return Array.from({ length: fallbackCount }, () => ({
        playbackId: fallback,
        title: settings?.videoTitle ?? ''
    }));
}

/** Poster frame Mux generates for a playback id, at an optional timestamp. */
export function muxPosterUrl(playbackId: string, time?: number | null): string {
    const params = new URLSearchParams();
    if (typeof time === 'number') params.set('time', String(time));
    const query = params.toString();
    return `https://image.mux.com/${playbackId}/thumbnail.webp${query ? `?${query}` : ''}`;
}
