import { AudioManager } from './audio';
import { createMiamiLogger } from './logger';
import {
	loadRiveAsset,
	miamiAssetLoader,
	RIVE_ASSETS,
	type SparvieroAssetsMap,
} from './rive-assets';
import RiveWebGL, {
	type RiveCanvas as RiveCanvasType,
	type LinearAnimationInstance,
	type StateMachineInstance,
	type WrappedRenderer,
	type Artboard,
} from '@rive-app/webgl2-advanced';
import { gsap } from 'gsap';
import { Observer } from 'gsap/Observer';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger, Observer);

const isDev = import.meta.env.MODE === 'development';
const ASSETS_BASE_PATH = '/miami/miami_v10/assets/resized';
const FINAL_BUTTONS_THRESHOLD = 3 * 60 + 25; // 3 minutes and 30 seconds

export default class SparvieroAnimation {
	private logger = createMiamiLogger(SparvieroAnimation.name);
	private assets: SparvieroAssetsMap = new Map<string, (() => Promise<Uint8Array>) | Uint8Array>();
	private audioManager = new AudioManager();
	private lastDrawTime = 0;
	private riveCanvas: RiveCanvasType | null = null;
	private renderer: WrappedRenderer | null = null;
	private artboard: Artboard | null = null;
	private stateMachine: StateMachineInstance | null = null;
	private activeAnimation: LinearAnimationInstance | null = null;
	private isPlaying = false;
	private triggered = false;
	private speed = 1;
	private gsapSpeed = 1;
	private gsapVolume = 1;
	private renderProgress = true;
	private ready = false;
	private speedTween: gsap.core.Tween | null = null;
	private wheelTimeout: ReturnType<typeof setTimeout> | null = null;
	private canvas: HTMLCanvasElement;
	private creditsContainer: HTMLElement;
	private finalButtonsWrapper: HTMLElement;
	private audioProgressEl: HTMLElement;
	private frameProgressEl: HTMLElement;
	private errorValueEl: HTMLElement;
	private scrollVelocityEl: HTMLElement;
	private volumeEl: HTMLImageElement;
	private pausePlayEl: HTMLImageElement;

	constructor() {
		this.setupBackgroundAssetsLoading();

		const canvas = document.querySelector<HTMLCanvasElement>('canvas');
		const creditsContainer = document.getElementById('miami-credits-container');
		const finalButtonsWrapper = document.getElementById('final-buttons-wrapper');
		const audioProgressEl = document.getElementById('audio-progress');
		const frameProgressEl = document.getElementById('frame-progress');
		const errorValueEl = document.getElementById('error-value');
		const scrollVelocityEl = document.getElementById('scroll-speed');
		const volumeEl = document.getElementById('volume') as HTMLImageElement;
		const closeCreditsBtn = document.getElementById('miami-credits-close');
		const openCreditsBtn = document.getElementById('miami-credits-open');
		const pausePlayEl = document.getElementById('pause-play');

		if (
			!canvas ||
			!creditsContainer ||
			!finalButtonsWrapper ||
			!audioProgressEl ||
			!frameProgressEl ||
			!errorValueEl ||
			!scrollVelocityEl ||
			!volumeEl ||
			!closeCreditsBtn ||
			!openCreditsBtn ||
			!pausePlayEl
		) {
			throw new Error('Missing required elements');
		}

		this.canvas = canvas;
		this.creditsContainer = creditsContainer;
		this.finalButtonsWrapper = finalButtonsWrapper;
		this.audioProgressEl = audioProgressEl;
		this.frameProgressEl = frameProgressEl;
		this.errorValueEl = errorValueEl;
		this.scrollVelocityEl = scrollVelocityEl;
		this.volumeEl = volumeEl;
		this.pausePlayEl = pausePlayEl as HTMLImageElement;

		this.volumeEl.style.transition = 'opacity 0.3s ease-in-out';
		this.pausePlayEl.style.transition = 'opacity 0.3s ease-in-out';

		volumeEl.addEventListener('click', () => this.toggleVolume());
		closeCreditsBtn.addEventListener('click', () => this.closeCredits());
		openCreditsBtn.addEventListener('click', () => this.openCredits());
		pausePlayEl.addEventListener('click', () => {
			if (!this.ready) return;
			this.isPlaying ? this.pause() : this.play();
		});

		window.addEventListener('blur', () => {
			if (this.triggered && this.ready && this.isPlaying) {
				this.pause();
			}
		});

		window.addEventListener('focus', () => {
			if (this.triggered && this.ready && !this.isPlaying) {
				this.play();
			}
		});

		// pause audio + animation on visibility change
		document.addEventListener('visibilitychange', () => {
			if (!this.triggered || !this.ready) return;
			if (document.hidden) {
				this.pause();
			} else {
				if (this.triggered) {
					this.play();
				}
			}
		});

		setTimeout(() => {
			// Set transition duration after initial load
			if (creditsContainer) creditsContainer.style.transitionDuration = '0.4s';
		}, 2000);
	}

