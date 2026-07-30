import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/** Peak opacity of the destination hairlines — a whisper, not a drawn line. */
const GHOST_OPACITY = 0.5;

/** How far out, in px, the side circles start before settling into register. */
const SETTLE = 20;

/**
 * The three overlapping circles on the About page ("Our approach").
 *
 * The section is viewport-height, and on desktop it pins and hands the assembly
 * to the scrollbar. Pinning the *section* rather than something inside it is
 * deliberate: it fills the screen exactly, and everything the timeline touches is
 * then on screen together — including each circle's title and the paragraph
 * beneath it, which have to animate on the same beat. `pinSpacing` pushes
 * everything after the pinned   a full pin-duration down the page, so any
 * paragraph living outsifgrtv3gb jm de the pin would always be a screen and a half below its 
 * title.
 *
 * Five beats, left to right throughout:
 *
 *   1. Hairlines scale in at the three destinations.
 *   2. Each disc irises open from its own centre, the first starting while the
 *      third hairline is still arriving. Each hairline hands over exactly as its
 *      own disc finishes filling it.
 *   3. The type — each circle's title and paragraph together, beginning on the
 *      frame that circle's own disc finishes filling.
 *   4. The two side circles settle inwards. They and their hairlines have been
 *      sitting `SETTLE` px out towards their own edge all along, so the pair stays
 *      in register through beats 1 and 2.
 *   5. The yellow overlaps fade up, last, once the geometry has all but stopped.
 *
 * Then a held tail, roughly the last tenth of the scroll, with the composition
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
 * (staggers of 0.18 then 0.30) so the composition is built slowly and deliberately.
 * The type inherits the fills' stagger, because each pair is pinned to its own
 * disc rather than running to a schedule of its own, which also means the first
 * title rises while the third disc is still opening. The settle and the overlaps
 * are then quick — about a fifth of the timeline for both. Big and slow early,
 * small and fast late; even weighting throughout is what makes a sequence like this
 * feel like a loop rather than a composition.
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
class CirclesAnimation extends HTMLElement {
    private mm: gsap.MatchMedia | undefined;
    private raf = 0;

    initCircles() {
        this.mm?.revert();
        cancelAnimationFrame(this.raf);

        // Fonts change the label metrics, and the labels sit inside a mask, so
        // wait for both the fonts and the following frame's layout.
        document.fonts.ready.then(() => {
            this.raf = requestAnimationFrame(() => this.build());
        });
    }

    private build() {
        const pin = this.querySelector<HTMLElement>('.circles-pin');
        const wrapper = this.querySelector<HTMLElement>('.circles-wrapper');
        const c1 = this.querySelector<HTMLElement>('.c1');
        const c2 = this.querySelector<HTMLElement>('.c2');
        const c3 = this.querySelector<HTMLElement>('.c3');
        const g1 = this.querySelector<HTMLElement>('.cg1');
        const g3 = this.querySelector<HTMLElement>('.cg3');
        const ghosts = gsap.utils.toArray<HTMLElement>('.circle-ghost', this);
        const discs = gsap.utils.toArray<HTMLElement>('.circle', this);
        const yellows = gsap.utils.toArray<HTMLElement>('.yellow', this);
        const labelInners = gsap.utils.toArray<HTMLElement>('.circle-label-inner', this);
        const lines = gsap.utils.toArray<HTMLElement>('.approach-line', this);

        if (!pin || !wrapper || !c1 || !c2 || !c3) return;

        // Each side circle and its hairline move as a pair, so they stay in
        // register while the disc is filling.
        const leftPair = [c1, g1].filter((el): el is HTMLElement => Boolean(el));
        const rightPair = [c3, g3].filter((el): el is HTMLElement => Boolean(el));

        /** The assembly itself, identical whether it is scrubbed or played. */
        const compose = (tl: gsap.core.Timeline) => {
            // ── 1. The hairlines ─────────────────────────────────────────────
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

            // The side circles and their hairlines wait out towards their own
            // edges. Set rather than tweened, so beat 4 has somewhere to come from
            // and beats 1 and 2 happen with each pair already together.
            tl.set(leftPair, { x: -SETTLE }, 0);
            tl.set(rightPair, { x: SETTLE }, 0);

            // ── 2. The fills ─────────────────────────────────────────────────
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

            /** When disc `i` has finished filling. */
            const filled = (i: number) => FILL_START + FILL_DURATION + i * FILL_STAGGER;

            // The end radius is what makes the ease land where it can be seen. For
            // a square box a `circle()` percentage resolves against its width, so a
            // disc's own edge is at 50% — clip beyond that and nothing more is
            // revealed, because `border-radius` is already cutting the corners
            // away. 52% is just past the edge: far enough not to double-antialias
            // it, and short enough that the whole tween is visible motion instead
            // of a third of a bloom and then a wait.
            tl.fromTo(
                discs,
                { clipPath: 'circle(0% at 50% 50%)' },
                {
                    clipPath: 'circle(52% at 50% 50%)',
                    duration: FILL_DURATION,
                    stagger: FILL_STAGGER,
                    ease: 'power2.out'
                },
                FILL_START
            );

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

            // ── 3. The type ──────────────────────────────────────────────────
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
                        { yPercent: 0, opacity: 1, duration: 0.66, ease: 'power2.out' },
                        at
                    );
                }
            });

            // ── 4. The settle ────────────────────────────────────────────────
            // The two sides close the last few pixels into their final positions.
            // `power2.inOut` because a settle wants to ease in as well as out — an
            // ease-out alone starts at full speed, which on a 20px move is a twitch.
            tl.to([...leftPair, ...rightPair], { x: 0, duration: 0.7, ease: 'power2.inOut' }, 2.5);

            // ── 5. The overlaps ──────────────────────────────────────────────
            // Last, and late enough into the settle that each lens is within a
            // couple of pixels of the true intersection as it becomes visible.
            if (yellows.length) {
                tl.fromTo(
                    yellows,
                    { opacity: 0 },
                    { opacity: 1, duration: 0.3, stagger: 0.07, ease: 'none' },
                    2.82
                );
            }

            // ── The held tail ────────────────────────────────────────────────
            // The last small share of the scroll, composition complete, nothing
            // moving. This is the beat that makes it read as resolved.
            tl.to({}, { duration: 0.5 }, 3.61);
        };

        this.mm = gsap.matchMedia(this);

        // Reduced motion gets the composed image. Nothing to undo: the hidden
        // states all live in the timeline's from-values, so never building it is
        // enough. The clear is only in case a previous build left props behind.
        this.mm.add('(prefers-reduced-motion: reduce)', () => {
            gsap.set([...discs, ...yellows, ...labelInners, ...lines], { clearProps: 'all' });
        });

        // Desktop pins the section and scrubs the assembly against the scrollbar.
        this.mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    // `pin` gets the inner div, never `this` — pinning re-parents
                    // the element, and re-parenting a custom element fires its
                    // lifecycle callbacks, which rebuild the timeline, which pins
                    // again. See the note in About.astro.
                    trigger: pin,
                    // The section is viewport-height, so locking its top to the
                    // top of the viewport fills the screen exactly.
                    start: 'top top',
                    // The pace of the whole thing, and the only place to change
                    // it: the timeline's beats are proportions, and this is the
                    // scroll distance they divide up. 180% of the viewport, so
                    // the opening hairlines alone get about half a screen of
                    // scroll rather than a couple of wheel notches.
                    end: '+=180%',
                    scrub: 1,
                    pin: pin,
                    pinSpacing: true,
                    anticipatePin: 1,
                    invalidateOnRefresh: true
                }
            });

            compose(tl);

            return () => {
                tl.scrollTrigger?.kill();
                tl.kill();
            };
        });

        // Mobile plays it once on entry instead. A pinned scrub against touch
        // momentum feels rubbery, and the group is likely taller than a phone
        // viewport anyway, so there is nothing to be gained by holding it there.
        this.mm.add('(max-width: 767px) and (prefers-reduced-motion: no-preference)', () => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: wrapper,
                    start: 'top 75%',
                    once: true
                }
            });

            compose(tl);

            return () => {
                tl.scrollTrigger?.kill();
                tl.kill();
            };
        });
    }

    connectedCallback() {
        this.initCircles();
    }

    disconnectedCallback() {
        cancelAnimationFrame(this.raf);
        this.mm?.revert();
        this.mm = undefined;
    }
}

if (!customElements.get('circles-animation')) {
    customElements.define('circles-animation', CirclesAnimation);
}

export { CirclesAnimation };
