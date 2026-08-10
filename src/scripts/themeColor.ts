/* The white above the hero and below the footer on an iPhone is two different
   surfaces, and neither one is reachable by sizing a section:

     1. Safari's own chrome — the band behind the notch, and the strip around the
        bottom URL bar. That is browser paint, not page paint. `viewport-fit=
        cover` lets content run under the *safe areas*, but nothing runs under
        the chrome; `svh`/`dvh`/`lvh` and `-webkit-fill-available` only ever
        change how tall a box is inside the content area. The one lever is
        `<meta name="theme-color">`.
     2. The rubber-band gutters above the top and below the bottom of the
        document. Those are the *canvas*, painted from `html`'s background —
        see `--page-edge` in global.css.

   Both want the same answer, so this sets both from one place. Safari paints its
   two bands the same colour as each other, so there is only ever one answer per
   frame: whatever tagged section sits under the *top* edge of the viewport. The
   notch is the more visible of the two, and the footer's mobile panel is
   `h-dvh`, so by the time you are standing in the footer it is under the top
   edge as well — one rule covers both halves of this.

   Sections opt in with `data-theme-color`. Anything untagged falls through to
   DEFAULT_COLOR, which is `main`'s own `bg-offwhite`. */

/** `--color-offwhite`, the background `main` carries between the tagged bands. */
const DEFAULT_COLOR = '#ededed';

let meta: HTMLMetaElement | null = null;
let current = '';
let frame = 0;

function colorAtTopEdge(): string {
    const tagged = document.querySelectorAll<HTMLElement>('[data-theme-color]');

    // Backwards, so the last section in document order wins where two tagged
    // boxes overlap the edge — the one scrolling *in* is the one you can see.
    for (let i = tagged.length - 1; i >= 0; i--) {
        const el = tagged[i];
        const { top, bottom, height } = el.getBoundingClientRect();

        // The desktop/mobile variants of a section are both in the DOM and both
        // tagged; the hidden one measures zero and must not answer for an edge
        // it is not actually painting.
        if (height > 0 && top <= 0 && bottom > 0) {
            return el.dataset.themeColor || DEFAULT_COLOR;
        }
    }

    return DEFAULT_COLOR;
}

function apply() {
    frame = 0;

    const color = colorAtTopEdge();
    if (color === current) return;
    current = color;

    // Safari's chrome. Writing the same value back re-triggers its crossfade
    // between bar colours, which is why this is gated on an actual change.
    if (meta) meta.content = color;

    // The overscroll gutters, via `html`'s background.
    document.documentElement.style.setProperty('--page-edge', color);
}

function schedule() {
    if (frame) return;
    frame = requestAnimationFrame(apply);
}

/** Re-resolve the tag: view transitions swap `<head>`, so the old node is gone. */
function bind() {
    meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    // The incoming page ships its own colour, and `current` is still the outgoing
    // page's — clear it so the first read after a navigation is never skipped.
    current = '';
    apply();
}

window.addEventListener('scroll', schedule, { passive: true });
window.addEventListener('resize', schedule, { passive: true });
document.addEventListener('astro:page-load', bind);

bind();
