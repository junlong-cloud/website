"use client";

import { useEffect } from "react";

// 全站入场动效调度：监听所有 [data-reveal] 元素，进入视口时加 .is-in。
// 等 TerminalLoader 拉幕（html.intro-done / intro:done 事件）后才启动，
// 保证首屏 Hero 的入场和幕布上拉衔接。
export function RevealManager() {
  useEffect(() => {
    let io: IntersectionObserver | null = null;

    const start = () => {
      if (io) return;
      const els = document.querySelectorAll("[data-reveal]");
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        els.forEach((el) => el.classList.add("is-in"));
        return;
      }
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-in");
              io?.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -5% 0px" }
      );
      els.forEach((el) => io?.observe(el));
    };

    if (document.documentElement.classList.contains("intro-done")) {
      start();
    } else {
      window.addEventListener("intro:done", start, { once: true });
    }

    return () => {
      window.removeEventListener("intro:done", start);
      io?.disconnect();
    };
  }, []);

  return null;
}
