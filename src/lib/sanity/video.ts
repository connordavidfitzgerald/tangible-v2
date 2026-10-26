/**
 * Each page carries its own `pageVideo` field (the Home page an array of
 * them for its slider), and falls back to the default film in `siteSettings`
 * when it is left empty. The queries already dereference the Mux asset — these
 * helpers just narrow the result and apply the fallbacks.
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
 * everything authored in the Studio takes precedence over it. Playback ids are public — they
 * ship in the page markup — so this is not a secret.
 */
const FALLBACK_PLAYBACK_ID = 'AqIGdBkVFxJBaRMBlCxOvyZ9AAGDLtAgvy7JQZFyTTc';

/** A `pageVideo` as the queries return it. */
interface PageVideoField {
    video?: MuxVideoField | null;
    playbackId?: string | null;
    title?: unknown;
}

export interface ResolvedVideo {
    playbackId: string;
    /** Still an internationalized field — callers `pick` the locale. */
    title: unknown;
}

/** The slider's reels, likewise uploaded directly on mux.com, in slider order. */
const FALLBACK_SLIDER_PLAYBACK_IDS = [
    'qA00vzHyoCYjcMlmpeRyQp01YKPzZEgn4DPOHFq3gaxt8',
    '89SZ000202SVhhYnoB3THcEVxOTmVLwyIswAB88a5QH028g',
    '9AQA5TEtFezp1rhAkB02M16BZOQiLuelxwuTLAEuFubE',
    'glOI4xBb9bLJUc6TteOvJPQKc1REEMWSHqWAX7SA6Jo'
];

/** An upload counts only once Mux has finished transcoding it. */
function readyPlaybackId(field: MuxVideoField | null | undefined): string | null {
    const asset = field?.asset;
    if (asset?.playbackId && (!asset.status || asset.status === 'ready')) {
        return asset.playbackId;
    }
    return null;
}

function pastedPlaybackId(value: unknown): string | null {
    return (typeof value === 'string' && value.trim()) || null;
}

/** A page's own film: its upload, failing that its pasted id, else null. */
function resolvePageVideo(entry: PageVideoField | null | undefined): ResolvedVideo | null {
    const playbackId = readyPlaybackId(entry?.video) ?? pastedPlaybackId(entry?.playbackId);
    return playbackId ? { playbackId, title: entry?.title } : null;
}

/**
 * Playback id for the site-wide default film, or null when none is configured.
 * A video uploaded through the Studio wins; failing that, an id pasted into
 * Site Settings; failing that, the id above.
 */
export function muxPlaybackId(settings: Record<string, any> | null | undefined): string | null {
    return (
        readyPlaybackId(settings?.video) ??
        pastedPlaybackId(settings?.videoPlaybackId) ??
        FALLBACK_PLAYBACK_ID ??
        null
    );
}

/**
 * The film a page embeds: its own `video` field when filled in, the default
 * film otherwise. An untitled page film borrows the default title.
 */
export function pageFilm(
    data: Record<string, any> | null | undefined,
    settings: Record<string, any> | null | undefined
): { playbackId: string | null; title: unknown } {
    const own = resolvePageVideo(data?.video);
    const hasOwnTitle = Array.isArray(own?.title) && own.title.some((e: any) => e?.value);
    return {
        playbackId: own?.playbackId ?? muxPlaybackId(settings),
        title: own && hasOwnTitle ? own.title : settings?.videoTitle
    };
}

/**
 * The films behind the Home slider, in Studio order. Each entry keeps its
 * own title so the player reports something meaningful to Mux Data.
 *
 * Read from the Home page first, then from the older list in Site Settings,
 * then from the reels above — so the slider is never blank.
 */
export function muxSliderVideos(
    data: Record<string, any> | null | undefined,
    settings: Record<string, any> | null | undefined
): ResolvedVideo[] {
    const resolve = (entries: unknown) =>
        (Array.isArray(entries) ? entries : [])
            .map((entry: PageVideoField) => resolvePageVideo(entry))
            .filter((v): v is ResolvedVideo => v !== null);

    const fromPage = resolve(data?.videos);
    if (fromPage.length > 0) return fromPage;

    const fromSettings = resolve(settings?.videos);
    if (fromSettings.length > 0) return fromSettings;

    return FALLBACK_SLIDER_PLAYBACK_IDS.map((playbackId) => ({
        playbackId,
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
