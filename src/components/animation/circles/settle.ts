import type { CircleParts, CirclesVariant } from './parts';

/**
 * How far out the side circles wait before closing, as a share of a circle's own
 * width. A percentage rather than pixels so the offset tracks the viewport: the
 * circles are sized in percentages of the grid, and a 90px push that reads as a
 * gentle spread at 1512 reads as a rout on a laptop.
 *
 * There is a ceiling on this. The composed layout overlaps each side circle with
 * the middle one by 30% of a circle's width, so at 30 they start exactly touching
 * and past it they start apart — at which point the section opens on three
 * separate circles and the whole premise, that these are overlapping fields being
 * brought into register, is gone before it is stated. Half of that is the most
 * that still reads as *spread* rather than *scattered*.
 */
const PUSH = 15;

/**
 * The circles as a movement: already drawn, already overlapping, closing into
 * register.
 *
 * The plain reading of the same idea. No hairlines and no fills — every disc is
 * on screen at full strength from the first frame, and the only geometry is the
 * two side circles sliding in from their wider spread. The hairlines are still in
 * the markup and stay at the opacity CSS gives them, which is zero; this variant
 * simply never mentions them.
 *
 * Two beats:
 *
 *   1. The move. Both sides close at once — they converge symmetrically, and
 *      staggering a symmetry only makes it look like a mistake.
 *   2. The type, left to right, starting before the move has quite finished.
 *
 * Then the same held tail as `grow`, for the same reason: the pin should not
 * release on the frame the last paragraph lands.
 *
 * `power2.inOut` for the move because a settle wants to ease in as well as out.
 * An ease-out alone starts at full speed, which on a converging pair reads as a
 * snap and then a crawl — the one thing a scrubbed timeline punishes hardest.
 *
 * **The yellows are the whole trick here, and they are not animated as opacity.**
 * A lens is a full-size disc parked inside its own circle at the middle circle's
 * position, cut down to the lens shape by the parent's `overflow: hidden`. It is
 * a child, so when its circle translates, it translates too — which would drag
 * the intersection off the actual intersection by exactly the push, and paint a
 * yellow band into open background on the way. Counter-translating each lens by
 * the same amount its parent moves pins it to `.c2`, which never moves at all, so
 * the visible yellow is the true overlap on every frame of the move and the
 * lenses need no fade at all. `xPercent` on both sides of that cancellation
 * resolves against the same width — a lens is 100% of its circle — so the two
 * offsets are the same number and stay the same number at every viewport.
 */
export const settle: CirclesVariant = {
    // Shorter than `grow`: two beats to divide up rather than five, and the same
    // scroll distance spread over fewer of them just makes each one feel slack.
    end: '+=120%',

    compose(tl, parts: CircleParts) {
        const { sides, y1, y3, labelInners, lines } = parts;
        const [left, right] = sides;

        // ── 1. The move ──────────────────────────────────────────────────────
        const MOVE_DURATION = 1.1;
        const MOVE_EASE = 'power2.inOut';

        if (left) {
            tl.fromTo(
                left,
                { xPercent: -PUSH },
                { xPercent: 0, duration: MOVE_DURATION, ease: MOVE_EASE },
                0
            );
        }

        if (right) {
            tl.fromTo(
                right,
                { xPercent: PUSH },
                { xPercent: 0, duration: MOVE_DURATION, ease: MOVE_EASE },
                0
            );
        }

        // Each lens holds still in the page while its parent moves under it. Same
        // duration and ease as the parent, opposite sign — anything else and the
        // cancellation is only exact at the two ends, with the lens drifting off
        // the real intersection everywhere in between.
        if (y1) {
            tl.fromTo(
                y1,
                { xPercent: PUSH },
                { xPercent: 0, duration: MOVE_DURATION, ease: MOVE_EASE },
                0
            );
        }

        if (y3) {
            tl.fromTo(
                y3,
                { xPercent: -PUSH },
                { xPercent: 0, duration: MOVE_DURATION, ease: MOVE_EASE },
                0
            );
        }

        // ── 2. The type ──────────────────────────────────────────────────────
        // Overlapping the tail of the move by about a quarter of it, so the
        // circles are still closing as the first title rises. A scrubbed
        // timeline with a seam in it reads as broken rather than as two beats.
        //
        // Same treatment as `grow`: title and paragraph paired by index on one
        // beat, the title rising out of its mask and the paragraph taking the
        // gentler lift and fade that `FadeUp.astro` uses for body copy.
        const TEXT_START = MOVE_DURATION * 0.72;
        const TEXT_STAGGER = 0.22;
        const LINE_DURATION = 0.66;

        labelInners.forEach((label, i) => {
            const at = TEXT_START + i * TEXT_STAGGER;

            tl.fromTo(
                label,
                { yPercent: 110 },
                { yPercent: 0, duration: 0.52, ease: 'power3.out' },
                at
            );

            const line = lines[i];
            if (line) {
                tl.fromTo(
                    line,
                    { yPercent: 14, opacity: 0 },
                    { yPercent: 0, opacity: 1, duration: LINE_DURATION, ease: 'power2.out' },
                    at
                );
            }
        });

        // ── The held tail ────────────────────────────────────────────────────
        // Composition complete, nothing moving. Placed off the last paragraph
        // rather than off a literal so retiming the type carries it.
        const LAST_LANDING =
            TEXT_START + Math.max(labelInners.length - 1, 0) * TEXT_STAGGER + LINE_DURATION;

        tl.to({}, { duration: 0.4 }, LAST_LANDING);
    }
};
