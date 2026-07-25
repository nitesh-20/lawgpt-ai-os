import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, LineChart, Users, Shield } from "lucide-react";
import HeroDocumentPreview from "@/components/landing/HeroDocumentPreview";
import { heroDocumentPreview } from "@/data/heroDocumentPreview";

const Navbar = () => (
  <nav className="fixed w-full bg-background/95 backdrop-blur-sm border-b border-border z-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
            <span className="text-primary-foreground font-serif font-semibold text-sm">L</span>
          </div>
          <span className="text-lg font-serif font-semibold text-ink tracking-tight">LawGPT</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm">
          <button className="text-muted-foreground hover:text-foreground transition-colors">Product</button>
          <button className="text-muted-foreground hover:text-foreground transition-colors">Resources</button>
          <button className="text-muted-foreground hover:text-foreground transition-colors">Pricing</button>
          <button className="text-muted-foreground hover:text-foreground transition-colors">Integrations</button>
        </div>
        <div className="flex items-center gap-4">
          <Button asChild>
            <Link to="/dashboard">
              Get started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  </nav>
);

const Stats = () => (
  <div className="border-t border-border">
    <div className="grid grid-cols-1 md:grid-cols-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {[
        { number: "32", label: "hours saved per month per team", standout: false },
        { number: "44%", label: "cost reduction on routine tasks", standout: false },
        { number: "+2.4", label: "NPS improvement", standout: false },
        { number: "100k+", label: "clauses reviewed to date", standout: true },
      ].map((stat, i) => (
        <div
          key={i}
          className={`py-12 px-6 ${i !== 0 ? "md:border-l border-border" : ""}`}
        >
          <div className={`text-4xl font-mono font-medium mb-2 ${stat.standout ? "text-accent" : "text-ink"}`}>
            {stat.number}
          </div>
          <p className="text-sm text-muted-foreground">{stat.label}</p>
        </div>
      ))}
    </div>
  </div>
);

const Testimonials = () => (
  <div className="bg-secondary/40 border-y border-border py-20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="font-serif text-3xl font-semibold text-center mb-12 text-ink text-balance">Trusted by legal teams worldwide</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            name: "Sarah Johnson",
            role: "Legal Director, LexCorp",
            content: "LawGPT has transformed how we handle legal documentation. The insights are invaluable to our review process."
          },
          {
            name: "Michael Chen",
            role: "Senior Partner, Chen & Associates",
            content: "The automation capabilities have saved us countless hours. It's like having an extra associate on every matter."
          },
          {
            name: "Emma Williams",
            role: "Legal Tech Lead, Justice Firm",
            content: "The integration was seamless, and the results were immediate. Highly recommend for any legal team."
          }
        ].map((testimonial, i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-6">
            <p className="font-serif text-3xl text-primary/30 leading-none mb-2">&ldquo;</p>
            <p className="text-foreground mb-6 -mt-4">{testimonial.content}</p>
            <div className="pt-4 border-t border-border">
              <p className="font-medium text-sm text-ink">{testimonial.name}</p>
              <p className="text-sm text-muted-foreground">{testimonial.role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const Features = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
    <h2 className="font-serif text-3xl font-semibold text-center mb-12 text-ink text-balance">Built for how legal teams already work</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border border border-border rounded-lg overflow-hidden">
      {[
        {
          icon: LineChart,
          title: "Case analytics",
          description: "See case load, hearing schedules, and document status at a glance, without digging through folders."
        },
        {
          icon: Users,
          title: "Team collaboration",
          description: "Assign cases, share documents, and keep every associate working from the same record."
        },
        {
          icon: Shield,
          title: "Compliance checks",
          description: "Run drafted documents against regulatory requirements before they leave your desk."
        }
      ].map((feature, i) => (
        <div key={i} className="p-8 bg-card">
          <feature.icon className="h-6 w-6 text-primary mb-4" strokeWidth={1.75} />
          <h3 className="font-serif text-lg font-semibold mb-2 text-ink">{feature.title}</h3>
          <p className="text-muted-foreground text-[15px] leading-relaxed">{feature.description}</p>
        </div>
      ))}
    </div>
  </div>
);

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main>
        {/* Hero Section */}
        <div className="pt-40 pb-24">
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
                  LawGPT keeps cases, documents, and compliance in a single system of record, with AI assistance built into the parts of the job that eat the most time.
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

        <Stats />
        <Features />
        <Testimonials />
      </main>

      {/* Footer */}
      <footer className="bg-background border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-medium text-sm text-ink mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Integrations</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a></li>
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
