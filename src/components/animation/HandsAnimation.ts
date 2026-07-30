import { gsap } from 'gsap';

/**
 * Animates the hands graphic on the About page.
 *
 * The SVG (HandsNew.svg) is structured into 5 groups:
 *   .hands            – the four hand shapes (static)
 *   .center-circles   – the overlapping circles + lens (static)
 *   .ripple-ring--inner / --middle / --outer – three concentric arc rings
 *
 * Only the three rings animate: they pulse in a staggered wave from the centre
 * outward, reading as a ripple emanating from between the hands.
 */
class HandsAnimation extends HTMLElement {
    private ctx: gsap.Context | undefined;

    connectedCallback() {
        // Defer a couple of frames so layout has resolved before GSAP reads geometry.
        requestAnimationFrame(() => {
            requestAnimationFrame(() => this.initAnimation());
        });
    }

    initAnimation() {
        this.ctx?.revert();

        const svg = this.querySelector('svg');
        if (!svg) return;

        const rings = ['--inner', '--middle', '--outer']
            .map((suffix) => svg.querySelector<SVGGElement>(`.ripple-ring${suffix}`))
            .filter((el): el is SVGGElement => el !== null);

        if (!rings.length) return;

        this.ctx = gsap.context(() => {
            // Geometric centre of the 0 0 671 423 viewBox.
            const ORIGIN = '335.5 211.5';

            rings.forEach((ring, i) => {
                gsap.set(ring, { svgOrigin: ORIGIN });
                gsap.fromTo(
                    ring,
                    { scale: 0.97, opacity: 0.55 },
                    {
                        scale: 1.07,
                        opacity: 1,
                        duration: 2,
                        ease: 'sine.inOut',
                        repeat: -1,
                        yoyo: true,
                        delay: i * 0.2
                    }
                );
            });
        }, this);
    }

    disconnectedCallback() {
        this.ctx?.revert();
    }
}

if (!customElements.get('hands-animation')) {
    customElements.define('hands-animation', HandsAnimation);
}

export { HandsAnimation };
