import { createElement } from 'react';
import { defineField, defineType } from 'sanity';
import { PlayIcon } from '@sanity/icons';
import { i18nString } from '../lib/fields';

/**
 * One film as a page embeds it: either uploaded through the Studio's Mux
 * plugin, or uploaded directly on mux.com and pasted in by playback id. The
 * upload wins when both are set.
 *
 * Every field is optional — a page whose video is left empty plays the
 * default film from Site Settings instead (see `src/lib/sanity/video.ts`).
 */
export const pageVideo = defineType({
    name: 'pageVideo',
    title: 'Video',
    type: 'object',
    icon: PlayIcon,
    fields: [
        defineField({
            name: 'video',
            title: 'Upload',
            type: 'mux.video',
            description: 'Upload a film, or pick one already in the Mux account.'
        }),
        defineField({
            name: 'playbackId',
            title: 'Mux Playback ID',
            type: 'string',
            description:
                'For a film uploaded directly on mux.com instead. Ignored when a film is uploaded above.'
        }),
        i18nString('title', 'Title', 'Accessible label, also reported to Mux Data.')
    ],
    preview: {
        select: {
            title: 'title',
            uploaded: 'video.asset.playbackId',
            pasted: 'playbackId'
        },
        prepare({ title, uploaded, pasted }) {
            const label = Array.isArray(title)
                ? title.find((entry) => entry?._key === 'fr')?.value
                : '';
            const playbackId = uploaded || pasted;
            return {
                title: label || 'Film',
                subtitle: playbackId ? undefined : 'No film yet',
                // Mux's own poster frame, so the films can be told apart while
                // dragging them into order.
                media: playbackId
                    ? createElement('img', {
                          src: `https://image.mux.com/${playbackId}/thumbnail.webp?width=200`,
                          alt: '',
                          style: { objectFit: 'cover', width: '100%', height: '100%' }
                      })
                    : PlayIcon
            };
        }
    }
});
