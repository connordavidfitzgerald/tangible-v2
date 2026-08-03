import { defineArrayMember, defineField, defineType } from 'sanity';
import { CogIcon } from '@sanity/icons';
import { i18nImage, i18nOptions, i18nString, i18nText } from '../lib/fields';

export const siteSettings = defineType({
    name: 'siteSettings',
    title: 'Site Settings',
    type: 'document',
    icon: CogIcon,
    groups: [
        { name: 'nav', title: 'Navigation' },
        { name: 'contact', title: 'Contact Info' },
        { name: 'links', title: 'External Links' },
        { name: 'video', title: 'Video' },
        { name: 'contactFooter', title: 'Contact Footer' },
        { name: 'form', title: 'Forms' },
        { name: 'labels', title: 'Buttons & Labels' },
        { name: 'seo', title: 'SEO' }
    ],
    fields: [
        { ...i18nString('navAbout', 'Nav — About'), group: 'nav' },
        { ...i18nString('navPrograms', 'Nav — Programs'), group: 'nav' },
        { ...i18nString('navMembers', 'Nav — Members Area'), group: 'nav' },
        { ...i18nString('navContact', 'Nav — Contact'), group: 'nav' },
        { ...i18nString('navIam', 'Nav — Centre I AM'), group: 'nav' },
        { ...i18nString('navBook', 'Nav — Book a consultation'), group: 'nav' },
        // The two service pages hang under "Nos services" in both menus.
        { ...i18nString('navServicesEntreprises', 'Nav — Services (Entreprises)'), group: 'nav' },
        { ...i18nString('navServicesLeaders', 'Nav — Services (Leaders)'), group: 'nav' },
        defineField({
            name: 'address',
            title: 'Address',
            type: 'text',
            rows: 3,
            group: 'contact'
        }),
        defineField({ name: 'phone', title: 'Phone', type: 'string', group: 'contact' }),
        defineField({ name: 'email', title: 'Email', type: 'string', group: 'contact' }),
        defineField({
            name: 'membersUrl',
            title: 'Members Area URL',
            type: 'url',
            group: 'links'
        }),
        defineField({
            name: 'bookingUrl',
            title: 'Booking URL',
            type: 'url',
            group: 'links'
        }),
        // One film, uploaded to Mux once and reused wherever a video appears —
        // hence it lives in Site Settings rather than on a single page document.
        defineField({
            name: 'video',
            title: 'Video',
            type: 'mux.video',
            description: 'Uploaded to Mux. Shown on the home page and any other page that embeds it.',
            group: 'video'
        }),
        // The services landing page runs a three-up slider rather than the single
        // film above. Leave it empty and the slider falls back to repeating the
        // film, so the page is never blank while the reels are being cut.
        defineField({
            name: 'videos',
            title: 'Video Slider — Films',
            type: 'array',
            description:
                'Shown as a slider on the services landing page. Empty falls back to the single film above.',
            group: 'video',
            of: [
                defineArrayMember({
                    type: 'object',
                    name: 'sliderVideo',
                    fields: [
                        defineField({ name: 'video', title: 'Video', type: 'mux.video' }),
                        i18nString(
                            'title',
                            'Title',
                            'Accessible label, also reported to Mux Data.'
                        )
                    ],
                    preview: {
                        select: { title: 'title.0.value' },
                        prepare: ({ title }) => ({ title: title || 'Film' })
                    }
                })
            ]
        }),
        defineField({
            name: 'videoPlaybackId',
            title: 'Video — Mux Playback ID',
            type: 'string',
            description:
                'For a film uploaded directly on mux.com instead of through the Studio. Ignored when a video is uploaded above.',
            group: 'video'
        }),
        {
            ...i18nString(
                'videoTitle',
                'Video — Title',
                'Used as the accessible label and reported to Mux Data.'
            ),
            group: 'video'
        },

        // ── Contact footer ──────────────────────────────────────────────────
        // The band that closes every page. Its heading is authored per page —
        // each one says something different — but the rest of the block reads
        // the same everywhere, so it is written once here.
        {
            ...i18nString(
                'contactFooterHeading',
                'Default heading',
                'Used when a page leaves its own contact-footer heading blank.'
            ),
            group: 'contactFooter'
        },
        { ...i18nText('contactFooterParagraph', 'Paragraph'), group: 'contactFooter' },
        {
            ...i18nString('contactFooterBooking', 'Form heading', 'Sits above the form.'),
            group: 'contactFooter'
        },
        {
            ...i18nText(
                'contactFooterMobBody',
                'Paragraph — phone layout',
                'The phone frame runs the paragraph and the form heading together as one block. Blank lines become paragraph breaks.'
            ),
            group: 'contactFooter'
        },
        {
            ...i18nString(
                'contactFooterCta',
                'Button — pages without a form',
                'About and Centre I AM close on a button through to the services page instead of the form.'
            ),
            group: 'contactFooter'
        },

        // ── Forms ───────────────────────────────────────────────────────────
        // One dictionary for every form on the site: the contact page, the
        // Centre I AM booking form and the two-step contact footer all label the
        // same fields, so they are authored once rather than three times over.
        defineField({
            name: 'formAccessKey',
            title: 'Web3Forms access key',
            type: 'string',
            description: 'Where submissions are delivered. From web3forms.com.',
            group: 'form'
        }),
        { ...i18nString('formName', 'Field — Name'), group: 'form' },
        { ...i18nString('formEmail', 'Field — Email'), group: 'form' },
        { ...i18nString('formPhone', 'Field — Phone'), group: 'form' },
        { ...i18nString('formCompany', 'Field — Company'), group: 'form' },
        { ...i18nString('formCompanySite', 'Field — Company website'), group: 'form' },
        { ...i18nString('formMessage', 'Field — Message'), group: 'form' },
        { ...i18nString('formEmployeesLabel', 'Group — Number of employees'), group: 'form' },
        { ...i18nOptions('formEmployeesOptions', 'Options — Number of employees'), group: 'form' },
        { ...i18nString('formBudgetLabel', 'Group — Budget'), group: 'form' },
        { ...i18nOptions('formBudgetOptions', 'Options — Budget'), group: 'form' },
        { ...i18nString('formSupportLabel', 'Group — Type of support sought'), group: 'form' },
        { ...i18nOptions('formSupportOptions', 'Options — Type of support sought'), group: 'form' },
        { ...i18nString('formConsultationLabel', 'Checkbox — Free consultation'), group: 'form' },
        { ...i18nString('formNext', 'Button — Next'), group: 'form' },
        { ...i18nString('formPrev', 'Button — Previous'), group: 'form' },
        { ...i18nString('formSubmit', 'Button — Submit'), group: 'form' },
        {
            ...i18nString(
                'formSuccess',
                'Button — Sent',
                'Replaces the submit label for a moment once the form goes through.'
            ),
            group: 'form'
        },

        // ── Shared UI labels ────────────────────────────────────────────────
        {
            ...i18nString(
                'sliderResultLabel',
                'Services slider — "Result" heading',
                'Sits above the result paragraph on every slide.'
            ),
            group: 'labels'
        },
        {
            ...i18nString(
                'sliderPrevLabel',
                'Services slider — Previous',
                'Read out by screen readers; never shown on screen.'
            ),
            group: 'labels'
        },
        { ...i18nString('sliderNextLabel', 'Services slider — Next'), group: 'labels' },
        { ...i18nString('videoPrevLabel', 'Film slider — Previous'), group: 'labels' },
        { ...i18nString('videoNextLabel', 'Film slider — Next'), group: 'labels' },

        // ── SEO ─────────────────────────────────────────────────────────────
        defineField({
            name: 'seoSiteName',
            title: 'Site name',
            type: 'string',
            description: 'Appended to every page title — "About — Tangible".',
            group: 'seo'
        }),
        {
            ...i18nString(
                'seoDescription',
                'Default description',
                'Used by any page that does not set its own.'
            ),
            group: 'seo'
        },
        {
            ...i18nImage('seoImage', 'Share image', 'Shown when a page is linked on social.'),
            group: 'seo'
        }
    ],
    preview: { prepare: () => ({ title: 'Site Settings' }) }
});
