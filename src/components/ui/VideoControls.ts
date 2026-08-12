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
    videoWidth: number;
    videoHeight: number;
    play: () => Promise<void> | void;
    pause: () => void;
    /**
     * `<mux-player>` exposes a curated subset of `HTMLVideoElement`, not the
     * whole thing — anything outside it (`webkitEnterFullscreen`, notably) has
     * to be reached on the real `<video>` underneath.
     */
    media?: { nativeEl?: HTMLVideoElement | null } | null;
};

/** iOS' own fullscreen, which lives on the video element rather than the API. */
type NativeVideoElement = HTMLVideoElement & {
    webkitEnterFullscreen?: () => void;
    webkitSupportsFullscreen?: boolean;
};

/** The vendor-prefixed halves of the Fullscreen API, still needed for WebKit. */
type WebkitFullscreenDocument = Document & {
    webkitFullscreenElement?: Element | null;
    webkitFullscreenEnabled?: boolean;
    webkitExitFullscreen?: () => void;
};

type WebkitFullscreenElement = HTMLElement & {
    webkitRequestFullscreen?: () => void;
};

const fullscreenDocument = document as WebkitFullscreenDocument;

/** Whichever spelling of the fullscreen element this browser answers to. */
const fullscreenElement = () =>
    document.fullscreenElement ?? fullscreenDocument.webkitFullscreenElement ?? null;

const SEEK_STEP_SECONDS = 5;

/** How much of the frame, measured up from the bottom, reveals the controls. */
const HOVER_BAND_RATIO = 1;

