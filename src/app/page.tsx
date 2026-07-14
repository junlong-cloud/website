import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { AppWorks } from "@/components/AppWorks";
import { AboutMe } from "@/components/AboutMe";
import { WebWorks } from "@/components/WebWorks";
import { WorkExperience } from "@/components/WorkExperience";
import { TerminalLoader } from "@/components/TerminalLoader";
import { RevealManager } from "@/components/RevealManager";

export default function Home() {
  return (
    <main>
      <TerminalLoader />
      <RevealManager />
      <Navigation />
      <Hero />
      <AppWorks />
      <WebWorks />
      <AboutMe />
      <WorkExperience />
    </main>
  );
}
