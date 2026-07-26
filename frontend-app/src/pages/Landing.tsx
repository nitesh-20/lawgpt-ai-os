import { useLenis } from "@/hooks/useLenis";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import { AIWorkspace, Capabilities, Trust, Workflow, FinalCTA } from "@/components/landing/Sections";

const Landing = () => {
  useLenis();

  return (
    <div className="min-h-screen bg-[#050506]">
      <Navbar />
      <main>
        <Hero />
        <AIWorkspace />
        <Capabilities />
        <Trust />
        <Workflow />
        <FinalCTA />
      </main>
    </div>
  );
};

export default Landing;
