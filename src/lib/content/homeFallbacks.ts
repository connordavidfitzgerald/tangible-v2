/**
 * Home-page copy the design calls for that the dataset does not carry yet.
 *
 * The home document is edited live in the Studio, and a field left blank there
 * resolves to an empty string — which for the hero titles and the intro band
 * means the drawn copy disappears from the page entirely (the band is rendered
 * only when it has something to say). These are those drawn defaults. They are
 * consulted *only* when the matching Sanity field is empty, so anything an
 * editor types wins immediately, the same way `video.ts` falls back to a
 * hardcoded playback id until a film is uploaded.
 */
import type { LocaleId } from '@lib/i18n/locales';

type Localized = Record<LocaleId, string>;

/**
 * One title per hero photo, in the order the photos are declared in
 * `Home.astro`. The first photo keeps `heroLine1-3` from the Studio — it is the
 * page's real `h1` and is already authored — so its slot here stays empty.
 *
 * Placeholders: replace them in the Studio under Home Page → Hero → Title per
 * photo, and these are ignored from then on.
 */
export const HERO_TITLES: Record<LocaleId, string[][]> = {
    fr: [
        [],
        ['Cultivez', "l'intelligence", 'collective'],
        ['Révélez', 'le potentiel', 'de vos équipes'],
        ['Bâtissez', 'un impact', 'durable'],
        ['Transformez', 'votre', 'organisation']
    ],
    en: [
        [],
        ['Cultivate', 'collective', 'intelligence'],
        ['Reveal', "your teams'", 'potential'],
        ['Build', 'lasting', 'impact'],
        ['Transform', 'your', 'organization']
    ]
};

/** Intro band — lead sentence, between the film and the contact form. */
export const INTRO_BOLD: Localized = {
    fr: 'Vous souhaitez créer un changement concret et durable pour vous, votre équipe ou votre organisation?',
    en: 'Are you looking to create meaningful and lasting change for yourself, your team, or your organization?'
};

/** Intro band — body. */
export const INTRO_BODY: Localized = {
    fr: 'Chez Tangible, nous croyons aux démarches qui créent un réel impact. Notre équipe est là pour vous guider, répondre à vos questions et bâtir avec vous une expérience adaptée à vos besoins. Consultation, programmes ou accompagnement personnalisé : chaque échange commence par une conversation.',
    en: 'At Tangible, we believe in approaches that create real impact. Our team is here to guide you, answer your questions, and build an experience tailored to your needs. Whether through consulting, programs, or personalized support, every collaboration starts with a conversation.'
};