	/**
	 * Initialize the animation
	 */
	public async prepare() {
		const { riveAnimation, riveCanvas } = await this.loadAsset();

		this.riveCanvas = riveCanvas;

		const file = await riveCanvas.load(
			new Uint8Array(riveAnimation),
			new riveCanvas.CustomFileAssetLoader({
				loadContents: miamiAssetLoader(this.assets, this.logger),
			}),
		);
		this.renderer = riveCanvas.makeRenderer(this.canvas, true);
		this.artboard = file.defaultArtboard();
		this.stateMachine = new riveCanvas.StateMachineInstance(
			this.artboard.stateMachineByIndex(0),
			this.artboard,
		);
		this.activeAnimation = new riveCanvas.LinearAnimationInstance(
			this.artboard.animationByIndex(0),
			this.artboard,
		);
		//if (isDev) riveCanvas.enableFPSCounter();

		this.setupAudioShiftCheck();

		this.setupGSAP();

		// Needed to resize the canvas
		const computeSize = () => {
			const { width, height } = this.canvas.getBoundingClientRect();
			this.canvas.width = width;
			this.canvas.height = height;
		};
		window.addEventListener('resize', computeSize);

		// Initial size
		computeSize();

		this.riveCanvas.requestAnimationFrame(this.drawLoop);

		this.riveCanvas.AABB;

		this.ready = true;
	}

	/**
	 * Start the animation
	 */
	public async start() {
		if (!this.ready || !this.riveCanvas || !this.stateMachine || !this.activeAnimation) {
			throw new Error('Animation not ready');
		}
		if (this.triggered || this.isPlaying) return;
		this.stateMachine.input(0).asTrigger().fire();
		this.triggered = true;
		this.isPlaying = true;
		this.activeAnimation.time = 0;
		this.audioManager.play(0);
	}

	private drawLoop = (time: number) => {
		if (!this.lastDrawTime) this.lastDrawTime = time;
		if (
			!this.riveCanvas ||
			!this.renderer ||
			!this.artboard ||
			!this.activeAnimation ||
			!this.stateMachine
		)
			return;

		if (this.creditsContainer && !this.creditsContainer.classList.contains('closed')) {
			// Do not render when credits are open
			this.riveCanvas.requestAnimationFrame(this.drawLoop);
			return;
		}

		this.renderer.clear();

		const elapsedSeconds = (time - this.lastDrawTime) / 1000;
		this.lastDrawTime = time;

		if (this.isPlaying || !this.triggered) {
			this.artboard.advance(elapsedSeconds * this.speed);
			this.stateMachine.advance(elapsedSeconds * this.speed);
			this.activeAnimation?.advance(elapsedSeconds * this.speed);
		}

		this.renderer.save();
		this.renderer.align(
			this.riveCanvas.Fit.cover,
			this.riveCanvas.Alignment.center,
			{
				minX: 0,
				minY: 0,
				maxX: this.canvas.width,
				maxY: this.canvas.height,
			},
			this.artboard.bounds,
		);
		this.artboard.draw(this.renderer);
		this.renderer.restore();
		this.renderer.flush();

		this.updateProgressDisplays();
		this.updateFinalButtonsVisibility();

		this.riveCanvas.requestAnimationFrame(this.drawLoop);
	};

