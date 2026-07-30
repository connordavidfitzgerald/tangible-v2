import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register the animation custom elements once. Their definitions persist across
// Astro view transitions, so new instances on other pages upgrade automatically.
import { CirclesAnimation } from '@components/animation/CirclesAnimation';
import { HandsAnimation } from '@components/animation/HandsAnimation';

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;

const raf = (time: number) => {
    lenis?.raf(time * 1000);
};

function startLenis() {
    if (lenis) return;

    lenis = new Lenis({
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true
    });

    // Drive ScrollTrigger + Lenis from GSAP's ticker (single rAF loop).
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
}

function stopLenis() {
    gsap.ticker.remove(raf);
    lenis?.destroy();
    lenis = null;
}

/** Re-init the ripple/circle animations once the incoming page has settled. */
function reinitPageAnimations() {
    ScrollTrigger.refresh();
    document
        .querySelectorAll<CirclesAnimation>('circles-animation')
        .forEach((el) => el.initCircles());
    document.querySelectorAll<HandsAnimation>('hands-animation').forEach((el) => el.initAnimation());
}

// ── Astro View Transitions lifecycle ────────────────────────────────────────

// Runs on initial load and after every client-side navigation.
document.addEventListener('astro:page-load', () => {
    startLenis();
    lenis?.scrollTo(0, { immediate: true });
    // Let layout + fonts settle before recalculating scroll positions.
    requestAnimationFrame(() => requestAnimationFrame(reinitPageAnimations));
});

// Tear down before the DOM is swapped so nothing leaks across pages.
document.addEventListener('astro:before-swap', () => {
    ScrollTrigger.getAll().forEach((t) => t.kill());
    stopLenis();
});
