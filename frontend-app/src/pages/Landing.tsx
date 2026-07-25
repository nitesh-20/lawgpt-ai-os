import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  ArrowRight, 
  Terminal, 
} from "lucide-react";
import { motion } from "framer-motion";

const Landing = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <div className="min-h-screen bg-white text-neutral-800 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/5 rounded-full blur-[160px] pointer-events-none" />

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000003_1px,transparent_1px),linear-gradient(to_bottom,#00000003_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 max-w-5xl mx-auto w-full px-6 md:px-8 h-20 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
            <span className="text-white font-sans font-bold text-sm">L</span>
          </div>
          <span className="text-sm font-sans font-bold text-neutral-900 tracking-tight">LawGPT <span className="text-[10px] text-primary uppercase font-mono px-1.5 py-0.5 bg-primary/10 rounded ml-1">OS</span></span>
        </div>
        <Button onClick={() => navigate("/dashboard")} className="btn-primary">
          Launch Workspace
          <ArrowRight className="ml-1.5 h-3 w-3" />
        </Button>
      </header>

      {/* Main Hero & Content */}
      <main className="relative z-10 flex-1 flex flex-col justify-center max-w-5xl mx-auto w-full px-6 md:px-8 py-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 items-center"
        >
          {/* Left Hero Column */}
          <div className="text-left space-y-6">
            <motion.div variants={itemVariants} className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-100 border border-border rounded">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              <span className="text-[9px] font-mono uppercase tracking-wider text-neutral-500">Secured Production Environment</span>
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.1] text-neutral-900">
              The AI Operating System for Modern Law.
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-xs text-neutral-500 max-w-xl leading-relaxed">
              Synthesize dossiers, stream agent actions, query legislation via Vector RAG, and audit risk boundaries with millisecond latencies. Completely authenticated, fully integrated.
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button onClick={() => navigate("/dashboard")} size="lg" className="btn-primary px-6 rounded">
                Enter Command Center
                <ArrowRight className="ml-2 h-4 w-4 text-white" />
              </Button>
              <Button onClick={() => navigate("/chat")} size="lg" variant="outline" className="border-border hover:bg-neutral-50 text-neutral-800 rounded">
                Consult Assistant
              </Button>
            </motion.div>
          </div>

          {/* Right Preview Column (Linear-style Mock System Panel) */}
          <motion.div 
            variants={itemVariants}
            className="w-full bg-white border border-border rounded p-6 shadow-md relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-primary/5 rounded-full blur-[50px] pointer-events-none" />
            <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-primary" />
                <span className="text-[9px] font-mono tracking-wider text-neutral-500 uppercase font-semibold">Agent Telemetry Console</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span className="text-[9px] font-mono text-emerald-600 font-semibold">STABLE</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-3.5 rounded bg-neutral-50 border border-border hover:border-neutral-300 transition-all">
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-neutral-800">Orchestrator Intent Sync</span>
                  <span className="text-primary text-[9px] font-mono">100% SUCCESS</span>
                </div>
                <p className="text-[10px] font-mono text-neutral-500 leading-relaxed">
                  [agent-core]: Resolving contract structure for draft file: MSA_Q3_V2.docx
                </p>
              </div>

              <div className="p-3.5 rounded bg-neutral-50 border border-border hover:border-neutral-300 transition-all">
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-neutral-800">Regulatory RAG Indexer</span>
                  <span className="text-primary text-[9px] font-mono">220ms RETRIEVAL</span>
                </div>
                <p className="text-[10px] font-mono text-neutral-500 leading-relaxed">
                  [rag-search]: Queried Central Act Section 42A. Match score: 0.942. Returning references.
                </p>
              </div>

              <div className="p-3.5 rounded bg-neutral-50 border border-border hover:border-neutral-300 transition-all">
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-neutral-800">Firebase Security Check</span>
                  <span className="text-emerald-600 text-[9px] font-mono">ACTIVE BYPASS</span>
                </div>
                <p className="text-[10px] font-mono text-neutral-500 leading-relaxed">
                  [auth-provider]: Running in dev/testing mode. UID test_user authenticated.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-8 text-center bg-neutral-50/50">
        <p className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest">
          LawGPT AI OS • Enterprise Ready • Powered by FastAPI & Gemini
        </p>
      </footer>
    </div>
  );
};

export default Landing;
