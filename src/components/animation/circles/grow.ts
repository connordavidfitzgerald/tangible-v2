import type { CircleParts, CirclesVariant } from './parts';

/** Peak opacity of the destination hairlines — a whisper, not a drawn line. */
const GHOST_OPACITY = 0.5;

/**
 * The circles built from nothing: hairlines, then fills, then type.
 *
 * Nothing translates. The three circles sit at their final positions from the
 * first frame and the only geometry is each one growing into place, so the
 * overlaps are true overlaps the whole way up rather than something applied to
 * the composition once it has stopped.
 *
 * Three beats, left to right throughout:
 *
 *   1. Hairlines scale in at the three destinations.
 *   2. Each disc irises open from its own centre, the first starting while the
 *      third hairline is still arriving. Each hairline hands over exactly as its
 *      own disc finishes filling it. The yellow lenses grow with them — see
 *      below, they are not a beat of their own.
 *   3. The type — each circle's title and paragraph together, beginning on the
 *      frame that circle's own disc finishes filling.
 *
 * Then a held tail, roughly the last sixth of the scroll, with the composition
 * complete and nothing moving. Without it the pin releases on the same frame the
 * last thing lands and the section reads as cut off rather than resolved.
 *
 * Two things about scrubbing in particular, both learned the hard way:
 *
 *   - **The eases are deliberately mixed, and mostly gentler than `power3.out`.**
 *     A strong ease-out feels expensive when a timeline is played and sluggish
 *     when it is scrubbed: it front-loads, so against a linear scroll input it
 *     reads as a snap followed by a wait. Only the type, which wants a crisp
 *     arrival, keeps `power3.out`; the opacity fades run linear, where an ease
 *     buys nothing.
 *   - **No beat may finish where nothing else is happening.** The beats overlap by
 *     roughly a third, so at every point in the scroll something is in motion.
 *     Dead stretches are what make a scrubbed section feel broken rather than
 *     slow.
 *
 * The weight is deliberately front-loaded. Beats 1 and 2 — the hairlines and the
 * fills — take a little over half the timeline between them, opening up as they go
 * (staggers of 0.18 then 0.25) so the composition is built slowly and deliberately.
 * The type inherits the fills' stagger, because each pair is pinned to its own
 * disc rather than running to a schedule of its own, which also means the first
 * title rises while the third disc is still opening, and the last paragraph is
 * what the held tail is waiting on. Big and slow early, small and fast late; even
 * weighting throughout is what makes a sequence like this feel like a loop rather
 * than a composition.
 *
 * Because the timeline is scrubbed, only these *proportions* matter — the scroll
 * distance is set once by `end` and the beats divide it up. Making a beat slower
 * means giving it a longer duration relative to the others, not lengthening the
 * pin.
 *
 * Nothing is hidden in CSS except the hairlines. The from-values do that, and GSAP
 * applies them when the timeline is built, which keeps the resting layout the one
 * the markup describes — so reduced motion and a JS failure both land on the
 * composed image rather than on an empty box.
 */
