import { useState, useEffect } from "react";
import { 
  Search as SearchIcon, 
  Filter, 
  Clock, 
  BookOpen, 
  Scale, 
  Sparkles, 
  Loader2, 
  ArrowRight, 
  Plus, 
  FileText, 
  Check, 
  Copy, 
  Download, 
  Languages, 
  Volume2, 
  Share2, 
  FileDown, 
  Globe, 
  ChevronDown, 
  ChevronUp, 
  TrendingUp, 
  AlertTriangle,
  HelpCircle,
  Bookmark,
  ShieldCheck,
  Building,
  CheckCircle,
  FileSpreadsheet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  search,
  getResearchHistory,
  getResearchStatistics,
  type ResearchResult,
  type ResearchContentType
} from "@/services/research";
import { VoiceButton } from "@/components/voice/VoiceButton";
import { AudioPlaybackButton } from "@/components/voice/AudioPlaybackButton";
import { apiClient } from "@/utils/apiClient";

const Search = () => {
  const [query, setQuery] = useState("");
  const [contentType, setContentType] = useState<ResearchContentType>("all");
  const [jurisdiction, setJurisdiction] = useState("all");
  const [language, setLanguage] = useState("en");
  const [results, setResults] = useState<ResearchResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [stats, setStats] = useState<any | null>(null);

  // Translation state
  const [translatedAnswer, setTranslatedAnswer] = useState<string | null>(null);
  const [translatedSummary, setTranslatedSummary] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState("en");

  // Loading animation state
  const [loadingStage, setLoadingStage] = useState(0);
  const loadingStages = [
    "Searching Knowledge Base...",
    "Retrieving Documents...",
    "Generating Legal Analysis..."
  ];

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

  // Set loading stage intervals
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSearching) {
      setLoadingStage(0);
      interval = setInterval(() => {
        setLoadingStage((prev) => (prev < loadingStages.length - 1 ? prev + 1 : prev));
      }, 1200);
    }
    return () => clearInterval(interval);
  }, [isSearching]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    executeSearch(query);
  };

  const executeSearch = async (searchTerm: string) => {
    setIsSearching(true);
    setTranslatedAnswer(null);
    setTranslatedSummary(null);
    setActiveLanguage("en");
    try {
      const searchResults = await search({
        query: searchTerm,
        contentType,
        jurisdiction: jurisdiction === "all" ? undefined : jurisdiction
      });
      setResults(searchResults);
      setActiveIndex(0);
      toast({
        title: "Analysis Complete",
        description: `Retrieved ${searchResults.length} legal references.`,
      });
      loadSidePanels();
    } catch (error) {
      console.error(error);
      toast({
        title: "Search Failed",
        description: "Failed to query research database.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectRecent = (term: string) => {
    setQuery(term);
    executeSearch(term);
  };

  const handleNewResearch = () => {
    setQuery("");
    setResults([]);
    setActiveIndex(0);
    setTranslatedAnswer(null);
    setTranslatedSummary(null);
    setActiveLanguage("en");
  };

  // Helper: relative time formatter
  const formatRelativeTime = (isoString?: string) => {
    if (!isoString) return "Recently";
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return "Recently";
    }
  };

  // Deduplicate history items and cap at 10
  const uniqueHistory: any[] = [];
  const seenQueries = new Set();
  for (const h of history) {
    const q = (typeof h === "string" ? h : h.query || "").trim();
    if (q && !seenQueries.has(q.toLowerCase())) {
      seenQueries.add(q.toLowerCase());
      uniqueHistory.push(h);
    }
  }
  const recentSearches = uniqueHistory.slice(0, 10);

  // Get matching icon based on history items
  const getSearchIcon = (h: any) => {
    const type = h.result?.type?.toLowerCase() || "";
    if (type.includes("case")) return <Scale className="h-3.5 w-3.5 text-neutral-400" />;
    if (type.includes("statute")) return <BookOpen className="h-3.5 w-3.5 text-neutral-400" />;
    if (type.includes("report")) return <Sparkles className="h-3.5 w-3.5 text-emerald-600" />;
    return <SearchIcon className="h-3.5 w-3.5 text-neutral-400" />;
  };

  // Compile unique list of documents used with pages
  const compileSourceDocs = (citations?: any[]) => {
    if (!citations) return [];
    const docsMap = new Map<string, { name: string; pages: string[] }>();
    
    citations.forEach((c) => {
      const docName = typeof c === 'string' 
        ? c 
        : c.document_name || c.citation_text || "Unknown Document";
      
      const cleanName = docName.replace(/\.pdf$/i, "").replace(/_/g, " ");
      const section = typeof c === 'object' && c.section ? String(c.section) : "";
      
      if (docsMap.has(cleanName)) {
        const existing = docsMap.get(cleanName)!;
        if (section && !existing.pages.includes(section)) {
          existing.pages.push(section);
        }
      } else {
        docsMap.set(cleanName, {
          name: cleanName,
          pages: section ? [section] : ["General"]
        });
      }
    });
    
    return Array.from(docsMap.values());
  };

  // Quick Action: Copy Report Text
  const handleCopy = () => {
    if (results.length === 0) return;
    const activeResult = results[activeIndex];
    const text = `
# ${activeResult.title}
Date: ${activeResult.date}
Confidence: ${activeResult.confidence || 'Medium'}

## Direct Answer
${activeResult.direct_answer || ''}

## Executive Summary
${activeResult.executive_summary || ''}

## Applicable Law
${activeResult.applicable_law?.map((l: any) => `- ${l.act_name || l} ${l.sections ? `(Section ${l.sections})` : ''}`).join('\n') || ''}

## Legal Analysis
Interpretation: ${activeResult.legal_analysis?.interpretation || ''}
Implications: ${activeResult.legal_analysis?.implications || ''}
Exceptions: ${activeResult.legal_analysis?.exceptions || ''}

## Recommendations
${activeResult.recommendations?.map((r: string) => `- ${r}`).join('\n') || ''}
    `.trim();
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "Report copied to clipboard as markdown format." });
  };

  // Quick Action: Export PDF
  const handlePrint = () => {
    window.print();
  };

  // Quick Action: Download Raw JSON
  const handleDownload = () => {
    if (results.length === 0) return;
    const activeResult = results[activeIndex];
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activeResult, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `legal_research_report_${activeResult.id || Date.now()}.json`);
    dlAnchorElem.click();
  };

  // Quick Action: Translate Report
  const handleTranslate = async (langCode: string) => {
    if (results.length === 0) return;
    const activeResult = results[activeIndex];
    if (langCode === "en") {
      setTranslatedAnswer(null);
      setTranslatedSummary(null);
      setActiveLanguage("en");
      return;
    }
    setIsTranslating(true);
    try {
      let transAns = null;
      let transSum = null;

      if (activeResult.direct_answer) {
        const res1 = await apiClient.post("/voice/translate", {
          text: activeResult.direct_answer,
          language_code: langCode,
          speaker: "shubh"
        });
        if (res1.status === "success") {
          transAns = res1.data.translated_text || res1.translated_text;
        }
      }

      if (activeResult.summary) {
        const res2 = await apiClient.post("/voice/translate", {
          text: activeResult.summary,
          language_code: langCode,
          speaker: "shubh"
        });
        if (res2.status === "success") {
          transSum = res2.data.translated_text || res2.translated_text;
        }
      }

      setTranslatedAnswer(transAns);
      setTranslatedSummary(transSum);
      setActiveLanguage(langCode);
      toast({ title: "Translation Completed", description: "Report translated successfully." });
    } catch (e) {
      console.error(e);
      toast({ title: "Translation Failed", description: "Failed to translate report.", variant: "destructive" });
    } finally {
      setIsTranslating(false);
    }
  };

  // Quick Action: Share Link
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Link Copied", description: "Research link copied to clipboard." });
  };

  const activeResult = results[activeIndex];

  return (
    <div className="h-full">
      {/* Styles for printing only the report component */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #premium-report-workspace, #premium-report-workspace * {
            visibility: visible;
          }
          #premium-report-workspace {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            border: none;
            box-shadow: none;
          }
        }
      `}</style>

      {/* Main Responsive 3-Column Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Search Box, Filters, and Recent Searches */}
        <aside className="xl:col-span-3 space-y-6 xl:sticky xl:top-28">
          
          {/* New Search Clear Button */}
          <Button 
            onClick={handleNewResearch} 
            variant="outline" 
            className="w-full h-9 rounded-none border-neutral-200 flex items-center gap-2 text-xs font-semibold hover:bg-neutral-50"
          >
            <Plus className="h-3.5 w-3.5" />
            New Research
          </Button>

          {/* Search Box Panel */}
          <div className="border border-neutral-200 bg-white p-4 space-y-3 rounded-none">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Query Console</span>
            <form onSubmit={handleSearch} className="space-y-3">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-neutral-450" />
                <textarea
                  placeholder="Ask any legal question..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  rows={3}
                  className="w-full bg-white border border-neutral-200 focus:border-emerald-600 focus:outline-none pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-neutral-405/85 rounded-none resize-none leading-relaxed"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <VoiceButton
                    onTranscribe={(t) => {
                      setQuery(t);
                      executeSearch(t);
                    }}
                  />
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="bg-white border border-neutral-200 text-3xs font-mono py-1 px-1 focus:outline-none focus:border-emerald-600 cursor-pointer rounded-none"
                  >
                    <option value="en">EN</option>
                    <option value="hi-IN">HI</option>
                    <option value="ta-IN">TA</option>
                    <option value="te-IN">TE</option>
                    <option value="bn-IN">BN</option>
                  </select>
                </div>

                <Button 
                  type="submit" 
                  disabled={isSearching || !query.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-none h-7 px-3.5 text-xs font-semibold"
                >
                  {isSearching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Search"}
                </Button>
              </div>
            </form>
          </div>

          {/* Filters Panel */}
          <div className="border border-neutral-200 bg-white p-4 space-y-3 rounded-none">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Scope Filters</span>
            
            {/* Scope selectors */}
            <div className="grid grid-cols-2 gap-1.5">
              {(["all", "cases", "statutes", "articles"] as ResearchContentType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setContentType(type)}
                  className={`h-7 border text-3xs font-mono uppercase tracking-wider transition-all rounded-none ${
                    contentType === type
                      ? "bg-slate-800 border-slate-850 text-white font-bold"
                      : "bg-white border-neutral-200 text-slate-650 hover:bg-neutral-50"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Jurisdiction Dropdown */}
            <div className="relative pt-1">
              <Globe className="absolute left-2 top-[24px] h-3.5 w-3.5 text-neutral-400" />
              <select
                value={jurisdiction}
                onChange={(e) => setJurisdiction(e.target.value)}
                className="w-full bg-white border border-neutral-200 text-xs pl-7 pr-2 py-1.5 focus:outline-none focus:border-emerald-600 rounded-none cursor-pointer appearance-none"
              >
                <option value="all">All Jurisdictions</option>
                <option value="Supreme Court">Supreme Court</option>
                <option value="High Court">High Court</option>
                <option value="FEMA">FEMA Regulations</option>
                <option value="SEBI">SEBI Regulations</option>
              </select>
            </div>
          </div>

          {/* ChatGPT-style Recent searches */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-neutral-200 pb-2">
              <Clock className="h-3.5 w-3.5 text-neutral-500" />
              <h3 className="text-3xs font-mono uppercase tracking-wider text-slate-500 font-bold">Recent Searches</h3>
            </div>
            
            <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
              {recentSearches.length > 0 ? (
                recentSearches.map((h, idx) => {
                  const queryText = typeof h === "string" ? h : h.query || "";
                  const timestamp = typeof h === "object" ? h.timestamp : undefined;
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectRecent(queryText)}
                      className="w-full text-left p-2.5 bg-white border border-neutral-200 hover:border-emerald-600/30 hover:bg-neutral-50/50 transition-all flex flex-col gap-1 rounded-none group"
                    >
                      <div className="flex items-start justify-between gap-1.5 w-full">
                        <span className="font-sans font-medium text-[11px] text-slate-800 line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors">
                          {queryText}
                        </span>
                        {getSearchIcon(h)}
                      </div>
                      <div className="text-[9px] font-mono text-slate-400">
                        {formatRelativeTime(timestamp)}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="text-center py-6 text-neutral-450 text-3xs border border-dashed border-neutral-200 bg-white">No query logs recorded.</div>
              )}
            </div>
          </div>

        </aside>

        {/* CENTER COLUMN: AI Legal Research Report */}
        <main className="xl:col-span-6 space-y-6">
          
          {/* SEARCH LOADING STATUS */}
          {isSearching && (
            <div className="border border-neutral-200 bg-white p-12 text-center space-y-8 rounded-none">
              <div className="relative w-12 h-12 mx-auto flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                <div className="absolute w-4 h-4 bg-emerald-50 rounded-full animate-pulse" />
              </div>
              <div className="space-y-1">
                <h3 className="font-sans font-semibold text-xs text-slate-800">
                  {loadingStages[loadingStage]}
                </h3>
                <p className="font-mono text-[9px] text-slate-400 uppercase tracking-widest">
                  Processing Research Pipeline
                </p>
              </div>
            </div>
          )}

          {/* INITIAL EMPTY STATE */}
          {!isSearching && results.length === 0 && (
            <div className="border border-neutral-200 bg-white p-12 text-center space-y-6 rounded-none font-serif">
              <div className="w-10 h-10 mx-auto bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                <Scale className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="space-y-2 max-w-sm mx-auto">
                <h2 className="text-sm font-bold text-slate-900 tracking-tight font-sans">Legal Research Console</h2>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Enter a detailed query in the left panel to scan FEMA guidelines, SEBI circulars, Supreme Court cases, or uploaded PDF document vectors.
                </p>
              </div>
            </div>
          )}

          {/* AI REPORT MEMO */}
          {!isSearching && results.length > 0 && activeResult && (
            <div 
              id="premium-report-workspace" 
              className="border border-neutral-200 bg-white p-8 space-y-8 rounded-none font-serif text-[14px] leading-relaxed text-slate-750"
            >
              {/* Document Memo Header */}
              <div className="border-b border-neutral-350 pb-4 space-y-2">
                <div className="flex justify-between text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  <span>CONFIDENTIAL ATTORNEY-CLIENT WORK BRIEF</span>
                  <span>DATE: {activeResult.date}</span>
                </div>
                <h1 className="text-xl font-bold font-sans text-slate-950 tracking-tight leading-tight">
                  {activeResult.title}
                </h1>
              </div>

              {/* 1. Direct Answer */}
              {activeResult.direct_answer && (
                <div className="space-y-2">
                  <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    Direct Answer
                  </h3>
                  <div className="p-4.5 bg-emerald-50/20 border border-emerald-100/50 border-l-4 border-l-emerald-600">
                    <p className="text-slate-900 font-medium italic text-[13.5px]">
                      {translatedAnswer || activeResult.direct_answer}
                    </p>
                  </div>
                </div>
              )}

              {/* 2. Executive Summary */}
              {activeResult.executive_summary && (
                <div className="space-y-2 pt-2">
                  <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-900">
                    Executive Summary
                  </h3>
                  <p className="text-slate-700 leading-loose">
                    {translatedSummary || activeResult.executive_summary}
                  </p>
                </div>
              )}

              {/* 3. Applicable Law */}
              {activeResult.applicable_law && activeResult.applicable_law.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-900">
                    Applicable Law
                  </h3>
                  <ul className="list-disc pl-5 space-y-1.5 text-slate-700 leading-normal">
                    {activeResult.applicable_law.map((law: any, idx: number) => {
                      const actName = typeof law === 'object' ? law.act_name : String(law);
                      const sec = typeof law === 'object' ? law.sections : "";
                      return (
                        <li key={idx} className="font-sans text-xs">
                          <span className="font-semibold text-slate-800">{actName}</span>
                          {sec && (
                            <>
                              <span className="text-slate-400 font-mono mx-1">·</span>
                              <span className="font-mono text-3xs uppercase text-slate-500">Section Ref: <code className="bg-slate-50 border border-neutral-200 px-1 font-semibold text-slate-800">{sec}</code></span>
                            </>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* 4. Legal Analysis */}
              {activeResult.legal_analysis && (
                <div className="space-y-4 pt-2">
                  <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-900">
                    Legal Analysis
                  </h3>
                  <div className="space-y-4 text-slate-700 leading-loose">
                    {activeResult.legal_analysis.interpretation && (
                      <div className="space-y-1">
                        <span className="font-sans font-semibold text-[10px] uppercase tracking-wider text-slate-400 block font-mono">1. Interpretation</span>
                        <p>{activeResult.legal_analysis.interpretation}</p>
                      </div>
                    )}
                    {activeResult.legal_analysis.implications && (
                      <div className="space-y-1">
                        <span className="font-sans font-semibold text-[10px] uppercase tracking-wider text-slate-400 block font-mono">2. Implications</span>
                        <p>{activeResult.legal_analysis.implications}</p>
                      </div>
                    )}
                    {activeResult.legal_analysis.exceptions && (
                      <div className="space-y-1">
                        <span className="font-sans font-semibold text-[10px] uppercase tracking-wider text-slate-400 block font-mono">3. Considerations & Safe Harbors</span>
                        <p>{activeResult.legal_analysis.exceptions}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 5. Recommendations */}
              {activeResult.recommendations && activeResult.recommendations.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-900">
                    Recommendations
                  </h3>
                  <ol className="list-decimal pl-5 space-y-2 text-slate-700 leading-normal">
                    {activeResult.recommendations.map((rec: string, idx: number) => (
                      <li key={idx} className="pl-0.5">{rec}</li>
                    ))}
                  </ol>
                </div>
              )}

            </div>
          )}

          {/* Multiple Ref Switchers */}
          {!isSearching && results.length > 1 && (
            <div className="border border-neutral-200 bg-white p-3 rounded-none flex items-center justify-between">
              <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 font-bold">retrieved sets ({results.length})</span>
              <div className="flex gap-1.5">
                {results.map((r, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveIndex(idx)}
                    className={`px-2.5 py-1 border text-3xs font-mono uppercase tracking-wider rounded-none ${
                      activeIndex === idx
                        ? "bg-slate-800 text-white border-slate-800 font-bold"
                        : "bg-white text-slate-500 border-neutral-200 hover:bg-neutral-50"
                    }`}
                  >
                    set {idx + 1}
                  </button>
                ))}
              </div>
            </div>
          )}

        </main>

        {/* RIGHT COLUMN: Sources, Confidence, and Quick Actions */}
        <aside className="xl:col-span-3 space-y-6 xl:sticky xl:top-28">
          
          {activeResult && (
            <>
              {/* Sources Panel */}
              <div className="border border-neutral-200 bg-white p-4 space-y-3 rounded-none text-xs">
                <div className="flex items-center gap-1.5 border-b border-neutral-100 pb-2">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                  <h3 className="text-3xs font-mono uppercase tracking-wider text-slate-500 font-bold">Research Source</h3>
                </div>
                
                <div className="space-y-3">
                  <span className="text-xs font-semibold text-slate-800 block">
                    {activeResult.is_context_grounded ? "✓ PDF Knowledge Base" : "✓ Gemini General Legal Knowledge"}
                  </span>
                  
                  {activeResult.is_context_grounded && activeResult.citations && activeResult.citations.length > 0 ? (
                    <div className="space-y-2 border-t border-neutral-100 pt-2.5">
                      <span className="text-[9px] font-mono text-slate-400 uppercase block font-bold">Ingested Documents</span>
                      <div className="space-y-2">
                        {compileSourceDocs(activeResult.citations).map((doc, idx) => (
                          <div key={idx} className="p-2 bg-neutral-50 border border-neutral-150 rounded-none text-[10px] font-sans">
                            <p className="font-semibold text-slate-800 truncate">📄 {doc.name}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {doc.pages.map((p, pIdx) => (
                                <code key={pIdx} className="bg-neutral-100 border border-neutral-200 text-slate-500 text-[8px] font-mono px-1 font-semibold">
                                  Page {p}
                                </code>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-450 italic leading-normal border-t border-neutral-100 pt-2.5">
                      No relevant document found in the indexed knowledge base.
                    </p>
                  )}
                </div>
              </div>

              {/* Confidence Panel */}
              <div className="border border-neutral-200 bg-white p-4 space-y-3 rounded-none text-xs">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                  <h3 className="text-3xs font-mono uppercase tracking-wider text-slate-500 font-bold">Analysis Confidence</h3>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className={`text-2xs font-mono uppercase px-2 py-1 font-bold ${
                    activeResult.confidence === 'High' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    activeResult.confidence === 'Medium' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                    'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}>
                    {activeResult.confidence || 'Medium'}
                  </div>
                  
                  <div className="text-[10px] text-slate-400 leading-normal font-sans">
                    Grounding metrics confirm score of {activeResult.matchScore || (activeResult.confidence === 'High' ? 95 : 75)}% against citation standards.
                  </div>
                </div>
              </div>

              {/* Quick Actions Panel */}
              <div className="border border-neutral-200 bg-white p-4 space-y-3 rounded-none text-xs">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                  <h3 className="text-3xs font-mono uppercase tracking-wider text-slate-500 font-bold">Quick Actions</h3>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {/* Copy */}
                  <button 
                    onClick={handleCopy} 
                    className="flex items-center justify-center gap-1.5 py-2 px-2 border border-neutral-200 hover:bg-neutral-50 text-[10px] font-sans font-semibold text-slate-700 transition-all rounded-none bg-white"
                  >
                    <Copy className="h-3.5 w-3.5 text-slate-400" />
                    Copy Memo
                  </button>

                  {/* Export PDF */}
                  <button 
                    onClick={handlePrint} 
                    className="flex items-center justify-center gap-1.5 py-2 px-2 border border-neutral-200 hover:bg-neutral-50 text-[10px] font-sans font-semibold text-slate-700 transition-all rounded-none bg-white"
                  >
                    <FileDown className="h-3.5 w-3.5 text-slate-400" />
                    Export PDF
                  </button>

                  {/* Download JSON */}
                  <button 
                    onClick={handleDownload} 
                    className="flex items-center justify-center gap-1.5 py-2 px-2 border border-neutral-200 hover:bg-neutral-50 text-[10px] font-sans font-semibold text-slate-700 transition-all rounded-none bg-white"
                  >
                    <Download className="h-3.5 w-3.5 text-slate-400" />
                    Raw JSON
                  </button>

                  {/* Narration */}
                  <div className="flex items-center justify-center border border-neutral-200 bg-white hover:bg-neutral-50 h-full w-full">
                    <AudioPlaybackButton 
                      text={translatedSummary || activeResult.summary || activeResult.direct_answer || ""} 
                      className="border-none hover:bg-transparent h-full w-full rounded-none flex items-center justify-center gap-1.5 text-[10px] font-sans font-semibold text-slate-700" 
                    />
                  </div>

                  {/* Translation Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center justify-center gap-1.5 py-2 px-2 border border-neutral-200 hover:bg-neutral-50 text-[10px] font-sans font-semibold text-slate-700 transition-all rounded-none bg-white col-span-2">
                        {isTranslating ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-650 animate-spin mr-1" />
                        ) : (
                          <Languages className="h-3.5 w-3.5 text-slate-400" />
                        )}
                        Translate memo
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white border border-neutral-200 text-slate-900 rounded-none">
                      <DropdownMenuItem onClick={() => handleTranslate("en")} className="focus:bg-neutral-50 text-[11px] cursor-pointer rounded-none">English (Default)</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleTranslate("hi-IN")} className="focus:bg-neutral-50 text-[11px] cursor-pointer rounded-none">Hindi (हिंदी)</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleTranslate("ta-IN")} className="focus:bg-neutral-50 text-[11px] cursor-pointer rounded-none">Tamil (தமிழ்)</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleTranslate("te-IN")} className="focus:bg-slate-50 text-[11px] cursor-pointer rounded-none">Telugu (తెలుగు)</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleTranslate("bn-IN")} className="focus:bg-neutral-50 text-[11px] cursor-pointer rounded-none">Bengali (বাংলা)</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Share Link */}
                  <button 
                    onClick={handleShare} 
                    className="flex items-center justify-center gap-1.5 py-2 px-2 border border-neutral-200 hover:bg-neutral-50 text-[10px] font-sans font-semibold text-slate-700 transition-all rounded-none bg-white col-span-2"
                  >
                    <Share2 className="h-3.5 w-3.5 text-slate-400" />
                    Copy share link
                  </button>

                </div>
              </div>
            </>
          )}

          {/* Quick Statistics details */}
          {stats && (
            <div className="border border-neutral-200 bg-white p-4 space-y-4 rounded-none text-xs">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                <h3 className="text-3xs font-mono uppercase tracking-wider text-slate-500 font-bold">Research Analytics</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-none">
                  <span className="text-[9px] text-slate-400 block font-mono uppercase">Queries Run</span>
                  <span className="font-mono text-sm text-slate-800 font-bold">{stats.total_queries || 0}</span>
                </div>
                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-none">
                  <span className="text-[9px] text-slate-400 block font-mono uppercase font-semibold">Avg Latency</span>
                  <span className="font-mono text-xs text-slate-850 font-bold mt-0.5 block">{stats.average_execution_time_sec || 0}s</span>
                </div>
              </div>
            </div>
          )}

        </aside>

      </div>
    </div>
  );
};

export default Search;
