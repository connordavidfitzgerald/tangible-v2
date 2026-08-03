/**
 * Wires the custom control bar in `MuxVideo.astro` to the `<mux-player>` it
 * wraps. All state lives in data attributes on the host element, so the CSS
 * decides which icon of each pair is on screen and this file only has to keep
 * those attributes honest.
 */

/** The slice of the media element API the bar drives. */
type MuxPlayerElement = HTMLElement & {
    paused: boolean;
    muted: boolean;
    currentTime: number;
    duration: number;
    play: () => Promise<void> | void;
    pause: () => void;
    webkitEnterFullscreen?: () => void;
};

const SEEK_STEP_SECONDS = 5;

/** How much of the frame, measured up from the bottom, reveals the controls. */
const HOVER_BAND_RATIO = 1;

/** Fraction of the frame that has to be on screen before it plays itself. */
const AUTOPLAY_VISIBILITY = 0.35;

class VideoControls extends HTMLElement {
    private player: MuxPlayerElement | null = null;
    private timeline: HTMLElement | null = null;
    private playButton: HTMLElement | null = null;
    private muteButton: HTMLElement | null = null;
    private fullscreenButton: HTMLElement | null = null;
    /** Torn down on disconnect, so view transitions do not leak listeners. */
    private listeners: AbortController | undefined;
    private observer: IntersectionObserver | undefined;
    private scrubbing = false;
    /** A deliberate pause outranks autoplay: scrolling back will not override it. */
    private pausedByViewer = false;

    connectedCallback() {
        this.player = this.querySelector('mux-player');
        if (!this.player) return;

        this.timeline = this.querySelector('[data-role="timeline"]');
        this.playButton = this.querySelector('[data-role="playpause"]');
        this.muteButton = this.querySelector('[data-role="mute"]');
        this.fullscreenButton = this.querySelector('[data-role="fullscreen"]');

        this.listeners = new AbortController();
        const { signal } = this.listeners;
        const player = this.player;

        this.playButton?.addEventListener(
            'click',
            () => {
                if (player.paused) player.play();
                else player.pause();
                this.pausedByViewer = !player.paused;
            },
            { signal }
        );

        this.muteButton?.addEventListener(
            'click',
            () => {
                player.muted = !player.muted;
            },
            { signal }
        );

        this.fullscreenButton?.addEventListener('click', () => this.toggleFullscreen(), { signal });

        // The player is the source of truth: reflect it rather than assuming a
        // click succeeded, so autoplay blocking and hotkeys stay in sync too.
        for (const event of ['play', 'pause', 'ended']) {
            player.addEventListener(event, () => this.syncPlayState(), { signal });
        }
        player.addEventListener('volumechange', () => this.syncMuteState(), { signal });
        for (const event of ['timeupdate', 'durationchange', 'loadedmetadata', 'seeking']) {
            player.addEventListener(event, () => this.syncProgress(), { signal });
        }
        document.addEventListener('fullscreenchange', () => this.syncFullscreenState(), { signal });

        this.bindHoverReveal(signal);
        this.bindScrubbing(signal);
        this.bindViewportAutoplay();

        this.syncPlayState();
        this.syncMuteState();
        this.syncProgress();
        this.syncFullscreenState();
    }

    disconnectedCallback() {
        this.listeners?.abort();
        this.observer?.disconnect();
    }

    /** The bar only surfaces while the pointer is down near the bottom edge. */
    private bindHoverReveal(signal: AbortSignal) {
        const reveal = (visible: boolean) => {
            this.dataset.controlsVisible = String(visible || this.scrubbing);
        };

        this.addEventListener(
            'pointermove',
            (event: PointerEvent) => {
                const bounds = this.getBoundingClientRect();
                reveal(event.clientY >= bounds.bottom - bounds.height * HOVER_BAND_RATIO);
            },
            { signal }
        );

        this.addEventListener('pointerleave', () => reveal(false), { signal });

        reveal(false);
    }

