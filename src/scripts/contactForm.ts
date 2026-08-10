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

class ContactForm extends HTMLElement {
    private ctx: gsap.Context | undefined;

    connectedCallback() {
        const submitText = this.dataset.btnSubmit || 'Soumettre';
        const successText = this.dataset.btnSuccess || 'Succès';

        this.ctx = gsap.context(() => {
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
                   A form shown all at once is a tall column of near-identical
                   rows, and arriving together it lands as a wall. One trigger on
                   the form walks them in instead, so the eye is led down it.

                   Opt-in via `data-stagger`, because the same form is drawn in
                   the contact footer, where it is paged in two steps and already
                   has motion of its own — staggering the panels there would fight
                   the slide rather than add to it.

                   The rows are the form's own children: each label-and-input
                   pair, each radio group, the consent line, the button. Nothing
                   to mark up, and the hidden `access_key` is the one thing that
                   has to be kept out — it has no box, so it would spend a beat of
                   the stagger on nothing.

                   `y` in pixels, not `yPercent`: the rows are wildly different
                   heights — a text field against a three-option radio group — and
                   a percentage would make each one travel a different distance,
                   which reads as several animations rather than one. The lift and
                   fade are otherwise `FadeUp`'s, the site's vocabulary for body
                   copy. */
                if (form.hasAttribute('data-stagger')) {
                    const rows = form.querySelectorAll<HTMLElement>(
                        ':scope > *:not(input[type="hidden"])'
                    );

                    if (rows.length) {
                        gsap.set(rows, { willChange: 'transform, opacity' });

                        gsap.from(rows, {
                            y: 20,
                            opacity: 0,
                            duration: 0.9,
                            stagger: 0.08,
                            ease: 'power3.out',
                            force3D: true,
                            onComplete: () =>
                                gsap.set(rows, {
                                    clearProps: 'transform,opacity,willChange'
                                }),
                            scrollTrigger: {
                                // The form, not each row: one arrival for the
                                // whole thing, so the stagger stays a stagger
                                // instead of becoming ten separate reveals that
                                // re-time themselves to how fast you scroll.
                                trigger: form,
                                start: 'top 80%',
                                once: true
                            }
                        });
                    }
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
