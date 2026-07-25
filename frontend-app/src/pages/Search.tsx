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

  const handleSelectRecent = (term: string) => {
    setQuery(term);
    // Trigger search
    setIsSearching(true);
    search({
      query: term,
      contentType,
      jurisdiction: jurisdiction === "all" ? undefined : jurisdiction
    }).then((res) => {
      setResults(res);
      setIsSearching(false);
    }).catch(() => setIsSearching(false));
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
          <p className="text-xs text-neutral-500 font-mono uppercase tracking-wider">
            Perplexity-Style AI Semantic Search across statutes, judgments, and regulations
          </p>
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
                className="input-premium pl-10 w-full text-xs py-3"
              />
              <Button type="submit" disabled={isSearching || !query.trim()} className="absolute right-2 top-1.5 h-7 px-3 btn-primary">
                {isSearching ? <Loader2 className="h-3 w-3 animate-spin" /> : "Search"}
              </Button>
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
                    className={`px-2.5 py-1 rounded text-3xs font-mono uppercase border transition-all ${
                      contentType === type 
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
                <div key={item.id} className="glass-card p-5 hover:border-neutral-300 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Badge className="text-3xs font-mono uppercase bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 mb-1.5">{item.type}</Badge>
                      <h3 className="font-semibold text-xs text-neutral-900 leading-snug">{item.title}</h3>
                      <p className="text-[10px] text-neutral-400 font-mono mt-1">{item.court} · {item.date}</p>
                    </div>
                    <Badge variant="secondary" className="text-3xs bg-neutral-100">{item.matchScore}% Match</Badge>
                  </div>
                  <p className="text-xs text-neutral-600 leading-relaxed">{item.summary}</p>
                  {item.citations && item.citations.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {item.citations.map((c, idx) => (
                        <span key={idx} className="text-3xs font-mono bg-neutral-50 border border-border px-2 py-0.5 rounded text-neutral-500">
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
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
