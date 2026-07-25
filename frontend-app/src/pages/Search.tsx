import { useState, useEffect } from "react";
import { 
  Search as SearchIcon, Filter, Clock, BookOpen, Scale, Sparkles, 
  Loader2, FileText, CheckCircle2, AlertTriangle, ShieldAlert,
  Download, Copy, ExternalLink, Hash, BookMarked, Gavel
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  search, 
  getResearchHistory, 
  type ResearchReportResponse, 
  type ResearchContentType 
} from "@/services/research";
import { VoiceButton } from "@/components/voice/VoiceButton";

const Search = () => {
  const [query, setQuery] = useState("");
  const [contentType, setContentType] = useState<ResearchContentType>("all");
  const [jurisdiction, setJurisdiction] = useState("all");
  const [report, setReport] = useState<ResearchReportResponse | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const { toast } = useToast();

  const loadSidePanels = () => {
    getResearchHistory()
      .then(hist => setHistory(hist))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadSidePanels();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query);
  };

  const executeSearch = async (term: string) => {
    if (!term.trim()) return;
    setQuery(term);
    setIsSearching(true);
    setReport(null); // Clear previous
    try {
      const searchResult = await search({
        query: term,
        contentType,
        jurisdiction: jurisdiction === "all" ? undefined : jurisdiction
      });
      if (searchResult) {
        setReport(searchResult);
        toast({
          title: "Research Completed",
          description: "AI Research Report generated successfully.",
        });
      } else {
        toast({
          title: "No Results",
          description: "Could not find sufficient legal context.",
          variant: "destructive",
        });
      }
      loadSidePanels();
    } catch (error) {
      console.error(error);
      toast({
        title: "Search Failed",
        description: "Failed to query vector database.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const copyResearch = () => {
    if (!report) return;
    const text = `RESEARCH REPORT: ${query}\n\nSUMMARY\n${report.summary}\n\nKEY POINTS\n${(report.key_points || []).join("\n")}`;
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  const getRiskColor = (level: string) => {
    const l = (level || "").toLowerCase();
    if (l.includes("high") || l.includes("critical")) return "text-red-500 bg-red-50 border-red-200";
    if (l.includes("medium")) return "text-orange-500 bg-orange-50 border-orange-200";
    return "text-emerald-500 bg-emerald-50 border-emerald-200";
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto px-4 md:px-6 h-full flex flex-col">
      {/* Title Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Sparkles className="h-4.5 w-4.5 text-primary" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900">AI Legal Research</h1>
          </div>
          <p className="text-xs text-neutral-500 font-mono uppercase tracking-wider">
            Perplexity-Style Semantic Search
          </p>
        </div>
        {report && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={copyResearch} className="h-8 text-xs">
              <Copy className="h-3 w-3 mr-2" /> Copy
            </Button>
            <Button size="sm" className="h-8 text-xs btn-primary">
              <Download className="h-3 w-3 mr-2" /> Export PDF
            </Button>
          </div>
        )}
      </div>

      {/* 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pb-10">
        
        {/* LEFT COLUMN: Search & Filters (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="glass-card p-5 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-2">
              <SearchIcon className="h-4 w-4 text-primary" />
              New Research
            </h2>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="relative">
                <textarea
                  placeholder="Ask a complex legal question..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="input-premium w-full text-xs py-3 px-3 min-h-[100px] resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      executeSearch(query);
                    }
                  }}
                />
                <div className="absolute right-2 bottom-2 flex items-center gap-1.5">
                  <VoiceButton 
                    onTranscribe={(t) => {
                      setQuery(t);
                      executeSearch(t);
                    }}
                  />
                  <Button type="submit" disabled={isSearching || !query.trim()} className="h-7 px-3 btn-primary text-xs">
                    {isSearching ? <Loader2 className="h-3 w-3 animate-spin" /> : "Run"}
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-3xs font-mono uppercase text-neutral-500 flex items-center gap-1">
                    <Filter className="h-3 w-3" /> Scope
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {(["all", "cases", "statutes", "articles"] as ResearchContentType[]).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setContentType(type)}
                        className={`px-2.5 py-1 rounded-full text-3xs font-mono uppercase border transition-all ${
                          contentType === type 
                            ? "bg-primary text-white border-primary" 
                            : "bg-white text-neutral-600 border-border hover:bg-neutral-100"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-3xs font-mono uppercase text-neutral-500 flex items-center gap-1">
                    <Scale className="h-3 w-3" /> Jurisdiction
                  </label>
                  <select 
                    value={jurisdiction}
                    onChange={(e) => setJurisdiction(e.target.value)}
                    className="input-premium w-full py-2 text-xs"
                  >
                    <option value="all">All Jurisdictions</option>
                    <option value="Supreme Court">Supreme Court of India</option>
                    <option value="High Court">High Courts</option>
                    <option value="Tribunals">Appellate Tribunals</option>
                  </select>
                </div>
              </div>
            </form>
          </div>

          {/* Recent History in Left Col */}
          <div className="glass-card p-5 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Recent Threads
            </h2>
            <div className="space-y-1">
              {history.length > 0 ? (
                history.slice(0, 6).map((h, idx) => (
                  <button 
                    key={idx}
                    onClick={() => executeSearch(h.query || h)}
                    className="w-full text-left p-2 rounded hover:bg-neutral-50 text-xs text-neutral-600 hover:text-primary transition-all truncate flex items-center gap-2"
                  >
                    <SearchIcon className="h-3 w-3 opacity-50" />
                    {h.query || h}
                  </button>
                ))
              ) : (
                <div className="text-3xs text-neutral-400">No recent searches</div>
              )}
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: AI Research Report (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {isSearching ? (
            <div className="glass-card p-12 flex flex-col items-center justify-center text-center space-y-4 min-h-[400px]">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                <Sparkles className="h-6 w-6 text-primary animate-spin-slow" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900">Synthesizing Legal Research...</h3>
                <p className="text-xs text-neutral-500 mt-1">Retrieving chunks, ranking citations, and generating insights.</p>
              </div>
            </div>
          ) : report ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Answer Header */}
              <div className="glass-card p-6 border-t-4 border-t-primary">
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-primary text-white p-1.5 rounded-full">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <h2 className="text-lg font-bold text-neutral-900">Executive Summary</h2>
                </div>
                
                <div className="prose prose-sm prose-neutral max-w-none">
                  {report.summary.split('\n').map((paragraph, idx) => (
                    paragraph.trim() && <p key={idx} className="text-neutral-700 leading-relaxed mb-3">{paragraph}</p>
                  ))}
                </div>
              </div>

              {/* Key Findings */}
              {report.key_points && report.key_points.length > 0 && (
                <div className="glass-card p-6">
                  <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2 mb-4">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    Key Legal Findings
                  </h3>
                  <ul className="space-y-3">
                    {report.key_points.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-neutral-700">
                        <div className="mt-1 min-w-[6px] h-[6px] rounded-full bg-primary/40" />
                        <span className="leading-relaxed">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Compliance & Risk */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-card p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-2 mb-3">
                    <ShieldAlert className="h-4 w-4 text-primary" />
                    Compliance Impact
                  </h3>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    {report.compliance_notes || "No specific compliance obligations noted for this query."}
                  </p>
                </div>
                <div className={`glass-card p-5 border ${getRiskColor(report.risk_level)}`}>
                  <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 mb-3">
                    <AlertTriangle className="h-4 w-4" />
                    Risk Assessment
                  </h3>
                  <div className="text-2xl font-bold mt-2 capitalize">
                    {report.risk_level || "Unknown"}
                  </div>
                  <p className="text-xs opacity-80 mt-1">Based on retrieved precedents</p>
                </div>
              </div>

            </div>
          ) : (
            <div className="glass-card p-12 flex flex-col items-center justify-center text-center space-y-4 min-h-[400px] border-dashed">
              <Scale className="h-10 w-10 text-neutral-200" />
              <div>
                <h3 className="font-semibold text-neutral-900">AI Research Assistant</h3>
                <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                  Enter a query on the left to generate a comprehensive, citation-backed legal research report.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Sources & Metadata (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          
          {report && (
            <>
              {/* Sources */}
              <div className="glass-card p-5 space-y-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-2">
                  <BookMarked className="h-4 w-4 text-primary" />
                  Sources
                </h2>
                <div className="space-y-2">
                  {report.sources && report.sources.length > 0 ? (
                    report.sources.map((source, idx) => (
                      <a key={idx} href={source.url || "#"} className="block p-3 border border-border rounded-lg bg-neutral-50 hover:bg-neutral-100 transition-colors group">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-medium text-neutral-900 line-clamp-2">{source.title}</h4>
                          <ExternalLink className="h-3 w-3 text-neutral-400 group-hover:text-primary shrink-0" />
                        </div>
                        {source.type && (
                          <Badge className="mt-2 text-3xs font-mono uppercase bg-white">{source.type}</Badge>
                        )}
                      </a>
                    ))
                  ) : (
                    <div className="text-xs text-neutral-500 italic">No direct sources linked.</div>
                  )}
                </div>
              </div>

              {/* Citations & Entities */}
              <div className="glass-card p-5 space-y-5">
                <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-2 border-b border-border pb-3">
                  <FileText className="h-4 w-4 text-primary" />
                  Related Entities
                </h2>
                
                {report.acts && report.acts.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-3xs font-mono uppercase text-neutral-400">Relevant Acts</span>
                    <div className="flex flex-wrap gap-1.5">
                      {report.acts.map((act, i) => (
                        <span key={i} className="text-[10px] bg-primary/5 border border-primary/20 text-primary px-2 py-1 rounded">
                          {act}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {report.sections && report.sections.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-3xs font-mono uppercase text-neutral-400 flex items-center gap-1"><Hash className="h-3 w-3" /> Sections</span>
                    <div className="flex flex-wrap gap-1.5">
                      {report.sections.map((sec, i) => (
                        <span key={i} className="text-[10px] bg-neutral-100 border border-neutral-200 text-neutral-700 px-2 py-1 rounded">
                          {sec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {report.judgments && report.judgments.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-3xs font-mono uppercase text-neutral-400 flex items-center gap-1"><Gavel className="h-3 w-3" /> Judgments</span>
                    <div className="flex flex-col gap-1.5">
                      {report.judgments.map((judg, i) => (
                        <span key={i} className="text-[10px] bg-neutral-50 border border-neutral-200 text-neutral-700 p-1.5 rounded line-clamp-2">
                          {judg}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default Search;
