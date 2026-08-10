import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { collectParts, type CirclesVariant } from './circles/parts';
import { grow } from './circles/grow';
import { settle } from './circles/settle';

gsap.registerPlugin(ScrollTrigger);

/** Every assembly the element can run, by the name the `variant` attribute uses. */
const VARIANTS: Record<string, CirclesVariant> = { grow, settle };

/** Used when `variant` is missing or names something that is not in `VARIANTS`. */
const FALLBACK: keyof typeof VARIANTS = 'grow';

/** URL override, for comparing variants on a deployed build: `?circles=grow`. */
const OVERRIDE_PARAM = 'circles';

/**
 * The three overlapping circles on the About page ("Our approach").
 *
 * This element owns everything that is true of the section whatever it is doing —
 * when the timeline is built, where it is pinned, how far it scrubs, what happens
 * under reduced motion — and nothing about the assembly itself. The assemblies live
 * in `./circles`, one file each, and are chosen by the `variant` attribute:
 *
 *     <circles-animation variant="settle">
 *
 * `?circles=grow` on the URL overrides the attribute for a single load, which is how
 * to compare them on a deployed build without a rebuild. An unknown name in either
 * place falls back to `grow` rather than leaving the section dead.
 *
 * Every variant reads the same markup, via `collectParts`, and is free to ignore
 * whatever it does not use — which is what keeps switching one a one-word change
 * rather than a markup change.
 *
 * The section is viewport-height, and on desktop it pins and hands the assembly to
 * the scrollbar. Pinning the *section* rather than something inside it is
 * deliberate: it fills the screen exactly, and everything the timeline touches is
 * then on screen together — including each circle's title and the paragraph beneath
 * it, which have to animate on the same beat. `pinSpacing` pushes everything after
 * the pinned section a full pin-duration down the page, so any paragraph living
 * outside the pin would always be a screen and a half below its title.
 *
 * `end` comes from the variant, not from here. The beats inside a scrubbed timeline
 * are proportions and `end` is the scroll distance they divide up, so it is a
 * property of the particular assembly: a five-beat build wants noticeably more of it
 * than a slide into position does. Retiming a beat means changing its duration
 * relative to the others, in the variant; lengthening the pin is a different edit.
 *
 * Nothing is hidden in CSS except the hairlines. The variants' from-values do that,
 * and GSAP applies them when the timeline is built, which keeps the resting layout
 * the one the markup describes — so reduced motion and a JS failure both land on the
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

    /** The assembly this instance runs: URL override first, then the attribute. */
    private get variant(): CirclesVariant {
        const override = new URLSearchParams(window.location.search).get(OVERRIDE_PARAM);
        const name = override ?? this.getAttribute('variant') ?? FALLBACK;

        return VARIANTS[name] ?? VARIANTS[FALLBACK];
    }

    private build() {
        const parts = collectParts(this);
        if (!parts) return;

        const { pin, wrapper, animated } = parts;
        const variant = this.variant;

        this.mm = gsap.matchMedia(this);

        // Reduced motion gets the composed image. Nothing to undo: the hidden
        // states all live in the timeline's from-values, so never building it is
        // enough. The clear is only in case a previous build left props behind.
        this.mm.add('(prefers-reduced-motion: reduce)', () => {
            gsap.set(animated, { clearProps: 'all' });
        });

        // Desktop pins the section and scrubs the assembly against the scrollbar.
        this.mm.add('(min-width: 810px) and (prefers-reduced-motion: no-preference)', () => {
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
                    end: variant.end,
                    scrub: 1,
                    pin: pin,
                    pinSpacing: true,

                    /* This is the only pin on the site, and `pinSpacing` makes it
                       the only thing that changes how far down the page every
                       section after it sits — by the pin's own scroll distance,
                       1080px at a 1512-wide frame.

                       ScrollTrigger measures triggers in creation order, and it
                       measures them with pin spacing *reverted*, restoring each
                       pin's spacing when that pin's own turn comes round. This
                       one is built last: the element waits on `document.fonts
                       .ready` before it pins, by which time every SplitReveal
                       below it has already recorded a start position for a
                       document 1080px shorter than the one it ends up in. So the
                       vision quote and the promise list both fired while still a
                       screen and a half below the fold, and by the time you
                       scrolled to them they had long since finished — on desktop
                       only, because the mobile branch below does not pin.

                       A higher `refreshPriority` puts this trigger at the front
                       of that order, so the spacing is in place before anything
                       below it is measured. It only takes effect on a *refresh*,
                       though — the pass that creates this trigger has already
                       measured the others — hence the `ScrollTrigger.refresh()`
                       at the end of `build()`. */
                    refreshPriority: 1,

                    invalidateOnRefresh: true
                }
            });

            variant.compose(tl, parts);

            return () => {
                tl.scrollTrigger?.kill();
                tl.kill();
            };
        });

        // Mobile plays it once on entry instead. A pinned scrub against touch
        // momentum feels rubbery, and the group is likely taller than a phone
        // viewport anyway, so there is nothing to be gained by holding it there.
        this.mm.add('(max-width: 809px) and (prefers-reduced-motion: no-preference)', () => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: wrapper,
                    // The group is taller than a phone viewport, so its top edge
                    // crosses the fold well before enough of it is on screen to
                    // be worth watching. Holding off until the top is 60% down
                    // the frame gets the assembly under the thumb rather than
                    // half of it playing off the bottom.
                    start: 'top 45%',
                    once: true
                }
            });

            variant.compose(tl, parts);

            return () => {
                tl.scrollTrigger?.kill();
                tl.kill();
            };
        });

        // The pin has just changed the height of the document, and everything
        // below it was measured against the old one. See `refreshPriority` above
        // for why this has to come after the pin exists rather than before.
        ScrollTrigger.refresh();
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
