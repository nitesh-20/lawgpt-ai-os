import { useState, useEffect, useRef } from "react";
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
  ListChecks,
  Mic,
  MicOff
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
import { synthesizeText } from "@/services/voice";
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

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isVoiceSearchRef = useRef(false);

  const [voiceModeActive, setVoiceModeActive] = useState(false);
  const [voicePhase, setVoicePhase] = useState<"idle" | "listening" | "thinking" | "searching" | "speaking">("idle");
  const voiceAudioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (voiceAudioRef.current) {
        voiceAudioRef.current.pause();
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.onstop = null;
        mediaRecorderRef.current.stop();
      }
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.stop();
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [results, isSearching]);

  useEffect(() => {
    const handleVoiceSearchTrigger = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail || !detail.query) return;

      const newResult = {
        id: crypto.randomUUID(),
        queryText: detail.query,
        direct_answer: detail.direct_answer,
        citations: detail.citations || [],
        is_context_grounded: detail.citations && detail.citations.length > 0,
        confidence: "95%",
        source: detail.citations && detail.citations.length > 0 ? detail.citations[0].source_name : undefined
      };

      setQuery(detail.query);
      setResults(prev => [...prev, newResult]);
      setActiveIndex(results.length);
      loadSidePanels();
    };

    window.addEventListener("voice-search-trigger", handleVoiceSearchTrigger);
    return () => {
      window.removeEventListener("voice-search-trigger", handleVoiceSearchTrigger);
    };
  }, [results.length]);

  const getLanguageCodeForText = (t: string) => {
    const devanagariRegex = /[\u0900-\u097F]/;
    const bengaliRegex = /[\u0980-\u09FF]/;
    if (devanagariRegex.test(t)) return "hi-IN";
    if (bengaliRegex.test(t)) return "bn-IN";
    return "en-IN"; // Default English
  };

  const speakText = async (textToSpeak: string) => {
    if (!textToSpeak.trim()) return;
    try {
      const base64Data = await synthesizeText(textToSpeak, detectedLang, "priya");
      if (base64Data) {
        const audioUrl = `data:audio/wav;base64,${base64Data}`;
        const audio = new Audio(audioUrl);
        audio.play();
      }
    } catch (e) {
      console.error("Auto-play speech synthesis failed:", e);
    }
  };

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

  // Start Hands-free Voice Mode
  const startVoiceMode = async () => {
    setVoiceModeActive(true);
    setVoicePhase("listening");
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      startListening(stream);
    } catch (err) {
      console.error("Mic access denied:", err);
      toast({
        title: "Microphone Access Denied",
        description: "Please grant microphone permissions in browser settings.",
        variant: "destructive"
      });
      setVoiceModeActive(false);
      setVoicePhase("idle");
    }
  };

  // Exit Hands-free Voice Mode
  const exitVoiceMode = () => {
    setVoiceModeActive(false);
    setVoicePhase("idle");
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
    }
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.stop();
    }
    if (voiceAudioRef.current) {
      voiceAudioRef.current.pause();
      voiceAudioRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      audioCtxRef.current.close();
    }
  };

  // Interrupt Speech (if speaking)
  const interruptVoice = () => {
    if (voiceAudioRef.current) {
      voiceAudioRef.current.pause();
      voiceAudioRef.current = null;
    }
    setVoicePhase("listening");
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      startListening(stream);
    });
  };

  // The actual listening turn
  const startListening = (stream: MediaStream) => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      try { mediaRecorderRef.current.stop(); } catch {}
    }

    setVoicePhase("listening");
    chunksRef.current = [];

    // 1. Initialize MediaRecorder for backend audio payload
    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;
    
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = async () => {
      const audioBlob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
      stream.getTracks().forEach((track) => track.stop());
      
      if (audioBlob.size > 0) {
        submitVoiceQuery(audioBlob);
      } else {
        setVoicePhase("idle");
        setVoiceModeActive(false);
      }
    };

    recorder.start();

    // 2. Initialize browser SpeechRecognition for live character streaming in input box
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = true;
      recognition.interimResults = true;
      
      const chosenLang = language === "en" ? "en-IN" : `${language}-IN`;
      recognition.lang = chosenLang;

      recognition.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        setQuery(finalTranscript || interimTranscript);
      };

      recognition.onerror = (err: any) => {
        console.warn("Speech recognition error:", err);
      };

      recognition.start();
    }

    // 3. Web Audio VAD silence detection (> 1.5 seconds)
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = audioContext;
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      let lastSpeechTime = Date.now();

      const checkSilence = () => {
        if (!voiceModeActive || recorder.state !== "recording") {
          if (audioContext && audioContext.state !== "closed") audioContext.close();
          return;
        }

        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;

        if (average > 8) {
          lastSpeechTime = Date.now();
        } else {
          if (Date.now() - lastSpeechTime > 1500) {
            console.log("Silence > 1.5s. Stopping recording to process request...");
            if (recorder.state === "recording") {
              recorder.stop();
            }
            if (recognitionRef.current) {
              recognitionRef.current.stop();
            }
            if (audioContext && audioContext.state !== "closed") {
              audioContext.close();
            }
            return;
          }
        }

        requestAnimationFrame(checkSilence);
      };

      setTimeout(() => {
        if (recorder.state === "recording") {
          checkSilence();
        }
      }, 1000);

    } catch (audioErr) {
      console.error("VAD setup error in hands-free mode:", audioErr);
    }
  };

  // Submit voice query to backend
  const submitVoiceQuery = async (audioBlob: Blob) => {
    setVoicePhase("thinking");
    try {
      const { voiceChat } = await import("@/services/voice");
      
      const chosenLang = language === "en" ? "en-IN" : `${language}-IN`;
      const result = await voiceChat(audioBlob, "hands_free_session", chosenLang);
      
      const newResult = {
        id: crypto.randomUUID(),
        queryText: result.transcript || query,
        direct_answer: result.response_text,
        citations: result.citations || [],
        is_context_grounded: result.citations && result.citations.length > 0,
        confidence: "95%",
        source: result.citations && result.citations.length > 0 ? result.citations[0].source_name : undefined
      };
      
      setResults(prev => [...prev, newResult]);
      setActiveIndex(results.length);
      loadSidePanels();

      if (result.response_audio) {
        setVoicePhase("speaking");
        const audio = new Audio(`data:audio/wav;base64,${result.response_audio}`);
        voiceAudioRef.current = audio;

        audio.onended = () => {
          voiceAudioRef.current = null;
          if (voiceModeActive) {
            navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
              startListening(stream);
            });
          }
        };

        audio.onerror = () => {
          voiceAudioRef.current = null;
          exitVoiceMode();
        };

        await audio.play();
      } else {
        exitVoiceMode();
      }
    } catch (err: any) {
      console.error("Hands-free turn failed:", err);
      setVoicePhase("idle");
      setVoiceModeActive(false);
      toast({
        title: "Voice Assistant Error",
        description: err.message || "Failed to complete voice turn.",
        variant: "destructive"
      });
    }
  };

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
      const mapped = searchResults.map(res => ({ ...res, queryText: searchTerm }));
      setResults(prev => [...prev, ...mapped]);
      setActiveIndex(results.length);
      
      // Auto-play TTS if voice search was triggered
      if (isVoiceSearchRef.current && searchResults.length > 0) {
        isVoiceSearchRef.current = false;
        setTimeout(() => {
          speakText(searchResults[0].direct_answer || "");
        }, 600);
      }
      
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
        className={`w-full flex items-center justify-between border-b pb-2 mb-3 select-none text-left transition-all ${isRed
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
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-white font-sans">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .assistant-chat-card, .assistant-chat-card * {
            visibility: visible;
          }
          .assistant-chat-card {
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

      {/* HEADER BAR */}
      <div className="flex-shrink-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-2xs z-10">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 bg-blue-600/10 text-blue-600 rounded-xl flex items-center justify-center font-bold">
            <Scale className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-md font-bold text-slate-900 leading-tight">Legal Search</h1>
            <p className="text-[10px] text-slate-400 font-mono">Grounded Indic Legal Reasoning Subsystem</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {results.length > 0 && (
            <Button
              onClick={handleNewResearch}
              variant="outline"
              size="sm"
              className="text-slate-600 hover:text-slate-900 gap-1.5 text-xs rounded-xl h-8 px-3 font-semibold border-slate-200"
            >
              Clear Chat
            </Button>
          )}
        </div>
      </div>

      {/* CONVERSATION AREA */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-4 py-8 md:px-8 space-y-8 scroll-smooth"
      >
        {results.length === 0 && !isSearching ? (
          /* EMPTY STATE (ChatGPT style centered suggestion list) */
          <div className="max-w-2xl mx-auto py-16 space-y-8 text-center my-auto">
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">How can I assist your legal research today?</h2>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Ask compliance queries, review draft liabilities, check compounding options, or search constitutional precedents.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
              {[
                { text: "Explain obligations under DPDP Act", val: "What are the obligations under DPDP Act?" },
                { text: "Review NDA liabilities and termination clauses", val: "Review NDA liabilities and termination clauses" },
                { text: "Can an employer terminate employment without notice?", val: "Can an employer terminate employment without notice?" },
                { text: "Summarize major FEMA compounding penalties", val: "What are compounding options under FEMA Section 13?" }
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectRecent(item.val)}
                  className="p-4 text-left bg-white border border-slate-200 hover:border-blue-500/30 hover:bg-slate-50/50 rounded-2xl transition-all duration-200 text-sm font-semibold text-slate-700 hover:text-blue-700 flex justify-between items-center group shadow-3xs"
                >
                  <span>{item.text}</span>
                  <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-8">
            <AnimatePresence initial={false}>
              {results.map((res, idx) => {
                const docList = compileSourceDocs(res.citations);
                return (
                  <motion.div
                    key={res.id || idx}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-6"
                  >
                    {/* User Bubble */}
                    <div className="flex justify-end">
                      <div className="bg-blue-600 text-white rounded-2xl rounded-tr-xs px-5 py-3 max-w-[85%] text-sm font-medium shadow-sm leading-relaxed">
                        {res.queryText || query}
                      </div>
                    </div>

                    {/* Assistant Bubble */}
                    <div className="flex justify-start">
                      <div className="assistant-chat-card bg-white border border-slate-200 rounded-2xl rounded-tl-xs p-6 md:p-8 w-full shadow-xs space-y-6 transition-all duration-200">
                        {/* AI Legal Summary */}
                        <div className="space-y-2.5">
                          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider text-xs text-blue-600">
                            <Sparkles className="h-4 w-4" />
                            AI Legal Summary
                          </h3>
                          <div className="text-[16px] leading-relaxed text-slate-800 whitespace-pre-line font-normal font-sans">
                            {translatedAnswer && idx === activeIndex ? translatedAnswer : (res.direct_answer || "No direct answer text was generated.")}
                          </div>
                        </div>

                        {/* Applicable Law Badges (if present) */}
                        {res.applicable_law && res.applicable_law.length > 0 && (
                          <div className="space-y-2 pt-2.5 border-t border-slate-100">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Applicable Law</h3>
                            <div className="flex flex-wrap gap-2">
                              {res.applicable_law.map((law: any, lIdx: number) => (
                                <div key={lIdx} className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 text-xs px-2.5 py-1 rounded-lg border border-slate-200/50 font-semibold">
                                  <span>⚖️</span>
                                  <span>{law.act_name || law}</span>
                                  {law.sections && <span className="text-[10px] text-slate-500 font-mono ml-0.5">(Section {law.sections})</span>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Relevant / Supporting Extract */}
                        <div className="space-y-2.5 pt-2.5 border-t border-slate-100">
                          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Supporting Legal Extract</h3>
                          {res.is_context_grounded ? (
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl font-serif text-sm leading-relaxed text-slate-700 italic">
                              "{res.executive_summary || res.summary}"
                            </div>
                          ) : (
                            <div className="text-xs text-slate-500 italic bg-slate-50 px-4 py-3 border border-slate-100 rounded-xl">
                              No matching legal document found in the knowledge base.
                            </div>
                          )}
                        </div>

                        {/* Source Card & Action Row */}
                        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          {/* Source Card */}
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Source</span>
                            {res.is_context_grounded && res.citations && res.citations.length > 0 ? (
                              <div className="inline-flex flex-col gap-0.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl max-w-xs shadow-3xs">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                                  <span>📄</span>
                                  <span className="truncate max-w-[150px]">{res.source || "Grounded PDF Document"}</span>
                                </div>
                                <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono">
                                  <span>Page: {docList[0]?.pages.join(", ") || "General"}</span>
                                  <span className="h-2.5 w-[1px] bg-slate-200" />
                                  <span>Similarity: {res.confidence || "96%"}</span>
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs font-semibold text-slate-500 italic">General Legal Knowledge</span>
                            )}
                          </div>

                          {/* Actions (copy, tts, translate) */}
                          <div className="flex items-center flex-wrap gap-2.5">
                            <Button onClick={() => handleCopy(res)} variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900 gap-1.5 text-xs h-8 px-2.5 rounded-lg hover:bg-slate-100">
                              <Copy className="h-3.5 w-3.5" />
                              Copy
                            </Button>
                            <Button onClick={() => handlePrint()} variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900 gap-1.5 text-xs h-8 px-2.5 rounded-lg hover:bg-slate-100">
                              <FileDown className="h-3.5 w-3.5" />
                              Export PDF
                            </Button>
                            <div className="h-4 w-[1px] bg-slate-200 hidden sm:block" />
                            <AudioPlaybackButton text={res.direct_answer || ""} />
                            <select
                              value={idx === activeIndex ? activeLanguage : "en"}
                              onChange={(e) => {
                                setActiveIndex(idx);
                                handleTranslate(e.target.value);
                              }}
                              className="bg-slate-50 border border-slate-200 text-xs font-semibold py-1 px-2.5 focus:outline-none focus:border-blue-600 cursor-pointer rounded-lg text-slate-700 uppercase h-8"
                            >
                              <option value="en">EN</option>
                              <option value="hi">HI</option>
                              <option value="ta">TA</option>
                              <option value="te">TE</option>
                              <option value="bn">BN</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Loading / Searching Bubble */}
        {isSearching && (
          <div className="space-y-6 max-w-3xl mx-auto animate-pulse">
            <div className="flex justify-end">
              <div className="bg-blue-600/70 text-white rounded-2xl rounded-tr-xs px-5 py-3 max-w-[80%] text-sm font-medium">
                {query}
              </div>
            </div>
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs p-6 md:p-8 w-full max-w-full shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  <span>
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
            </div>
          </div>
        )}
      </div>

      {/* STICKY BOTTOM INPUT COMPOSER */}
      <div className="flex-shrink-0 bg-white border-t border-slate-100 p-4 md:p-6 z-10">
        {voicePhase !== "idle" && (
          <div className="max-w-3xl mx-auto mb-3.5 flex items-center justify-between bg-slate-50 border border-slate-200/60 px-4 py-2.5 rounded-2xl animate-fade-in shadow-2xs">
            <div className="flex items-center gap-2.5">
              <span className={cn(
                "h-2 w-2 rounded-full",
                voicePhase === "listening" && "bg-emerald-500 animate-pulse",
                voicePhase === "thinking" && "bg-amber-500 animate-pulse",
                voicePhase === "searching" && "bg-blue-500 animate-pulse",
                voicePhase === "speaking" && "bg-violet-500 animate-pulse"
              )} />
              <span className="text-xs font-semibold text-slate-700 font-sans">
                {voicePhase === "listening" && "Listening..."}
                {voicePhase === "thinking" && "Thinking..."}
                {voicePhase === "searching" && "Searching Laws..."}
                {voicePhase === "speaking" && "Speaking..."}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {voicePhase === "speaking" && (
                <Button onClick={interruptVoice} variant="ghost" size="sm" className="h-6.5 text-[10px] uppercase font-bold text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg">
                  Interrupt
                </Button>
              )}
              <Button onClick={exitVoiceMode} variant="ghost" size="sm" className="h-6.5 text-[10px] uppercase font-bold text-slate-500 hover:bg-slate-150 rounded-lg">
                Exit Voice Mode
              </Button>
            </div>
          </div>
        )}

        <div className="max-w-3xl mx-auto">
          <VercelV0Chat
            value={query}
            onChange={setQuery}
            onSubmit={() => executeSearch(query)}
            isSearching={isSearching}
            language={language}
            setLanguage={setLanguage}
            voiceComponent={
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={voiceModeActive ? exitVoiceMode : startVoiceMode}
                className={cn(
                  "h-8 w-8 rounded-xl border border-neutral-700/60 transition-all flex items-center justify-center cursor-pointer shrink-0 text-neutral-300 bg-neutral-800 hover:bg-neutral-700 hover:text-white"
                )}
                title={voiceModeActive ? "Stop Voice Mode" : "Start Voice Mode"}
              >
                {voiceModeActive ? (
                  <MicOff className="h-4 w-4 text-red-500 animate-pulse" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>
            }
          />
        </div>
      </div>
    </div>
  );
};

export default Search;
