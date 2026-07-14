"use client";

import { useEffect, useRef, useState } from "react";

// 终端打字机入场（移植自 portfolio/ 的 Loader，白纸+马卡龙配色版）
// 流程：逐行打字 → ASCII 进度条 → 停住等输入（Enter/滚轮/点击）→ 幕布上拉
type Line =
  | { type: "cmd"; text: string; cursor?: boolean }
  | { type: "output"; text: string; indent?: boolean }
  | { type: "gold"; text: string }
  | { type: "blank" };

const LINES: Line[] = [
  { type: "cmd", text: "whoami" },
  { type: "output", text: "马俊龙 Ma Junlong — AI Product Manager" },
  { type: "blank" },
  { type: "cmd", text: "cat now.md" },
  { type: "output", text: "8 年地产营销 → AI 产品经理 · 济南" },
  { type: "output", text: "像素时光 · ETF 看板 · 产品雷达", indent: true },
  { type: "blank" },
  { type: "gold", text: "1 person + AI = 1 team" },
  { type: "blank" },
  { type: "cmd", text: "open portfolio.app", cursor: true },
];

const BAR_LENGTH = 12;

type Phase = "typing" | "progress" | "ready" | "exit" | "gone";

export function TerminalLoader() {
  const root = useRef<HTMLDivElement>(null);
  const finishExitRef = useRef<() => void>(() => undefined);
  const [visibleCount, setVisibleCount] = useState(0);
  const [progress, setProgress] = useState(-1); // -1 = 进度条未开始
  const [phase, setPhase] = useState<Phase>("typing");
  const phaseRef = useRef<Phase>("typing");

  useEffect(() => {
    const previousOverflow = document.documentElement.style.overflow;
    let scrollRestored = false;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.documentElement.style.overflow = "hidden";

    const restoreScroll = () => {
      if (scrollRestored) return;
      scrollRestored = true;
      document.documentElement.style.overflow = previousOverflow;
    };
    // 通知 RevealManager：幕布开始拉开，页面入场动效可以启动了
    const signalIntroDone = () => {
      document.documentElement.classList.add("intro-done");
      window.dispatchEvent(new Event("intro:done"));
    };

    // reduced-motion 用户直接跳过
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      phaseRef.current = "gone";
      const reducedMotionTimer = window.setTimeout(() => setPhase("gone"), 0);
      restoreScroll();
      signalIntroDone();
      return () => window.clearTimeout(reducedMotionTimer);
    }

    const timers: ReturnType<typeof setTimeout>[] = [];
    const setPhaseBoth = (p: Phase) => {
      phaseRef.current = p;
      setPhase(p);
      if (p === "exit") timers.push(setTimeout(() => finishExitRef.current(), 1200));
    };
    const finishExit = () => {
      if (phaseRef.current !== "exit") return;
      setPhaseBoth("gone");
      restoreScroll();
    };
    finishExitRef.current = finishExit;

    // 逐行 reveal：cmd 慢、output 快（节奏与 portfolio 版一致）
    let delay = 300;
    LINES.forEach((line, i) => {
      if (line.type === "blank") delay += 200;
      else if (line.type === "cmd") delay += 400 + 300;
      else delay += 150 + 200;
      timers.push(setTimeout(() => setVisibleCount(i + 1), delay));
    });

    // 打字完 → 进度条 → ready（停住等输入）
    const startProgress = () => {
      if (phaseRef.current !== "typing") return;
      setPhaseBoth("progress");
      setVisibleCount(LINES.length);
      let p = 0;
      const iv = setInterval(() => {
        p += 1;
        setProgress(p);
        if (p >= BAR_LENGTH) {
          clearInterval(iv);
          setPhaseBoth("ready");
        }
      }, 80);
      timers.push(iv as unknown as ReturnType<typeof setTimeout>);
    };

    timers.push(setTimeout(startProgress, delay + 500));

    // 打字阶段：任意输入跳过；ready 阶段：Enter/滚轮/点击进入
    const onInput = (e: Event) => {
      if (phaseRef.current === "gone") return;
      if (e.type === "wheel" || e.type === "touchmove") e.preventDefault();
      if (phaseRef.current === "typing") {
        timers.forEach((t) => {
          clearTimeout(t);
          clearInterval(t as unknown as ReturnType<typeof setInterval>);
        });
        startProgress();
      } else if (phaseRef.current === "ready") {
        if (e.type === "keydown" && (e as KeyboardEvent).key !== "Enter") return;
        setPhaseBoth("exit"); // CSS transition 拉幕，onTransitionEnd 卸载
        signalIntroDone(); // 拉幕开始即启动页面入场，和幕布衔接
      }
    };
    window.addEventListener("pointerdown", onInput);
    window.addEventListener("keydown", onInput);
    window.addEventListener("wheel", onInput, { passive: false });
    window.addEventListener("touchmove", onInput, { passive: false });

    return () => {
      restoreScroll();
      timers.forEach((t) => {
        clearTimeout(t);
        clearInterval(t as unknown as ReturnType<typeof setInterval>);
      });
      window.removeEventListener("pointerdown", onInput);
      window.removeEventListener("keydown", onInput);
      window.removeEventListener("wheel", onInput);
      window.removeEventListener("touchmove", onInput);
    };
  }, []);

  if (phase === "gone") return null;

  const bar =
    progress >= 0
      ? `[${"█".repeat(Math.min(progress, BAR_LENGTH))}${"░".repeat(
          Math.max(BAR_LENGTH - progress, 0)
        )}] ${Math.round((Math.min(progress, BAR_LENGTH) / BAR_LENGTH) * 100)}%`
      : null;

  return (
    <div
      ref={root}
      className={`terminal-loader grid-paper mono${phase === "exit" ? " terminal-loader--exit" : ""}`}
      aria-hidden="true"
      onTransitionEnd={(e) => {
        if (e.target === root.current && phaseRef.current === "exit") {
          finishExitRef.current();
        }
      }}
    >
      <div className="terminal-loader__panel">
        <div className="terminal-loader__window">
            <div className="terminal-loader__bar">
              <span className="terminal-loader__dot" style={{ background: "#ff5f57" }} />
              <span className="terminal-loader__dot" style={{ background: "#febc2e" }} />
              <span className="terminal-loader__dot" style={{ background: "#28c840" }} />
              <span className="terminal-loader__title">majunlong@portfolio ~ zsh</span>
            </div>
            <div className="terminal-loader__body">
              {LINES.slice(0, visibleCount).map((line, i) => {
                if (line.type === "blank")
                  return <div className="term-line" key={i}>&nbsp;</div>;
                if (line.type === "cmd")
                  return (
                    <div className="term-line" key={i}>
                      <span className="term-prompt">$ </span>
                      <span className="term-cmd">{line.text}</span>
                      {line.cursor && progress < 0 && <span className="term-cursor" />}
                    </div>
                  );
                if (line.type === "gold")
                  return (
                    <div className="term-line" key={i}>
                      <span className="term-prompt">&gt; </span>
                      <span className="term-gold">{line.text}</span>
                    </div>
                  );
                return (
                  <div className="term-line" key={i}>
                    <span className="term-output">
                      {line.indent ? "  " : "> "}
                      {line.text}
                    </span>
                  </div>
                );
              })}
              {progress >= 0 && (
                <>
                  <div className="term-line">
                    <span className="term-output">&gt; launching...</span>
                  </div>
                  <div className="term-line">
                    <span className="term-bar">{bar}</span>
                  </div>
                </>
              )}
              {(phase === "ready" || phase === "exit") && (
                <div className="term-line">
                  <span className="term-output">&gt; ready. </span>
                  <span className="term-cursor" />
                </div>
              )}
            </div>
        </div>
      </div>
      <span
        className={`terminal-loader__hint${
          phase === "ready" ? " terminal-loader__hint--ready" : ""
        }`}
      >
        {phase === "ready"
          ? "SCROLL DOWN · PRESS ENTER · OR CLICK"
          : "CLICK OR PRESS ANY KEY TO SKIP"}
      </span>
    </div>
  );
}
