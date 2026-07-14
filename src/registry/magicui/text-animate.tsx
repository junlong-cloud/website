"use client";

import { useEffect, useState } from "react";

type TextAnimateProps = {
  children: string;
  animation?: "blurInUp";
  by?: "character";
  once?: boolean;
  className?: string;
};

export function TextAnimate({
  children,
  animation = "blurInUp",
  by = "character",
  once = false,
  className = "",
}: TextAnimateProps) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const play = () => setActive(true);

    if (document.documentElement.classList.contains("intro-done")) {
      window.requestAnimationFrame(play);
      return;
    }

    window.addEventListener("intro:done", play, { once });
    return () => window.removeEventListener("intro:done", play);
  }, [once]);

  const characters = by === "character" ? Array.from(children) : [children];

  return (
    <span
      aria-label={children}
      className={`text-animate text-animate--${animation} ${className}`.trim()}
      data-animate={active ? "true" : "false"}
    >
      {characters.map((character, index) => (
        <span
          aria-hidden="true"
          className="text-animate__character"
          key={`${character}-${index}`}
          style={{ "--character-index": index } as React.CSSProperties}
        >
          {character === " " ? "\u00a0" : character}
        </span>
      ))}
    </span>
  );
}
