import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ShieldCheck,
  Search,
  Bot,
  Cpu,
  Terminal,
  Activity,
  ChevronRight,
  Lock,
} from "lucide-react";
import { motion } from "framer-motion";

const Landing = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute -top-[10%] -left-[10%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 md:px-8 h-20 flex items-center justify-between border-b border-white/[0.04]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center">
            <span className="text-white font-sans font-bold text-sm">L</span>
          </div>
          <span className="text-lg font-sans font-bold text-white tracking-tight">LawGPT <span className="text-[10px] text-primary uppercase font-mono px-1.5 py-0.5 bg-primary/10 rounded ml-1">OS</span></span>
        </div>
        <Button onClick={() => navigate("/dashboard")} className="bg-white hover:bg-white/90 text-black rounded-lg text-xs font-semibold px-4 py-2 transition-all">
          Launch Workspace
          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
        </Button>
      </header>

      {/* Main Hero & Content */}
      <main className="relative z-10 flex-1 flex flex-col justify-center max-w-7xl mx-auto w-full px-6 md:px-8 py-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-16 items-center"
        >
          {/* Left Hero Column */}
          <div className="text-left space-y-6">
            <motion.div variants={itemVariants} className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/[0.04] border border-white/[0.06] rounded-full">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-primary-foreground/80">Secured Production Environment</span>
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.05] text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-400">
              The AI Operating System for Modern Law.
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-base text-muted-foreground/80 max-w-xl leading-relaxed">
              Synthesize dossiers, stream agent actions, query legislation via Vector RAG, and audit risk boundaries with millisecond latencies. Completely authenticated, fully integrated.
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button onClick={() => navigate("/dashboard")} size="lg" className="bg-primary hover:bg-primary/95 text-white shadow-lg shadow-primary/20 rounded-xl px-6">
                Enter Command Center
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button onClick={() => navigate("/chat")} size="lg" variant="outline" className="border-white/[0.08] hover:bg-white/[0.04] text-white rounded-xl">
                Consult Legal Assistant
              </Button>
            </motion.div>
          </div>

          {/* Right Preview Column (Linear-style Mock System Panel) */}
          <motion.div 
            variants={itemVariants}
            className="w-full bg-[#0d0d11]/80 border border-white/[0.08] rounded-2xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-md"
          >
            <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-primary/5 rounded-full blur-[50px] pointer-events-none" />
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.06] mb-6">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-primary" />
                <span className="text-2xs font-mono tracking-wider text-muted-foreground uppercase">Agent Telemetry Console</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span className="text-3xs font-mono text-emerald-500">STABLE</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-all">
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-white">Orchestrator Intent Sync</span>
                  <span className="text-primary text-[10px] font-mono">100% SUCCESS</span>
                </div>
                <p className="text-3xs font-mono text-muted-foreground/80 leading-relaxed">
                  [agent-core]: Resolving contract structure for draft file: MSA_Q3_V2.docx
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-all">
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-white">Regulatory RAG Indexer</span>
                  <span className="text-primary text-[10px] font-mono">220ms RETRIEVAL</span>
                </div>
                <p className="text-3xs font-mono text-muted-foreground/80 leading-relaxed">
                  [rag-search]: Queried Central Act Section 42A. Match score: 0.942. Returning references.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-all">
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-white">Firebase Security Check</span>
                  <span className="text-emerald-500 text-[10px] font-mono">BYPASS GRANTED</span>
                </div>
                <p className="text-3xs font-mono text-muted-foreground/80 leading-relaxed">
                  [auth-provider]: Running in dev/testing mode. UID test_user authenticated.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.04] py-8 text-center">
        <p className="text-3xs font-mono text-muted-foreground/40 uppercase tracking-widest">
          LawGPT AI OS • Enterprise Ready • Powered by FastAPI & Gemini
        </p>
      </footer>
    </div>
  );
};

export default Landing;
