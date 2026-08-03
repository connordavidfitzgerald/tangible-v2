/**
 * The copy that is shared rather than owned by a page: the navigation, the
 * contact footer, every form label, and the handful of slider labels that read
 * the same wherever they appear.
 *
 * All of it is authored under Site Settings, and all of it falls back to the
 * strings the components used to hardcode. So the site reads exactly as it does
 * today against an unfilled dataset, and each field an editor completes takes
 * over on the next build — the same arrangement `homeFallbacks.ts` has for the
 * home page and `video.ts` has for the film.
 *
 * The defaults are the *starting point*, not the source of truth. Once
 * `fill-translations.ts` has been run against the dataset these are dead weight
 * on every field, and the plan is to let them rot rather than maintain them.
 */
import { pick, type I18nField } from '@lib/sanity/i18n';
import type { LocaleId } from '@lib/i18n/locales';

type Localized = Record<LocaleId, string>;
type LocalizedList = Record<LocaleId, string[]>;

type Settings = Record<string, any> | null | undefined;

const DEFAULTS: Record<string, Localized> = {
    navServicesEntreprises: { fr: 'Services aux entreprises', en: 'Corporate services' },
    navServicesLeaders: { fr: 'Services aux individus', en: 'Individual services' },

    contactFooterHeading: {
        fr: 'Amorcez une transformation tangible.',
        en: 'Initiate a tangible transformation.'
    },
    contactFooterParagraph: {
        fr: 'Tissons des connexions authentiques et déclenchons un impact durable — pour vous, votre équipe et votre communauté.',
        en: "Let's weave authentic connections and trigger lasting impact — for you, your team, and your community."
    },
    contactFooterBooking: { fr: 'Réservez une consultation', en: 'Book a consultation' },
    contactFooterMobBody: {
        fr: 'Tissons des connexions authentiques et déclenchons un impact durable — pour vous, votre équipe et votre communauté.\n\nRéservez une consultation.',
        en: "Let's weave authentic connections and trigger lasting impact — for you, your team, and your community.\n\nBook a consultation."
    },
    contactFooterCta: { fr: 'Découvrez nos services', en: 'Discover our services' },

    formName: { fr: 'Nom', en: 'Name' },
    formEmail: { fr: 'Courriel', en: 'Email' },
    formPhone: { fr: 'Téléphone', en: 'Phone' },
    formCompany: { fr: 'Entreprise', en: 'Company' },
    formCompanySite: { fr: "Site de l'entreprise", en: 'Company website' },
    formMessage: { fr: 'Message', en: 'Message' },
    formEmployeesLabel: { fr: "Nombre d'employé.e.s", en: 'Number of employees' },
    formBudgetLabel: { fr: 'Budget', en: 'Budget' },
    formSupportLabel: { fr: "Type d'accompagnement recherché", en: 'Type of support sought' },
    formConsultationLabel: {
        fr: 'Je souhaite réserver une consultation gratuite avec un·e coach de Tangible.',
        en: 'I would like to book a free consultation with a Tangible coach.'
    },
    formNext: { fr: 'Suivant', en: 'Next' },
    formPrev: { fr: 'Précédent', en: 'Previous' },
    formSubmit: { fr: 'Soumettre', en: 'Submit' },
    formSuccess: { fr: 'Succès', en: 'Success' },

    sliderResultLabel: { fr: 'Résultat', en: 'Result' },
    sliderPrevLabel: { fr: 'Service précédent', en: 'Previous service' },
    sliderNextLabel: { fr: 'Service suivant', en: 'Next service' },
    videoPrevLabel: { fr: 'Film précédent', en: 'Previous film' },
    videoNextLabel: { fr: 'Film suivant', en: 'Next film' },

    seoDescription: {
        fr: 'Concrétisez votre leadership authentique',
        en: 'Make your authentic leadership tangible'
    }
};

const DEFAULT_OPTIONS: Record<string, LocalizedList> = {
    formEmployeesOptions: {
        fr: ['0 à 10', '11 à 25', '25 à 100', '100+'],
        en: ['0 to 10', '11 to 25', '25 to 100', '100+']
    },
    formBudgetOptions: {
        fr: ['Moins de 5 000 $', '5 000 $ - 15 000 $', '15 000 $ - 50 000 $', 'Ne sais pas'],
        en: ['Under $5,000', '$5,000 - $15,000', '$15,000 - $50,000', "Don't know"]
    },
    formSupportOptions: {
        fr: [
            'Ateliers',
            'Expériences immersives',
            'Formations/coaching',
            'Retraites',
            'Autres / Ne sais pas'
        ],
        en: [
            'Workshops',
            'Immersive experiences',
            'Training/coaching',
            'Retreats',
            "Other / Don't know"
        ]
    }
};

/**
 * Where form submissions are delivered. Overridden by Site Settings → Forms;
 * this is the key the forms were built against. Web3Forms access keys are
 * public by design — they ship in the page markup — so this is not a secret.
 */
const DEFAULT_ACCESS_KEY = '3cb859b7-eb03-4988-a1d8-38cf672ee0c8';

/** Resolve one shared string for the active locale. */
export function copy(settings: Settings, key: string, locale: LocaleId): string {
    const authored = pick(settings?.[key] as I18nField, locale);
    return authored || DEFAULTS[key]?.[locale] || '';
}

/** Resolve one shared list of options for the active locale. */
export function copyOptions(settings: Settings, key: string, locale: LocaleId): string[] {
    const authored = Array.isArray(settings?.[key])
        ? (settings[key] as { text?: I18nField }[])
              .map((item) => pick(item?.text, locale))
              .filter(Boolean)
        : [];
    return authored.length ? authored : (DEFAULT_OPTIONS[key]?.[locale] ?? []);
}

/** The whole form dictionary, resolved once per render. */
export function formCopy(settings: Settings, locale: LocaleId) {
    const t = (key: string) => copy(settings, key, locale);
    return {
        accessKey: (settings?.formAccessKey as string) || DEFAULT_ACCESS_KEY,
        nameLabel: t('formName'),
        emailLabel: t('formEmail'),
        phoneLabel: t('formPhone'),
        companyLabel: t('formCompany'),
        siteLabel: t('formCompanySite'),
        messageLabel: t('formMessage'),
        employeesLabel: t('formEmployeesLabel'),
        employeesOptions: copyOptions(settings, 'formEmployeesOptions', locale),
        budgetLabel: t('formBudgetLabel'),
        budgetOptions: copyOptions(settings, 'formBudgetOptions', locale),
        supportLabel: t('formSupportLabel'),
        supportOptions: copyOptions(settings, 'formSupportOptions', locale),
        consultationLabel: t('formConsultationLabel'),
        nextText: t('formNext'),
        prevText: t('formPrev'),
        submitText: t('formSubmit'),
        successText: t('formSuccess')
    };
}

export type FormCopy = ReturnType<typeof formCopy>;

/** The contact-footer block, resolved once per render. */
export function footerCopy(settings: Settings, locale: LocaleId) {
    const t = (key: string) => copy(settings, key, locale);
    return {
        heading: t('contactFooterHeading'),
        paragraph: t('contactFooterParagraph'),
        booking: t('contactFooterBooking'),
        mobBody: t('contactFooterMobBody'),
        cta: t('contactFooterCta')
    };
}
