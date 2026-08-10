/**
 * The `<contact-form>` custom element — every form on the site runs through it.
 *
 * There are two shapes. The contact footer pages its fields in two steps; the
 * contact page and the Centre I AM booking form show everything at once. The
 * difference is entirely in the markup: stepping is wired only when the form
 * actually carries `[data-step-panel]` elements, so a single-step form is left
 * alone rather than having its submit button hidden by a `setStep(1)` that has
 * no step two to reveal it from.
 *
 * Wrap any form in `<contact-form data-btn-submit="…" data-btn-success="…">`,
 * give the form itself `.contact-form-inner` and its submit button
 * `.submit-btn`, and import this module once from the same component.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

const ENDPOINT = 'https://api.web3forms.com/submit';

/** Lifts each character of a field's value off the page as it is sent. */
function dissolveInputs(form: Element) {
    const inputs = form.querySelectorAll<HTMLInputElement>(
        'input[type="text"], input[type="email"], input[type="tel"]'
    );

    inputs.forEach((input) => {
        const overlay = document.createElement('div');
        overlay.textContent = input.value;
        overlay.style.cssText = `
            position: absolute;
            top: ${input.offsetTop}px;
            left: ${input.offsetLeft}px;
            width: ${input.offsetWidth}px;
            font-size: ${getComputedStyle(input).fontSize};
            font-family: ${getComputedStyle(input).fontFamily};
            color: ${getComputedStyle(input).color};
            pointer-events: none;
            overflow: hidden;
        `;
        if (input.parentElement) {
            input.parentElement.style.position = 'relative';
            input.parentElement.appendChild(overlay);
        }
        input.style.opacity = '0';

        const split = new SplitText(overlay, { type: 'chars' });
        gsap.to(split.chars, {
            y: 10,
            opacity: 0,
            duration: 0.3,
            stagger: 0.01,
            ease: 'power2.out',
            onComplete: () => overlay.remove()
        });
    });

    return inputs;
}

/** How far apart consecutive rows of the form start, in seconds. */
const ROW_STEP = 0.08;

/**
 * The staggered arrival on a form marked `data-stagger`.
 *
 * A form shown all at once is a tall column of near-identical rows, and arriving
 * together it lands as a wall. One trigger on the form walks them down it
 * instead — the trigger is on the form and not on each row, so the stagger stays
 * a stagger rather than becoming ten separate reveals that re-time themselves to
 * how fast you scroll.
 *
 * Each row arrives as its two parts, a beat apart:
 *
 *   - the label rises into place from under a mask, the site's own reveal (see
 *     `SplitReveal`), split per line so a label that wraps on a phone comes in as
 *     two rather than as one tall block;
 *   - the rule under the field draws itself left to right.
 *
 * The rule is the row's `::after`, not the input's `border-bottom`, precisely so
 * it can be drawn: a border has no length to animate, and scaling the input to
 * fake one would squash the text typed into it. The row publishes `--line-scale`
 * and the stylesheet points the pseudo-element's `scaleX` at it, which keeps the
 * line's colour and thickness in CSS where the rest of the field's styling is.
 * It defaults to 1, so a row that is never animated — reduced motion, a failed
 * script — is a fully drawn line rather than a missing one.
 *
 * Rows with no label of their own (the consent line, the submit button) have
 * nothing to mask or to draw, so they keep the plain lift-and-fade.
 *
 * The rows are the form's own children; the hidden `access_key` is the one thing
 * kept out, because it has no box and would spend a beat of the stagger on
 * nothing.
 */