	private async loadAsset() {
		const assetsToPreload = RIVE_ASSETS.filter(
			(asset) =>
				asset.startsWith('SEQ1_') || asset.startsWith('SEQ2_') || asset.startsWith('SEQ3_'),
		);
		const [riveAnimation, riveCanvas] = await Promise.all([
			fetch('/miami/miami_v10/r.riv').then((res) => res.arrayBuffer()),
			RiveWebGL({
				locateFile: (_) => `https://unpkg.com/@rive-app/webgl2-advanced@2.25.4/rive.wasm`,
			}),
			this.audioManager.loadAudio('/miami/audio/audio_seq_started.mp3'),
			Promise.allSettled(
				assetsToPreload.map(async (asset) => {
					const filename = asset.split('.')[0];
					if (!this.assets.has(filename)) {
						this.logger.log(`Asset ${filename} not found`);
						return Promise.resolve();
					}
					return (this.assets.get(filename) as () => Promise<Uint8Array>)().then((data) => {
						this.assets.set(filename, data);
					});
				}),
			),
		]);

		return {
			riveAnimation,
			riveCanvas,
		};
	}

	private setupBackgroundAssetsLoading() {
		RIVE_ASSETS.forEach((asset) => {
			const filename = asset.split('.')[0];
			// Store a lazy function that initializes the loading when called
			this.assets.set(filename, () => loadRiveAsset(ASSETS_BASE_PATH, asset));
		});
	}

	private updateProgressDisplays() {
		if (!this.audioManager || !this.activeAnimation) return;
		if (!this.renderProgress) return;

		const audioPosition = this.audioManager.getCurrentTime();
		const animationProgress = this.activeAnimation.time;

		if (this.audioProgressEl) {
			this.audioProgressEl.textContent = audioPosition.toFixed(2);
		}

		// Update animation progress
		if (this.frameProgressEl) {
			this.frameProgressEl.textContent = animationProgress.toFixed(2);
		}

		// Update error value
		if (this.errorValueEl && audioPosition && animationProgress) {
			this.errorValueEl.textContent = (audioPosition - animationProgress).toFixed(2);
		}
	}

	private updateFinalButtonsVisibility() {
		if (!this.activeAnimation || !this.finalButtonsWrapper) return;

		if (
			this.finalButtonsWrapper &&
			this.activeAnimation.time >= FINAL_BUTTONS_THRESHOLD &&
			this.finalButtonsWrapper.style.display !== 'flex'
		) {
			this.finalButtonsWrapper.style.opacity = '0';
			this.finalButtonsWrapper.style.display = 'flex';

			this.volumeEl.style.opacity = '0';
			this.pausePlayEl.style.opacity = '0';

			setTimeout(() => {
				this.finalButtonsWrapper.style.opacity = '1';
				this.volumeEl.style.display = 'none';
				this.pausePlayEl.style.display = 'none';
			}, 100);
		} else if (
			this.finalButtonsWrapper &&
			this.activeAnimation.time < FINAL_BUTTONS_THRESHOLD &&
			this.finalButtonsWrapper.style.display !== 'none'
		) {
			this.volumeEl.style.display = 'block';
			this.pausePlayEl.style.display = 'block';

			this.finalButtonsWrapper.style.opacity = '0';
			setTimeout(() => {
				this.finalButtonsWrapper.style.display = 'none';
				this.volumeEl.style.opacity = '1';
				this.pausePlayEl.style.opacity = '1';
			}, 400);
		}
	}

	private setupAudioShiftCheck() {
		setInterval(() => {
			if (this.isPlaying) {
				this.logger.log('Checking for drifts');
				const animationTime = this.activeAnimation?.time || 0;
				const audioTime = this.audioManager.getCurrentTime();
				const drift = Math.abs(animationTime - audioTime);

				if (drift > 0.2) {
					// Threshold of 200ms drift
					this.logger.log(`Drift detected: ${drift.toFixed(3)}s`);
					// Adjust audio to match animation
					if (this.activeAnimation) {
						this.audioManager.play(this.activeAnimation.time);
					}
				}
			}
		}, 1000);
	}

