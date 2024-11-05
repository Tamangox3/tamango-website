import { gsap, Linear } from "gsap";
import { Howl } from "howler";
import lottie from "lottie-web";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ScrollToPlugin from "gsap/ScrollToPlugin";
import type { AnimationItem } from "lottie-web";

gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(ScrollToPlugin); 


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
  renderer?: "svg" | "canvas" | "html";
  durationPx?: number;
  rendererSettings?: Record<string, any>;
  scrollTriggerVars?: Partial<ScrollTrigger.Vars>;
  debug?: boolean;
  logger?: DummyLogger;
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
    [
      this.containerTarget,
      this.animationTarget
    ] = gsap.utils.toArray([vars.containerTarget, vars.animationTarget]) as HTMLElement[];

    if (vars.audioBlob) {
      this.audioLayer = new Howl({
        src: [vars.audioBlob],
        format: ["mp3"],
        volume: 1,
        html5: false,
        loop: false,
      });
    }

    this.durationPx = vars.durationPx ?? 2500;

    this.animation = lottie.loadAnimation({
      container: this.animationTarget,
      renderer: vars.renderer ?? "svg",
      animationData: vars.animationData,
      loop: false,
      autoplay: false,
      rendererSettings: vars.rendererSettings ?? {},
    });

    const scrollTrigger = {
      trigger: this.containerTarget,
      start: "top top",
      end: `+=${this.durationPx}px bottom`,
      pin: true,
      markers: vars.debug,
      scrub: .11,
      ...vars.scrollTriggerVars
    } satisfies ScrollTrigger.Vars;

    this.gsapCtx = gsap.context && gsap.context();

    const frameAnimation = gsap.timeline({ scrollTrigger });
    const playhead = { frame: 0 };

    let createTween = () => {
      this.animation.goToAndStop(playhead.frame, true);
      frameAnimation.to(playhead, {
        frame: this.animation.totalFrames - 1,
        ease: "none",
        duration: frameAnimation.duration() || 1,
        onUpdate: () => {
          if (this.isPaused) {
            this.animation.goToAndStop(playhead.frame, true);
          } else {
            this.animation.goToAndPlay(playhead.frame, true);
          }
          // if audio and animation are not in sync, this is where you'd update the audio
          if (this.audioLayer) {
            const progress = playhead.frame / this.animation.totalFrames; // Between 0 and 1
            const audioCurrentTime = this.audioLayer.seek();
            const audioShouldBe = this.audioLayer.duration() * progress;
            if (Math.abs(audioCurrentTime - audioShouldBe) > 0.25) {
              this.logger?.log("Audio out of sync, seeking to", audioShouldBe);
              this.audioLayer.seek(audioShouldBe);
            }
          }
        },
      }, 0);
      return () => this.animation.destroy && this.animation.destroy();
    };

    this.gsapCtx && this.gsapCtx.add ? this.gsapCtx.add(createTween) : createTween();

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
    });
  }

  toggleAutoscroll(isEnabled: boolean) {
    if (!this.audioLayer) return;
    if (isEnabled) {
      const remaining = this.audioLayer.duration() - this.audioLayer.seek();
      this.logger?.log(`Scroll to ${this.durationPx} in ${remaining} seconds`);
      this.autoscroll(remaining);
    }
    else gsap.killTweensOf(window); // Stop autoscroll if toggled off
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
    this.logger?.log("Playing animation");
  }

  pause() {
    if (!this.animation.isPaused) this.animation.pause();
    if (this.audioLayer?.playing()) this.audioLayer?.pause();
    this.toggleAutoscroll(false);
    this.logger?.log("Pausing animation");
  }

  private setupDebug() {
    this.setupLottieDebug();
    this.setupAudioDebug();
  }

  private setupLottieDebug() {
    const lottieProgress = document.createElement("div");
    lottieProgress.style.position = "fixed";
    lottieProgress.style.bottom = "0";
    lottieProgress.style.left = "0";
    lottieProgress.style.zIndex = "1000";
    lottieProgress.style.padding = "10px";
    lottieProgress.style.backgroundColor = "rgba(0,0,0,.5)";
    lottieProgress.style.color = "white";
    this.animation.addEventListener("DOMLoaded", () => {
      lottieProgress.textContent = `Lottie frame: 0 / ${this.animation.totalFrames}`;
    });
    this.animation.addEventListener("enterFrame", () => {
      lottieProgress.textContent = `Lottie frame: ${this.animation.currentFrame.toFixed(0)} / ${this.animation.totalFrames}`;
    });
    document.body.appendChild(lottieProgress);
  }

  private setupAudioDebug() {
    if (!this.audioLayer) return;
    const audioProgress = document.createElement("div");
    audioProgress.style.position = "fixed";
    audioProgress.style.bottom = "44px";
    audioProgress.style.left = "0";
    audioProgress.style.zIndex = "1000";
    audioProgress.style.padding = "10px";
    audioProgress.style.backgroundColor = "rgba(0,0,0,.5)";
    audioProgress.style.color = "white";
    const serializedAudio = (audio: Howl) => `Audio${audio.playing() ? '' : ' not'} playing: ${audio.seek().toFixed(0)}s / ${audio.duration().toFixed(0)}s`;
    ["play", "end", "pause", "stop", "mute", "volume", "rate", "seek", "fade", "unlock", "load", "loaderror", "playerror"].forEach(evt => {
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
}

export async function fetchLottieData(url: string): Promise<unknown> {
  const res = await fetch(url)
  const json = await res.json();
  return json;
}