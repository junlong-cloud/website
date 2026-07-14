import Image from "next/image";
import { IconCloud } from "@/components/IconCloud";
import { Backlight } from "@/registry/magicui/backlight";

const cloudIcons = [
  { src: "/assets/icon-cloud/gemini.png", label: "Gemini" },
  { src: "/assets/icon-cloud/coze.png", label: "Coze" },
  { src: "/assets/icon-cloud/codex.png", label: "Codex" },
  { src: "/assets/icon-cloud/obsidian.png", label: "Obsidian" },
  { src: "/assets/icon-cloud/gpt.png", label: "ChatGPT" },
  { src: "/assets/icon-cloud/claude.png", label: "Claude" },
  { src: "/assets/icon-cloud/figma.png", label: "Figma" },
  { src: "/assets/icon-cloud/deepseek.png", label: "DeepSeek" },
  { src: "/assets/icon-cloud/github.png", label: "GitHub" },
  { src: "/assets/icon-cloud/hermes.png", label: "Hermes" },
  { src: "/assets/icon-cloud/doubao.png", label: "豆包" },
] as const;

const capabilities = ["PRD", "RAG", "智能体", "工作流", "提示词工程"];

export function AboutMe() {
  return (
    <section id="about" className="about grid-paper">
      <div className="section-shell">
        <Backlight blur={40} className="about-backlight" data-reveal>
        <div className="about-layout">
          <div className="about-copy">
            <p className="hand about-kicker">the person behind the products!</p>
            <h2 className="pixel">ABOUT ME</h2>
            <p className="about-bio">
              8 年业务一线与增长实战，现专注 AI 产品。擅长从复杂场景中识别高价值需求，用 PRD、RAG、智能体与工作流快速做出可验证产品。
            </p>

            <div className="about-capabilities" aria-label="核心能力">
              {capabilities.map((capability) => (
                <span className="mono" key={capability}>{capability}</span>
              ))}
            </div>

            <p className="mono about-toolHint">MY AI TOOLBOX · DRAG TO ROTATE ↔</p>
          </div>

          <div className="about-visual">
            <Image
              src="/assets/about/about-me-ai-tools.png"
              alt="马俊龙托起 AI 工具云的个人插画"
              width={1254}
              height={1254}
              sizes="(max-width: 900px) 100vw, 58vw"
              className="about-portrait"
            />
            <div className="about-cloud">
              <IconCloud icons={cloudIcons} copies={2} />
            </div>
          </div>
        </div>
        </Backlight>
      </div>

      <style>{`
        .about{padding:56px 0 48px;overflow:visible}
        .about-layout{display:grid;grid-template-columns:minmax(330px,.72fr) minmax(520px,1fr);align-items:stretch;border:2px solid #17120f;background:#fff;box-shadow:10px 10px 0 #35c5ec;overflow:hidden}
        .about-copy{display:flex;flex-direction:column;justify-content:center;padding:clamp(42px,5vw,76px);background:linear-gradient(145deg,rgba(244,197,78,.16),transparent 48%)}
        .about-kicker{color:#ed185a;font-size:clamp(24px,2.3vw,32px);line-height:1;margin:0 0 16px;transform:rotate(-2deg);transform-origin:left center}
        .about-copy h2{font-size:clamp(54px,6.1vw,92px);line-height:.83;letter-spacing:-.07em;margin:0 0 32px;white-space:nowrap}
        .about-bio{max-width:490px;font-size:clamp(15px,1.25vw,18px);line-height:1.75;margin:0 0 34px;color:rgba(24,19,15,.82)}
        .about-capabilities{display:flex;flex-wrap:wrap;gap:9px;margin-bottom:38px}
        .about-capabilities span{border:1px solid #17120f;background:#fff;padding:8px 10px;font-size:10px;font-weight:700;box-shadow:3px 3px 0 #17120f}
        .about-capabilities span:nth-child(1){background:#f4c54e}
        .about-capabilities span:nth-child(2){background:#35c5ec}
        .about-capabilities span:nth-child(3){background:#ed185a;color:#fff}
        .about-capabilities span:nth-child(4){background:#43c98a}
        .about-toolHint{align-self:flex-start;border-top:1px solid #17120f;padding-top:13px;font-size:9px;font-weight:700;letter-spacing:.08em;margin:0}
        .about-visual{position:relative;align-self:center;aspect-ratio:1;background:#fff;overflow:hidden}
        .about-portrait{display:block;width:100%;height:auto}
        .about-cloud{position:absolute;z-index:2;left:23.5%;top:54%;width:28%;aspect-ratio:1;transform:translate(-50%,-50%);filter:drop-shadow(0 10px 14px rgba(53,197,236,.12))}
        @media(max-width:900px){
          .about{padding:48px 0 44px}
          .about-layout{grid-template-columns:1fr}
          .about-copy{padding:48px 34px 42px;border-bottom:1px solid #17120f}
          .about-copy h2{font-size:clamp(54px,13vw,82px);white-space:normal}
          .about-bio{max-width:680px}
          .about-visual{width:100%}
        }
        @media(max-width:480px){
          .about{padding:40px 0 38px}
          .about-layout{box-shadow:7px 7px 0 #35c5ec}
          .about-copy{padding:36px 24px 32px}
          .about-kicker{font-size:23px}
          .about-copy h2{font-size:52px;margin-bottom:24px}
          .about-bio{font-size:14px;line-height:1.7;margin-bottom:28px}
          .about-capabilities{gap:7px;margin-bottom:30px}
          .about-capabilities span{padding:7px 8px;font-size:9px;box-shadow:2px 2px 0 #17120f}
          .about-toolHint{font-size:8px}
        }
      `}</style>
    </section>
  );
}
