import { useState, useEffect } from "react";
import { Search as SearchIcon, Filter, Clock, BookOpen, Scale, Sparkles, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  search,
  getResearchHistory,
  getResearchStatistics,
  type ResearchResult,
  type ResearchContentType
} from "@/services/research";
import { VoiceButton } from "@/components/voice/VoiceButton";
import { AudioPlaybackButton } from "@/components/voice/AudioPlaybackButton";

const Search = () => {
  const [query, setQuery] = useState("");
  const [contentType, setContentType] = useState<ResearchContentType>("all");
  const [jurisdiction, setJurisdiction] = useState("all");
  const [results, setResults] = useState<ResearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [stats, setStats] = useState<any | null>(null);
  const { toast } = useToast();

  const loadSidePanels = () => {
    Promise.all([
      getResearchHistory(),
      getResearchStatistics()
    ]).then(([hist, st]) => {
      setHistory(hist);
      setStats(st);
    }).catch(err => console.error(err));
  };

  useEffect(() => {
    loadSidePanels();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const searchResults = await search({
        query,
        contentType,
        jurisdiction: jurisdiction === "all" ? undefined : jurisdiction
      });
      setResults(searchResults);
      toast({
        title: "Search Completed",
        description: `Found ${searchResults.length} relevant legal references.`,
      });
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

  const executeDirectSearch = async (term: string) => {
    if (!term.trim()) return;
    setIsSearching(true);
    try {
      const searchResults = await search({
        query: term,
        contentType,
        jurisdiction: jurisdiction === "all" ? undefined : jurisdiction
      });
      setResults(searchResults);
      toast({
        title: "Voice Search Completed",
        description: `Found ${searchResults.length} relevant legal references.`,
      });
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

  const handleSelectRecent = (term: string) => {
    setQuery(term);
    executeDirectSearch(term);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 md:px-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded bg-primary/10 border border-primary/20 flex items-center justify-center">
              <SearchIcon className="h-4.5 w-4.5 text-primary" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900">Legal Search</h1>
          </div>
        </div>
      </div>

      {/* Grid Layout: Main Search and Results vs Stats and History */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 items-start">
        <div className="space-y-6">
          {/* Search form */}
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="relative">
              <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                placeholder="Ask any legal question (e.g. 'What is the penalty for insider trading under SEBI?')..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="input-premium pl-10 pr-28 w-full text-xs py-3"
              />
              <div className="absolute right-2 top-1.5 flex items-center gap-1.5">
                <VoiceButton
                  onTranscribe={(t) => {
                    setQuery(t);
                    executeDirectSearch(t);
                  }}
                />
                <Button type="submit" disabled={isSearching || !query.trim()} className="h-7 px-3 btn-primary">
                  {isSearching ? <Loader2 className="h-3 w-3 animate-spin" /> : "Search"}
                </Button>
              </div>
            </div>

            {/* Filters panel */}
            <div className="flex flex-wrap items-center gap-3 text-xs p-3.5 bg-neutral-50 border border-border rounded">
              <div className="flex items-center gap-1 text-neutral-500 font-medium">
                <Filter size={13} className="text-primary" />
                <span>Scope:</span>
              </div>
              <div className="flex gap-1">
                {(["all", "cases", "statutes", "articles"] as ResearchContentType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setContentType(type)}
                    className={`px-2.5 py-1 rounded text-3xs font-mono uppercase border transition-all ${contentType === type
                        ? "bg-primary text-white border-primary"
                        : "bg-white text-neutral-600 border-border hover:bg-neutral-100"
                      }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <div className="ml-auto flex items-center gap-1.5">
                <span className="text-neutral-400 text-3xs uppercase font-mono">Jurisdiction:</span>
                <select
                  value={jurisdiction}
                  onChange={(e) => setJurisdiction(e.target.value)}
                  className="input-premium py-1 text-3xs"
                >
                  <option value="all">All Jurisdictions</option>
                  <option value="Supreme Court">Supreme Court</option>
                  <option value="High Court">High Court</option>
                  <option value="FEMA">FEMA Regulations</option>
                  <option value="SEBI">SEBI Regulations</option>
                </select>
              </div>
            </div>
          </form>

          {/* Results list */}
          <div className="space-y-4">
            {results.length > 0 ? (
              results.map((item) => (
                <div key={item.id} className="glass-card p-5 hover:border-neutral-300 space-y-4">
                  <div className="flex items-start justify-between gap-3 border-b border-neutral-100 pb-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <Badge className="text-3xs font-mono uppercase bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">{item.type}</Badge>
                        {item.source && (
                          <Badge className={`text-3xs font-mono border ${
                            item.source.includes("PDF")
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}>
                            {item.source}
                          </Badge>
                        )}
                        {item.confidence && (
                          <Badge className="text-3xs font-mono bg-neutral-100 border border-neutral-200 text-neutral-600">
                            Confidence: {item.confidence}
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-xs text-neutral-900 leading-snug">{item.title}</h3>
                      <p className="text-[10px] text-neutral-400 font-mono mt-1">{item.court || "LawGPT Reasoner"} · {item.date}</p>
                    </div>
                    <Badge variant="secondary" className="text-3xs bg-neutral-100">{item.matchScore}% Match</Badge>
                  </div>

                  {item.type === "AI Report" ? (
                    <div className="space-y-4 text-xs text-neutral-700 leading-relaxed">
                      {/* Direct Answer */}
                      {item.direct_answer && (
                        <div className="p-3 bg-neutral-50/80 border-l-2 border-primary rounded-r">
                          <h4 className="font-semibold text-2xs uppercase tracking-wider text-neutral-500 mb-1">Direct Answer</h4>
                          <p className="text-neutral-800 font-medium italic">{item.direct_answer}</p>
                        </div>
                      )}

                      {/* Executive Summary */}
                      {item.executive_summary && (
                        <div className="space-y-1">
                          <h4 className="font-semibold text-2xs uppercase tracking-wider text-neutral-500">Executive Summary</h4>
                          <p className="text-neutral-600">{item.executive_summary}</p>
                        </div>
                      )}

                      {/* Applicable Law */}
                      {item.applicable_law && item.applicable_law.length > 0 && (
                        <div className="space-y-1.5">
                          <h4 className="font-semibold text-2xs uppercase tracking-wider text-neutral-500">Applicable Law</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {item.applicable_law.map((law: any, idx: number) => (
                              <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary/5 border border-primary/10 text-3xs text-primary font-mono">
                                <Scale size={10} />
                                {law.act_name || law} {law.sections ? `(Sec. ${law.sections})` : ''}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Legal Analysis */}
                      {item.legal_analysis && typeof item.legal_analysis === "object" && (
                        <div className="space-y-2 p-3 bg-neutral-50/50 border border-neutral-150 rounded">
                          <h4 className="font-semibold text-2xs uppercase tracking-wider text-neutral-500">Legal Analysis</h4>
                          {item.legal_analysis.interpretation && (
                            <div>
                              <span className="font-semibold text-[10px] uppercase text-neutral-400 block font-mono">Interpretation</span>
                              <p className="text-neutral-600">{item.legal_analysis.interpretation}</p>
                            </div>
                          )}
                          {item.legal_analysis.implications && (
                            <div>
                              <span className="font-semibold text-[10px] uppercase text-neutral-400 block font-mono">Implications</span>
                              <p className="text-neutral-600">{item.legal_analysis.implications}</p>
                            </div>
                          )}
                          {item.legal_analysis.exceptions && (
                            <div>
                              <span className="font-semibold text-[10px] uppercase text-neutral-400 block font-mono">Exceptions / Safe Harbors</span>
                              <p className="text-neutral-600">{item.legal_analysis.exceptions}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Compliance Requirements */}
                      {item.compliance_requirements && item.compliance_requirements.length > 0 && (
                        <div className="space-y-1">
                          <h4 className="font-semibold text-2xs uppercase tracking-wider text-neutral-500">Compliance Guidelines</h4>
                          <ul className="list-disc pl-4 space-y-0.5 text-neutral-600 text-2xs">
                            {item.compliance_requirements.map((req: string, idx: number) => (
                              <li key={idx}>{req}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Risks */}
                      {item.risks && item.risks.length > 0 && (
                        <div className="space-y-1">
                          <h4 className="font-semibold text-2xs uppercase tracking-wider text-neutral-500">Regulatory Risks</h4>
                          <ul className="list-disc pl-4 space-y-0.5 text-red-600 text-2xs">
                            {item.risks.map((risk: string, idx: number) => (
                              <li key={idx}>{risk}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Recommendations */}
                      {item.recommendations && item.recommendations.length > 0 && (
                        <div className="space-y-1">
                          <h4 className="font-semibold text-2xs uppercase tracking-wider text-neutral-500">Recommended Actions</h4>
                          <ol className="list-decimal pl-4 space-y-0.5 text-neutral-600 text-2xs">
                            {item.recommendations.map((rec: string, idx: number) => (
                              <li key={idx}>{rec}</li>
                            ))}
                          </ol>
                        </div>
                      )}

                      {/* Case References */}
                      {item.case_references && item.case_references.length > 0 && (
                        <div className="space-y-1.5">
                          <h4 className="font-semibold text-2xs uppercase tracking-wider text-neutral-500">Landmark Case References</h4>
                          <div className="space-y-1 text-2xs">
                            {item.case_references.map((c: any, idx: number) => (
                              <div key={idx} className="p-2 bg-white border border-neutral-100 rounded">
                                <span className="font-semibold text-neutral-800">{c.case_name}</span>
                                {c.citation && <span className="text-neutral-400 font-mono ml-2">({c.citation})</span>}
                                <p className="text-neutral-500 mt-0.5 italic">{c.summary}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Source Documents */}
                      <div className="border-t border-neutral-100 pt-3">
                        <h4 className="font-semibold text-2xs uppercase tracking-wider text-neutral-500 mb-1">Source Attribution</h4>
                        {item.is_context_grounded ? (
                          <div className="space-y-1 text-3xs font-mono text-neutral-500">
                            {item.citations && item.citations.map((c: any, idx: number) => (
                              <div key={idx} className="flex justify-between p-1 bg-neutral-50 rounded">
                                <span>📄 {c.document_name || c.citation_text || c}</span>
                                {c.section && <span>Section: {c.section}</span>}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-3xs text-amber-600 italic">✓ Gemini General Legal Knowledge: No matching indexed document was found in the uploaded knowledge base.</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-xs text-neutral-600 leading-relaxed whitespace-pre-wrap">{item.summary}</p>
                      {item.citations && item.citations.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {item.citations.map((c, idx) => (
                            <span key={idx} className="text-3xs font-mono bg-neutral-50 border border-border px-2 py-0.5 rounded text-neutral-500">
                              {c}
                            </span>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  <div className="flex items-center gap-3 pt-2">
                    <AudioPlaybackButton text={item.direct_answer || item.summary || item.title || ""} className="scale-90 origin-left" />
                  </div>
                </div>
              ))
            ) : (
              !isSearching && (
                <div className="text-center py-16 text-neutral-500 glass-card">
                  <BookOpen className="h-8 w-8 mx-auto text-neutral-300 mb-3" />
                  <p className="text-xs font-semibold text-neutral-800">Vector Search Active</p>
                  <p className="text-3xs text-neutral-400 mt-1">Submit a query to scan statutes, related regulations, and judgments.</p>
                </div>
              )
            )}
          </div>
        </div>

        {/* Right side: History & Stats */}
        <div className="space-y-6">
          {/* Query Stats */}
          {stats && (
            <div className="glass-card p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <Scale className="h-4 w-4 text-primary" />
                <h2 className="text-xs font-mono uppercase text-neutral-800 tracking-wider">Search Statistics</h2>
              </div>
              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-neutral-400 block font-mono text-3xs uppercase">Total Queries Run:</span>
                  <span className="font-mono text-neutral-900 font-semibold">{stats.total_queries_run || 0}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block font-mono text-3xs uppercase">Top Search Terms:</span>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {stats.top_query_terms ? Object.keys(stats.top_query_terms).map((term) => (
                      <span key={term} className="px-1.5 py-0.5 bg-neutral-50 border border-border text-[9px] font-mono rounded text-neutral-600">
                        {term}
                      </span>
                    )) : <span className="text-neutral-400 italic">None yet</span>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* History */}
          <div className="glass-card p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Clock className="h-4 w-4 text-primary" />
              <h2 className="text-xs font-mono uppercase text-neutral-800 tracking-wider">Recent Searches</h2>
            </div>
            <div className="space-y-2">
              {history.length > 0 ? (
                history.slice(0, 5).map((h, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectRecent(h.query || h)}
                    className="w-full text-left p-2.5 rounded hover:bg-neutral-50 border border-transparent hover:border-border text-2xs text-neutral-600 hover:text-neutral-900 transition-all font-mono truncate"
                  >
                    {h.query || h}
                  </button>
                ))
              ) : (
                <div className="text-center py-4 text-neutral-400 text-3xs">No search logs recorded.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;
