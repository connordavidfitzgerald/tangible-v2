/* The reveal every photograph on the site enters with: a small rectangle at the
   centre of the frame that opens out to the image's own edges.

   It is driven from one place rather than from a wrapper component because the
   thing being animated has to be the `<img>` itself. `SanityPicture` renders its
   `<picture>` as `display: contents`, so at every call site the `<img>` *is* the
   grid or flex item its classes were written for; a wrapper element added around
   it for the animation's sake would take that place back and change the layout.
   `clip-path` needs no box of its own, so tagging the image with `data-reveal`
   costs the page nothing structurally.

   Not the heroes, and not the SVG line art: a hero is the first thing painted
   and is already covered by the preloader's wipe, and the drawings animate
   themselves (see CirclesAnimation / HandsAnimation). */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/** Inset per side at the start — equal on all four, so the opening rectangle is
    the same shape as the image rather than a slot cut across it. 38% leaves a
    centred window a quarter of the frame wide. */
const START = 'inset(38% 38% 38% 38%)';
const END = 'inset(0% 0% 0% 0%)';

const DURATION = 0.8;
const EASE = 'power3.out';

/** Marks an image whose reveal has been built, so a second `astro:page-load`
    over the same DOM cannot stack two tweens on it. */
const BUILT = 'revealBuilt';

function build(img: HTMLElement) {
    if (BUILT in img.dataset) return;
    img.dataset[BUILT] = '';

    gsap.set(img, { willChange: 'clip-path' });

    gsap.fromTo(
        img,
        { clipPath: START },
        {
            clipPath: END,
            duration: DURATION,
            ease: EASE,
            onComplete: () => {
                // Hand the element back to the stylesheet: a lingering
                // `clip-path` clips nothing at `inset(0)`, but it does keep the
                // image on its own compositing layer for the rest of the page.
                gsap.set(img, { clearProps: 'clipPath,willChange' });
            },
            scrollTrigger: {
                trigger: img,
                // Late enough that the image is comfortably on screen before it
                // starts, early enough that it is finished by the time it is
                // being read.
                start: 'top 85%',
                once: true
            }
        }
    );
}

function init() {
    // The reveal is the whole effect here — with it off there is nothing to
    // degrade to, so the images simply arrive.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    document.querySelectorAll<HTMLElement>('[data-reveal]').forEach(build);
}

document.addEventListener('astro:page-load', init);

init();
