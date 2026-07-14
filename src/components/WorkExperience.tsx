const experiences = [
  { period: "2026 — NOW", role: "AI 产品独立实践", company: "INDEPENDENT · JINAN", summary: "聚焦真实业务场景，持续实践 RAG、提示词工程与 Agent，完成从需求洞察、PRD 到产品验证的独立交付。", skills: ["Claude Code", "Coze", "PRD"] },
  { period: "2026.2 — 2026.5", role: "营销策划总监", company: "展帮主地产智库平台", summary: "负责 30 万+ 粉丝地产 IP 矩阵内容策略，操盘两场千人峰会实现近千万营收，并设计四层增长模型。", skills: ["内容策略", "增长模型", "IP 运营"] },
  { period: "2017 — 2025", role: "项目营销经理", company: "中海地产 · 济南", summary: "从管培生成长为项目营销经理：独立操盘多个项目全周期，覆盖市场研判、产品定位、渠道搭建到开盘推售管控，并从 0 到 1 组建团队、搭建标准化流程与 KPI 考核体系。", skills: ["全周期操盘", "团队管理", "策略定位"] },
];

export function WorkExperience() {
  return (
    <section id="experience" className="xp grid-paper">
      <div className="section-shell">
        <header className="xp-head">
          <div><p className="hand">where I&apos;ve been!</p><h2 className="pixel">WORK<br />EXPERIENCE</h2></div>
          <p className="xp-note mono">FROM REAL ESTATE<br />TO AI PRODUCTS.</p>
        </header>
        <div className="xp-list">
          {experiences.map((item, index) => (
            <article className="xp-row" key={item.period}>
              <div className={`xp-index i${index + 1} pixel`}>0{index + 1}</div>
              <time className="mono">{item.period}</time>
              <div className="xp-main"><p className="mono">{item.company}</p><h3>{item.role}</h3><p>{item.summary}</p></div>
              <div className="xp-skills">{item.skills.map(skill => <span key={skill}>{skill}</span>)}</div>
            </article>
          ))}
        </div>
        <div className="xp-end mono"><span>OPEN TO AI PM ROLES · JINAN</span><a href="#home" className="pixel">JL</a><span>© {new Date().getFullYear()}</span></div>
      </div>
      <style>{`
        .xp{background-color:#fff;color:#18130f;padding:64px 0 28px;overflow:hidden}
        .xp-head{display:grid;grid-template-columns:1fr auto;align-items:end;gap:40px;margin-bottom:85px}
        .xp-head .hand{color:#43c98a;font-size:29px;margin:0 0 8px}.xp-head h2{font-size:clamp(58px,8vw,118px);line-height:.78;letter-spacing:-.075em;margin:0}
        .xp-note{background:#f4c54e;color:#17120f;border:2px solid #17120f;box-shadow:5px 5px 0 #ed185a;padding:16px 20px;font-size:11px;line-height:1.45;transform:rotate(3deg);margin:0 8px 8px 0}
        .xp-list{border-top:1px solid #18130f}.xp-row{display:grid;grid-template-columns:78px 150px minmax(280px,1fr) minmax(230px,.55fr);align-items:center;gap:24px;min-height:210px;border-bottom:1px solid #18130f;padding:28px 0;transition:background .25s,padding .25s}
        .xp-row:hover{background:#f7f4ed;padding-left:18px;padding-right:18px}.xp-index{display:grid;place-items:center;width:58px;height:58px;border:1px solid #18130f;font-size:21px}.i1{background:#35c5ec;color:#17120f}.i2{background:#ed185a;color:#fff}.i3{background:#43c98a;color:#17120f}
        .xp-row time{font-size:11px}.xp-main>p:first-child{font:10px var(--font-mono);text-transform:uppercase;opacity:.7;margin:0 0 8px}.xp-main h3{font-size:clamp(27px,3vw,46px);line-height:1;margin:0 0 14px;letter-spacing:-.05em}.xp-main>p:last-child{max-width:620px;font-size:13px;line-height:1.45;margin:0;opacity:.8}
        .xp-skills{display:flex;justify-content:flex-end;flex-wrap:wrap;gap:7px}.xp-skills span{border:1px solid currentColor;padding:6px 9px;font:9px var(--font-mono);text-transform:uppercase}
        .xp-end{display:grid;grid-template-columns:1fr auto 1fr;align-items:end;padding-top:48px;font-size:9px}.xp-end a{font-size:82px;line-height:.65}.xp-end span:last-child{text-align:right}
        @media(max-width:760px){.xp{padding-top:52px}.xp-head{grid-template-columns:1fr;margin-bottom:55px}.xp-head h2{font-size:55px}.xp-note{justify-self:start}.xp-row{grid-template-columns:58px 1fr;gap:15px;min-height:0;padding:28px 0}.xp-row time{align-self:center}.xp-main,.xp-skills{grid-column:1/-1}.xp-skills{justify-content:flex-start}.xp-row:hover{padding-left:10px;padding-right:10px}.xp-end{grid-template-columns:1fr auto}.xp-end a{font-size:58px;grid-row:1/span 2;grid-column:2}.xp-end span:last-child{text-align:left}}
      `}</style>
    </section>
  );
}
