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
 *      staggering a symmetry only makes it look like a mistake. The titles are
 *      part of this beat rather than one of their own: they sit inside the discs,
 *      already legible, and ride in with them.
 *   2. The paragraphs, left to right, starting before the move has quite
 *      finished.
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
        const { sides, y1, y3, lines } = parts;
        const [left, right] = sides;

        // ── 1. The move ──────────────────────────────────────────────────────
        const MOVE_DURATION = 1.1;
        const MOVE_EASE = 'power2.inOut';

        // Below `md` the three circles are stacked rather than rowed, so the same
        // convergence has to run down the page instead of across it. Only the axis
        // changes — the two outer discs still close on the middle one by the same
        // share of their own size, and the lenses still cancel it exactly.
        //
        // Read here rather than passed in because the layout it mirrors is a CSS
        // media query, and this is the one place that has to agree with it. It is
        // the same 809px the stylesheet switches on.
        const axis = window.matchMedia('(max-width: 809px)').matches ? 'yPercent' : 'xPercent';

        /** A converge tween on whichever axis this layout uses. */
        const converge = (el: HTMLElement, push: number) =>
            tl.fromTo(
                el,
                { [axis]: push },
                { [axis]: 0, duration: MOVE_DURATION, ease: MOVE_EASE },
                0
            );

        if (left) converge(left, -PUSH);
        if (right) converge(right, PUSH);

        // Each lens holds still in the page while its parent moves under it. Same
        // duration and ease as the parent, opposite sign — anything else and the
        // cancellation is only exact at the two ends, with the lens drifting off
        // the real intersection everywhere in between.
        if (y1) converge(y1, PUSH);
        if (y3) converge(y3, -PUSH);

        // ── 2. The paragraphs ────────────────────────────────────────────────
        // The titles are no longer a beat of their own. They belong to the
        // circles — a title is part of the field being brought into register,
        // not a caption that arrives once the field lands — so they are at full
        // strength from the first frame and travel in with their own disc.
        // `.circle-label` is a child of `.circle`, which is what makes that free:
        // the converge above carries the type with the shape it names, and the
        // mask around it goes back to being nothing but descender room.
        //
        // What stays staggered is the row of paragraphs, still left to right and
        // still overlapping the tail of the move by about a quarter of it, so the
        // circles are closing as the first line lifts. A scrubbed timeline with a
        // seam in it reads as broken rather than as two beats. They keep the
        // gentler lift and fade `FadeUp.astro` uses for body copy.
        const TEXT_START = MOVE_DURATION * 0.72;
        const TEXT_STAGGER = 0.22;
        const LINE_DURATION = 0.66;

        lines.forEach((line, i) => {
            tl.fromTo(
                line,
                { yPercent: 14, opacity: 0 },
                { yPercent: 0, opacity: 1, duration: LINE_DURATION, ease: 'power2.out' },
                TEXT_START + i * TEXT_STAGGER
            );
        });

        // ── The held tail ────────────────────────────────────────────────────
        // Composition complete, nothing moving. Placed off the last paragraph
        // rather than off a literal so retiming the type carries it.
        const LAST_LANDING =
            TEXT_START + Math.max(lines.length - 1, 0) * TEXT_STAGGER + LINE_DURATION;

        tl.to({}, { duration: 0.4 }, LAST_LANDING);
    }
};