export const grow: CirclesVariant = {
    // 180% of the viewport, so the opening hairlines alone get about half a screen
    // of scroll rather than a couple of wheel notches.
    end: '+=180%',

    compose(tl, parts: CircleParts) {
        const { ghosts, discs, yellows, labelInners, lines } = parts;

        // ── 1. The hairlines ─────────────────────────────────────────────────
        // The three destinations, stated before anything fills them.
        // Transient, so they resolve back to nothing.
        if (ghosts.length) {
            tl.fromTo(
                ghosts,
                { opacity: 0, scale: 0.9 },
                {
                    opacity: GHOST_OPACITY,
                    scale: 1,
                    duration: 0.62,
                    stagger: 0.18,
                    ease: 'power2.out'
                },
                0
            );
        }

        // ── 2. The fills ─────────────────────────────────────────────────────
        // Each disc irises open from its own centre, starting while the third
        // hairline is still scaling in so the two beats interlock.
        //
        // These three are the spine of the timeline. Both the hairline handover
        // and the type key off them by derivation rather than by their own
        // literals, so retuning the fills carries everything that is supposed
        // to line up with them instead of silently pulling it out of sync.
        const FILL_START = 0.42;
        const FILL_DURATION = 0.95;
        const FILL_STAGGER = 0.25;

        /** When disc `i` begins filling. */
        const fillStart = (i: number) => FILL_START + i * FILL_STAGGER;

        /** When disc `i` has finished filling. */
        const filled = (i: number) => fillStart(i) + FILL_DURATION;

        // The end radius is what makes the ease land where it can be seen. For
        // a square box a `circle()` percentage resolves against its width, so a
        // disc's own edge is at 50% — clip beyond that and nothing more is
        // revealed, because `border-radius` is already cutting the corners
        // away. 52% is just past the edge: far enough not to double-antialias
        // it, and short enough that the whole tween is visible motion instead
        // of a third of a bloom and then a wait.
        const HIDDEN = 'circle(0% at 50% 50%)';
        const REVEALED = 'circle(52% at 50% 50%)';
        const FILL_EASE = 'power2.out';

        tl.fromTo(
            discs,
            { clipPath: HIDDEN },
            {
                clipPath: REVEALED,
                duration: FILL_DURATION,
                stagger: FILL_STAGGER,
                ease: FILL_EASE
            },
            FILL_START
        );

        // The overlaps, which are not a beat — they are a consequence of the
        // fills and are on screen for every frame in which the two discs
        // actually intersect.
        //
        // A lens is a full-size disc parked inside its own circle at the
        // *middle* circle's position, cut down to the lens shape by the
        // parent's `overflow: hidden`. So the parent's clip already limits it
        // to what that circle has revealed; what it cannot know about is the
        // middle circle, over which it would otherwise paint a yellow crescent
        // onto bare background while `.c2` is still opening.
        //
        // Giving each lens the middle disc's own reveal — same box size, same
        // duration and ease, started on the same frame — makes the visible
        // yellow the intersection of the two growing discs exactly, with no
        // opacity involved at any point. Both lenses take `.c2`'s timing
        // because both of them sit over `.c2`; if a fourth circle ever joins,
        // this has to become per-lens.
        if (yellows.length) {
            tl.fromTo(
                yellows,
                { clipPath: HIDDEN },
                { clipPath: REVEALED, duration: FILL_DURATION, ease: FILL_EASE },
                fillStart(1)
            );
        }

        // Each hairline hands over as its own disc reaches it: same stagger as
        // the fills, and backed off its own duration so every handover ends on
        // the exact frame its disc finishes, leaving no ring sitting under a
        // filled disc.
        const GHOST_OUT = 0.34;

        if (ghosts.length) {
            tl.to(
                ghosts,
                { opacity: 0, duration: GHOST_OUT, stagger: FILL_STAGGER, ease: 'none' },
                filled(0) - GHOST_OUT
            );
        }

        // ── 3. The type ──────────────────────────────────────────────────────
        // Each circle's type begins on the frame its own disc finishes filling
        // — so the words arrive as a consequence of the shape resolving rather
        // than on a schedule of their own. Derived from the fills above, which
        // is also why the stagger is theirs and not a separate number.
        //
        // A title and its paragraph share a beat, paired by index rather than by
        // two staggered tweens, so the pairing cannot drift if the counts ever
        // differ.
        //
        // The titles rise out of a mask, which is the site's display-type
        // vocabulary; the paragraphs take the shorter, gentler lift and fade
        // that `FadeUp.astro` uses for body copy, so the title stays the event
        // and the paragraph reads as following it.
        const TEXT_START = filled(0);
        const TEXT_STAGGER = FILL_STAGGER;
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
        // The last small share of the scroll, composition complete, nothing
        // moving. This is the beat that makes it read as resolved.
        //
        // The last paragraph is now what everything else has to clear, so the
        // tail is placed off it rather than off a literal — the type runs
        // longest of the three beats and nothing follows it.
        const LAST_LANDING = TEXT_START + (discs.length - 1) * TEXT_STAGGER + LINE_DURATION;

        tl.to({}, { duration: 0.5 }, LAST_LANDING);
    }
};
