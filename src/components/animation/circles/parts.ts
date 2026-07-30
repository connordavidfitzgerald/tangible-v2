import { gsap } from 'gsap';

/**
 * Everything on the About page's "Our approach" section that a circles variant is
 * allowed to touch, collected once so the variants themselves contain nothing but
 * timing.
 *
 * Every variant gets the same markup — the one in `About.astro` — and is free to
 * ignore whatever it does not use. The hairlines are the example: they are in the
 * DOM for every variant, hidden in CSS, and only the `grow` variant ever raises
 * their opacity. That is deliberate. It means switching variants is a one-word
 * change and never a markup change, which is the whole point of being able to
 * switch at all.
 */
export interface CircleParts {
    /** The section that pins. Never the custom element — see the note in About.astro. */
    pin: HTMLElement;
    /** The circles' own box, used as the mobile trigger. */
    wrapper: HTMLElement;
    /** The three discs, left to right. */
    discs: HTMLElement[];
    /** The destination hairlines, left to right. Only `grow` uses these. */
    ghosts: HTMLElement[];
    /** Both yellow lenses. */
    yellows: HTMLElement[];
    /** The lens inside the left disc, sitting over the middle one. */
    y1: HTMLElement | null;
    /** The lens inside the right disc, sitting over the middle one. */
    y3: HTMLElement | null;
    /** The left and right discs, which are the only two that any variant moves. */
    sides: HTMLElement[];
    /** The masked titles, one per circle. */
    labelInners: HTMLElement[];
    /** The paragraphs beneath, in the same order as the titles. */
    lines: HTMLElement[];
    /**
     * Everything a timeline sets a from-value on, which is exactly what the
     * reduced-motion path has to clear. Kept here so a variant cannot animate
     * something the clear does not know about.
     */
    animated: HTMLElement[];
}

/**
 * A single way of assembling the circles.
 *
 * `end` belongs to the variant rather than to the element because it is the pace
 * of that particular assembly: the beats inside a scrubbed timeline are
 * proportions, and this is the scroll distance they divide up. A five-beat build
 * wants noticeably more of it than a slide into position does.
 */
export interface CirclesVariant {
    /** ScrollTrigger `end` for the pinned desktop scrub. */
    end: string;
    /** Lays the assembly onto `tl`. Identical whether it is scrubbed or played. */
    compose: (tl: gsap.core.Timeline, parts: CircleParts) => void;
}

/**
 * Reads the parts out of a `<circles-animation>`, or returns null if the section
 * is not the shape any variant expects.
 */
export function collectParts(root: HTMLElement): CircleParts | null {
    const pin = root.querySelector<HTMLElement>('.circles-pin');
    const wrapper = root.querySelector<HTMLElement>('.circles-wrapper');
    const c1 = root.querySelector<HTMLElement>('.c1');
    const c2 = root.querySelector<HTMLElement>('.c2');
    const c3 = root.querySelector<HTMLElement>('.c3');

    if (!pin || !wrapper || !c1 || !c2 || !c3) return null;

    const ghosts = gsap.utils.toArray<HTMLElement>('.circle-ghost', root);
    const discs = gsap.utils.toArray<HTMLElement>('.circle', root);
    const yellows = gsap.utils.toArray<HTMLElement>('.yellow', root);
    const labelInners = gsap.utils.toArray<HTMLElement>('.circle-label-inner', root);
    const lines = gsap.utils.toArray<HTMLElement>('.approach-line', root);

    return {
        pin,
        wrapper,
        discs,
        ghosts,
        yellows,
        y1: root.querySelector<HTMLElement>('.y1'),
        y3: root.querySelector<HTMLElement>('.y3'),
        sides: [c1, c3],
        labelInners,
        lines,
        animated: [...discs, ...ghosts, ...yellows, ...labelInners, ...lines]
    };
}
