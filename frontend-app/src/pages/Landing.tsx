import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ScrollText,
  Gavel,
  ShieldCheck,
  BookOpenCheck,
  FileEdit,
  Activity,
  Cpu,
  Layers,
  Search,
} from "lucide-react";
import { motion } from "framer-motion";
import HeroDocumentPreview from "@/components/landing/HeroDocumentPreview";

const heroDocumentPreview = {
  title: "Master Services Agreement",
  type: "Contract Draft",
  status: "Review Pending",
  clauses: [
    { id: "c1", title: "Indemnification", text: "Party A shall indemnify Party B against all claims arising from...", status: "flagged" },
    { id: "c2", title: "Confidentiality", text: "Both parties agree to maintain strict confidentiality regarding...", status: "approved" },
    { id: "c3", title: "Term and Termination", text: "This agreement shall commence on the Effective Date...", status: "pending" },
  ]
};

const NAV_LINKS = [
  { label: "Platform", href: "#platform" },
  { label: "Workflow", href: "#workflow" },
  { label: "Agents", href: "#agents" },
  { label: "Trust", href: "#trust" },
];

const Navbar = () => (
  <nav className="fixed w-full bg-background/85 backdrop-blur-md border-b border-border/60 z-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-[72px]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-tr from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-primary-foreground font-serif font-semibold text-sm">L</span>
          </div>
          <span className="text-lg font-serif font-bold text-ink tracking-tight">LawGPT</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              {link.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <Button asChild className="rounded-xl shadow-sm">
            <Link to="/dashboard">
              Enter Workspace
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  </nav>
);

const FIRMS = [
  { name: "Kessler & Vane", initials: "KV" },
  { name: "Meridian Counsel", initials: "MC" },
  { name: "Osprey & Cole", initials: "OC" },
  { name: "Thornfield LLP", initials: "TL" },
  { name: "Fenwick Rowe", initials: "FR" },
];

const TrustedBy = () => (
  <div id="trust" className="border-y border-border py-12 bg-secondary/5">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <p className="text-center text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-8">Used by legal teams at</p>
      <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
        {FIRMS.map((firm) => (
          <div key={firm.name} className="flex items-center gap-2.5 opacity-65 hover:opacity-100 transition-opacity">
            <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="11" fill="none" stroke="currentColor" strokeWidth="1.25" className="text-muted-foreground" />
              <text
                x="12"
                y="15.5"
                textAnchor="middle"
                fontSize="9.5"
                fontFamily="'Source Serif 4', Georgia, serif"
                fontWeight="600"
                fill="currentColor"
                className="text-muted-foreground"
              >
                {firm.initials}
              </text>
            </svg>
            <span className="font-serif text-sm font-semibold text-muted-foreground">{firm.name}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const WORKFLOW_STEPS = [
  {
    verb: "Query",
    body: "Run complex semantic checks against active Indian Penal Code (IPC) and Central Acts. Retain citations natively.",
  },
  {
    verb: "Verify",
    body: "AI logs every agent intent, latency execution log, and query parameter directly, preventing opaque response bias.",
  },
  {
    verb: "Refine",
    body: "Evaluate contract files with structural analysis. Automatically flags critical risk factors, legal limits, and out-of-scope clauses.",
  },
];

const Workflow = () => (
  <div id="workflow" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,380px)_1fr] gap-12 lg:gap-20">
      <div>
        <h2 className="font-serif text-3xl font-bold text-ink mb-4 leading-tight">
          Traceable Intelligence
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Open a docket and audit query flows. LawGPT structures all legal documents, summaries, and agent intents into a clean vector space.
        </p>
      </div>
      <div className="divide-y divide-border border-t border-border">
        {WORKFLOW_STEPS.map((step, idx) => (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            key={step.verb} 
            className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-2 sm:gap-8 py-6"
          >
            <h3 className="font-serif text-xl font-bold text-ink">{step.verb}</h3>
            <p className="text-muted-foreground leading-relaxed text-sm">{step.body}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);

const AGENTS = [
  {
    icon: BookOpenCheck,
    name: "Legal Research",
    description: "Searches statutes, case law, and prior judgments using advanced vector embedding retrieval.",
  },
  {
    icon: FileEdit,
    name: "Contract Drafting",
    description: "Generates custom contract outlines and drafts instantly with structural consistency checks.",
  },
  {
    icon: ShieldCheck,
    name: "Compliance Audit",
    description: "Checks drafted documents against regulatory frameworks including SEBI, FEMA, and custom compliance lists.",
  },
  {
    icon: Gavel,
    name: "Dossier Registry",
    description: "Maintains active case timelines, client hearings, and document records in Firebase Firestore.",
  },
];

const Agents = () => (
  <div id="agents" className="bg-secondary/20 border-y border-border py-24">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mb-16">
        <h2 className="font-serif text-3xl font-bold text-ink mb-4">
          Integrated Legal Frameworks
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Multiple sub-agents operate under a single central orchestrator. Follow intent pathways, check status execution logs, and analyze latency curves.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {AGENTS.map((agent, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            key={agent.name} 
            className="rounded-2xl border border-border/70 p-6 bg-card/40 backdrop-blur-md shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center mb-4">
              <agent.icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
            </div>
            <h3 className="font-serif text-lg font-bold text-ink mb-2">{agent.name}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{agent.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main>
        <div id="platform" className="pt-32 pb-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-12 lg:gap-16 items-center">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center lg:text-left"
              >
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-primary/5 border border-primary/10 rounded-full mb-6">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-ping" />
                  <span className="text-2xs font-semibold uppercase tracking-wider text-primary">Enterprise Legal OS</span>
                </div>
                <h1 className="font-serif text-5xl md:text-6xl font-bold text-ink leading-[1.05] mb-6 text-balance tracking-tight">
                  Integrated legal intelligence, mapped end-to-end.
                </h1>
                <p className="text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
                  LawGPT unites dossiers, semantic research, regulatory compliance checks, and drafting into a single authenticated system of record.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                  <Button size="lg" className="w-full sm:w-auto rounded-xl shadow-sm" asChild>
                    <Link to="/dashboard">
                      Enter Workspace
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.55 }}
                className="flex justify-center lg:justify-end"
              >
                <HeroDocumentPreview document={heroDocumentPreview} />
              </motion.div>
            </div>
          </div>
        </div>

        <TrustedBy />
        <Workflow />
        <Agents />
      </main>
    </div>
  );
};

export default Landing;
