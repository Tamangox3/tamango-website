import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import lottie, { type AnimationItem } from "lottie-web";

// Register the ScrollTrigger and ScrollToPlugin plugins
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

interface ExtendedAnimationItem extends AnimationItem {
  frameTween?: gsap.core.Tween;
}

interface LottieScrollTriggerVars {
  scrollTarget: string | HTMLElement;
  animationTarget: string | HTMLElement;
  path: string;
  renderer?: "svg" | "canvas" | "html";
  speed?: "slow" | "medium" | "fast";
  rendererSettings?: Record<string, any>;
  autoplay?: boolean;
  [key: string]: any; // Allow other properties to override ScrollTrigger defaults
}

export function LottieScrollTrigger(vars: LottieScrollTriggerVars): ExtendedAnimationItem {
  const playhead = { frame: 0 };
  const scrollTarget = gsap.utils.toArray(vars.scrollTarget)[0] as HTMLElement;
  const animationTarget = gsap.utils.toArray(vars.animationTarget)[0] as HTMLElement;
  const speeds: Record<string, string> = { slow: "+=2000", medium: "+=1000", fast: "+=500" };
  const st: Record<string, any> = {
    trigger: scrollTarget,
    pin: true,
    start: "top top",
    end: speeds[vars.speed!] || "+=1000",
    scrub: 1,
  };
  const ctx = gsap.context && gsap.context();
  const animation = lottie.loadAnimation({
    container: animationTarget,
    renderer: vars.renderer || "svg",
    loop: false,
    autoplay: false,
    path: vars.path,
    rendererSettings: vars.rendererSettings,
  }) as ExtendedAnimationItem;

  for (const p in vars) {
    // Let users override the ScrollTrigger defaults
    st[p] = vars[p];
  }

  animation.addEventListener("DOMLoaded", () => {
    const createTween = () => {
      animation.frameTween = gsap.to(playhead, {
        frame: animation.totalFrames - 1,
        ease: "none",
        onUpdate: () => animation.goToAndStop(playhead.frame, true),
        scrollTrigger: st,
      });
      return () => animation.destroy && animation.destroy();
    };

    ctx && ctx.add ? ctx.add(createTween) : createTween();
    // In case there are any other ScrollTriggers on the page and the loading of this Lottie asset caused layout changes
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
  });

  if (vars.autoplay) {
    const autoplayTimeline = gsap.timeline({ repeat: -1, paused: true });

    autoplayTimeline.to(scrollTarget, {
      scrollTo: { y: scrollTarget.scrollHeight - window.innerHeight, autoKill: false },
      duration: parseFloat(speeds[vars.speed!] || "1000") / 1000,
      ease: "none",
    });

    let isScrolling: NodeJS.Timeout;

    window.addEventListener("scroll", () => {
      window.clearTimeout(isScrolling);
      autoplayTimeline.pause();
      isScrolling = setTimeout(() => {
        autoplayTimeline.play();
      }, 100);
    });

    autoplayTimeline.play();
  }

  return animation;
}