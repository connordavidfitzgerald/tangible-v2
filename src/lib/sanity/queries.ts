import { sanityClient } from 'sanity:client';
import { defineQuery } from 'groq';

/**
 * Each page is a singleton stored at a fixed document id equal to its type.
 * We fetch the whole document (both languages) at build time and resolve the
 * active locale on the frontend with `pick()` from `./i18n` — no per-field
 * GROQ coalescing needed, and output is static so shipping both languages is
 * free.
 */
const singletonQuery = (type: string) => defineQuery(`*[_type == "${type}"][0]`);

/**
 * Fetch a single document, tolerating an unreachable/empty dataset so the site
 * still builds before content is imported (pages fall back to empty strings via
 * `pick`). A missing document simply returns null.
 */
async function fetchSingleton(query: string): Promise<Record<string, any> | null> {
    try {
        return (await sanityClient.fetch(query)) ?? null;
    } catch (err) {
        console.warn('[sanity] fetch failed — is the dataset reachable and imported?', err);
        return null;
    }
}

export const HOME_QUERY = singletonQuery('home');
export const ABOUT_QUERY = singletonQuery('about');
export const PROGRAMS_QUERY = singletonQuery('programs');
export const CONTACT_QUERY = singletonQuery('contact');
export const SERVICES_ENTREPRISES_QUERY = singletonQuery('servicesEntreprises');
export const SERVICES_LEADERS_QUERY = singletonQuery('servicesLeaders');
export const CENTRE_IAM_QUERY = singletonQuery('centreIam');
/**
 * Site settings additionally dereference the Mux asset behind the `video`
 * field, so the frontend gets a playback id instead of a reference. The
 * `videos` array feeding the services slider is unwrapped the same way.
 */
const MUX_ASSET = `asset->{
        playbackId,
        assetId,
        status,
        thumbTime,
        "aspectRatio": data.aspect_ratio,
        "duration": data.duration
    }`;

export const SITE_SETTINGS_QUERY = defineQuery(`*[_type == "siteSettings"][0]{
    ...,
    video{ ${MUX_ASSET} },
    videos[]{
        ...,
        video{ ${MUX_ASSET} }
    }
}`);

export const getHome = () => fetchSingleton(HOME_QUERY);
export const getAbout = () => fetchSingleton(ABOUT_QUERY);
export const getPrograms = () => fetchSingleton(PROGRAMS_QUERY);
export const getContact = () => fetchSingleton(CONTACT_QUERY);
export const getServicesEntreprises = () => fetchSingleton(SERVICES_ENTREPRISES_QUERY);
export const getServicesLeaders = () => fetchSingleton(SERVICES_LEADERS_QUERY);
export const getCentreIam = () => fetchSingleton(CENTRE_IAM_QUERY);
export const getSiteSettings = () => fetchSingleton(SITE_SETTINGS_QUERY);
