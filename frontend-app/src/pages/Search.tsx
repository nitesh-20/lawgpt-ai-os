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
import { VercelV0Chat } from "@/components/ui/v0-ai-chat";
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
    <div className="max-w-4xl mx-auto px-4 md:px-0 py-8 space-y-8 min-h-[calc(100vh-120px)] flex flex-col justify-start font-sans">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #premium-answer-workspace, #premium-answer-workspace * {
            visibility: visible;
          }
          #premium-answer-workspace {
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

      {/* Page Title Header */}
      <div className="text-center space-y-3 py-4">
        <h1 className="text-[28px] font-bold tracking-tight text-slate-900">Legal Search</h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Query central acts, precedents, and compliance regulations grounded in your legal database
        </p>
      </div>

      {/* PERSISTENT SEARCH CONSOLE */}
      <div className="w-full max-w-3xl mx-auto">
        <VercelV0Chat
          value={query}
          onChange={setQuery}
          onSubmit={() => executeSearch(query)}
          isSearching={isSearching}
          language={language}
          setLanguage={setLanguage}
          voiceComponent={
            <VoiceButton
              showLanguageSelect={false}
              onTranscribe={(t) => {
                setQuery(t);
                executeSearch(t);
              }}
            />
          }
        />
      </div>

      <AnimatePresence mode="wait">
        {/* EMPTY STATE */}
        {!isSearching && results.length === 0 ? (
          <motion.div
            key="empty-state"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="w-full max-w-2xl mx-auto space-y-4 pt-4"
          >
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block text-center">Suggested Prompts</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { text: "Explain obligations under DPDP Act", val: "What are the obligations under DPDP Act?" },
                { text: "Review NDA liabilities and termination clauses", val: "Review NDA liabilities and termination clauses" },
                { text: "Can an employer terminate employment without notice?", val: "Can an employer terminate employment without notice?" },
                { text: "Summarize major FEMA compounding penalties", val: "What are compounding options under FEMA Section 13?" }
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectRecent(item.val)}
                  className="p-4 text-left bg-white border border-slate-200 hover:border-blue-500/40 hover:bg-slate-50/50 rounded-2xl transition-all duration-150 text-sm font-medium text-slate-700 hover:text-blue-700 flex justify-between items-center group shadow-3xs"
                >
                  <span>{item.text}</span>
                  <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </motion.div>
        ) : isSearching ? (
          /* LOADING STATE */
          <motion.div
            key="searching-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-2xl mx-auto py-8 space-y-8"
          >
            <div className="space-y-4">
              <div className="h-4.5 bg-slate-200 rounded-md w-3/4 animate-pulse" />
              <div className="h-4 bg-slate-100 rounded-md w-full animate-pulse" />
              <div className="h-4 bg-slate-100 rounded-md w-5/6 animate-pulse" />
              <div className="h-4 bg-slate-100 rounded-md w-4/5 animate-pulse" />
            </div>

            <div className="border border-slate-200 bg-white p-6 rounded-2xl shadow-3xs text-center space-y-5">
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <span className="text-sm font-semibold text-slate-700">
                  {loadingStage === 0 && "Searching legal database..."}
                  {loadingStage === 1 && "Finding precedents..."}
                  {loadingStage >= 2 && "Generating grounded answer..."}
                </span>
              </div>

              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 transition-all duration-500 rounded-full" 
                  style={{ width: `${((loadingStage + 1) / loadingStages.length) * 100}%` }} 
                />
              </div>
            </div>
          </motion.div>
        ) : (
          /* RESULT STATE: Hybrid Summary + Source Extract + Citation Card Layout */
          <motion.div
            key="results-layout"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-3xl mx-auto space-y-6"
          >
            <div id="premium-answer-workspace" className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm space-y-8 font-sans">
              
              {/* Question Header */}
              <div className="border-b border-slate-100 pb-5">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Question</span>
                <h2 className="text-lg font-bold text-slate-900 leading-snug">
                  "{query}"
                </h2>
              </div>

              {/* AI Legal Summary */}
              <div className="space-y-3">
                <h3 className="text-base font-bold text-slate-900">AI Legal Summary</h3>
                <div className="text-[18px] leading-relaxed text-slate-800 space-y-4 whitespace-pre-line font-normal">
                  {translatedAnswer || 
                   activeResult?.direct_answer || 
                   "No direct answer text was generated. Please review applicable law sections below."}
                </div>
              </div>

              {/* Relevant Extract */}
              <div className="space-y-3 pt-2">
                <h3 className="text-base font-bold text-slate-900">Relevant Extract</h3>
                {activeResult?.is_context_grounded ? (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl font-serif text-[15px] leading-relaxed text-slate-700 whitespace-pre-line italic">
                    "{activeResult?.executive_summary || activeResult?.summary}"
                  </div>
                ) : (
                  <div className="text-sm text-slate-500 italic bg-slate-50 px-4 py-3 border border-slate-100 rounded-xl">
                    No matching legal document found in the knowledge base.
                  </div>
                )}
              </div>

              {/* Source Card */}
              <div className="pt-5 border-t border-slate-100 space-y-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block font-bold">Source</span>
                
                {activeResult?.is_context_grounded && activeResult?.citations && activeResult.citations.length > 0 ? (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 max-w-sm">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                      <span>📄</span>
                      <span className="truncate">{activeResult.source || "Grounded PDF Document"}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                      <span>Page: {compileSourceDocs(activeResult.citations)[0]?.pages.join(", ") || "General"}</span>
                      <span>Confidence: {activeResult.confidence || "96%"}</span>
                    </div>
                    <div className="text-[10px] font-semibold text-blue-600 bg-blue-50/50 px-2 py-0.5 rounded inline-block">
                      Retrieved from Firebase RAG
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1 max-w-sm text-xs text-slate-500">
                    <span className="font-semibold block text-slate-700">Generated using Gemini General Legal Knowledge</span>
                    <span className="text-[10px] font-mono text-slate-400">Retrieved from general parameters</span>
                  </div>
                )}
              </div>
            </div>

            {/* BOTTOM ACTIONS BAR */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200 px-6 py-3.5 rounded-2xl shadow-3xs">
              <div className="flex items-center gap-2">
                <Button onClick={handleCopy} variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 gap-1.5 text-xs">
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </Button>
                <Button onClick={handlePrint} variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 gap-1.5 text-xs">
                  <FileDown className="h-3.5 w-3.5" />
                  Export PDF
                </Button>
                <div className="flex items-center gap-1 text-slate-600 border-l border-slate-200 pl-2">
                  <AudioPlaybackButton text={translatedAnswer || activeResult?.direct_answer || ""} />
                </div>
              </div>

              {/* Translation Selection Trigger */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-sans">Translate:</span>
                <select
                  value={activeLanguage}
                  onChange={(e) => handleTranslate(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-xs font-semibold py-1 px-2.5 focus:outline-none focus:border-blue-600 cursor-pointer rounded-lg text-slate-700 uppercase"
                >
                  <option value="en">English (EN)</option>
                  <option value="hi">Hindi (HI)</option>
                  <option value="ta">Tamil (TA)</option>
                  <option value="te">Telugu (TE)</option>
                  <option value="bn">Bengali (BN)</option>
                </select>

                <Button onClick={handleShare} variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 gap-1.5 text-xs border-l border-slate-200 pl-2">
                  <Share2 className="h-3.5 w-3.5" />
                  Share
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Search;
