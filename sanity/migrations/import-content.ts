/**
 * Transforms the legacy `src/content/*.json` (bilingual { fr, en } objects) into
 * an NDJSON file of Sanity documents using field-level internationalized arrays.
 *
 *   npm run content:build              # writes sanity/migrations/content.ndjson
 *   npx sanity dataset import sanity/migrations/content.ndjson <dataset>
 *
 * Documents are created at fixed ids equal to their type (singletons).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SOURCE = join(__dirname, 'source');
const OUT = join(__dirname, 'content.ndjson');

// ── i18n value builders ─────────────────────────────────────────────────────
let keySeq = 0;
const key = () => `k${(keySeq++).toString(36)}`;

const iStr = (fr?: string, en?: string) => [
    { _key: 'fr', _type: 'internationalizedArrayStringValue', value: fr ?? '' },
    { _key: 'en', _type: 'internationalizedArrayStringValue', value: en ?? '' }
];
const iText = (fr?: string, en?: string) => [
    { _key: 'fr', _type: 'internationalizedArrayTextValue', value: fr ?? '' },
    { _key: 'en', _type: 'internationalizedArrayTextValue', value: en ?? '' }
];

const read = (name: string) => JSON.parse(readFileSync(join(SOURCE, `${name}.json`), 'utf-8'));

// ── Per-document transforms ─────────────────────────────────────────────────
function build() {
    const home = read('home');
    const about = read('about');
    const programs = read('programs');
    const contact = read('contact');
    const entreprises = read('services-entreprises');
    const leaders = read('services-leaders');
    const centre = read('centre-iam');

    const str = (doc: any, k: string) => iStr(doc.fr[k], doc.en[k]);
    const txt = (doc: any, k: string) => iText(doc.fr[k], doc.en[k]);

    const docs: any[] = [];

    // Home
    docs.push({
        _id: 'home',
        _type: 'home',
        heroLine1: str(home, 'heroLine1'),
        heroLine2: str(home, 'heroLine2'),
        heroLine3: str(home, 'heroLine3'),
        aboutSectionLabel: str(home, 'aboutSectionLabel'),
        aboutBody: txt(home, 'aboutBody'),
        aboutBody2: txt(home, 'aboutBody2'),
        aboutButton: str(home, 'aboutButton'),
        missionQuote: txt(home, 'missionQuote'),
        programsSectionLabel: str(home, 'programsSectionLabel'),
        entreprisesTitle1: str(home, 'entreprisesTitle1'),
        entreprisesTitle2: str(home, 'entreprisesTitle2'),
        entreprisesBody: txt(home, 'entreprisesBody'),
        entreprisesResult: str(home, 'entreprisesResult'),
        entreprisesButton: str(home, 'entreprisesButton'),
        leadersTitle1: str(home, 'leadersTitle1'),
        leadersTitle2: str(home, 'leadersTitle2'),
        leadersBody: txt(home, 'leadersBody'),
        leadersAmbition: str(home, 'leadersAmbition'),
        leadersButton: str(home, 'leadersButton'),
        contactFooterHeading: str(home, 'contactFooterHeading')
    });

    // About
    docs.push({
        _id: 'about',
        _type: 'about',
        heroSectionLabel: str(about, 'heroSectionLabel'),
        heroLine1: str(about, 'heroLine1'),
        heroLine2: str(about, 'heroLine2'),
        heroLine3: str(about, 'heroLine3'),
        heroLine4: str(about, 'heroLine4'),
        introParagraph1: txt(about, 'introParagraph1'),
        introParagraph2: txt(about, 'introParagraph2'),
        approachSectionLabel: str(about, 'approachSectionLabel'),
        circleLabel1: str(about, 'circleLabel1'),
        circleLabel2: str(about, 'circleLabel2'),
        circleLabel3: str(about, 'circleLabel3'),
        approachBody: txt(about, 'approachBody'),
        visionSectionLabel: str(about, 'visionSectionLabel'),
        visionQuote: txt(about, 'visionQuote'),
        promiseSectionLabel: str(about, 'promiseSectionLabel'),
        promiseIntro: str(about, 'promiseIntro'),
        promiseItems: (about.fr.promiseItems ?? []).map((fr: string, i: number) => ({
            _key: key(),
            _type: 'bulletItem',
            text: iStr(fr, about.en.promiseItems?.[i])
        })),
        ronName: str(about, 'ronName'),
        ronTitle: str(about, 'ronTitle'),
        ronBio: txt(about, 'ronBio'),
        contactFooterHeading: str(about, 'contactFooterHeading')
    });

    // Programs
    docs.push({
        _id: 'programs',
        _type: 'programs',
        pageTitle: txt(programs, 'pageTitle'),
        entreprisesTitle1: str(programs, 'entreprisesTitle1'),
        entreprisesTitle2: str(programs, 'entreprisesTitle2'),
        entreprisesBody: txt(programs, 'entreprisesBody'),
        entreprisesResult: str(programs, 'entreprisesResult'),
        entreprisesButton: str(programs, 'entreprisesButton'),
        leadersTitle1: str(programs, 'leadersTitle1'),
        leadersTitle2: str(programs, 'leadersTitle2'),
        leadersBody: txt(programs, 'leadersBody'),
        leadersAmbition: str(programs, 'leadersAmbition'),
        leadersButton: str(programs, 'leadersButton'),
        quote: txt(programs, 'quote'),
        quoteAuthor: str(programs, 'quoteAuthor'),
        contactFooterHeading: str(programs, 'contactFooterHeading')
    });

    // Contact
    docs.push({
        _id: 'contact',
        _type: 'contact',
        heroLine1: str(contact, 'heroLine1'),
        heroLine2: str(contact, 'heroLine2'),
        heroLine3: str(contact, 'heroLine3'),
        heroLine4: str(contact, 'heroLine4'),
        introBold: txt(contact, 'introBold'),
        introBody: txt(contact, 'introBody'),
        email: str(contact, 'email'),
        phone: str(contact, 'phone'),
        fieldName: str(contact, 'fieldName'),
        fieldEmail: str(contact, 'fieldEmail'),
        fieldPhone: str(contact, 'fieldPhone'),
        fieldMessage: str(contact, 'fieldMessage'),
        checkboxLabel: str(contact, 'checkboxLabel'),
        submitButton: str(contact, 'submitButton')
    });

    // Services — Entreprises + Leaders (share the serviceSlide shape)
    const serviceSlides = (doc: any) =>
        (doc.fr.slides ?? []).map((frSlide: any, i: number) => {
            const enSlide = doc.en.slides?.[i] ?? {};
            return {
                _key: key(),
                _type: 'serviceSlide',
                shapeTitle: iText(frSlide.shapeTitle, enSlide.shapeTitle),
                body: iText(frSlide.body, enSlide.body),
                result: iText(frSlide.result, enSlide.result)
            };
        });

    docs.push({
        _id: 'servicesEntreprises',
        _type: 'servicesEntreprises',
        heroLine1: str(entreprises, 'heroLine1'),
        heroLine2: str(entreprises, 'heroLine2'),
        introParagraph: txt(entreprises, 'introParagraph'),
        introResult: txt(entreprises, 'introResult'),
        slides: serviceSlides(entreprises),
        contactFooterHeading: str(entreprises, 'contactFooterHeading')
    });

    docs.push({
        _id: 'servicesLeaders',
        _type: 'servicesLeaders',
        heroLine1: str(leaders, 'heroLine1'),
        heroLine2: str(leaders, 'heroLine2'),
        introParagraph: txt(leaders, 'introParagraph'),
        slides: serviceSlides(leaders),
        contactFooterHeading: str(leaders, 'contactFooterHeading')
    });

    // Centre I AM
    docs.push({
        _id: 'centreIam',
        _type: 'centreIam',
        heroLine1: str(centre, 'heroLine1'),
        heroLine2: str(centre, 'heroLine2'),
        heroLine3: str(centre, 'heroLine3'),
        heroLine4: str(centre, 'heroLine4'),
        aboutSectionLabel: str(centre, 'aboutSectionLabel'),
        aboutBody: txt(centre, 'aboutBody'),
        aboutBodyParagraph: txt(centre, 'aboutBodyParagraph'),
        servicesSectionLabel: str(centre, 'servicesSectionLabel'),
        slides: (centre.fr.slides ?? []).map((frSlide: any, i: number) => {
            const enSlide = centre.en.slides?.[i] ?? {};
            return {
                _key: key(),
                _type: 'centreIamSlide',
                title: iText(frSlide.title, enSlide.title),
                description: iText(frSlide.description, enSlide.description)
            };
        }),
        contactFooterHeading: str(centre, 'contactFooterHeading')
    });

    // Site Settings (nav labels + contact info were hardcoded in the old layout).
    docs.push({
        _id: 'siteSettings',
        _type: 'siteSettings',
        navAbout: iStr('À Propos', 'About'),
        navPrograms: iStr('Nos Services', 'Our Services'),
        navMembers: iStr('Espace Membre', 'Members Area'),
        navContact: iStr('Contact', 'Contact'),
        navIam: iStr('Centre I AM', 'I AM Center'),
        navBook: iStr('Réservez une consultation', 'Book a consultation'),
        address: '1179, rue de Bleury, 5e étage\nMontreal (Quebec) H3B 3H9\nCANADA',
        phone: '514-679-2312',
        email: 'info@tangiblecoach.com',
        membersUrl: 'https://www.cognito-app.com/coach/?askedByTenant=ten181110034803',
        bookingUrl: 'https://www.app.taaars.com/b/roncherilus'
    });

    return docs;
}

const docs = build();
writeFileSync(OUT, docs.map((d) => JSON.stringify(d)).join('\n') + '\n', 'utf-8');
console.log(`Wrote ${docs.length} documents to ${OUT}`);