function buildFormReveal(form: HTMLElement) {
    const rows = form.querySelectorAll<HTMLElement>(':scope > *:not(input[type="hidden"])');
    if (!rows.length) return;

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: form,
            start: 'top 80%',
            once: true
        }
    });

    rows.forEach((row, i) => {
        const at = i * ROW_STEP;
        const label = row.querySelector<HTMLElement>('[data-field-label]');

        if (label) {
            const split = new SplitText(label, { type: 'lines', mask: 'lines' });

            tl.from(
                split.lines,
                {
                    yPercent: 110,
                    duration: 0.8,
                    ease: 'power3.out',
                    stagger: 0.06,
                    // Put the label back to plain text once it is up. Without
                    // `autoSplit` the line breaks it was cut at are frozen, and a
                    // rotated phone would keep them.
                    onComplete: () => split.revert()
                },
                at
            );
        }

        if (row.hasAttribute('data-field')) {
            tl.fromTo(
                row,
                { '--line-scale': 0 },
                {
                    '--line-scale': 1,
                    duration: 0.9,
                    ease: 'power2.out',
                    // Back to the stylesheet's default of a whole line, rather
                    // than an inline 1 that outlives the animation.
                    onComplete: () => row.style.removeProperty('--line-scale')
                },
                at + 0.1
            );
        }

        /* Whatever the label does not cover: the options under a radio group's
           label, or — for a row with no label at all — the row itself. `y` in
           pixels rather than `yPercent`, because these are wildly different
           heights and a percentage would give each a different distance to
           travel, which reads as several animations instead of one. */
        const fade = row.querySelector<HTMLElement>('[data-field-body]') ?? (label ? null : row);

        if (fade) {
            tl.from(
                fade,
                {
                    y: 20,
                    opacity: 0,
                    duration: 0.9,
                    ease: 'power3.out',
                    force3D: true,
                    onComplete: () => gsap.set(fade, { clearProps: 'transform,opacity' })
                },
                at + 0.15
            );
        }
    });
}

class ContactForm extends HTMLElement {
    private ctx: gsap.Context | undefined;

