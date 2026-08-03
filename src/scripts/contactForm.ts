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
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(SplitText);

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
                const buttonRow = form.querySelector<HTMLElement>('.form-buttons');
                const stepped = panels.length > 0;

                const setStep = (step: number) => {
                    if (!stepped) return;
                    (form as HTMLFormElement).dataset.step = String(step);

                    // One button on step one, so it sits right; two on step two,
                    // so they take an edge each and the submit does not move.
                    buttonRow?.classList.toggle('justify-end', step === 1);
                    buttonRow?.classList.toggle('justify-between', step === 2);

                    panels.forEach((panel) => {
                        const active = panel.dataset.stepPanel === String(step);
                        panel.classList.toggle('hidden', !active);
                        panel.classList.toggle('flex', active);
                        panel
                            .querySelectorAll<HTMLInputElement>('[data-required]')
                            .forEach((control) => {
                                control.required = active;
                            });
                    });

                    nextBtn?.classList.toggle('hidden', step !== 1);
                    prevBtn?.classList.toggle('hidden', step !== 2);
                    btn.classList.toggle('hidden', step !== 2);
                };

                setStep(1);

                nextBtn?.addEventListener('click', () => {
                    // Step one has to be valid before it goes out of view.
                    if (!(form as HTMLFormElement).reportValidity()) return;
                    setStep(2);
                });

                prevBtn?.addEventListener('click', () => setStep(1));

                form.addEventListener('submit', async (e) => {
                    e.preventDefault();

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
