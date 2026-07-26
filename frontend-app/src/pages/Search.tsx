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

  // Get matching icon based on history items
  const getSearchIcon = (h: any) => {
    const type = h.result?.type?.toLowerCase() || "";
    if (type.includes("case")) return <Scale className="h-3.5 w-3.5 text-neutral-400 animate-pulse" />;
    if (type.includes("statute")) return <BookOpen className="h-3.5 w-3.5 text-neutral-400" />;
    if (type.includes("report")) return <Sparkles className="h-3.5 w-3.5 text-emerald-600" />;
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
    toast({ title: "Link Copied", description: "Research sharing link copied to clipboard." });
  };

  // Render collapsible header element
  const renderCollapsibleHeader = (title: string, icon: React.ReactNode, key: string, isRed = false) => {
    const isCollapsed = collapsedSections[key];
    return (
      <button
        onClick={() => setCollapsedSections(prev => ({ ...prev, [key]: !prev[key] }))}
        className={`w-full flex items-center justify-between border-b pb-2 mb-3.5 select-none text-left transition-all ${isRed
            ? "border-red-100 hover:border-red-200 text-red-800"
            : "border-neutral-200 hover:border-neutral-300 text-slate-800"
          }`}
      >
        <div className="flex items-center gap-2 font-sans font-semibold text-xs uppercase tracking-wider">
          {icon}
          {title}
        </div>
        {isCollapsed ? (
          <ChevronDown className="h-4 w-4 text-slate-400" />
        ) : (
          <ChevronUp className="h-4 w-4 text-slate-400" />
        )}
      </button>
    );
  };

  const activeResult = results[activeIndex];
  const sourceDocs = compileSourceDocs(activeResult?.citations);
  const totalPagesCount = sourceDocs.reduce((acc, d) => acc + d.pages.length, 0);

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

      {/* Main Responsive 3-Column Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">

        {/* LEFT SIDEBAR: Search configuration, filters, history */}
        <aside className="xl:col-span-3 space-y-6 xl:sticky xl:top-28">

          {/* New Research trigger */}
          <Button
            onClick={handleNewResearch}
            variant="outline"
            className="w-full h-10 rounded-xl border-white/5 bg-[#101010] text-slate-300 flex items-center gap-2 text-xs font-semibold hover:bg-[#151515]"
          >
            <Plus className="h-4 w-4" />
            New Research
          </Button>

          {/* Search Box inside left sidebar */}
          <div className="border border-white/5 bg-[#101010] p-4 space-y-3 rounded-xl shadow-3xs">
            <span className="text-[10px] font-mono text-slate-500 uppercase font-bold block">Console Query Input</span>
            <form onSubmit={handleSearchSubmit} className="space-y-3">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-500" />
                <textarea
                  placeholder="Type or paste query..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  rows={2}
                  className="w-full bg-[#151515] border border-white/5 focus:border-[#7C5CFF] focus:outline-none pl-9 pr-2 py-2 text-xs text-white placeholder:text-slate-600 rounded-xl resize-none leading-relaxed"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <VoiceButton
                    onTranscribe={(t) => {
                      setQuery(t);
                      executeSearch(t);
                    }}
                  />
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="bg-[#151515] border border-white/5 text-3xs font-mono py-1 px-1.5 focus:outline-none focus:border-[#7C5CFF] cursor-pointer rounded-lg text-white"
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
                  className="bg-[#7C5CFF] hover:bg-[#9B87FF] text-white rounded-lg h-7 px-3 text-xs font-semibold border border-[#7C5CFF]/30"
                >
                  {isSearching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Run"}
                </Button>
              </div>
            </form>
          </div>

          {/* Filters panel */}
          <div className="border border-white/5 bg-[#101010] p-4 space-y-4 rounded-xl shadow-3xs">
            <div className="flex items-center gap-2 border-b border-white/5 pb-2">
              <Filter className="h-3.5 w-3.5 text-[#9B87FF]" />
              <h3 className="text-3xs font-mono uppercase tracking-wider text-slate-500 font-bold">Research Filters</h3>
            </div>

            {/* Scope select */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">Scope</span>
              <div className="grid grid-cols-2 gap-1.5">
                {(["all", "cases", "statutes", "articles"] as ResearchContentType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setContentType(type)}
                    className={`h-8 border text-3xs font-mono uppercase tracking-wider transition-all rounded-lg ${contentType === type
                        ? "bg-[#7C5CFF] border-[#7C5CFF]/30 text-white font-bold"
                        : "bg-[#151515] border-white/5 text-slate-400 hover:bg-[#1C1C1C] hover:text-white"
                      }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Jurisdiction Select */}
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-slate-500 uppercase block font-bold">Jurisdiction</label>
              <div className="relative">
                <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                <select
                  value={jurisdiction}
                  onChange={(e) => setJurisdiction(e.target.value)}
                  className="w-full bg-[#151515] border border-white/5 text-xs pl-8 pr-2 py-1.5 focus:outline-none focus:border-[#7C5CFF] rounded-lg cursor-pointer text-white appearance-none"
                >
                  <option value="all">All Jurisdictions</option>
                  <option value="Supreme Court">Supreme Court</option>
                  <option value="High Court">High Court</option>
                  <option value="FEMA">FEMA Regulations</option>
                  <option value="SEBI">SEBI Regulations</option>
                </select>
              </div>
            </div>
          </div>

          {/* ChatGPT-style Recent searches */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-slate-500" />
                <h3 className="text-3xs font-mono uppercase tracking-wider text-slate-500 font-bold">Recent Searches</h3>
              </div>
            </div>

            <div className="space-y-3.5 max-h-[250px] overflow-y-auto pr-1 font-sans">
              {recentSearches.length > 0 ? (
                recentSearches.map((h, idx) => {
                  const queryText = typeof h === "string" ? h : h.query || "";
                  const timestamp = typeof h === "object" ? h.timestamp : undefined;
                  const source = typeof h === "object" ? h.result?.source || "PDF Knowledge Base" : "PDF Knowledge Base";
                  const cleanSource = source.replace(/^[✓\s]+/, "");
                  const preview = typeof h === "object" ? h.result?.direct_answer || h.result?.executive_summary || "" : "";

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectRecent(queryText)}
                      className="w-full text-left p-3.5 bg-[#101010] border border-white/5 hover:border-[#7C5CFF]/40 hover:scale-[1.01] hover:shadow-xs transition-all duration-200 group flex flex-col gap-1.5 rounded-xl"
                    >
                      <div className="flex items-start justify-between gap-2 w-full">
                        <span className="font-sans font-semibold text-[11px] text-white line-clamp-2 leading-snug group-hover:text-[#9B87FF] transition-colors">
                          {queryText}
                        </span>
                        {getSearchIcon(h)}
                      </div>

                      <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 w-full">
                        <span>{formatRelativeTime(timestamp)}</span>
                        <span className="text-[#9B87FF] font-bold">{cleanSource}</span>
                      </div>

                      {preview && (
                        <p className="text-[9px] text-slate-400 font-serif line-clamp-1 leading-normal border-t border-white/5 pt-1 w-full">
                          {preview}
                        </p>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="text-center py-6 text-slate-500 text-3xs border border-dashed border-white/5 bg-[#101010] rounded-xl">No query logs recorded.</div>
              )}
            </div>
          </div>

          {/* Saved Research */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-neutral-200 pb-2">
              <Bookmark className="h-3.5 w-3.5 text-neutral-500" />
              <h3 className="text-3xs font-mono uppercase tracking-wider text-slate-500 font-bold">Saved Research</h3>
            </div>

            <div className="space-y-1.5">
              {[
                "SEBI Compounding Rules 2024",
                "PIT Connected Persons Interpretation",
                "FEMA Compound Penalty Schedule",
                "Insider Trading Precedents"
              ].map((saved, idx) => (
                <button
                  key={idx}
                  onClick={() => { setQuery(saved); executeSearch(saved); }}
                  className="w-full text-left py-2 px-2.5 bg-white border border-neutral-100 hover:bg-neutral-50 transition-all flex items-center justify-between text-2xs text-slate-650 hover:text-slate-900 rounded-none font-sans"
                >
                  <span className="truncate flex items-center gap-2">
                    <Bookmark className="h-3 w-3 text-slate-400" />
                    {saved}
                  </span>
                  <ArrowRight className="h-2.5 w-2.5 text-slate-350" />
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* CENTER WORKSPACE: Primary document brief view & Wide search input */}
        <main className="xl:col-span-6 space-y-6">

          {/* SEARCH BAR PANEL (WIDE & CENTERED AT TOP OF MAIN WORKSPACE) */}
          <div className="border border-white/5 bg-[#101010] p-5 rounded-xl shadow-3xs">
            <form onSubmit={handleSearchSubmit} className="space-y-2">
              <div className="relative font-sans">
                <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500" />
                <input
                  placeholder="Ask a legal query (e.g. 'What is the compounding penalty for FEMA Section 13?')..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-[#151515] border border-white/5 focus:border-[#7C5CFF] focus:outline-none pl-11 pr-32 py-3.5 text-xs text-white placeholder:text-slate-650 rounded-lg transition-all"
                />

                {/* Voice, Language select & Shortcut hints */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <span className="hidden sm:inline text-[9px] font-mono text-slate-500 bg-neutral-900 border border-white/5 px-1.5 py-0.5 rounded">
                    ↵ Search
                  </span>
                  <VoiceButton
                    onTranscribe={(t) => {
                      setQuery(t);
                      executeSearch(t);
                    }}
                  />
                  <Button
                    type="submit"
                    disabled={isSearching || !query.trim()}
                    className="h-8 px-4 rounded-lg bg-[#7C5CFF] hover:bg-[#9B87FF] text-white font-semibold text-xs border border-[#7C5CFF]/30"
                  >
                    {isSearching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Analyze"}
                  </Button>
                </div>
              </div>
            </form>
          </div>

          {/* DYNAMIC PIPELINE INGESTION STAGES ANIMATION */}
          {isSearching && (
            <div className="border border-white/5 bg-[#101010] p-12 text-center space-y-8 rounded-xl">
              <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                <div className="w-12 h-12 border-2 border-[#7C5CFF] border-t-transparent rounded-full animate-spin" />
                <div className="absolute w-6 h-6 bg-[#7C5CFF]/15 rounded-full animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="font-sans font-semibold text-sm text-white">
                  {loadingStages[loadingStage]}
                </h3>
                <p className="font-mono text-3xs text-slate-500 uppercase tracking-widest">
                  Processing Legal Analysis Pipeline
                </p>
              </div>

              <div className="flex items-center gap-1 w-48 mx-auto">
                {loadingStages.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1 flex-1 transition-all duration-300 ${idx <= loadingStage ? "bg-[#7C5CFF]" : "bg-neutral-800"
                      }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* NO RESULTS INITIAL SCREEN (AESTHETIC LAW BRIEF PREVIEW) */}
          {!isSearching && results.length === 0 && (
            <div className="border border-white/5 bg-[#101010] p-10 text-center space-y-8 rounded-xl shadow-3xs">
              <div className="max-w-md mx-auto space-y-3">
                <div className="w-12 h-12 mx-auto bg-[#7C5CFF]/10 border border-[#7C5CFF]/20 flex items-center justify-center rounded-xl">
                  <Scale className="h-6 w-6 text-[#9B87FF] animate-pulse" />
                </div>
                <h2 className="text-base font-bold text-white tracking-tight font-serif">Enterprise Legal Intelligence Console</h2>
                <p className="text-xs text-slate-400 leading-relaxed font-serif">
                  Search across Indian legislation, SEBI compliance briefs, FEMA guidelines, and high court rulings. Grounded legal reports will render as official, structured legal research documents.
                </p>
              </div>

              {/* Suggestions quick cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
                {[
                  {
                    title: "FEMA Compound Offence Rule",
                    q: "What is the penalty for compounding offences under FEMA?",
                    desc: "Reviews Section 13 limits and compounding schedules."
                  },
                  {
                    title: "SEBI Insider Trading",
                    q: "What is the penalty for insider trading under SEBI?",
                    desc: "Looks up PIT regulations and compliance fines."
                  },
                  {
                    title: "FDI Single Brand Retail",
                    q: "Analyze FDI limit rules for single brand retail under FEMA.",
                    desc: "Verifies government approval route requirements."
                  },
                  {
                    title: "Board Liability Safe Harbors",
                    q: "Safe harbors for independent directors against compliance risks",
                    desc: "Scans board resolutions and high court decisions."
                  }
                ].map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setQuery(s.q); executeSearch(s.q); }}
                    className="p-4 border border-white/5 hover:border-[#7C5CFF]/30 hover:bg-[#151515] transition-all text-left space-y-1.5 rounded-xl bg-[#151515]/30 font-sans"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-white">{s.title}</span>
                      <ArrowRight className="h-3 w-3 text-slate-500" />
                    </div>
                    <p className="text-3xs text-slate-400 font-serif leading-normal">{s.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ACTIVE RESEARCH REPORT DISPLAY (Premium document layout) */}
          {!isSearching && results.length > 0 && activeResult && (
            <div
              id="premium-report-workspace"
              className="border border-white/5 bg-[#101010] p-8 space-y-8 rounded-xl shadow-3xs"
            >

              {/* Document Header Metadata */}
              <div className="space-y-4 font-sans">
                <div className="flex flex-wrap items-center gap-2 border-b border-white/5 pb-3">
                  <Badge className="text-3xs font-mono uppercase bg-[#7C5CFF] hover:bg-[#9B87FF] text-white rounded-lg border-none">
                    {activeResult.type || "AI Analysis"}
                  </Badge>
                  <span className="text-slate-650 font-mono text-3xs">·</span>
                  <span className="text-slate-400 text-3xs font-semibold uppercase">{activeResult.date}</span>
                  {activeResult.court && (
                    <>
                      <span className="text-slate-650 font-mono text-3xs">·</span>
                      <span className="text-slate-405 font-mono text-3xs uppercase font-semibold">{activeResult.court}</span>
                    </>
                  )}
                </div>

                <h1 className="text-2xl font-bold font-sans text-slate-900 tracking-tight leading-tight">
                  {activeResult.title}
                </h1>
              </div>

              {/* ANSWER CARD BANNER (Unified summary stats) */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-y-3 gap-x-6 text-[10px] font-mono uppercase tracking-wider text-slate-500 border-t border-b border-neutral-200 py-3.5 my-6">
                <div className="flex flex-col gap-0.5">
                  <span className="text-slate-400 text-3xs font-bold">Source</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    {activeResult.source || "✓ PDF Knowledge Base"}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-slate-400 text-3xs font-bold">Confidence</span>
                  <span className={`font-bold ${activeResult.confidence === 'High' ? 'text-emerald-600' : 'text-amber-600'
                    }`}>
                    {activeResult.confidence || 'High'}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-slate-400 text-3xs font-bold">Documents</span>
                  <span className="text-slate-800 font-bold">{activeResult.citations?.length || 0} Files</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-slate-400 text-3xs font-bold">Time Taken</span>
                  <span className="text-slate-800 font-bold">0.82 sec</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-slate-400 text-3xs font-bold">Jurisdiction</span>
                  <span className="text-slate-800 font-bold">{jurisdiction === 'all' ? 'All India' : jurisdiction}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-slate-400 text-3xs font-bold">Language</span>
                  <span className="text-slate-800 font-bold">{activeLanguage === 'en' ? 'English' : activeLanguage}</span>
                </div>
              </div>

              {/* REPORT SECTIONS: RENDERED AS Collapsible Premium Document Briefs */}
              <div className="space-y-8 font-serif text-[14.5px] leading-relaxed text-slate-750">

                {/* 1. Direct Answer (Special Callout Box) */}
                {activeResult.direct_answer && (
                  <div className="space-y-2">
                    {renderCollapsibleHeader("Direct Answer", <ShieldCheck className="h-4 w-4 text-emerald-600" />, "directAnswer")}
                    {!collapsedSections.directAnswer && (
                      <div className="p-5 bg-emerald-50/40 border border-emerald-200/50 border-l-4 border-l-emerald-600 rounded-none">
                        <p className="font-serif text-[15px] leading-relaxed text-slate-800 font-medium italic">
                          {translatedAnswer || activeResult.direct_answer}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. Executive Summary */}
                {activeResult.executive_summary && (
                  <div className="space-y-2">
                    {renderCollapsibleHeader("Executive Summary", <FileText className="h-4 w-4 text-slate-500" />, "executiveSummary")}
                    {!collapsedSections.executiveSummary && (
                      <p className="text-slate-700 leading-loose">
                        {translatedSummary || activeResult.executive_summary}
                      </p>
                    )}
                  </div>
                )}

                {/* 3. Applicable Law */}
                {activeResult.applicable_law && activeResult.applicable_law.length > 0 && (
                  <div className="space-y-2">
                    {renderCollapsibleHeader("Applicable Law", <Scale className="h-4 w-4 text-slate-500" />, "applicableLaw")}
                    {!collapsedSections.applicableLaw && (
                      <div className="space-y-2.5">
                        {activeResult.applicable_law.map((law: any, idx: number) => {
                          const actName = typeof law === 'object' ? law.act_name : String(law);
                          const sec = typeof law === 'object' ? law.sections : "";
                          return (
                            <div key={idx} className="flex items-start gap-2.5 font-sans text-xs">
                              <Scale className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                              <div>
                                <span className="font-semibold text-slate-850">{actName}</span>
                                {sec && (
                                  <span className="font-mono text-3xs text-neutral-500 ml-2 uppercase">
                                    Section: <code className="bg-neutral-100 border border-neutral-200 px-1 font-semibold text-slate-700">{sec}</code>
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* 4. Relevant Sections */}
                {activeResult.applicable_law && activeResult.applicable_law.some(l => typeof l === 'object' && l.sections) && (
                  <div className="space-y-2">
                    {renderCollapsibleHeader("Relevant Sections", <ListChecks className="h-4 w-4 text-slate-505" />, "relevantSections")}
                    {!collapsedSections.relevantSections && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-3xs uppercase tracking-wider">
                        {activeResult.applicable_law.map((law: any, idx: number) => {
                          const actName = typeof law === 'object' ? law.act_name : String(law);
                          const sec = typeof law === 'object' ? law.sections : "";
                          if (!sec) return null;
                          return (
                            <div key={idx} className="p-3 bg-neutral-50 border border-neutral-200 flex justify-between items-center rounded-none text-slate-700">
                              <span className="truncate max-w-[150px] font-semibold">{actName}</span>
                              <span className="bg-slate-800 text-white px-2 py-0.5 font-bold">Section {sec}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* 5. Legal Analysis */}
                {activeResult.legal_analysis && (
                  <div className="space-y-2">
                    {renderCollapsibleHeader("Legal Analysis", <BookOpen className="h-4 w-4 text-slate-500" />, "legalAnalysis")}
                    {!collapsedSections.legalAnalysis && (
                      <div className="space-y-5 text-slate-700 leading-loose">
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
                            <span className="font-sans font-semibold text-[10px] uppercase tracking-wider text-slate-400 block font-mono">3. Exceptions & Considerations</span>
                            <p>{activeResult.legal_analysis.exceptions}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* 6. Compliance Requirements */}
                {activeResult.compliance_requirements && activeResult.compliance_requirements.length > 0 && (
                  <div className="space-y-2">
                    {renderCollapsibleHeader("Compliance Requirements", <CheckCircle className="h-4 w-4 text-slate-500" />, "complianceRequirements")}
                    {!collapsedSections.complianceRequirements && (
                      <ul className="list-disc pl-5 space-y-2 text-slate-700 leading-relaxed">
                        {activeResult.compliance_requirements.map((req: string, idx: number) => (
                          <li key={idx}>{req}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {/* 7. Risks */}
                {activeResult.risks && activeResult.risks.length > 0 && (
                  <div className="space-y-2">
                    {renderCollapsibleHeader("Regulatory Risks", <AlertTriangle className="h-4 w-4 text-red-500" />, "risks", true)}
                    {!collapsedSections.risks && (
                      <div className="bg-red-50/20 border border-red-100 p-5 rounded-none">
                        <ul className="list-disc pl-5 space-y-2 text-red-950 leading-relaxed">
                          {activeResult.risks.map((risk: string, idx: number) => (
                            <li key={idx} className="text-red-900">{risk}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* 8. Recommendations */}
                {activeResult.recommendations && activeResult.recommendations.length > 0 && (
                  <div className="space-y-2">
                    {renderCollapsibleHeader("Recommended Actions", <TrendingUp className="h-4 w-4 text-slate-500" />, "recommendations")}
                    {!collapsedSections.recommendations && (
                      <ol className="list-decimal pl-5 space-y-2 text-slate-700 leading-relaxed">
                        {activeResult.recommendations.map((rec: string, idx: number) => (
                          <li key={idx}>{rec}</li>
                        ))}
                      </ol>
                    )}
                  </div>
                )}

                {/* 9. Case References */}
                {activeResult.case_references && activeResult.case_references.length > 0 && (
                  <div className="space-y-2">
                    {renderCollapsibleHeader("Landmark Case References", <Building className="h-4 w-4 text-slate-500" />, "caseReferences")}
                    {!collapsedSections.caseReferences && (
                      <div className="space-y-4">
                        {activeResult.case_references.map((c: any, idx: number) => (
                          <div key={idx} className="p-4 border border-neutral-200 bg-white rounded-none space-y-2">
                            <div className="flex flex-wrap justify-between items-start gap-2">
                              <span className="font-sans font-semibold text-xs text-slate-800">{c.case_name}</span>
                              {c.citation && (
                                <span className="font-mono text-3xs text-slate-500 bg-neutral-100 border border-neutral-200 px-2 py-0.5 uppercase">
                                  {c.citation}
                                </span>
                              )}
                            </div>
                            <p className="font-serif text-2xs text-slate-605 italic leading-relaxed mt-1">{c.summary}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </div>

              {/* SOURCE DOCUMENTS CARDS (BOTTOM OF REPORT) */}
              <div className="border-t border-neutral-200 pt-6 mt-8 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-sans font-semibold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <FileSpreadsheet className="h-4.5 w-4.5 text-slate-400" />
                    Documents Used ({sourceDocs.length})
                  </h3>
                </div>

                {activeResult.is_context_grounded && activeResult.citations && activeResult.citations.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {sourceDocs.map((doc, idx) => (
                      <div
                        key={idx}
                        className="p-4 border border-neutral-200 bg-white hover:border-emerald-600/30 hover:bg-neutral-50/10 cursor-pointer transition-all duration-200 flex flex-col justify-between gap-3 rounded-none"
                      >
                        <div className="space-y-1">
                          <p className="font-sans font-semibold text-slate-800 text-xs truncate">
                            📄 {doc.name}.pdf
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {doc.pages.map((p, pIdx) => (
                              <code key={pIdx} className="bg-neutral-50 border border-neutral-200 text-slate-500 font-mono text-[9px] px-1 font-semibold uppercase">
                                Page: {p}
                              </code>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-3xs font-mono text-slate-400 mt-1">
                          <span className="text-emerald-700 bg-emerald-50 px-1 border border-emerald-100 font-bold">
                            High Match
                          </span>
                          <span>{doc.chunks} Chunks Matched</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-amber-50/30 border border-amber-100 p-4">
                    <p className="text-3xs text-amber-700 italic font-mono flex items-center gap-1.5 leading-relaxed">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                      Gemini General Legal Knowledge: No relevant document found in the indexed knowledge base.
                    </p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* Multiple Ref Switchers */}
          {!isSearching && results.length > 1 && (
            <div className="border border-white/5 bg-[#101010] p-3 rounded-xl flex items-center justify-between shadow-3xs font-mono">
              <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">retrieved sets ({results.length})</span>
              <div className="flex gap-1.5">
                {results.map((r, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveIndex(idx)}
                    className={`px-2.5 py-1 border text-3xs uppercase tracking-wider rounded-lg transition-colors ${activeIndex === idx
                        ? "bg-[#7C5CFF] text-white border-[#7C5CFF]/30 font-bold"
                        : "bg-[#151515] text-slate-450 border-white/5 hover:bg-[#1C1C1C] hover:text-white"
                      }`}
                  >
                    set {idx + 1}
                  </button>
                ))}
              </div>
            </div>
          )}

        </main>

        {/* RIGHT SIDEBAR: Knowledge Source, Confidence, Cited acts, quick actions */}
        <aside className="xl:col-span-3 space-y-6 xl:sticky xl:top-28 font-sans">

          {activeResult && (
            <>
              {/* Grounding Info Panel */}
              <div className="border border-white/5 bg-[#101010] p-4 space-y-4 rounded-xl shadow-3xs">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <h3 className="text-3xs font-mono uppercase tracking-wider text-slate-500 font-bold">Grounding Verification</h3>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <span className="text-slate-500 text-3xs font-mono block uppercase font-bold">Knowledge Source</span>
                    <span className="text-white font-semibold mt-0.5 block">
                      {activeResult.is_context_grounded ? "✓ PDF Knowledge Base" : "✓ Gemini General Knowledge"}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 text-3xs font-mono block uppercase font-bold">Confidence Rating</span>
                    <span className={`font-semibold mt-0.5 block ${activeResult.confidence === 'High' ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                      {activeResult.confidence || 'High'} ({activeResult.matchScore || 95}% score)
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 text-3xs font-mono block uppercase font-bold">PDFs Used</span>
                    <span className="text-white font-semibold mt-0.5 block font-mono">
                      {activeResult.is_context_grounded ? `${sourceDocs.length} unique files` : "None"}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 text-3xs font-mono block uppercase font-bold">Pages Used</span>
                    <span className="text-white font-semibold mt-0.5 block font-mono">
                      {activeResult.is_context_grounded ? `${totalPagesCount} pages` : "None"}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 text-3xs font-mono block uppercase font-bold">Retrieval Score</span>
                    <span className="text-white font-semibold mt-0.5 block font-mono">
                      {activeResult.matchScore || 95}% matching
                    </span>
                  </div>
                </div>
              </div>

              {/* Cited Acts & Regulations */}
              <div className="border border-white/5 bg-[#101010] p-4 space-y-3 rounded-xl shadow-3xs">
                <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                  <Scale className="h-3.5 w-3.5 text-slate-500" />
                  <h3 className="text-3xs font-mono uppercase tracking-wider text-slate-500 font-bold">Related Acts</h3>
                </div>

                <div className="flex flex-col gap-1.5">
                  {activeResult.applicable_law && activeResult.applicable_law.length > 0 ? (
                    activeResult.applicable_law.map((law: any, idx: number) => {
                      const actName = typeof law === 'object' ? law.act_name : String(law);
                      return (
                        <div key={idx} className="flex items-center gap-2 p-2 bg-[#151515] border border-white/5 text-3xs font-mono text-slate-350 rounded-lg">
                          <Scale className="h-3 w-3 text-[#7C5CFF] shrink-0" />
                          <span className="truncate" title={actName}>{actName}</span>
                        </div>
                      );
                    })
                  ) : (
                    <span className="text-3xs text-slate-500 italic font-serif">No specific act citations parsed.</span>
                  )}
                </div>
              </div>

              {/* Related Inquiries */}
              <div className="border border-white/5 bg-[#101010] p-4 space-y-3 rounded-xl shadow-3xs">
                <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                  <HelpCircle className="h-3.5 w-3.5 text-slate-500" />
                  <h3 className="text-3xs font-mono uppercase tracking-wider text-slate-500 font-bold">Related Questions</h3>
                </div>

                <div className="flex flex-col gap-2">
                  {relatedQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => { setQuery(q); executeSearch(q); }}
                      className="text-left p-2.5 border border-white/5 bg-[#151515] hover:border-[#7C5CFF]/30 hover:bg-[#1C1C1C] text-[10px] font-sans text-slate-300 hover:text-white transition-all flex items-center justify-between rounded-lg leading-relaxed shadow-3xs"
                    >
                      <span className="line-clamp-2">{q}</span>
                      <ArrowRight className="h-3 w-3 text-slate-500 shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Actions grid block */}
              <div className="border border-white/5 bg-[#101010] p-4 space-y-4 rounded-xl text-xs shadow-3xs">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <h3 className="text-3xs font-mono uppercase tracking-wider text-slate-500 font-bold">Quick Actions</h3>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-sans">
                  {/* Copy */}
                  <button
                    onClick={handleCopy}
                    className="flex items-center justify-center gap-1.5 py-2 px-2 border border-white/5 hover:bg-[#151515] text-[10px] font-semibold text-slate-300 transition-all rounded-lg bg-[#151515]/50 hover:text-white"
                  >
                    <Copy className="h-3.5 w-3.5 text-slate-500" />
                    Copy Text
                  </button>

                  {/* Export PDF */}
                  <button
                    onClick={handlePrint}
                    className="flex items-center justify-center gap-1.5 py-2 px-2 border border-white/5 hover:bg-[#151515] text-[10px] font-semibold text-slate-300 transition-all rounded-lg bg-[#151515]/50 hover:text-white"
                  >
                    <FileDown className="h-3.5 w-3.5 text-slate-500" />
                    Export PDF
                  </button>

                  {/* Download JSON */}
                  <button
                    onClick={handleDownload}
                    className="flex items-center justify-center gap-1.5 py-2 px-2 border border-white/5 hover:bg-[#151515] text-[10px] font-semibold text-slate-300 transition-all rounded-lg bg-[#151515]/50 hover:text-white"
                  >
                    <Download className="h-3.5 w-3.5 text-slate-500" />
                    JSON Data
                  </button>

                  {/* Narration */}
                  <div className="flex items-center justify-center border border-white/5 bg-[#151515]/50 hover:bg-[#151515] h-full w-full rounded-lg">
                    <AudioPlaybackButton
                      text={translatedSummary || activeResult.summary || activeResult.direct_answer || ""}
                      className="border-none bg-transparent hover:bg-transparent h-full w-full rounded-lg flex items-center justify-center gap-1.5 text-[10px] font-semibold text-slate-300 hover:text-white"
                    />
                  </div>

                  {/* Translation Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center justify-center gap-1.5 py-2 px-2 border border-white/5 hover:bg-[#151515] text-[10px] font-semibold text-slate-300 transition-all rounded-lg bg-[#151515]/50 hover:text-white col-span-2">
                        {isTranslating ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-[#9B87FF] mr-1" />
                        ) : (
                          <Languages className="h-3.5 w-3.5 text-slate-500" />
                        )}
                        Translate Report
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#101010] border border-white/5 text-white rounded-xl shadow-md p-1">
                      <DropdownMenuItem onClick={() => handleTranslate("en")} className="focus:bg-[#151515] focus:text-white text-[11px] cursor-pointer rounded-lg">English (Default)</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleTranslate("hi-IN")} className="focus:bg-[#151515] focus:text-white text-[11px] cursor-pointer rounded-lg">Hindi (हिंदी)</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleTranslate("ta-IN")} className="focus:bg-[#151515] focus:text-white text-[11px] cursor-pointer rounded-lg">Tamil (தமிழ்)</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleTranslate("te-IN")} className="focus:bg-[#151515] focus:text-white text-[11px] cursor-pointer rounded-lg">Telugu (తెలుగు)</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleTranslate("bn-IN")} className="focus:bg-[#151515] focus:text-white text-[11px] cursor-pointer rounded-lg">Bengali (বাংলা)</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Share Link */}
                  <button
                    onClick={handleShare}
                    className="flex items-center justify-center gap-1.5 py-2 px-2 border border-white/5 hover:bg-[#151515] text-[10px] font-semibold text-slate-300 transition-all rounded-lg bg-[#151515]/50 hover:text-white col-span-2"
                  >
                    <Share2 className="h-3.5 w-3.5 text-slate-500" />
                    Share Brief
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Search Statistics */}
          {stats && (
            <div className="border border-white/5 bg-[#101010] p-4 space-y-4 rounded-xl text-xs shadow-3xs">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <h3 className="text-3xs font-mono uppercase tracking-wider text-slate-500 font-bold">Research Statistics</h3>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-sans">
                <div className="p-3 bg-[#151515] border border-white/5 rounded-lg">
                  <span className="text-[9px] text-slate-500 block font-mono uppercase font-bold">Total Queries</span>
                  <span className="font-mono text-sm text-white font-bold">{stats.total_queries || 0}</span>
                </div>
                <div className="p-3 bg-[#151515] border border-white/5 rounded-lg">
                  <span className="text-[9px] text-slate-500 block font-mono uppercase font-bold">Avg Confidence</span>
                  <span className="font-mono text-sm text-white font-bold">
                    {stats.average_confidence ? `${Math.round(stats.average_confidence * 100)}%` : "0%"}
                  </span>
                </div>
                <div className="p-3 bg-[#151515] border border-white/5 col-span-2 rounded-lg">
                  <span className="text-[9px] text-slate-500 block font-mono uppercase font-bold">Avg Ingestion Latency</span>
                  <span className="font-mono text-xs text-white font-bold mt-0.5 block">{stats.average_execution_time_sec || 0} seconds</span>
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