    connectedCallback() {
        const submitText = this.dataset.btnSubmit || 'Soumettre';
        const successText = this.dataset.btnSuccess || 'Succès';

        this.ctx = gsap.context((self) => {
            this.querySelectorAll('form.contact-form-inner').forEach((form) => {
                const btn = form.querySelector('.submit-btn');
                if (!btn) return;

                const labelDefault = btn.querySelector('.c-button_label_default');
                const labelHover = btn.querySelector('.c-button_label_hover');
                if (!labelDefault) return;

                /* ---- Optional two-step paging ---------------------------
                   `required` is moved onto the visible step only. A hidden
                   required control still blocks submission, and the browser
                   cannot focus it to say why, so leaving step two's radios
                   required would deadlock step one — the form would refuse to
                   submit with no visible reason. The values still post either
                   way: hidden fields are submitted, only disabled ones are not. */
                const panels = form.querySelectorAll<HTMLElement>('[data-step-panel]');
                const nextBtn = form.querySelector<HTMLElement>('.form-next');
                const prevBtn = form.querySelector<HTMLElement>('.form-prev');
                const stepped = panels.length > 0;

                /* The steps are stacked in one grid cell (see
                   ContactFooterForm.astro), so they can be paged sideways: the
                   one leaving slides out the way the reading goes and the one
                   arriving comes in from the other side, both across the same
                   box. Each step carries its own buttons, so those travel with
                   the fields rather than needing a place of their own.

                   `xPercent` rather than pixels — it resolves against the panel's
                   own width, which is the column's, so the slide is exactly one
                   panel wide at every viewport with nothing to keep in step. */
                const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                const STEP_SLIDE = 0.5;

                const setStep = (step: number, animate = true) => {
                    if (!stepped) return;

                    const formEl = form as HTMLFormElement;
                    const from = Number(formEl.dataset.step) || 1;
                    formEl.dataset.step = String(step);

                    // Forward leaves to the left, back leaves to the right, so the
                    // motion always agrees with the direction being travelled.
                    const forward = step >= from;
                    const sliding = animate && !reduced && step !== from;

                    panels.forEach((panel) => {
                        const active = panel.dataset.stepPanel === String(step);

                        /* A hidden required control still blocks submission and
                           the browser cannot focus it to say why, so `required`
                           only ever sits on the step being shown. The values post
                           either way: hidden fields are submitted, only disabled
                           ones are not. */
                        panel
                            .querySelectorAll<HTMLInputElement>('[data-required]')
                            .forEach((control) => {
                                control.required = active;
                            });

                        if (!sliding) {
                            gsap.set(panel, { xPercent: 0, autoAlpha: active ? 1 : 0 });
                            return;
                        }

                        if (active) {
                            gsap.fromTo(
                                panel,
                                { xPercent: forward ? 100 : -100, autoAlpha: 1 },
                                { xPercent: 0, duration: STEP_SLIDE, ease: 'power3.inOut' }
                            );
                        } else {
                            gsap.to(panel, {
                                xPercent: forward ? -100 : 100,
                                duration: STEP_SLIDE,
                                ease: 'power3.inOut',
                                // Held visible for the whole slide so it reads as
                                // leaving rather than dissolving, then taken out of
                                // the tab order once it is off the box.
                                onComplete: () => gsap.set(panel, { autoAlpha: 0 })
                            });
                        }
                    });
                };

                setStep(1, false);

                /** Step one has to be valid before it goes out of view. */
                const advance = () => {
                    if (!(form as HTMLFormElement).reportValidity()) return;
                    setStep(2);
                };

                nextBtn?.addEventListener('click', advance);
                prevBtn?.addEventListener('click', () => setStep(1));

                /* ---- Optional staggered entry ---------------------------
                   Opt-in via `data-stagger`, because the same form is drawn in
                   the contact footer, where it is paged in two steps and already
                   has motion of its own — staggering the panels there would fight
                   the slide rather than add to it. See `buildFormReveal`.

                   Deferred to the frame after the fonts land, for two reasons.

                   The fonts are SplitText's: it measures where the lines break,
                   and a label measured in the fallback face keeps those breaks
                   once the real one loads.

                   The frame is the router's. `connectedCallback` runs *during*
                   the view-transition swap, while `window.scrollY` is still the
                   outgoing page's — Astro resets it immediately after, and
                   `motion.ts` sends Lenis back to the top on `astro:page-load`.
                   A `once: true` ScrollTrigger built in that window is measured
                   against the wrong scroll offset: arriving here from anywhere
                   below ~1000px on the previous page, the form counted as long
                   passed, fired instantly, and was over before the new page was
                   drawn. That is why this animated on a refresh and only
                   sometimes on a click — it depended on how far down the page you
                   had been standing when you left it. One frame is all it takes;
                   by then the swap is done and the scroll is back at zero. */
                if (form.hasAttribute('data-stagger')) {
                    document.fonts.ready.then(() => {
                        requestAnimationFrame(() => {
                            // Gone again already — a fast second navigation.
                            if (!this.isConnected) return;

                            // Registered with the context so `disconnectedCallback`
                            // still takes the whole thing back down.
                            self.add(() => buildFormReveal(form as HTMLElement));
                        });
                    });
                }

                form.addEventListener('submit', async (e) => {
                    e.preventDefault();

                    /* Enter in a text field is an implicit submission, and it
                       fires here whatever step is showing — the form's default
                       button is step two's `submit`, and being off-box does not
                       stop the browser electing it. On step one that keystroke
                       means "next", so it is answered as the button would answer
                       it rather than posting four fields and none of the
                       qualification. */
                    if (stepped && (form as HTMLFormElement).dataset.step === '1') {
                        advance();
                        return;
                    }

                    const inputs = dissolveInputs(form);

                    const btnSplit = new SplitText(labelDefault, { type: 'chars' });
                    await gsap.to(btnSplit.chars, {
                        y: 10,
                        opacity: 0,
                        duration: 0.3,
                        stagger: 0.01,
                        ease: 'power2.out'
                    });

                    const data = new FormData(form as HTMLFormElement);
                    const response = await fetch(ENDPOINT, { method: 'POST', body: data });
                    if (!response.ok) return;

                    (form as HTMLFormElement).reset();
                    inputs.forEach((input) => (input.style.opacity = ''));

                    btnSplit.revert();
                    labelDefault.textContent = successText;
                    if (labelHover) labelHover.textContent = successText;

                    const successSplit = new SplitText(labelDefault, { type: 'chars' });
                    gsap.from(successSplit.chars, {
                        y: 10,
                        opacity: 0,
                        duration: 0.3,
                        stagger: 0.03,
                        ease: 'power2.out'
                    });

                    setTimeout(async () => {
                        await gsap.to(successSplit.chars, {
                            y: 10,
                            opacity: 0,
                            duration: 0.4,
                            stagger: 0.02,
                            ease: 'power2.out'
                        });

                        successSplit.revert();
                        labelDefault.textContent = submitText;
                        if (labelHover) labelHover.textContent = submitText;

                        const revertSplit = new SplitText(labelDefault, { type: 'chars' });
                        gsap.from(revertSplit.chars, {
                            y: 10,
                            opacity: 0,
                            duration: 0.5,
                            stagger: 0.03,
                            ease: 'power2.out',
                            onComplete: () => revertSplit.revert()
                        });

                        // Back to the identity fields, ready for the next visitor
                        // rather than stranded on step two.
                        setStep(1);
                    }, 2000);
                });
            });
        }, this);
    }

    disconnectedCallback() {
        this.ctx?.revert();
    }
}

if (!customElements.get('contact-form')) {
    customElements.define('contact-form', ContactForm);
}
