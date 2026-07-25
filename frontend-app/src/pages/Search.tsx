import { useState, useEffect } from 'react';
import { Search as SearchIcon, Filter, Clock, ArrowRight, BookOpen, Building2, Gavel, Scale, FileText, User, MapPin, Calendar, Brain, X, Sparkles, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { search as researchSearch, type ResearchResult, type ResearchContentType } from "@/services/research";
import { motion, AnimatePresence } from "framer-motion";

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [jurisdiction, setJurisdiction] = useState('');
  const [contentType, setContentType] = useState('cases');
  const [searchResults, setSearchResults] = useState<ResearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [aiSummary, setAiSummary] = useState('');

  const jurisdictions = [
    { id: "india", label: "India (All)" },
    { id: "supreme", label: "Supreme Court" },
    { id: "high", label: "High Courts" },
    { id: "delhi", label: "Delhi" },
    { id: "maharashtra", label: "Maharashtra" }
  ];

  useEffect(() => {
    setSearchQuery('right to privacy data protection');
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchResults([]);
    setAiSummary('');

    try {
      const results = await researchSearch({
        query: searchQuery,
        contentType: contentType as ResearchContentType,
        jurisdiction,
      });

      setSearchResults(results);
      if (results.length > 0) {
        setAiSummary(results[0].summary || "Synthesized analysis complete. Document matches RAG vectors.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 py-8">
      {/* Brand Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/5 border border-primary/10 rounded-full">
          <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
          <span className="text-3xs font-mono uppercase tracking-wider text-primary">Advanced AI Legal Search</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-white">Ask LawGPT</h1>
        <p className="text-xs text-muted-foreground/80 font-mono uppercase tracking-wider">Semantic search over statutes, IPC, cases and citations</p>
      </div>

      {/* Main Omnibar */}
      <div className="glass-card p-4 border-white/[0.08] shadow-[0_16px_48px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col gap-4">
          <div className="relative flex items-center gap-2 bg-black/40 border border-white/[0.08] rounded-xl px-4 py-3 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 transition-all duration-200">
            <SearchIcon className="text-muted-foreground h-5 w-5" />
            <input
              type="text"
              placeholder="What provisions define breach of trust under the Indian Penal Code?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm focus:outline-none text-white placeholder:text-muted-foreground/60"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-muted-foreground hover:text-white">
                <X className="h-4 w-4" />
              </button>
            )}
            <button 
              onClick={() => setFiltersVisible(!filtersVisible)} 
              className={`p-1.5 rounded-lg border transition-all ${filtersVisible ? 'bg-primary/10 border-primary text-primary' : 'bg-white/[0.02] border-white/[0.05] text-muted-foreground hover:text-white'}`}
            >
              <Filter className="h-3.5 w-3.5" />
            </button>
            <button 
              onClick={handleSearch}
              disabled={isSearching}
              className="p-1.5 bg-primary hover:bg-primary/95 text-white rounded-lg transition-all"
            >
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Search Scope Tabs & Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1 border-t border-white/[0.04]">
            <div className="flex bg-white/[0.03] p-0.5 rounded-lg border border-white/[0.06]">
              {['cases', 'statutes', 'articles'].map((type) => (
                <button
                  key={type}
                  onClick={() => setContentType(type)}
                  className={`px-3 py-1 rounded-md text-2xs font-semibold capitalize transition-all ${contentType === type ? 'bg-primary/25 text-white shadow-sm' : 'text-muted-foreground hover:text-white'}`}
                >
                  {type}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-3xs font-mono text-muted-foreground/60">RAG DEPTH: 10 VECTORS</span>
            </div>
          </div>

          {/* Quick Filters */}
          <AnimatePresence>
            {filtersVisible && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/[0.01] border border-white/[0.04] p-4 rounded-xl mt-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase text-muted-foreground">Jurisdiction</label>
                    <select 
                      value={jurisdiction} 
                      onChange={(e) => setJurisdiction(e.target.value)}
                      className="w-full bg-black/40 border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white"
                    >
                      <option value="">All Jurisdictions</option>
                      {jurisdictions.map(j => (
                        <option key={j.id} value={j.id}>{j.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Loading State */}
      {isSearching && (
        <div className="space-y-4">
          <div className="text-2xs font-mono tracking-widest text-muted-foreground uppercase flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-ping" />
            Computing RAG vectors and citations...
          </div>
          <div className="space-y-3">
            {[1, 2].map((_, i) => (
              <div key={i} className="glass-card p-5 animate-pulse border-white/[0.04]">
                <div className="h-4 bg-white/[0.06] rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-white/[0.04] rounded w-1/2 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-2.5 bg-white/[0.04] rounded w-full"></div>
                  <div className="h-2.5 bg-white/[0.04] rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {!isSearching && searchResults.length > 0 && (
        <div className="space-y-6">
          {/* AI synthesized top response */}
          {aiSummary && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 border-white/[0.06] bg-primary/[0.03] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-[100px] h-[100px] bg-primary/10 rounded-full blur-[30px]" />
              <div className="flex items-center gap-2 text-xs font-semibold text-primary mb-3">
                <Brain className="h-4 w-4" />
                <span>AI Synthesis Summary</span>
              </div>
              <p className="text-sm leading-relaxed text-white">{aiSummary}</p>
            </motion.div>
          )}

          <div className="space-y-4">
            <h2 className="text-xs font-mono text-muted-foreground/80 uppercase tracking-wider">Citations & Search Records</h2>
            <div className="grid gap-4">
              {searchResults.map((result) => (
                <div 
                  key={result.id}
                  className="glass-card p-5 hover:border-primary/45 transition-all duration-200"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="font-semibold text-sm text-white hover:text-primary transition-colors cursor-pointer">{result.title}</h3>
                      <p className="text-[10px] font-mono text-muted-foreground/70 uppercase mt-1">{result.court || "Supreme Court"} • {new Date(result.date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-3xs font-mono text-primary font-semibold">{result.matchScore}% match</span>
                      <div className="w-12 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${result.matchScore}%` }} />
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{result.summary}</p>

                  {result.citations && result.citations.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-white/[0.04]">
                      {result.citations.map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="bg-white/[0.02] border-white/[0.08] text-muted-foreground text-3xs font-mono">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isSearching && searchResults.length === 0 && (
        <div className="text-center py-16 text-muted-foreground glass-card border-white/[0.04] p-8">
          <Brain className="h-10 w-10 mx-auto text-muted-foreground/40 mb-4" />
          <p className="text-sm font-semibold text-white">Enter a legal research query</p>
          <p className="text-xs text-muted-foreground/80 mt-1 max-w-sm mx-auto leading-relaxed">Submit query parameters to perform a RAG analysis across IPC and active legislation databases.</p>
        </div>
      )}
    </div>
  );
};

export default Search;
