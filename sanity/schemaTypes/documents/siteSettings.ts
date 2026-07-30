import { defineArrayMember, defineField, defineType } from 'sanity';
import { CogIcon } from '@sanity/icons';
import { i18nString } from '../lib/fields';

export const siteSettings = defineType({
    name: 'siteSettings',
    title: 'Site Settings',
    type: 'document',
    icon: CogIcon,
    groups: [
        { name: 'nav', title: 'Navigation' },
        { name: 'contact', title: 'Contact Info' },
        { name: 'links', title: 'External Links' },
        { name: 'video', title: 'Video' }
    ],
    fields: [
        { ...i18nString('navAbout', 'Nav — About'), group: 'nav' },
        { ...i18nString('navPrograms', 'Nav — Programs'), group: 'nav' },
        { ...i18nString('navMembers', 'Nav — Members Area'), group: 'nav' },
        { ...i18nString('navContact', 'Nav — Contact'), group: 'nav' },
        { ...i18nString('navIam', 'Nav — Centre I AM'), group: 'nav' },
        { ...i18nString('navBook', 'Nav — Book a consultation'), group: 'nav' },
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
        }
    ],
    preview: { prepare: () => ({ title: 'Site Settings' }) }
});
