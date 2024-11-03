import { gsap } from "gsap";
import { Howl } from "howler";
import lottie from "lottie-web";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { AnimationItem } from "lottie-web";
gsap.registerPlugin(ScrollTrigger);

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
  private started = false;

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
        html5: true,
        loop: false,
      });
    }

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
      end: `+=${vars.durationPx ?? 2500}px bottom`,
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
            this.logger?.log("Frame:", playhead.frame);
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
              if (Math.abs(audioCurrentTime - audioShouldBe) > 0.1) {
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

    setTimeout(() => this.pause(), 100);
  }

  get isPaused() {
    return this.animation.isPaused;
  }

  play() {
    this.started = true;
    if (this.animation.isPaused) this.animation.play();
    if (!this.audioLayer?.playing()) this.audioLayer?.play();
    this.logger?.log("Playing animation");
  }

  pause() {
    if (!this.animation.isPaused) this.animation.pause();
    if (this.audioLayer?.playing()) this.audioLayer?.pause();
    this.logger?.log("Pausing animation");
  }
}

export async function fetchLottieData(url: string): Promise<unknown> {
  const res = await fetch(url)
  const json = await res.json();
  return json;
}