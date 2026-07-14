"use client";

import Image from "next/image";

type Project = {
  name: string;
  category: string;
  description: string;
  slug: "pixtime" | "etf" | "product-radar";
  accent: string;
  mark: string;
  imageCount: number;
};

const projects: Project[] = [
  {
    name: "PIXEL TIME",
    category: "计时收银 WEB APP · 服务真实门店",
    description:
      "为拼豆手作店打造的计时收银 App：支持多座位开台、多计费规则、次卡与扫码看时长。用 Claude Code 开发上线，已在真实门店稳定使用。",
    slug: "pixtime",
    accent: "#c9f43d",
    mark: "P",
    imageCount: 10,
  },
  {
    name: "ETF DASHBOARD",
    category: "数据自动化 · 每日 16:30 运行",
    description:
      "从 PRD 到自动化流水线：同类指数去重、PE 分位等专业字段、6 项数据质检，并每日自动生成看板与社媒文案。",
    slug: "etf",
    accent: "#ffc85a",
    mark: "E",
    imageCount: 4,
  },
  {
    name: "PRODUCT RADAR",
    category: "AI 学习平台 · 每周更新",
    description:
      "面向 AI 产品经理的学习平台，按五大板块整理资源并每周更新；用 Claude Code 从 0 到 1 开发部署。",
    slug: "product-radar",
    accent: "#9ed9ff",
    mark: "R",
    imageCount: 13,
  },
];

// 无限横向滚动（marquee）：两组重复内容首尾相接循环位移，
// reverse 时反向（从左往右）。hover 暂停。机制同 MagicUI Marquee。
function PhoneStrip({ project, reverse }: { project: Project; reverse?: boolean }) {
  const sequence = Array.from({ length: project.imageCount }, (_, index) => index + 1);

  const renderGroup = (groupKey: string, hidden: boolean) => (
    <div
      className={`aw-marqueeGroup${reverse ? " aw-marqueeGroup--reverse" : ""}`}
      aria-hidden={hidden || undefined}
      key={groupKey}
    >
      {sequence.map((image, index) => (
        <div className="aw-phoneCard" key={`${project.slug}-${groupKey}-${index}`}>
          <Image
            className="aw-phoneImage"
            src={`/assets/app-${project.slug}-${image}.png`}
            alt={hidden ? "" : `${project.name} mobile screen ${index + 1}`}
            width={1320}
            height={2868}
            style={{ width: "100%", height: "auto" }}
            sizes="(max-width: 700px) 220px, 20vw"
          />
        </div>
      ))}
    </div>
  );

  return (
    <div className="aw-phoneViewport" aria-label={`${project.name} app screens`}>
      <div className="aw-marquee">
        {renderGroup("a", false)}
        {renderGroup("b", true)}
      </div>
    </div>
  );
}