/** How long a tap keeps the bar up on a touch screen before it puts itself away. */
const TAP_REVEAL_MS = 3500;

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
    /** Pending auto-hide of the bar after a tap. */
    private tapTimer = 0;
    /** Whether the landscape rotation on screen is ours to release. */
    private orientationLocked = false;

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
        for (const event of ['fullscreenchange', 'webkitfullscreenchange']) {
            document.addEventListener(event, () => this.syncFullscreenState(), { signal });
        }

        this.bindHoverReveal(signal);
        this.bindTapReveal(signal);
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
        window.clearTimeout(this.tapTimer);
        // A view transition away mid-fullscreen would otherwise leave the next
        // page pinned to landscape.
        this.unlockOrientation();
    }

    /** Mid-scrub the bar stays up whatever else says otherwise — you are using it. */
    private reveal(visible: boolean) {
        this.dataset.controlsVisible = String(visible || this.scrubbing);
    }

    /** The bar only surfaces while the pointer is down near the bottom edge. */
    private bindHoverReveal(signal: AbortSignal) {
        this.addEventListener(
            'pointermove',
            (event: PointerEvent) => {
                // A touch "move" is a drag, not a hover. Letting it through would
                // flash the bar on every swipe that started over the video, and
                // then strand it there — touch fires no `pointerleave` to
                // put it away again. On touch the tap handler owns the bar.
                if (event.pointerType === 'touch') return;

                const bounds = this.getBoundingClientRect();
                this.reveal(event.clientY >= bounds.bottom - bounds.height * HOVER_BAND_RATIO);
            },
            { signal }
        );

        this.addEventListener(
            'pointerleave',
            (event: PointerEvent) => {
                if (event.pointerType === 'touch') return;
                this.reveal(false);
            },
            { signal }
        );

        this.reveal(false);
    }

    /**
     * A touch screen has no pointer to hover the bottom edge with, so the frame
     * is tapped instead: first tap brings the bar up, a second puts it away, and
     * it leaves on its own after `TAP_REVEAL_MS` if neither happens.
     *
     * `pointerup` rather than `click` because the timeline calls
     * `setPointerCapture` while scrubbing, which retargets the click to it — a
     * scrub that ended over the video would otherwise read as a tap on the frame
     * and dismiss the bar the moment you let go of the playhead.
     */
    private bindTapReveal(signal: AbortSignal) {
        this.addEventListener(
            'pointerup',
            (event: PointerEvent) => {
                if (event.pointerType !== 'touch') return;

                // A tap that landed on a control belongs to that control; it only
                // restarts the countdown, so the bar cannot go out from under a
                // finger that is still working it.
                if ((event.target as Element | null)?.closest?.('.c-video-controls')) {
                    this.holdRevealed();
                    return;
                }

                if (this.dataset.controlsVisible === 'true') {
                    window.clearTimeout(this.tapTimer);
                    this.reveal(false);
                } else {
                    this.holdRevealed();
                }
            },
            { signal }
        );
    }

    /** Show the bar and restart its countdown. */
    private holdRevealed() {
        this.reveal(true);
        window.clearTimeout(this.tapTimer);
        this.tapTimer = window.setTimeout(() => this.reveal(false), TAP_REVEAL_MS);
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
        if (fullscreenElement()) {
            if (document.exitFullscreen) await document.exitFullscreen().catch(() => {});
            else fullscreenDocument.webkitExitFullscreen?.();
            return;
        }

        const host = this as WebkitFullscreenElement;

        // `fullscreenEnabled` is the honest answer to "can any element go
        // fullscreen here": iPhone Safari reports false, and it is the reason
        // the native path below exists at all.
        const canFullscreenElement =
            (document.fullscreenEnabled || fullscreenDocument.webkitFullscreenEnabled) &&
            Boolean(host.requestFullscreen || host.webkitRequestFullscreen);

        if (canFullscreenElement) {
            try {
                // Fullscreen the host, not the player, so the bar comes along.
                if (host.requestFullscreen) await host.requestFullscreen();
                else host.webkitRequestFullscreen?.();
                return;
            } catch {
                // Denied — fall through and let the video try on its own.
            }
        }

        this.enterNativeFullscreen();
    }

    /**
     * iPhone Safari has no element fullscreen, but the video element itself
     * still has iOS' own — which rotates to the film's aspect and brings up the
     * system controls, the best available there. It lives on the real `<video>`
     * rather than on `<mux-player>`, whose public API does not carry it.
     */
    private enterNativeFullscreen() {
        const video = this.player?.media?.nativeEl as NativeVideoElement | null | undefined;
        if (!video?.webkitEnterFullscreen) return;

        // iOS refuses until it knows the film's dimensions. `loading="viewport"`
        // means a tap can land before that, so wait it out rather than no-op.
        if (video.webkitSupportsFullscreen === false) {
            video.addEventListener('loadedmetadata', () => video.webkitEnterFullscreen?.(), {
                once: true,
                signal: this.listeners?.signal
            });
            return;
        }

        video.webkitEnterFullscreen();
    }

    /**
     * A phone's screen is portrait and a film is not, so element fullscreen
     * alone leaves a 16:9 frame letterboxed into a 9:16 hole. Asking for
     * landscape turns the screen to the film instead. Only Android honours it;
     * everywhere else it throws and the CSS letterboxing stands as written.
     */
    private lockLandscape() {
        const orientation = screen.orientation as ScreenOrientation & {
            lock?: (orientation: string) => Promise<void>;
        };
        const player = this.player;
        if (!orientation?.lock || !player) return;

        // Portrait films exist; do not turn the screen away from one.
        if (!player.videoWidth || player.videoWidth <= player.videoHeight) return;

        orientation.lock('landscape').then(
            () => {
                this.orientationLocked = true;
            },
            () => {
                // Desktop, iOS, or a browser that will not rotate on request.
            }
        );
    }

    /** Release only a rotation we asked for ourselves. */
    private unlockOrientation() {
        if (!this.orientationLocked) return;
        this.orientationLocked = false;
        screen.orientation?.unlock?.();
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
        const isFullscreen = fullscreenElement() === this;
        this.dataset.fullscreen = String(isFullscreen);
        this.fullscreenButton?.setAttribute(
            'aria-label',
            isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'
        );

        // Rotating is only allowed once fullscreen is actually on, so it waits
        // for the event rather than for `requestFullscreen` to return — the
        // prefixed spelling returns nothing to wait on in the first place.
        if (isFullscreen) this.lockLandscape();
        else this.unlockOrientation();
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
