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
  FileSpreadsheet,
  Activity,
  ArrowUpRight,
  ListChecks
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
import { motion, AnimatePresence } from "framer-motion";

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
  
  // Collapsible sections
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    directAnswer: false,
    executiveSummary: false,
    applicableLaw: false,
    relevantSections: false,
    legalAnalysis: false,
    complianceRequirements: false,
    risks: false,
    recommendations: false,
    caseReferences: false,
  });

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
    "Ranking Results...",
    "Generating Legal Analysis...",
    "Preparing Citations..."
  ];

  // Contextual related questions
  const [relatedQuestions, setRelatedQuestions] = useState<string[]>([
    "What are the compliance requirements for insider trading?",
    "What are compounding options under FEMA Section 13?",
    "Analyze FDI limit rules for single brand retail.",
    "What are high court safe harbors for board members?"
  ]);

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

  // Contextual related questions updater
  useEffect(() => {
    if (results.length > 0) {
      const activeResult = results[activeIndex];
      const title = activeResult.title.toLowerCase();
      const currentQuery = query.toLowerCase();
      if (title.includes("insider") || currentQuery.includes("insider")) {
        setRelatedQuestions([
          "Explain SEBI's definition of connected persons.",
          "What are disclosure requirements under PIT regulations?",
          "Are directors automatically deemed insiders?",
          "Landmark judgments on SEBI PIT regulations."
        ]);
      } else if (title.includes("fema") || currentQuery.includes("fema")) {
        setRelatedQuestions([
          "FEMA compliance requirements for non-resident investors.",
          "Explain compounding procedures under FEMA.",
          "What is the role of RBI under FEMA Section 6?",
          "FDI rules for tech and e-commerce companies."
        ]);
      } else {
        setRelatedQuestions([
          "What is the statutory interpretation of this legal issue?",
          "Are there high court precedents on this point?",
          "What are the immediate compliance risks?",
          "Download the citation schedule for this analysis."
        ]);
      }
    }
  }, [results, activeIndex]);

  const handleSearchSubmit = (e: React.FormEvent) => {
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
        title: "Search Pipeline Complete",
        description: `Retrieved and analyzed ${searchResults.length} references.`,
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

  // Deduplicate history items and limit to 10
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

  const getSearchIcon = (h: any) => {
    const type = h.result?.type?.toLowerCase() || "";
    if (type.includes("case")) return <Scale className="h-3.5 w-3.5 text-neutral-400" />;
    if (type.includes("statute")) return <BookOpen className="h-3.5 w-3.5 text-neutral-400" />;
    if (type.includes("report")) return <Sparkles className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />;
    return <SearchIcon className="h-3.5 w-3.5 text-neutral-400" />;
  };

  // Compile unique list of documents used
  const compileSourceDocs = (citations?: any[]) => {
    if (!citations) return [];
    const docsMap = new Map<string, { name: string; pages: string[]; chunks: number }>();
    
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
        existing.chunks += 1;
      } else {
        docsMap.set(cleanName, {
          name: cleanName,
          pages: section ? [section] : ["General"],
          chunks: 1
        });
      }
    });
    
    return Array.from(docsMap.values());
  };

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

## Compliance Requirements
${activeResult.compliance_requirements?.map((r: string) => `- ${r}`).join('\n') || ''}

## Risks
${activeResult.risks?.map((r: string) => `- ${r}`).join('\n') || ''}

