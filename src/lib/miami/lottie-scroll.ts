import { gsap } from "gsap";
import lottie from "lottie-web";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { AnimationItem } from "lottie-web";

const isDev = import.meta.env.MODE === "development";
gsap.registerPlugin(ScrollTrigger);

interface ExtendedAnimationItem extends AnimationItem {
  frameAnimation?: gsap.core.Timeline;
}

interface LottieScrollTriggerVars {
  containerTarget: string | HTMLElement;
  animationTarget: string | HTMLElement;
  path?: string;
  animationData?: any;
  audioLayer?: Howl;
  renderer?: "svg" | "canvas" | "html";
  durationPx?: number;
  rendererSettings?: Record<string, any>;
  scrollTriggerVars?: Partial<ScrollTrigger.Vars>;
}

export function LottieScrollTrigger(vars: LottieScrollTriggerVars) {
  const playhead = { frame: 0 };
  const [containerTarget, animationTarget] = gsap.utils.toArray([vars.containerTarget, vars.animationTarget]) as HTMLElement[];

  const animation: ExtendedAnimationItem = lottie.loadAnimation({
    container: animationTarget,
    renderer: vars.renderer ?? "svg",
    path: vars.path,
    animationData: vars.animationData,
    loop: false,
    autoplay: false,
    rendererSettings: vars.rendererSettings ?? {},
    audioFactory: (path) => {
      const howl = new Howl({
        src: [path],
        autoplay: false,
        html5: true,
      });
      return {
        play: () => {
          if (howl.playing()) return;
          howl.play();
        },
        pause: () => howl.pause(),
        seek: (at?: number) => {
          console.log("seek", at);
          if (at !== undefined) howl.seek(at);
        },
        playing: () => howl.playing(),
        rate: () => howl.rate(),
        setVolume: () => howl.volume(1),
      } as any;
    }
  });

  // animation.addEventListener("drawnFrame", function (e) {
  //   console.log("drawnFrame", e);
  // });
  
  const scrollTrigger = {  
    trigger: containerTarget,
    start: "top top",
    end: `+=${vars.durationPx ?? 2500}px bottom`,
    pin: true,
    markers: isDev,
    scrub: .11,
    ...vars.scrollTriggerVars
  } satisfies ScrollTrigger.Vars;
  
  const ctx = gsap.context && gsap.context();

  const frameAnimation = gsap.timeline({ scrollTrigger });

  animation.addEventListener("DOMLoaded", function () {
    let createTween = function () {
      animation.goToAndStop(playhead.frame, true);
      frameAnimation.to(playhead, {
          frame: animation.totalFrames - 1,
          ease: "none",
          duration: frameAnimation.duration() || 1,
          onUpdate: () => {
            animation.goToAndPlay(playhead.frame, true);
            // if audio and animation are not in sync, this is where you'd update the audio
            if (vars.audioLayer) {
              const progress = playhead.frame / animation.totalFrames; // Between 0 and 1
              const audioCurrentTime = vars.audioLayer.seek();
              const audioShouldBe = vars.audioLayer.duration() * progress;
              if (Math.abs(audioCurrentTime - audioShouldBe) > 0.1) {
                vars.audioLayer.seek(audioShouldBe);
              }
              if (vars.audioLayer.playing() === false) {
                vars.audioLayer.play();
              }
            }
          },
        }, 0);
      return () => animation.destroy && animation.destroy();
    };
    ctx && ctx.add ? ctx.add(createTween) : createTween();
    // in case there are any other ScrollTriggers on the page and the loading of this Lottie asset caused layout changes
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
  });

  animation.frameAnimation = frameAnimation;

  return animation;
}

export function fetchLottieData(url: string): Promise<unknown> {
  return fetch(url).then(response => response.json());
}