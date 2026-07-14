import type { HTMLAttributes, ReactElement } from "react";

type BacklightProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  blur?: number;
  children: ReactElement;
};

export function Backlight({
  blur = 20,
  children,
  className = "",
  ...props
}: BacklightProps) {
  return (
    <div className={`magic-backlight ${className}`.trim()} {...props}>
      <span
        aria-hidden="true"
        className="magic-backlight__glow"
        style={{ filter: `blur(${blur}px)` }}
      />
      <div className="magic-backlight__content">{children}</div>

      <style>{`
        .magic-backlight{position:relative;isolation:isolate}
        .magic-backlight__glow{position:absolute;inset:-24px;z-index:0;pointer-events:none;border-radius:50%;opacity:.9;background:radial-gradient(ellipse 48% 58% at 9% 42%,rgba(244,197,78,.98) 0,rgba(244,197,78,.62) 34%,transparent 76%),radial-gradient(ellipse 52% 62% at 92% 38%,rgba(53,197,236,.98) 0,rgba(53,197,236,.6) 36%,transparent 78%),radial-gradient(ellipse 58% 42% at 68% 96%,rgba(237,24,90,.9) 0,rgba(237,24,90,.48) 34%,transparent 76%);transform:scale(1.01);animation:backlight-drift 8s ease-in-out infinite alternate;will-change:transform,opacity}
        .magic-backlight__content{position:relative;z-index:1}
        @keyframes backlight-drift{0%{transform:scale(1.005) translate3d(-.6%,.4%,0);opacity:.78}100%{transform:scale(1.025) translate3d(.6%,-.4%,0);opacity:.96}}
        @media(prefers-reduced-motion:reduce){.magic-backlight__glow{animation:none;transform:scale(1)}}
      `}</style>
    </div>
  );
}