## Recommendations
${activeResult.recommendations?.map((r: string) => `- ${r}`).join('\n') || ''}
    `.trim();
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "Report copied to clipboard as markdown format." });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (results.length === 0) return;
    const activeResult = results[activeIndex];
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activeResult, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `legal_research_report_${activeResult.id || Date.now()}.json`);
    dlAnchorElem.click();
  };

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

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Link Copied", description: "Research sharing link copied to clipboard." });
  };

  const renderCollapsibleHeader = (title: string, icon: React.ReactNode, key: string, isRed = false) => {
    const isCollapsed = collapsedSections[key];
    return (
      <button
        onClick={() => setCollapsedSections(prev => ({ ...prev, [key]: !prev[key] }))}
        className={`w-full flex items-center justify-between border-b pb-2 mb-3 select-none text-left transition-all ${
          isRed 
            ? "border-red-100 hover:border-red-200 text-red-800" 
            : "border-neutral-200/60 hover:border-neutral-300 text-slate-800"
        }`}
      >
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider font-bold">
          {icon}
          {title}
        </div>
        {isCollapsed ? (
          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
        ) : (
          <ChevronUp className="h-3.5 w-3.5 text-slate-400" />
        )}
      </button>
    );
  };

  const activeResult = results[activeIndex];
  const sourceDocs = compileSourceDocs(activeResult?.citations);

  return (
    <div className="h-full space-y-6">
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

      {/* HEADER SECTION (Top Banner Title) */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-neutral-100">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              <SearchIcon className="h-4.5 w-4.5 text-emerald-600 animate-pulse" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900 font-sans">Legal Search Desk</h1>
          </div>
          <p className="text-xs text-neutral-500 font-mono uppercase tracking-wider">
            Query regulations and retrieve citing precedent with autonomous RAG pipelines
          </p>
        </div>
        
        {results.length > 0 && (
          <Button onClick={handleNewResearch} variant="outline" className="border-neutral-200 text-xs font-mono font-bold uppercase tracking-wider h-9">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            New Query
          </Button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* NO RESULTS & INITIAL STATE: Display clean, large input dashboard (Perplexity-style Home) */}
        {!isSearching && results.length === 0 ? (
          <motion.div
            key="empty-state"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="max-w-2xl mx-auto py-12 md:py-20 space-y-12 text-center"
          >
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[9px] font-mono uppercase tracking-wider text-emerald-700 font-bold">Unified Vector RAG Platform</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-neutral-950 font-sans tracking-tight leading-tight">
                Search Legislation & Precedent.
              </h2>
              <p className="text-xs text-neutral-500 max-w-md mx-auto leading-relaxed">
                Query central acts, SEBI guidelines, or local contract caches. Our orchestrator compiles citation trees automatically.
              </p>
            </div>

            {/* Central glowing search console */}
            <div className="bg-white border border-neutral-200 p-4 rounded-2xl shadow-sm relative overflow-hidden">
              <form onSubmit={handleSearchSubmit} className="space-y-4">
                <div className="relative">
                  <SearchIcon className="absolute left-3.5 top-4 h-4.5 w-4.5 text-neutral-400" />
                  <textarea
                    placeholder="Ask a compliance or precedent query (e.g. 'What is the compounding penalty for FEMA Section 13?')..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    rows={3}
                    className="w-full bg-transparent border-0 focus:outline-none focus:ring-0 pl-11 pr-4 py-2 text-xs text-slate-800 placeholder:text-neutral-400 leading-relaxed resize-none"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 pt-3">
                  <div className="flex items-center gap-2">
                    <VoiceButton
                      onTranscribe={(t) => {
                        setQuery(t);
                        executeSearch(t);
                      }}
                    />
                    
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="bg-white border border-neutral-200 text-[10px] font-mono py-1.5 px-2 focus:outline-none focus:border-emerald-600 cursor-pointer rounded uppercase font-bold"
                    >
                      <option value="en">English (EN)</option>
                      <option value="hi-IN">Hindi (HI)</option>
                      <option value="ta-IN">Tamil (TA)</option>
                      <option value="te-IN">Telugu (TE)</option>
                      <option value="bn-IN">Bengali (BN)</option>
                    </select>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isSearching || !query.trim()}
                    className="btn-primary flex items-center font-mono py-4 text-[10px] font-bold uppercase tracking-wider px-6"
                  >
                    Analyze
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                </div>
              </form>
            </div>

            {/* Quick scope tags selector */}
            <div className="space-y-3">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Filter Research Scope</span>
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  { key: "all", label: "Global search" },
                  { key: "cases", label: "Citing Precedents" },
                  { key: "statutes", label: "Central Acts" },
                  { key: "articles", label: "Risk Manuals" }
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setContentType(item.key as ResearchContentType)}
                    className={`px-3 py-1.5 text-2xs font-mono uppercase tracking-wider rounded border transition-all ${
                      contentType === item.key
                        ? "bg-slate-900 border-slate-900 text-white font-bold"
                        : "bg-white border-neutral-200 text-slate-500 hover:bg-neutral-50"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Suggested prompts list */}
            <div className="space-y-3.5 pt-6 border-t border-neutral-100">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Suggested Inquiries</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto">
                {relatedQuestions.slice(0, 4).map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectRecent(q)}
                    className="p-3 text-left bg-white border border-neutral-200 hover:border-emerald-600/40 rounded-xl transition-all duration-200 text-2xs font-sans font-semibold text-slate-700 hover:text-emerald-700 flex justify-between items-center group shadow-3xs"
                  >
                    <span className="truncate">{q}</span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        ) : isSearching ? (
          /* SEARCH PIPELINE LOADING TICKER PANEL */
          <motion.div
            key="searching-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="border border-neutral-200 bg-white p-12 text-center space-y-8 rounded-2xl max-w-xl mx-auto my-12 shadow-3xs"
          >
            <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
              <div className="w-12 h-12 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              <div className="absolute w-6 h-6 bg-emerald-50 rounded-full animate-pulse" />
            </div>
            
            <div className="space-y-2">
              <h3 className="font-sans font-semibold text-sm text-slate-800">
                {loadingStages[loadingStage]}
              </h3>
              <p className="font-mono text-[9px] text-slate-400 uppercase tracking-widest">
                Running Autonomous RAG queries
              </p>
            </div>
            
            <div className="flex items-center gap-1.5 w-48 mx-auto">
              {loadingStages.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`h-1 flex-1 transition-all duration-300 ${
                    idx <= loadingStage ? "bg-emerald-600 animate-pulse" : "bg-slate-100"
                  }`} 
                />
              ))}
            </div>
          </motion.div>
        ) : (
          /* MAIN RESULTS PANEL: Redesigned 3-column workspace */
          <motion.div
            key="results-layout"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start"
          >
            {/* COLUMN 1 (Left): Research controls & query history */}
            <aside className="xl:col-span-3 space-y-6">
              
              {/* Search query input */}
              <div className="border border-neutral-200 bg-white p-4 space-y-3 rounded-xl shadow-3xs">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">Modify Query</span>
                <form onSubmit={handleSearchSubmit} className="space-y-3">
                  <textarea
                    placeholder="Enter query..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    rows={2}
                    className="w-full bg-white border border-neutral-200 focus:border-emerald-600 focus:outline-none p-2 text-xs text-slate-900 placeholder:text-neutral-400 rounded resize-none leading-relaxed"
                  />
                  <div className="flex items-center justify-between">
                    <VoiceButton
                      onTranscribe={(t) => {
                        setQuery(t);
                        executeSearch(t);
                      }}
                    />
                    <Button 
                      type="submit" 
                      disabled={isSearching || !query.trim()}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded h-7 px-3 text-2xs font-mono font-bold uppercase tracking-wider"
                    >
                      Run query
                    </Button>
                  </div>
                </form>
              </div>

              {/* Research Scope selectors */}
              <div className="border border-neutral-200 bg-white p-4 space-y-3 rounded-xl shadow-3xs">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold font-bold">Research Filters</span>
                
                <div className="space-y-2">
                  <label className="text-[9px] font-mono text-slate-400 uppercase block font-bold">Jurisdiction</label>
                  <select
                    value={jurisdiction}
                    onChange={(e) => setJurisdiction(e.target.value)}
                    className="w-full bg-white border border-neutral-200 text-xs px-2.5 py-1.5 focus:outline-none focus:border-emerald-600 rounded cursor-pointer"
                  >
                    <option value="all">All Jurisdictions</option>
                    <option value="Supreme Court">Supreme Court</option>
                    <option value="High Court">High Court</option>
                    <option value="FEMA">FEMA Regulations</option>
                    <option value="SEBI">SEBI Regulations</option>
                  </select>
                </div>
              </div>

              {/* History index */}
              <div className="space-y-3">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Query History</span>
                <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                  {recentSearches.map((h, idx) => {
                    const queryText = typeof h === "string" ? h : h.query || "";
                    const timestamp = typeof h === "object" ? h.timestamp : undefined;
                    
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectRecent(queryText)}
                        className="w-full text-left p-3 bg-white border border-neutral-200 hover:border-emerald-600/40 rounded-xl transition-all flex flex-col gap-1 shadow-3xs group"
                      >
                        <span className="font-semibold text-2xs text-slate-800 line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors">
                          {queryText}
                        </span>
                        <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 w-full mt-1">
                          <span>{formatRelativeTime(timestamp)}</span>
                          {getSearchIcon(h)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

            </aside>

            {/* COLUMN 2 (Center): Modern AI Legal Reading Brief Paper */}
            <main className="xl:col-span-6 space-y-6">
              {results.length > 0 && activeResult ? (
                <div id="premium-report-workspace" className="bg-white border border-neutral-200/80 p-8 rounded-2xl shadow-sm relative overflow-hidden font-serif space-y-6">
                  
                  {/* Watermark/Grid overlay */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000001_1px,transparent_1px),linear-gradient(to_bottom,#00000001_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

                  {/* Document header banner */}
                  <div className="border-b border-neutral-100 pb-4 font-sans flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-mono text-[9px] font-bold uppercase rounded py-0.5">
                          {activeResult.source || "RAG Synthesis"}
                        </Badge>
                        <span className="text-[10px] font-mono text-slate-400">Published: {new Date(activeResult.date).toLocaleDateString()}</span>
                      </div>
                      <h2 className="text-xl font-bold tracking-tight text-slate-900 leading-snug pt-1">
                        {activeResult.title}
                      </h2>
                    </div>

                    <div className="flex items-center gap-1 text-[9px] font-mono bg-neutral-100 text-slate-500 border border-neutral-200 px-2 py-1 rounded-sm">
                      <Volume2 className="h-3 w-3 text-slate-400 shrink-0" />
                      <AudioPlaybackButton text={translatedAnswer || activeResult.direct_answer || ""} />
                    </div>
                  </div>

                  {/* Sub-sections tabs */}
                  <div className="space-y-6">
                    {/* Direct Answer */}
                    {!collapsedSections.directAnswer && (
                      <div className="space-y-2">
                        {renderCollapsibleHeader("Direct Answer", <Sparkles className="h-3.5 w-3.5 text-emerald-600" />, "directAnswer")}
                        <p className="text-xs leading-relaxed text-slate-700 font-serif whitespace-pre-line bg-neutral-50/50 p-4 border border-neutral-200/40 rounded-xl shadow-3xs">
                          {translatedAnswer || activeResult.direct_answer}
                        </p>
                      </div>
                    )}

                    {/* Executive Summary */}
                    {!collapsedSections.executiveSummary && activeResult.executive_summary && (
                      <div className="space-y-2">
                        {renderCollapsibleHeader("Executive Summary", <FileText className="h-3.5 w-3.5 text-slate-500" />, "executiveSummary")}
                        <p className="text-xs leading-relaxed text-slate-650 font-serif whitespace-pre-line">
                          {translatedSummary || activeResult.executive_summary}
                        </p>
                      </div>
                    )}

                    {/* Applicable Legislation */}
                    {!collapsedSections.applicableLaw && activeResult.applicable_law && activeResult.applicable_law.length > 0 && (
                      <div className="space-y-2">
                        {renderCollapsibleHeader("Applicable Legislation", <BookOpen className="h-3.5 w-3.5 text-slate-500" />, "applicableLaw")}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-sans">
                          {activeResult.applicable_law.map((law: any, idx: number) => (
                            <div key={idx} className="p-3 bg-neutral-50/50 border border-neutral-200/60 rounded-xl flex items-start gap-2.5 shadow-3xs">
                              <Building className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                              <div className="space-y-0.5">
                                <p className="font-bold text-slate-800 text-[11px] leading-snug">{law.act_name || law}</p>
                                <p className="text-[10px] font-mono text-slate-400">Section: {law.sections || "General"}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Legal Analysis */}
                    {!collapsedSections.legalAnalysis && activeResult.legal_analysis && (
                      <div className="space-y-4">
                        {renderCollapsibleHeader("Legal Interpretation & Implications", <Scale className="h-3.5 w-3.5 text-slate-500" />, "legalAnalysis")}
                        <div className="space-y-3 font-serif">
                          {activeResult.legal_analysis.interpretation && (
                            <div className="space-y-1">
                              <span className="font-sans text-[9px] font-mono uppercase text-slate-400 font-bold">Interpretation</span>
                              <p className="text-xs leading-relaxed text-slate-650">{activeResult.legal_analysis.interpretation}</p>
                            </div>
                          )}
                          {activeResult.legal_analysis.implications && (
                            <div className="space-y-1">
                              <span className="font-sans text-[9px] font-mono uppercase text-slate-400 font-bold">Implications</span>
                              <p className="text-xs leading-relaxed text-slate-655">{activeResult.legal_analysis.implications}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Compliance Risks & Recommendations */}
                    {!collapsedSections.complianceRequirements && activeResult.compliance_requirements && activeResult.compliance_requirements.length > 0 && (
                      <div className="space-y-3">
                        {renderCollapsibleHeader("Actionable Compliance Guidelines", <ListChecks className="h-3.5 w-3.5 text-slate-500" />, "complianceRequirements")}
                        <div className="space-y-2">
                          {activeResult.compliance_requirements.map((req: string, idx: number) => (
                            <div key={idx} className="flex gap-2 text-xs text-slate-650 leading-relaxed">
                              <span className="text-emerald-600 font-bold shrink-0">✓</span>
                              <span>{req}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Citations panel */}
                    {activeResult.citations && activeResult.citations.length > 0 && (
                      <div className="pt-4 border-t border-neutral-100 space-y-3.5">
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Citations Schedule</span>
                        <div className="space-y-2">
                          {activeResult.citations.map((c: any, idx: number) => {
                            const title = typeof c === "string" ? c : c.document_name || c.citation_text || "Document citation";
                            const body = typeof c === "object" ? c.text || c.context : "";
                            
                            return (
                              <div key={idx} className="p-3 bg-neutral-50/50 border border-neutral-200/50 rounded-xl space-y-1 text-2xs font-sans shadow-3xs">
                                <div className="flex justify-between items-center text-[10px] text-slate-700 font-semibold">
                                  <span>[{idx + 1}] {title}</span>
                                  {typeof c === "object" && c.section && (
                                    <span className="font-mono text-[9px] text-emerald-600 font-bold uppercase">Section {c.section}</span>
                                  )}
                                </div>
                                {body && <p className="text-[11px] leading-relaxed text-slate-500 font-serif italic">"{body}"</p>}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="border border-neutral-200 border-dashed bg-neutral-50/30 p-12 text-center rounded-2xl min-h-[300px] flex flex-col justify-center items-center font-serif shadow-3xs">
                  <Scale className="h-10 w-10 text-neutral-300" />
                  <div className="space-y-1.5 mt-4">
                    <p className="text-xs font-semibold text-slate-700 font-sans">Reading Desk</p>
                    <p className="text-2xs text-slate-400 max-w-xs leading-normal">
                      Initiate a query to generate comprehensive legal research reports with live citation indexing.
                    </p>
                  </div>
                </div>
              )}
            </main>

            {/* COLUMN 3 (Right): Quick actions, confidence levels, translations */}
            <aside className="xl:col-span-3 space-y-6">
              
              {/* Confidence Gauge & Stats */}
              {activeResult && (
                <div className="border border-neutral-200 bg-white p-5 rounded-2xl shadow-3xs space-y-4 font-sans">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">Confidence Indicator</span>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Retrieval Score:</span>
                      <span className="font-semibold text-slate-800">{activeResult.confidence || "High"}</span>
                    </div>
                    
                    {/* Progress indicator */}
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-600 rounded-full" style={{ width: "94%" }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Translation drawer */}
              {activeResult && (
                <div className="border border-neutral-200 bg-white p-5 rounded-2xl shadow-3xs space-y-4 font-sans">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">Translation Engine</span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { code: "en", label: "English" },
                      { code: "hi", label: "Hindi" },
                      { code: "ta", label: "Tamil" },
                      { code: "te", label: "Telugu" },
                      { code: "bn", label: "Bengali" }
                    ].map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleTranslate(lang.code)}
                        disabled={isTranslating}
                        className={`py-1.5 px-2.5 rounded border transition-all text-center ${
                          activeLanguage === lang.code
                            ? "bg-slate-900 border-slate-900 text-white font-semibold"
                            : "bg-white border-neutral-200 text-slate-600 hover:bg-neutral-50"
                        }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action tools list */}
              {activeResult && (
                <div className="border border-neutral-200 bg-white p-5 rounded-2xl shadow-3xs space-y-3 font-sans">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">Export Options</span>
                  <div className="space-y-2 text-xs font-semibold">
                    <Button onClick={handleCopy} variant="outline" className="w-full text-left justify-start border-neutral-200 hover:bg-neutral-50 h-9">
                      <Copy className="mr-2 h-4 w-4 text-slate-400" />
                      Copy Report Markdown
                    </Button>
                    
                    <Button onClick={handleDownload} variant="outline" className="w-full text-left justify-start border-neutral-200 hover:bg-neutral-50 h-9">
                      <Download className="mr-2 h-4 w-4 text-slate-400" />
                      Download Raw JSON
                    </Button>
                    
                    <Button onClick={handlePrint} variant="outline" className="w-full text-left justify-start border-neutral-200 hover:bg-neutral-50 h-9">
                      <FileDown className="mr-2 h-4 w-4 text-slate-400" />
                      Print brief report (PDF)
                    </Button>

                    <Button onClick={handleShare} variant="outline" className="w-full text-left justify-start border-neutral-200 hover:bg-neutral-50 h-9">
                      <Share2 className="mr-2 h-4 w-4 text-slate-400" />
                      Share Reference link
                    </Button>
                  </div>
                </div>
              )}

              {/* Source files used in this report */}
              {activeResult && sourceDocs.length > 0 && (
                <div className="space-y-3">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Indexed Source Files</span>
                  <div className="space-y-2">
                    {sourceDocs.map((doc, idx) => (
                      <div key={idx} className="p-3 bg-white border border-neutral-200 rounded-xl space-y-1 shadow-3xs">
                        <span className="font-semibold text-2xs text-slate-800 block truncate">📄 {doc.name}</span>
                        <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 mt-1">
                          <span>Pages referenced: {doc.pages.join(", ")}</span>
                          <span className="text-emerald-600 font-bold uppercase">{doc.chunks} matches</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Related prompts box */}
              {activeResult && relatedQuestions.length > 0 && (
                <div className="space-y-3">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Follow-up inquiries</span>
                  <div className="space-y-2">
                    {relatedQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectRecent(q)}
                        className="w-full text-left p-3.5 bg-white border border-neutral-200 hover:border-emerald-600/40 rounded-xl text-2xs font-semibold text-slate-700 hover:text-emerald-700 transition-all flex justify-between items-center group shadow-3xs"
                      >
                        <span className="truncate max-w-[200px]">{q}</span>
                        <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Search;