	private updateSpeed(newSpeed: number) {
		if (!this.isPlaying) return;

		// Clamp the absolute value but preserve sign
		const sign = Math.sign(newSpeed);
		const absSpeed = Math.abs(newSpeed);
		const clampedAbsSpeed = Math.max(0.1, Math.min(absSpeed, 30));
		newSpeed = sign * clampedAbsSpeed;

		this.speed = newSpeed;
		if (this.scrollVelocityEl) {
			this.scrollVelocityEl.textContent = newSpeed.toFixed(2);
		}

		this.audioManager.setPlaybackRate(newSpeed);
	}

	private setupGSAP() {
		gsap.utils.toArray(this.canvas).forEach((element) => {
			let startY: number;
			let isDragging = false;
			const mobileRatio = 1;
			const desktopRatio = 5;

			Observer.create({
				target: element as HTMLElement,
				type: 'touch,wheel,pointer,scroll',
				onPress: (self) => {
					if (this.speedTween) this.speedTween.kill();
					if (this.wheelTimeout) clearTimeout(this.wheelTimeout);

					startY = self.y ?? 0;
					isDragging = true;
				},
				onDrag: (self) => {
					if (!isDragging) return;

					const currentY = self.y ?? 0;
					const deltaY = currentY - startY;
					let newSpeed = deltaY / mobileRatio;
					newSpeed = -newSpeed;
					this.updateSpeed(newSpeed);
					startY = currentY;
				},
				onRelease: () => {
					if (this.isPlaying && isDragging) {
						isDragging = false;
						this.logger.log('Released, current speed:', this.speed);
						this.animateToNormalSpeed();
					}
				},
				onWheel: (self) => {
					if (this.speedTween) this.speedTween.kill();
					if (this.wheelTimeout) clearTimeout(this.wheelTimeout);

					const newSpeed = self.deltaY / desktopRatio;
					this.updateSpeed(newSpeed);

					this.wheelTimeout = setTimeout(() => {
						this.animateToNormalSpeed();
					}, 150);
				},
			});
		});
	}

	private animateToNormalSpeed() {
		this.speedTween = gsap.fromTo(
			this,
			{
				gsapSpeed: this.speed,
			},
			{
				gsapSpeed: 1,
				duration: 0.6,
				ease: 'power1.out',
				onUpdate: () => this.updateSpeed(this.gsapSpeed),
			},
		);

		gsap.fromTo(
			this,
			{
				gsapVolume: 0.3,
			},
			{
				gsapVolume: 1,
				duration: 0.6,
				ease: 'power1.out',
				onUpdate: () => {
					// Do not update volume if it's off
					if (this.volumeEl.src.includes('off.webp')) return;
					this.audioManager.setVolume(this.gsapVolume);
				},
			},
		);
	}

	private toggleVolume() {
		if (!this.volumeEl.src.includes('off.webp')) {
			this.audioManager.setVolume(0);
			if (
				!(
					this.volumeEl.classList.contains('scale-[0.8]') &&
					this.volumeEl.classList.contains('mr-[12px]')
				)
			) {
				this.volumeEl.classList.add('scale-[0.8]');
				this.volumeEl.classList.add('mr-[12px]');
			}
			this.volumeEl.src = '/miami/controls/volume-off.webp';
		} else {
			this.audioManager.setVolume(1);
			if (
				this.volumeEl.classList.contains('scale-[0.8]') &&
				this.volumeEl.classList.contains('mr-[12px]')
			) {
				this.volumeEl.classList.remove('scale-[0.8]');
				this.volumeEl.classList.remove('mr-[12px]');
			}
			this.volumeEl.src = '/miami/controls/volume-on.webp';
		}
	}

	private openCredits() {
		this.creditsContainer.classList.remove('closed');
	}

	private closeCredits() {
		this.creditsContainer.classList.add('closed');
	}

	private pause() {
		this.updateSpeed(1);
		this.audioManager.pause();
		this.isPlaying = false;
		this.pausePlayEl.src = '/miami/controls/play.webp';
	}

	private play() {
		this.isPlaying = true;
		this.audioManager.play(this.activeAnimation?.time || 0);
		this.pausePlayEl.src = '/miami/controls/pause.webp';
	}
}
