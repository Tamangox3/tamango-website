import { gsap } from 'gsap';
import { Howl } from 'howler';
import lottie from 'lottie-web';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ScrollToPlugin from 'gsap/ScrollToPlugin';
import type { AnimationEventName, AnimationItem } from 'lottie-web';

gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(ScrollToPlugin);

ScrollTrigger.config({ ignoreMobileResize: false });
if (ScrollTrigger.isTouch === 1) {
	ScrollTrigger.normalizeScroll(true);
}

interface ExtendedAnimationItem extends AnimationItem {
	frameAnimation?: gsap.core.Timeline;
}

interface DummyLogger {
	log: (...props: any[]) => void;
}

interface LottieScrollTriggerVars {
	containerTarget: string | HTMLElement;
	animationTarget: string | HTMLElement;
	animationData?: any;
	audioBlob?: string;
	renderer?: 'svg' | 'canvas' | 'html';
	durationPx?: number;
	rendererSettings?: Record<string, any>;
	scrollTriggerVars?: Partial<ScrollTrigger.Vars>;
	debug?: boolean;
	logger?: DummyLogger;
	assetsPath?: string;
}

export class LottieScrollTrigger {
	private readonly animation: ExtendedAnimationItem;
	private readonly audioLayer?: Howl;
	private readonly gsapCtx?: gsap.Context;
	private readonly logger?: DummyLogger;
	private readonly containerTarget: HTMLElement;
	private readonly animationTarget: HTMLElement;
	private readonly durationPx: number;

	constructor(vars: LottieScrollTriggerVars) {
		this.logger = vars.logger;
		[this.containerTarget, this.animationTarget] = gsap.utils.toArray([
			vars.containerTarget,
			vars.animationTarget,
		]) as HTMLElement[];

		this.logger?.log(
			'Initializing LottieScrollTrigger',
			this.animationTarget,
			this.containerTarget,
		);

		if (vars.audioBlob) {
			this.audioLayer = new Howl({
				src: [vars.audioBlob],
				format: ['mp3'],
				volume: 1,
				html5: true, // does not work on mobile otherwise
				loop: false,
			});
		}

		this.durationPx = vars.durationPx ?? 2500;

		this.animation = lottie.loadAnimation({
			container: this.animationTarget,
			renderer: vars.renderer ?? 'svg',
			animationData: vars.animationData,
			loop: false,
			autoplay: false,
			rendererSettings: vars.rendererSettings ?? {},
			assetsPath: vars.assetsPath,
		});

		const scrollTrigger = {
			trigger: this.containerTarget,
			start: 'top top',
			end: `+=${this.durationPx}px bottom`,
			pin: true,
			markers: vars.debug,
			scrub: 0.11,
			...vars.scrollTriggerVars,
		} satisfies ScrollTrigger.Vars;

		this.gsapCtx = gsap.context && gsap.context();

		const frameAnimation = gsap.timeline({ scrollTrigger });
		const playhead = { frame: 0 };

		let createTween = () => {
			this.animation.goToAndStop(playhead.frame, true);
			frameAnimation.to(
				playhead,
				{
					frame: this.animation.totalFrames - 1,
					ease: 'none',
					duration: frameAnimation.duration() || 1,
					onUpdate: () => {
						const progress = playhead.frame / this.animation.totalFrames;
						const animationProgress = this.animation.currentFrame / this.animation.totalFrames;
						if (this.isPaused) {
							this.animation.goToAndStop(playhead.frame, true);
						} else if (Math.abs(progress - animationProgress) > 0.01) {
							this.animation.goToAndPlay(playhead.frame, true);
						}
						// if audio and animation are not in sync, this is where you'd update the audio
						if (this.audioLayer) {
							const audioCurrentTime = this.audioLayer.seek();
							const audioShouldBe = this.audioLayer.duration() * progress;
							if (Math.abs(audioCurrentTime - audioShouldBe) > 0.25) {
								this.logger?.log('Audio out of sync, seeking to', audioShouldBe);
								this.audioLayer.seek(audioShouldBe);
							}
						}
					},
				},
				0,
			);
			return () => this.animation.destroy && this.animation.destroy();
		};

		this.gsapCtx && this.gsapCtx.add ? this.gsapCtx.add(createTween) : createTween();

		ScrollTrigger.sort();
		ScrollTrigger.refresh();

		this.animation.frameAnimation = frameAnimation;

		if (vars.debug) {
			this.setupDebug();
		}
	}

	autoscroll(duration: number) {
		gsap.to(window, {
			scrollTo: {
				y: this.durationPx - window.innerHeight,
				autoKill: true, // Stops autoscroll if the user scrolls manually
			},
			ease: 'none', // linear
			duration,
			onComplete: () => {
				this.logger?.log('Autoscroll completed');
				// Scroll one whole page up to avoid the user seeing the end of the animation
				gsap.to(window, {
					scrollTo: {
						y: this.durationPx,
						autoKill: true,
					},
					ease: 'none',
					duration: 1,
				});
			},
		});
	}