    /** Play once the frame is properly on screen, pause when it leaves. */
    private bindViewportAutoplay() {
        if (this.dataset.autoplayInView !== 'true') return;

        this.observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        if (!this.pausedByViewer) this.player?.play();
                    } else {
                        this.player?.pause();
                    }
                }
            },
            { threshold: AUTOPLAY_VISIBILITY }
        );

        this.observer.observe(this);
    }

    /** Click or drag anywhere along the timeline to seek. */
    private bindScrubbing(signal: AbortSignal) {
        const timeline = this.timeline;
        if (!timeline) return;

        const seekTo = (clientX: number) => {
            const player = this.player;
            if (!player?.duration || !Number.isFinite(player.duration)) return;

            const bounds = timeline.getBoundingClientRect();
            const ratio = Math.min(Math.max((clientX - bounds.left) / bounds.width, 0), 1);
            player.currentTime = ratio * player.duration;
            this.syncProgress();
        };

        timeline.addEventListener(
            'pointerdown',
            (event: PointerEvent) => {
                this.scrubbing = true;
                timeline.setPointerCapture(event.pointerId);
                seekTo(event.clientX);
            },
            { signal }
        );

        timeline.addEventListener(
            'pointermove',
            (event: PointerEvent) => {
                if (this.scrubbing) seekTo(event.clientX);
            },
            { signal }
        );

        for (const event of ['pointerup', 'pointercancel']) {
            timeline.addEventListener(
                event,
                () => {
                    this.scrubbing = false;
                },
                { signal }
            );
        }

        timeline.addEventListener(
            'keydown',
            (event: KeyboardEvent) => {
                const player = this.player;
                if (!player) return;

                const step =
                    event.key === 'ArrowRight'
                        ? SEEK_STEP_SECONDS
                        : event.key === 'ArrowLeft'
                          ? -SEEK_STEP_SECONDS
                          : 0;
                if (!step) return;

                event.preventDefault();
                player.currentTime = Math.min(
                    Math.max(player.currentTime + step, 0),
                    player.duration || 0
                );
                this.syncProgress();
            },
            { signal }
        );
    }

    private async toggleFullscreen() {
        if (document.fullscreenElement) {
            await document.exitFullscreen();
            return;
        }

        // Fullscreen the host, not the player, so the control bar comes along.
        if (this.requestFullscreen) {
            await this.requestFullscreen().catch(() => {
                // Denied (or gesture-less) — leave the player windowed.
            });
            return;
        }

        // iOS Safari has no element fullscreen; the video handles it natively,
        // with its own controls, which is the best available there.
        this.player?.webkitEnterFullscreen?.();
    }

    private syncPlayState() {
        const paused = this.player?.paused ?? true;
        this.dataset.paused = String(paused);
        this.playButton?.setAttribute('aria-label', paused ? 'Play' : 'Pause');
    }

    private syncMuteState() {
        const muted = this.player?.muted ?? false;
        this.dataset.muted = String(muted);
        this.muteButton?.setAttribute('aria-label', muted ? 'Unmute' : 'Mute');
    }

    private syncFullscreenState() {
        const isFullscreen = document.fullscreenElement === this;
        this.dataset.fullscreen = String(isFullscreen);
        this.fullscreenButton?.setAttribute(
            'aria-label',
            isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'
        );
    }

    private syncProgress() {
        const player = this.player;
        if (!this.timeline || !player) return;

        const duration = player.duration;
        const ratio =
            duration && Number.isFinite(duration) ? Math.min(player.currentTime / duration, 1) : 0;

        this.timeline.style.setProperty('--progress', `${ratio * 100}%`);
        this.timeline.setAttribute('aria-valuenow', String(Math.round(ratio * 100)));
    }
}

if (!customElements.get('video-controls')) {
    customElements.define('video-controls', VideoControls);
}

export { VideoControls };
