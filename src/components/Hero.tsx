"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { Confetti, type ConfettiRef } from "@/registry/magicui/confetti";
import { Pointer } from "@/registry/magicui/pointer";
import { TextAnimate } from "@/registry/magicui/text-animate";

function Clock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () => setTime(new Intl.DateTimeFormat("en-US", {
      hour: "numeric", minute: "2-digit", second: "2-digit",
    }).format(new Date()));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, []);

  return <time className="mono text-[13px] font-bold tabular-nums">{time || "00:00:00 PM"}</time>;
}

function SitePointer() {
  return (
    <Pointer>
      <motion.div
        className="drop-shadow-[3px_4px_0_#17120f]"
        animate={{ scale: [0.82, 1, 0.82], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <motion.path
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            className="fill-[#ed185a] stroke-white"
            strokeWidth="1.25"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformBox: "fill-box", transformOrigin: "center" }}
          />
        </svg>
      </motion.div>
    </Pointer>
  );
}

const Handle = ({ className }: { className: string }) => (
  <span className={`absolute z-10 h-5 w-5 border-2 border-[#24140e] bg-[#35c5ec] ${className}`} />
);

export function Hero() {
  const confettiRef = useRef<ConfettiRef>(null);
  const heroRef = useRef<HTMLElement>(null);
  const workflowRef = useRef<HTMLSpanElement>(null);
  const agentRef = useRef<HTMLSpanElement>(null);
  const pigRef = useRef<HTMLSpanElement>(null);
  const folderRef = useRef<HTMLSpanElement>(null);
  const laptopRef = useRef<HTMLSpanElement>(null);
  const bagRef = useRef<HTMLSpanElement>(null);
  const workflowTarget = useMotionValue(1);
  const agentTarget = useMotionValue(1);
  const pigTarget = useMotionValue(1);
  const folderTarget = useMotionValue(1);
  const laptopTarget = useMotionValue(1);
  const bagTarget = useMotionValue(1);
  const workflowScale = useSpring(workflowTarget, { stiffness: 320, damping: 24, mass: 0.45 });
  const agentScale = useSpring(agentTarget, { stiffness: 320, damping: 24, mass: 0.45 });
  const pigScale = useSpring(pigTarget, { stiffness: 320, damping: 24, mass: 0.45 });
  const folderScale = useSpring(folderTarget, { stiffness: 320, damping: 24, mass: 0.45 });
  const laptopScale = useSpring(laptopTarget, { stiffness: 320, damping: 24, mass: 0.45 });
  const bagScale = useSpring(bagTarget, { stiffness: 320, damping: 24, mass: 0.45 });

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const radius = 280;
    const maxScale = 1.22;
    const scaleFromDistance = (event: PointerEvent, element: HTMLElement | null) => {
      if (!element) return 1;
      const rect = element.getBoundingClientRect();
      const distance = Math.hypot(
        event.clientX - (rect.left + rect.width / 2),
        event.clientY - (rect.top + rect.height / 2),
      );
      const proximity = Math.max(0, Math.min(1, 1 - distance / radius));
      return 1 + (maxScale - 1) * proximity;
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType && event.pointerType !== "mouse") return;
      workflowTarget.set(scaleFromDistance(event, workflowRef.current));
      agentTarget.set(scaleFromDistance(event, agentRef.current));
      pigTarget.set(scaleFromDistance(event, pigRef.current));
      folderTarget.set(scaleFromDistance(event, folderRef.current));
      laptopTarget.set(scaleFromDistance(event, laptopRef.current));
      bagTarget.set(scaleFromDistance(event, bagRef.current));
    };
    const reset = () => {
      workflowTarget.set(1);
      agentTarget.set(1);
      pigTarget.set(1);
      folderTarget.set(1);
      laptopTarget.set(1);
      bagTarget.set(1);
    };

    hero.addEventListener("pointermove", move, { passive: true });
    hero.addEventListener("pointerleave", reset);
    return () => {
      hero.removeEventListener("pointermove", move);
      hero.removeEventListener("pointerleave", reset);
    };
  }, [agentTarget, bagTarget, folderTarget, laptopTarget, pigTarget, workflowTarget]);

  return (
    <section ref={heroRef} id="home" className="hero-cover grid-paper relative min-h-[980px] overflow-hidden border-b border-black/10 pt-12">
      <SitePointer />
      <div className="hero-fx" aria-hidden="true">
        <span className="hero-orbit hero-orbit--left" />
        <span className="hero-orbit hero-orbit--right" />
        <span className="hero-cross hero-cross--one" />
        <span className="hero-cross hero-cross--two" />
        <span className="hero-scan-beam" />
      </div>

      <span ref={pigRef} aria-hidden="true" className="absolute left-[6%] top-[190px] z-[2] hidden h-[88px] w-[88px] -rotate-[7deg] lg:block" data-reveal="pop" style={{ "--reveal-delay": "0.68s" } as React.CSSProperties}>
        <motion.span className="block h-full w-full origin-center drop-shadow-[5px_7px_0_rgba(23,18,15,.14)]" style={{ scale: pigScale }}>
          <Image src="/hero-icons/pig.png" alt="" width={450} height={450} className="h-full w-full select-none object-contain" draggable={false} />
        </motion.span>
      </span>
      <span ref={folderRef} aria-hidden="true" className="absolute right-[7%] top-[205px] z-[2] hidden h-[92px] w-[92px] rotate-[6deg] lg:block" data-reveal="pop" style={{ "--reveal-delay": "0.76s" } as React.CSSProperties}>
        <motion.span className="block h-full w-full origin-center drop-shadow-[5px_7px_0_rgba(23,18,15,.14)]" style={{ scale: folderScale }}>
          <Image src="/hero-icons/folder.png" alt="" width={450} height={450} className="h-full w-full select-none object-contain" draggable={false} />
        </motion.span>
      </span>
      <span ref={laptopRef} aria-hidden="true" className="absolute left-[19%] top-[625px] z-[2] hidden h-[94px] w-[94px] -rotate-[5deg] lg:block" data-reveal="pop" style={{ "--reveal-delay": "0.84s" } as React.CSSProperties}>
        <motion.span className="block h-full w-full origin-center drop-shadow-[5px_7px_0_rgba(23,18,15,.14)]" style={{ scale: laptopScale }}>
          <Image src="/hero-icons/laptop.png" alt="" width={450} height={450} className="h-full w-full select-none object-contain" draggable={false} />
        </motion.span>
      </span>
      <span ref={bagRef} aria-hidden="true" className="absolute right-[7%] top-[720px] z-[2] hidden h-[88px] w-[88px] rotate-[7deg] lg:block" data-reveal="pop" style={{ "--reveal-delay": "0.92s" } as React.CSSProperties}>
        <motion.span className="block h-full w-full origin-center drop-shadow-[5px_7px_0_rgba(23,18,15,.14)]" style={{ scale: bagScale }}>
          <Image src="/hero-icons/bag.png" alt="" width={450} height={450} className="h-full w-full select-none object-contain" draggable={false} />
        </motion.span>
      </span>
      <div aria-hidden="true" className="h-10 border-b border-black/15 bg-white/75">
        <div className="h-3 bg-[repeating-linear-gradient(90deg,transparent_0,transparent_49px,#c9c9c9_50px)]" />
        <div className="mono hidden justify-around pt-1 text-[9px] text-black/35 sm:flex">
          {[0,100,200,300,400,500,600,700,800,900,1000,1100,1200,1300,1400].map(n => <span key={n}>{n}</span>)}
        </div>
      </div>

      <div className="absolute inset-x-0 top-[102px] flex justify-center"><Clock /></div>

      <div className="absolute left-1/2 top-[318px] w-[min(860px,76vw)] -translate-x-1/2 text-center sm:top-[304px]">
        <div className="hero-signature hand mb-8 text-[34px] leading-none sm:text-[42px]" data-reveal>
          Ma Junlong
          <span aria-hidden="true" className="hero-signature-line mx-auto mt-2 block h-3 w-28 border-y border-black -skew-x-12" />
        </div>

        <div
          className="hero-title-frame relative flex min-h-[76px] items-center justify-center border-2 border-[#35c5ec] px-3 py-3 sm:min-h-[150px] sm:px-5 lg:min-h-[174px]"
          data-reveal
          style={{ "--reveal-delay": "0.12s" } as React.CSSProperties}
          onPointerEnter={() => confettiRef.current?.fire()}
        >
          <Confetti ref={confettiRef} className="hero-confetti" />
          <Handle className="-left-[11px] -top-[11px]" /><Handle className="-right-[11px] -top-[11px]" />
          <Handle className="-bottom-[11px] -left-[11px]" /><Handle className="-bottom-[11px] -right-[11px]" />
          <span ref={workflowRef} className="absolute left-2 top-[-48px] block h-[52px] w-[122px] rotate-[10deg] sm:left-6 sm:top-[-58px] sm:h-[68px] sm:w-[190px]" data-reveal="pop" style={{ "--reveal-delay": "0.5s" } as React.CSSProperties}>
            <motion.span className="sticker pixel grid h-full w-full origin-center place-items-center bg-[#91d9c0] text-[11px] uppercase sm:text-[15px]" style={{ scale: workflowScale }}>Workflow</motion.span>
          </span>
          <span ref={agentRef} className="absolute right-2 top-[-48px] block h-[48px] w-[96px] -rotate-[8deg] sm:right-6 sm:top-[-60px] sm:h-[64px] sm:w-[150px]" data-reveal="pop" style={{ "--reveal-delay": "0.62s" } as React.CSSProperties}>
            <motion.span className="sticker pixel grid h-full w-full origin-center place-items-center bg-[#f7d77d] text-[11px] uppercase sm:text-[15px]" style={{ scale: agentScale }}>Agent</motion.span>
          </span>
          <h1 className="hero-title pixel inline-block whitespace-nowrap text-[44px] leading-[1.05] tracking-[-.07em] text-[#30180d] sm:text-[clamp(76px,9.6vw,142px)]">PORTFOLIO</h1>
        </div>

        <p className="mono mt-7 flex items-center justify-center gap-3 text-[11px] font-bold sm:text-[16px]">
          <span className="hero-status-dot h-4 w-4 rounded-full bg-[#35c5ec] sm:h-5 sm:w-5" data-reveal="pop" style={{ "--reveal-delay": "0.32s" } as React.CSSProperties} />
          <TextAnimate animation="blurInUp" by="character" once>
            Bet on people who ship.
          </TextAnimate>
        </p>
      </div>

      <div className="absolute inset-x-0 top-[620px] text-center sm:top-[650px]">
        <a href="mailto:503952420@qq.com" className="hard-button mono inline-flex items-center gap-3 px-3 py-2 text-[12px] font-bold uppercase" data-reveal style={{ "--reveal-delay": "0.45s" } as React.CSSProperties}>
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[#35c5ec] text-xl text-black">➜</span> Contact me
        </a>
      </div>

      <div aria-hidden="true" className="hero-float-left sticker mono absolute bottom-[160px] left-[12%] hidden rounded-[20px_2px_20px_20px] bg-[#f4c54e] px-6 py-3 text-[12px] font-bold uppercase lg:block" data-reveal="pop" style={{ "--reveal-delay": "0.75s" } as React.CSSProperties}>Open for work</div>
      <div aria-hidden="true" className="hero-float-right sticker mono absolute right-[25%] top-[610px] hidden rounded-[2px_24px_24px_24px] bg-[#ed185a] px-7 py-3 text-[13px] font-bold text-white lg:block" data-reveal="pop" style={{ "--reveal-delay": "0.85s" } as React.CSSProperties}>8 Yrs Exp</div>
    </section>
  );
}
