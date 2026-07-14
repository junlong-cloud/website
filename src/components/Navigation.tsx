const HomeIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4 fill-current">
    <path d="M1 7.2 8 1l7 6.2V15h-4v-4H5v4H1V7.2Z" />
  </svg>
);

const AboutIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4 fill-current">
    <circle cx="8" cy="5" r="3" />
    <path d="M2 15c.4-3.7 2.4-5.5 6-5.5s5.6 1.8 6 5.5H2Z" />
  </svg>
);

const NavMark = ({ children }: { children: React.ReactNode }) => (
  <span aria-hidden="true" className="pixel text-[19px] leading-none">{children}</span>
);

export function Navigation() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 h-12 overflow-x-auto border-b border-black/20 bg-white">
      <nav aria-label="Primary navigation" className="flex h-full min-w-max items-stretch">
        <a href="#home" aria-label="Ma Junlong home" className="pixel flex w-[54px] shrink-0 items-center justify-center border-r border-black/15 text-[22px] tracking-[-5px] md:w-[66px] md:text-[24px]">
          JL
        </a>
        <a href="#home" className="mono flex items-center gap-2 border-r border-black/15 bg-[#36c5ec] px-3 text-[11px] font-bold uppercase md:gap-3 md:px-4 md:text-[12px]">
          <HomeIcon /> <span>Home</span>
        </a>
        <a href="#app-works" className="mono flex items-center gap-2 border-r border-black/15 px-3 text-[11px] font-bold uppercase md:gap-3 md:px-4 md:text-[12px]">
          <NavMark>✣</NavMark><span>App Works</span>
        </a>
        <a href="#web-works" className="mono flex items-center gap-2 border-r border-black/15 px-3 text-[11px] font-bold uppercase md:gap-3 md:px-4 md:text-[12px]">
          <NavMark>▤</NavMark><span>Web Works</span>
        </a>
        <a href="#about" className="mono flex items-center gap-2 border-r border-black/15 px-3 text-[11px] font-bold uppercase md:gap-3 md:px-4 md:text-[12px]">
          <AboutIcon /> <span>About Me</span>
        </a>
      </nav>
    </header>
  );
}
