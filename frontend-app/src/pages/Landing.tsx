import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ScrollText,
  Gavel,
  ShieldCheck,
  BookOpenCheck,
  FileEdit,
} from "lucide-react";
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
  <nav className="fixed w-full bg-background/95 backdrop-blur-sm border-b border-border z-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-[72px]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
            <span className="text-primary-foreground font-serif font-semibold text-sm">L</span>
          </div>
          <span className="text-lg font-serif font-semibold text-ink tracking-tight">LawGPT</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <Button asChild>
            <Link to="/dashboard">
              Start for free
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
  <div id="trust" className="border-y border-border py-10">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <p className="text-center text-xs text-muted-foreground mb-6">Used by legal teams at</p>
      <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
        {FIRMS.map((firm) => (
          <div key={firm.name} className="flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity">
            <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="11" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="1.25" />
              <text
                x="12"
                y="16"
                textAnchor="middle"
                fontSize="9"
                fontFamily="'Source Serif 4', Georgia, serif"
                fontWeight="600"
                fill="hsl(var(--muted-foreground))"
              >
                {firm.initials}
              </text>
            </svg>
            <span className="font-serif text-sm text-muted-foreground">{firm.name}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const WORKFLOW_STEPS = [
  {
    verb: "Ask",
    body: "Open a case and ask what needs attention. LawGPT surfaces what changed, what's at risk, and what's due, in one briefing.",
  },
  {
    verb: "Verify",
    body: "Every answer arrives with its sources and reasoning already visible, so checking it is faster than trusting it blindly.",
  },
  {
    verb: "Draft",
    body: "Generate filings and correspondence grounded in the case record, ready for review rather than a blank page.",
  },
  {
    verb: "Decide",
    body: "You approve what moves forward. Approved work becomes part of the official record; nothing is promoted silently.",
  },
];

const Workflow = () => (
  <div id="workflow" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,380px)_1fr] gap-12 lg:gap-20">
      <div>
        <h2 className="font-serif text-3xl font-semibold text-ink mb-4 text-balance">
          Built around one question
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Open a case and ask what you need to know. That single ritual replaces the morning spent
          hunting across folders, inboxes, and calendars.
        </p>
      </div>
      <div className="divide-y divide-border border-t border-border">
        {WORKFLOW_STEPS.map((step) => (
          <div key={step.verb} className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-2 sm:gap-8 py-6">
            <h3 className="font-serif text-xl font-semibold text-ink">{step.verb}</h3>
            <p className="text-muted-foreground leading-relaxed text-[15px]">{step.body}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const AGENTS = [
  {
    icon: BookOpenCheck,
    name: "Legal Research",
    description: "Searches statutes, case law, and prior judgments for the matter at hand.",
    tone: "bg-primary/5 border-primary/15",
  },
  {
    icon: FileEdit,
    name: "Drafting",
    description: "Generates and revises document language grounded in the case record.",
    tone: "bg-accent/5 border-accent/15",
  },
  {
    icon: ShieldCheck,
    name: "Compliance",
    description: "Checks drafted documents against regulatory requirements before they leave your desk.",
    tone: "bg-primary/5 border-primary/15",
  },
  {
    icon: Gavel,
    name: "Risk Analysis",
    description: "Flags uncapped liability and other high-exposure clauses for review.",
    tone: "bg-accent/5 border-accent/15",
  },
];

const Agents = () => (
  <div id="agents" className="bg-secondary/30 border-y border-border py-24">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mb-12">
        <h2 className="font-serif text-3xl font-semibold text-ink mb-4 text-balance">
          Specialist agents, one orchestrator
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          A single request routes across the agents below in parallel. You see which agent did what,
          not just a finished answer.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {AGENTS.map((agent) => (
          <div key={agent.name} className={`rounded-lg border p-6 ${agent.tone}`}>
            <agent.icon className="h-6 w-6 text-primary mb-4" strokeWidth={1.75} />
            <h3 className="font-serif text-lg font-semibold text-ink mb-1.5">{agent.name}</h3>
            <p className="text-muted-foreground text-[15px] leading-relaxed">{agent.description}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const Verification = () => (
  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
    <ScrollText className="h-8 w-8 text-primary mx-auto mb-6" strokeWidth={1.5} />
    <h2 className="font-serif text-3xl md:text-4xl font-semibold text-ink mb-5 text-balance">
      Built to be checked, not just trusted
    </h2>
    <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto">
      Every conclusion arrives with its reasoning, sources, and open questions already visible.
      AI accelerates the judgment. The judgment stays yours.
    </p>
  </div>
);

const Testimonial = () => (
  <div className="bg-secondary/30 border-y border-border py-20">
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <p className="font-serif text-3xl text-primary/30 leading-none mb-4">&ldquo;</p>
      <p className="font-serif text-xl text-ink leading-relaxed mb-6 text-balance">
        The briefing view is the first thing I open on every case now. It tells me what changed
        overnight instead of me hunting for it.
      </p>
      <p className="font-medium text-sm text-ink">Renata Okafor</p>
      <p className="text-sm text-muted-foreground">General Counsel, Kessler &amp; Vane</p>
    </div>
  </div>
);

const CTA = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
    <h2 className="font-serif text-3xl md:text-4xl font-semibold text-ink mb-4 text-balance">
      Bring your caseload into one record
    </h2>
    <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
      Cases, documents, and compliance in one system, with AI built into the parts of the job
      that eat the most time.
    </p>
    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
      <Button size="lg" asChild>
        <Link to="/dashboard">
          Start for free
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
      <Button size="lg" variant="outline" asChild>
        <Link to="/demo">Book a demo</Link>
      </Button>
    </div>
  </div>
);

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main>
        <div id="platform" className="pt-24 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-12 lg:gap-16 items-center">
              <div className="text-center lg:text-left fade-in">
                <p className="text-xs font-medium uppercase tracking-widest text-accent mb-5">
                  AI-assisted legal practice management
                </p>
                <h1 className="font-serif text-5xl md:text-6xl font-semibold text-ink leading-[1.05] mb-6 text-balance">
                  The record of every case, drafted, checked, and searchable in one place.
                </h1>
                <p className="text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed">
                  LawGPT keeps cases, documents, and compliance in a single system of record, with
                  AI assistance built into the parts of the job that eat the most time.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                  <Button size="lg" className="w-full sm:w-auto" asChild>
                    <Link to="/dashboard">
                      Start for free
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
                    <Link to="/demo">Book a demo</Link>
                  </Button>
                </div>
              </div>

              <div className="flex justify-center lg:justify-end">
                <HeroDocumentPreview document={heroDocumentPreview} />
              </div>
            </div>
          </div>
        </div>

        <TrustedBy />
        <Workflow />
        <Agents />
        <Verification />
        <Testimonial />
        <CTA />
      </main>

      <footer className="bg-background border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-medium text-sm text-ink mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#platform" className="text-muted-foreground hover:text-foreground transition-colors">Platform</a></li>
                <li><a href="#workflow" className="text-muted-foreground hover:text-foreground transition-colors">Workflow</a></li>
                <li><a href="#agents" className="text-muted-foreground hover:text-foreground transition-colors">Agents</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-sm text-ink mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Documentation</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">API</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Guides</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-sm text-ink mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-sm text-ink mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Privacy</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Terms</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground text-center">© 2026 LawGPT. All rights reserved.</p>
              <div className="flex gap-4 text-sm">
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Twitter</a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">LinkedIn</a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">GitHub</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
