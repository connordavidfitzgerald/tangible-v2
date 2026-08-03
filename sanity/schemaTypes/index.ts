import type { SchemaTypeDefinition } from 'sanity';

// Objects
import { bulletItem } from './objects/bulletItem';
import { serviceSlide } from './objects/serviceSlide';
import { centreIamSlide } from './objects/centreIamSlide';
import { heroSlideTitle } from './objects/heroSlideTitle';

// Documents (singletons)
import { home } from './documents/home';
import { about } from './documents/about';
import { programs } from './documents/programs';
import { contact } from './documents/contact';
import { servicesEntreprises } from './documents/servicesEntreprises';
import { servicesLeaders } from './documents/servicesLeaders';
import { centreIam } from './documents/centreIam';
import { siteSettings } from './documents/siteSettings';

/** Document types that are edited as singletons (one document, fixed id). */
export const SINGLETONS = [
    { type: 'siteSettings', title: 'Site Settings' },
    { type: 'home', title: 'Home Page' },
    { type: 'about', title: 'About Page' },
    { type: 'programs', title: 'Programs Page' },
    { type: 'servicesEntreprises', title: 'Services — Entreprises' },
    { type: 'servicesLeaders', title: 'Services — Leaders' },
    { type: 'centreIam', title: 'Centre I AM Page' },
    { type: 'contact', title: 'Contact Page' }
] as const;

export const schemaTypes: SchemaTypeDefinition[] = [
    // objects
    bulletItem,
    serviceSlide,
    centreIamSlide,
    heroSlideTitle,
    // documents
    home,
    about,
    programs,
    contact,
    servicesEntreprises,
    servicesLeaders,
    centreIam,
    siteSettings
];