	toggleAutoscroll(isEnabled: boolean) {
		if (!this.audioLayer) return;
		if (isEnabled) {
			// We want to scroll to durationPx in the remaining time of the audio + the time to scroll a whole page
			const remaining = this.audioLayer.duration() - this.audioLayer.seek();
			this.logger?.log(`Scroll to ${this.durationPx} in ${remaining} seconds`);
			this.autoscroll(remaining);
		} else gsap.killTweensOf(window); // Stop autoscroll if toggled off
	}

	get isPaused() {
		return this.animation.isPaused;
	}

	get isPlaying() {
		return !this.animation.isPaused;
	}

	play() {
		if (this.animation.isPaused) this.animation.play();
		if (!this.audioLayer?.playing()) this.audioLayer?.play();
		this.toggleAutoscroll(true);
		this.logger?.log('Playing animation');
	}

	pause() {
		if (!this.animation.isPaused) this.animation.pause();
		if (this.audioLayer?.playing()) this.audioLayer?.pause();
		this.toggleAutoscroll(false);
		this.logger?.log('Pausing animation');
	}

	toggle() {
		if (this.animation.isPaused) this.play();
		else this.pause();
	}

	on(eventName: AnimationEventName, callback: () => void) {
		this.animation.addEventListener(eventName, callback);
	}

	private setupDebug() {
		this.setupLottieDebug();
		this.setupAudioDebug();
		this.setupScrollDebug();
	}

	private setupLottieDebug() {
		const lottieProgress = document.createElement('div');
		lottieProgress.style.position = 'fixed';
		lottieProgress.style.bottom = '0';
		lottieProgress.style.left = '0';
		lottieProgress.style.zIndex = '1000';
		lottieProgress.style.padding = '10px';
		lottieProgress.style.backgroundColor = 'rgba(0,0,0,.5)';
		lottieProgress.style.color = 'white';
		this.animation.addEventListener('DOMLoaded', () => {
			lottieProgress.textContent = `Lottie frame: 0 / ${this.animation.totalFrames}`;
		});
		this.animation.addEventListener('enterFrame', () => {
			lottieProgress.textContent = `Lottie frame: ${this.animation.currentFrame.toFixed(0)} / ${this.animation.totalFrames}`;
		});
		document.body.appendChild(lottieProgress);
	}

	private setupAudioDebug() {
		if (!this.audioLayer) return;
		const audioProgress = document.createElement('div');
		audioProgress.style.position = 'fixed';
		audioProgress.style.bottom = '44px';
		audioProgress.style.left = '0';
		audioProgress.style.zIndex = '1000';
		audioProgress.style.padding = '10px';
		audioProgress.style.backgroundColor = 'rgba(0,0,0,.5)';
		audioProgress.style.color = 'white';
		const serializedAudio = (audio: Howl) =>
			`Audio${audio.playing() ? '' : ' not'} playing: ${audio.seek().toFixed(0)}s / ${audio.duration().toFixed(0)}s`;
		[
			'play',
			'end',
			'pause',
			'stop',
			'mute',
			'volume',
			'rate',
			'seek',
			'fade',
			'unlock',
			'load',
			'loaderror',
			'playerror',
		].forEach((evt) => {
			this.audioLayer?.on(evt, () => {
				let updateRef: any = undefined;
				const onAnimationFrame = () => {
					audioProgress.textContent = serializedAudio(this.audioLayer!);
					if (this.audioLayer?.playing()) {
						updateRef = requestAnimationFrame(onAnimationFrame);
					} else {
						if (updateRef) {
							cancelAnimationFrame(updateRef);
						}
					}
				};
				updateRef = requestAnimationFrame(onAnimationFrame);
			});
		});
		document.body.appendChild(audioProgress);
	}

	private setupScrollDebug() {
		const scrollProgress = document.createElement('div');
		scrollProgress.style.position = 'fixed';
		scrollProgress.style.bottom = '88px';
		scrollProgress.style.left = '0';
		scrollProgress.style.zIndex = '1000';
		scrollProgress.style.padding = '10px';
		scrollProgress.style.backgroundColor = 'rgba(0,0,0,.5)';
		scrollProgress.style.color = 'white';
		scrollProgress.textContent = `Scroll: 0 / ${this.durationPx}px`;
		window.addEventListener('scroll', () => {
			scrollProgress.textContent = `Scroll: ${window.scrollY.toFixed(0)} / ${this.durationPx}px`;
		});
		document.body.appendChild(scrollProgress);
	}
}

export async function fetchLottieData(url: string): Promise<unknown> {
	const res = await fetch(url);
	const json = await res.json();
	return json;
}