export function AppWorks() {
  return (
    <section id="app-works" className="aw-root">
      <header className="aw-intro">
        <div className="aw-kicker" data-reveal>
          explore my work!
          <span aria-hidden="true" />
        </div>
        <div className="aw-headingWrap">
          <h2 data-reveal style={{ "--reveal-delay": "0.1s" } as React.CSSProperties}>
            FEATURED
            <br />
            APP WORKS
          </h2>
          <span
            className="aw-sticker"
            data-reveal="pop"
            style={{ "--reveal-delay": "0.45s" } as React.CSSProperties}
          >
            BEST ONES!
          </span>
        </div>
      </header>

      <div className="aw-projects">
        {projects.map((project, index) => (
          <article className="aw-project" key={project.slug}>
            <div className="aw-projectMeta">
              <div className="aw-identity" data-reveal>
                <div
                  className="aw-appIcon"
                  style={{ backgroundColor: project.accent }}
                  aria-hidden="true"
                >
                  {project.mark}
                </div>
                <div>
                  <p className="aw-category">{project.category}</p>
                  <h3>{project.name}</h3>
                </div>
              </div>
              <p
                className="aw-description"
                data-reveal
                style={{ "--reveal-delay": "0.15s" } as React.CSSProperties}
              >
                {project.description}
              </p>
            </div>
            {/* 方向交替：第 1/3 个从右往左（默认），第 2 个从左往右（reverse） */}
            <PhoneStrip project={project} reverse={index % 2 === 1} />
          </article>
        ))}
      </div>

      <style jsx global>{`
        .aw-root {
          --ink: #321f15;
          color: var(--ink);
          overflow: hidden;
          padding: 170px 0 160px;
        }

        .aw-intro {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 142px;
          text-align: center;
        }

        .aw-kicker {
          position: relative;
          margin-bottom: 22px;
          font-family: var(--font-hand), "Comic Sans MS", cursive;
          font-size: clamp(24px, 2.1vw, 34px);
          line-height: 1;
          transform: rotate(-2deg);
        }

        .aw-kicker span {
          display: block;
          width: 74px;
          height: 10px;
          margin: 10px auto 0;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          transform: rotate(2deg);
        }

        .aw-headingWrap {
          position: relative;
        }

        .aw-root h2,
        .aw-root h3,
        .aw-root p {
          margin: 0;
        }

        .aw-root h2 {
          font-family: var(--font-pixel), monospace;
          font-size: clamp(52px, 6vw, 92px);
          font-weight: 500;
          letter-spacing: -0.07em;
          line-height: 0.85;
        }

        .aw-sticker {
          position: absolute;
          top: -31px;
          right: 2%;
          padding: 22px 28px;
          background: #f8d67d;
          box-shadow: 0 7px 13px rgba(74, 50, 17, 0.08);
          font-family: "DM Mono", "Courier New", monospace;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 0.02em;
          transform: rotate(-8deg);
        }

        .aw-projects {
          display: flex;
          flex-direction: column;
          gap: 116px;
        }

        .aw-projectMeta {
          display: grid;
          grid-template-columns: 1fr minmax(280px, 39%);
          align-items: center;
          width: min(1140px, calc(100% - 96px));
          margin: 0 auto 46px;
        }

        .aw-identity {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .aw-appIcon {
          display: grid;
          flex: 0 0 66px;
          width: 66px;
          height: 66px;
          place-items: center;
          border-radius: 15px;
          box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.35);
          font-family: "Arial Black", sans-serif;
          font-size: 40px;
          line-height: 1;
          text-transform: uppercase;
        }

        .aw-category {
          margin-bottom: 5px;
          font-family: "DM Mono", "Courier New", monospace;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: -0.03em;
          text-transform: uppercase;
        }

        .aw-root h3 {
          font-family: var(--font-pixel), monospace;
          font-size: 47px;
          font-weight: 500;
          letter-spacing: -0.05em;
          line-height: 0.95;
          text-transform: uppercase;
        }

        .aw-description {
          max-width: 410px;
          font-size: 17px;
          line-height: 1.38;
        }

        .aw-phoneViewport {
          --aw-gap: 26px;
          --aw-duration: 42s;
          position: relative;
          width: 100%;
          overflow: hidden;
          padding-top: 8px;
        }

        /* 左右白色渐变遮罩（marquee 边缘淡出） */
        .aw-phoneViewport::before,
        .aw-phoneViewport::after {
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
          width: 12%;
          z-index: 1;
          pointer-events: none;
        }

        .aw-phoneViewport::before {
          left: 0;
          background: linear-gradient(to right, var(--paper), transparent);
        }

        .aw-phoneViewport::after {
          right: 0;
          background: linear-gradient(to left, var(--paper), transparent);
        }

        .aw-marquee {
          display: flex;
          gap: var(--aw-gap);
          width: max-content;
        }

        .aw-marqueeGroup {
          display: flex;
          flex: 0 0 auto;
          gap: var(--aw-gap);
          animation: aw-marquee var(--aw-duration) linear infinite;
        }

        .aw-marqueeGroup--reverse {
          animation-direction: reverse;
        }

        .aw-phoneViewport:hover .aw-marqueeGroup {
          animation-play-state: paused;
        }

        @keyframes aw-marquee {
          to {
            transform: translateX(calc(-100% - var(--aw-gap)));
          }
        }

        .aw-phoneCard {
          flex: 0 0 clamp(190px, 17vw, 250px);
          width: clamp(190px, 17vw, 250px);
          height: clamp(390px, 36vw, 550px);
          overflow: hidden;
          border-radius: 28px;
          background: #f1f1f1;
        }

        .aw-phoneImage {
          display: block;
          width: 100%;
          height: auto;
          transition: transform 260ms ease;
        }

        .aw-phoneCard:hover .aw-phoneImage {
          transform: translateY(-8px);
        }

        @media (max-width: 700px) {
          .aw-root {
            padding: 76px 0 90px;
          }

          .aw-intro {
            margin-bottom: 72px;
          }

          .aw-kicker {
            margin-bottom: 18px;
            font-size: 22px;
          }

          .aw-root h2 {
            font-size: 44px;
            line-height: 0.9;
          }

          .aw-sticker {
            top: -28px;
            right: -4px;
            padding: 13px 15px;
            font-size: 11px;
          }

          .aw-projects {
            gap: 48px;
          }

          .aw-projectMeta {
            display: flex;
            width: calc(100% - 32px);
            margin-bottom: 24px;
            flex-direction: column;
            align-items: flex-start;
            gap: 20px;
          }

          .aw-appIcon {
            flex-basis: 52px;
            width: 52px;
            height: 52px;
            border-radius: 12px;
            font-size: 31px;
          }

          .aw-root h3 {
            font-size: 30px;
          }

          .aw-description {
            max-width: 100%;
            font-size: 15px;
          }

          .aw-phoneViewport {
            --aw-gap: 14px;
            --aw-duration: 30s;
          }

          .aw-phoneCard {
            flex: 0 0 220px;
            width: 220px;
            height: 385px;
            border-radius: 22px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .aw-phoneImage {
            transition: none;
          }

          .aw-marqueeGroup {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}

export default AppWorks;
