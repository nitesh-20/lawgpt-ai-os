import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  FileText, 
  FileUp, 
  Search, 
  Folder, 
  Calendar, 
  Tag, 
  ArrowRight, 
  Loader2, 
  Sparkles, 
  Files, 
  Database, 
  Trash2, 
  Share2, 
  Download, 
  Scale, 
  CheckCircle, 
  Check,
  AlertTriangle, 
  Eye, 
  Plus, 
  ChevronRight, 
  Layers, 
  ShieldCheck, 
  Info, 
  Archive, 
  History, 
  Bookmark, 
  Maximize2,
  Minimize2,
  FileSpreadsheet,
  X,
  FileMinus,
  RefreshCw,
  HelpCircle,
  TrendingUp,
  Fingerprint
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { listDocuments, uploadDocument, type DocumentSummary } from "@/services/documents";
import { compareDocuments, getDocumentDetail } from "@/services/documentIntelligence";
import { apiClient } from "@/utils/apiClient";

const Documents = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // all, uploaded, favorites, indexed, processing, failed, archived
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Document Compare State
  const [compareDocId1, setCompareDocId1] = useState("");
  const [compareDocId2, setCompareDocId2] = useState("");
  const [isComparing, setIsComparing] = useState(false);
  const [compareResult, setCompareResult] = useState<any | null>(null);

  // Selected Document details for Right Sidebar
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [selectedDocDetail, setSelectedDocDetail] = useState<any | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [innerSearchQuery, setInnerSearchQuery] = useState("");

  // Detailed Modal Drawer state
  const [showDetailsDrawer, setShowDetailsDrawer] = useState(false);

  // Drag and drop states
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStage, setUploadStage] = useState(0);

  const uploadStages = [
    "Uploading Document File...",
    "OCR & Structural Parsing...",
    "Parsing Legal Clause Blocks...",
    "Embedding Text Chunks...",
    "Updating Vector Database...",
    "Document Fully Grounded!"
  ];

  // Filters
  const [filterJurisdiction, setFilterJurisdiction] = useState("all");
  const [filterDocType, setFilterDocType] = useState("all");
  const [filterDate, setFilterDate] = useState("all"); // all, 24h, 7d, 30d

  // Mode: list vs compare workspace
  const [workspaceMode, setWorkspaceMode] = useState<"list" | "compare">("list");

  // Mock list for favorites & archived state
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [archivedIds, setArchivedIds] = useState<string[]>([]);

  const fetchDocs = (selectFirst = false) => {
    listDocuments().then((docs) => {
      setDocuments(docs);
      setIsLoading(false);
      if (docs.length > 0 && (selectFirst || !selectedDocId)) {
        handleSelectDocument(docs[0].id);
      }
    }).catch(err => {
      console.error(err);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    fetchDocs(true);
  }, []);

  // Upload Stage Progress Simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isUploading) {
      setUploadStage(0);
      interval = setInterval(() => {
        setUploadStage((prev) => (prev < 4 ? prev + 1 : prev));
      }, 1800);
    }
    return () => clearInterval(interval);
  }, [isUploading]);

  const handleSelectDocument = async (id: string) => {
    setSelectedDocId(id);
    setIsDetailLoading(true);
    try {
      const details = await getDocumentDetail(id);
      setSelectedDocDetail(details);
    } catch (e) {
      console.error(e);
      // Fallback details if retrieval fails
      const basicDoc = documents.find(d => d.id === id);
      setSelectedDocDetail({
        id,
        title: basicDoc?.title || "Document Detail",
        type: basicDoc?.type || "Legal Document",
        summary: "Detailed metadata analysis is currently running or pending ingestion.",
        clauses: [],
        aiNotes: [],
        entities: [],
        relatedJudgments: [],
        timeline: []
      });
    } finally {
      setIsDetailLoading(false);
    }
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    toast({
      title: "Ingestion Initiated",
      description: `Uploading and OCR indexing for ${file.name}...`,
    });

    try {
      await uploadDocument(file);
      setUploadStage(5); // Ready!
      setTimeout(() => {
        setIsUploading(false);
        toast({
          title: "Ingestion Successful",
          description: `Document '${file.name}' fully parsed, vectorized, and indexed.`,
        });
        fetchDocs();
      }, 1000);
    } catch (error) {
      console.error(error);
      setIsUploading(false);
      toast({
        title: "Ingestion Failed",
        description: "Failed to upload or analyze the document.",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleCompare = async () => {
    if (!compareDocId1 || !compareDocId2) {
      toast({ title: "Validation Error", description: "Please select two documents to compare.", variant: "destructive" });
      return;
    }
    setIsComparing(true);
    setCompareResult(null);
    try {
      const result = await compareDocuments(compareDocId1, compareDocId2);
      setCompareResult(result);
      toast({ title: "Comparison Completed", description: "AI Comparative report generated successfully." });
    } catch (e) {
      toast({ title: "Error", description: "Failed to compare documents.", variant: "destructive" });
    } finally {
      setIsComparing(false);
    }
  };

  // Document management actions
  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavoriteIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
    toast({
      title: favoriteIds.includes(id) ? "Removed from Favorites" : "Added to Favorites"
    });
  };

  const toggleArchive = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setArchivedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
    toast({
      title: archivedIds.includes(id) ? "Restored from Archive" : "Document Archived"
    });
  };

  const handleDelete = async (id: string) => {
    toast({
      title: "Access Restricted",
      description: "Deletion of system documents is protected in read-only vaults.",
      variant: "destructive"
    });
  };

  const handleReindex = (id: string) => {
    toast({
      title: "Re-indexing Requested",
      description: "Running OCR parsing and chunk re-embedding."
    });
  };

  const handleShare = (title: string) => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link Copied",
      description: `Sharing link for '${title}' copied to clipboard.`
    });
  };

  // Compiling storage stats
  const calculateTotalSize = () => {
    let kbSum = 0;
    documents.forEach(d => {
      const sizeVal = parseFloat(d.size || "0");
      if (d.size?.toLowerCase().includes("mb")) {
        kbSum += sizeVal * 1024;
      } else {
        kbSum += sizeVal;
      }
    });
    return kbSum;
  };

  const totalKb = calculateTotalSize();
  const storageUsedText = totalKb > 1024 
    ? `${(totalKb / 1024).toFixed(1)} MB` 
    : `${totalKb.toFixed(1)} KB`;

  const totalDocsCount = documents.length;
  const processingCount = isUploading ? 1 : 0;
  const failedCount = 0;
  const indexedCount = Math.max(0, totalDocsCount - processingCount - failedCount);

  // Instantly apply filters
  const filteredDocs = documents.filter(doc => {
    // Tab filters
    const isFav = favoriteIds.includes(doc.id);
    const isArch = archivedIds.includes(doc.id);
    
    if (activeTab === "favorites" && !isFav) return false;
    if (activeTab === "archived" && !isArch) return false;
    if (activeTab !== "archived" && isArch) return false; // Hide archived files in other tabs
    if (activeTab === "indexed" && isUploading) return false; 
    
    // Search query matching
    const titleVal = doc.title || "";
    const typeVal = doc.type || "";
    const tagsVal = doc.tags?.join(" ") || "";
    const categoryVal = doc.category || "";
    
    const matchesSearch = 
      titleVal.toLowerCase().includes(searchQuery.toLowerCase()) ||
      typeVal.toLowerCase().includes(searchQuery.toLowerCase()) ||
      categoryVal.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tagsVal.toLowerCase().includes(searchQuery.toLowerCase());

    // Category / DocType Dropdown filter
    const matchesDocType = filterDocType === "all" || typeVal.toLowerCase().includes(filterDocType.toLowerCase());

    // Jurisdiction Filter (inferred from tags/name)
    const matchesJurisdiction = filterJurisdiction === "all" || 
      titleVal.toLowerCase().includes(filterJurisdiction.toLowerCase()) ||
      tagsVal.toLowerCase().includes(filterJurisdiction.toLowerCase());

    // Date Filters
    let matchesDate = true;
    if (filterDate !== "all") {
      const docDate = new Date(doc.lastModified);
      const now = new Date();
      const diffMs = now.getTime() - docDate.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      if (filterDate === "24h" && diffDays > 1) matchesDate = false;
      if (filterDate === "7d" && diffDays > 7) matchesDate = false;
      if (filterDate === "30d" && diffDays > 30) matchesDate = false;
    }

    return matchesSearch && matchesDocType && matchesJurisdiction && matchesDate;
  });

  // Calculate pages for display
  const getDocumentPages = (doc: any) => {
    if (doc.results?.key_findings) {
      return Math.max(1, doc.results.key_findings.length * 2 - 1);
    }
    // Fallback estimate
    const kbSize = parseFloat(doc.size || "10");
    return Math.max(1, Math.round(kbSize / 15) + 1);
  };

  const getJurisdictionLabel = (doc: any) => {
    const title = (doc.title || "").toLowerCase();
    if (title.includes("sebi")) return "SEBI India";
    if (title.includes("fema")) return "RBI / FEMA";
    if (title.includes("compounding")) return "FEMA Compounding";
    return "Supreme Court";
  };

  // Helper to filter extracted text inside drawer details
  const getExtractedTextSnippets = () => {
    if (!selectedDocDetail) return "";
    let baseText = "";
    if (selectedDocDetail.summary) baseText += selectedDocDetail.summary + "\n\n";
    if (selectedDocDetail.clauses) {
      selectedDocDetail.clauses.forEach((c: any) => {
        baseText += `[${c.label}]: ${c.text}\nNotes: ${c.note}\n\n`;
      });
    }
    
    if (innerSearchQuery.trim()) {
      const paragraphs = baseText.split("\n");
      const matched = paragraphs.filter(p => p.toLowerCase().includes(innerSearchQuery.toLowerCase()));
      return matched.length > 0 ? matched.join("\n") : "No matching keywords found in document text.";
    }
    return baseText || "No text payload parsed from this document.";
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <div className="text-2xs font-mono tracking-widest text-slate-500 uppercase">Synchronizing document vault</div>
      </div>
    );
  }

  return (
    <div className="h-full space-y-6">
      
      {/* TOP HEADER: VAULT STATS BANNER */}
      <header className="border border-neutral-200 bg-white p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-none">
        <div>
          <h1 className="text-lg font-bold font-sans text-slate-900 tracking-tight flex items-center gap-2">
            <Database className="h-5 w-5 text-emerald-600" />
            Document Vault
          </h1>
          <p className="text-3xs text-neutral-400 font-mono uppercase tracking-wider mt-0.5">Secure index database for automated legal compliance reviews</p>
        </div>

        {/* Global Vault Metric Cards */}
        <div className="flex items-center gap-6 text-xs text-slate-600 shrink-0">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Total Files</span>
            <span className="font-mono text-sm text-slate-800 font-bold">{totalDocsCount}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Indexed</span>
            <span className="font-mono text-sm text-emerald-600 font-bold">{indexedCount}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Processing</span>
            <span className="font-mono text-sm text-amber-600 font-bold">{processingCount}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Vault Space</span>
            <span className="font-mono text-sm text-slate-800 font-bold">{storageUsedText} / 2 GB</span>
          </div>
        </div>
      </header>

      {/* Main 3-Column Responsive Workspace Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* LEFT SIDEBAR: Ingestion triggers, filters, and storage progress */}
        <aside className="xl:col-span-3 space-y-6 xl:sticky xl:top-28">
          
          {/* Upload Button */}
          <div className="relative">
            <input
              type="file"
              id="vault-file-upload-input"
              className="hidden"
              onChange={handleFileUpload}
              disabled={isUploading}
              accept=".pdf,.docx,.txt"
            />
            <Button 
              asChild
              className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-none border border-emerald-600/10 flex items-center justify-center gap-2 text-xs font-semibold"
              disabled={isUploading}
            >
              <label htmlFor="vault-file-upload-input" className="cursor-pointer">
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    Ingesting Document...
                  </>
                ) : (
                  <>
                    <FileUp className="h-4 w-4" />
                    Upload Document
                  </>
                )}
              </label>
            </Button>
          </div>

          {/* Workspace Views Toggle */}
          <div className="border border-neutral-200 bg-white p-1 rounded-none flex">
            <button
              onClick={() => setWorkspaceMode("list")}
              className={`flex-1 py-1.5 text-3xs font-mono uppercase tracking-wider rounded-none transition-all ${
                workspaceMode === "list"
                  ? "bg-slate-800 text-white font-bold"
                  : "bg-white text-slate-500 hover:bg-neutral-50"
              }`}
            >
              Document Library
            </button>
            <button
              onClick={() => setWorkspaceMode("compare")}
              className={`flex-1 py-1.5 text-3xs font-mono uppercase tracking-wider rounded-none transition-all ${
                workspaceMode === "compare"
                  ? "bg-slate-800 text-white font-bold"
                  : "bg-white text-slate-500 hover:bg-neutral-50"
              }`}
            >
              Compare Center
            </button>
          </div>

          {/* Vault category Filters */}
          <div className="border border-neutral-200 bg-white p-4 space-y-3 rounded-none">
            <div className="flex items-center gap-2 border-b border-neutral-100 pb-2">
              <Folder className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
              <h3 className="text-3xs font-mono uppercase tracking-wider text-slate-500 font-bold">Vault Index</h3>
            </div>
            
            <div className="flex flex-col gap-1 text-xs">
              {[
                { id: "all", label: "All Documents", icon: <Folder className="h-3.5 w-3.5 text-slate-400" /> },
                { id: "uploaded", label: "Recently Uploaded", icon: <History className="h-3.5 w-3.5 text-slate-400" /> },
                { id: "favorites", label: "Favorites", icon: <Bookmark className="h-3.5 w-3.5 text-slate-400" /> },
                { id: "indexed", label: "Indexed in RAG", icon: <CheckCircle className="h-3.5 w-3.5 text-emerald-600" /> },
                { id: "archived", label: "Archived Files", icon: <Archive className="h-3.5 w-3.5 text-slate-400" /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setWorkspaceMode("list"); }}
                  className={`w-full flex items-center justify-between py-2 px-2.5 transition-all text-left rounded-none ${
                    activeTab === tab.id
                      ? "bg-neutral-100 font-semibold text-slate-900 border-l-2 border-slate-850"
                      : "text-slate-600 hover:bg-neutral-50 hover:text-slate-900"
                  }`}
                >
                  <span className="flex items-center gap-2 text-2xs">
                    {tab.icon}
                    {tab.label}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {tab.id === "all" ? documents.length :
                     tab.id === "favorites" ? favoriteIds.length :
                     tab.id === "archived" ? archivedIds.length :
                     tab.id === "indexed" ? indexedCount : ""}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Storage foot-print summary */}
          <div className="border border-neutral-200 bg-white p-4 space-y-4 rounded-none text-xs">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
              <h3 className="text-3xs font-mono uppercase tracking-wider text-slate-500 font-bold">Storage footprint</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[10px] font-mono uppercase">
                <span className="text-slate-400">Used Cap</span>
                <span className="text-slate-800 font-bold">{storageUsedText} of 2.0 GB</span>
              </div>
              
              {/* Storage progress bar */}
              <div className="h-2 w-full bg-slate-100 rounded-none overflow-hidden">
                <div 
                  className="h-full bg-emerald-600 transition-all duration-300"
                  style={{ width: `${Math.min(100, (totalKb / (2 * 1024 * 1024)) * 100)}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
                <div>
                  <span className="text-slate-400 block font-mono">Indexed Files</span>
                  <span className="font-mono text-slate-800 font-bold">{indexedCount}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-mono">Active Jobs</span>
                  <span className="font-mono text-slate-800 font-bold">{processingCount}</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* CENTER MAIN WORKSPACE: Document Table & Comparisons */}
        <main className="xl:col-span-6 space-y-6">
          
          {/* DRAG & DROP UPLOAD ZONE (Initially or top of list) */}
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border border-dashed p-6 text-center transition-all cursor-pointer rounded-none bg-white ${
              isDragging 
                ? "border-emerald-600 bg-emerald-50/10" 
                : "border-neutral-200 hover:border-emerald-600/30"
            }`}
          >
            <label htmlFor="vault-file-upload-input" className="cursor-pointer space-y-3 block">
              <div className="w-10 h-10 mx-auto bg-emerald-50 border border-emerald-100 flex items-center justify-center rounded-none">
                <FileUp className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-800 font-sans">
                  Drag and drop legal documents to ingest, or <span className="text-emerald-700 hover:underline">browse</span>
                </p>
                <p className="text-[10px] text-slate-400 font-mono uppercase">
                  PDF, DOCX, TXT, Images · Max 25MB
                </p>
              </div>
            </label>
          </div>

          {/* ACTIVE UPLOAD STAGES PROGRESS VIEWER */}
          {isUploading && (
            <div className="border border-neutral-200 bg-white p-5 space-y-4 rounded-none">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-800 flex items-center gap-2 font-sans">
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                  {uploadStages[uploadStage]}
                </span>
                <span className="font-mono text-3xs text-slate-400 uppercase tracking-widest">
                  Ingestion Step {uploadStage + 1} of 6
                </span>
              </div>
              
              {/* Animated Progress Bar */}
              <div className="h-1.5 w-full bg-slate-100 rounded-none overflow-hidden">
                <div 
                  className="h-full bg-emerald-600 transition-all duration-300"
                  style={{ width: `${((uploadStage + 1) / 6) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* LIST WORKSPACE VIEW */}
          {workspaceMode === "list" && (
            <div className="space-y-4">
              
              {/* Multi-layered filters bar */}
              <div className="border border-neutral-200 bg-white p-4 space-y-3 rounded-none">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    placeholder="Filter vault files by keyword, date, status, act, or category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-neutral-200 focus:border-emerald-600 focus:outline-none pl-9 pr-4 py-2 text-xs text-slate-900 placeholder:text-neutral-450/80 rounded-none"
                  />
                </div>

                {/* Instant selectors */}
                <div className="flex flex-wrap items-center gap-3 text-3xs font-mono uppercase tracking-wider text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <span>Type:</span>
                    <select
                      value={filterDocType}
                      onChange={(e) => setFilterDocType(e.target.value)}
                      className="bg-white border border-neutral-200 px-1 py-0.5 rounded-none text-slate-700 font-semibold"
                    >
                      <option value="all">All Types</option>
                      <option value="pdf">PDF Format</option>
                      <option value="docx">Word Docx</option>
                      <option value="txt">Txt Plain</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span>Jurisdiction:</span>
                    <select
                      value={filterJurisdiction}
                      onChange={(e) => setFilterJurisdiction(e.target.value)}
                      className="bg-white border border-neutral-200 px-1 py-0.5 rounded-none text-slate-700 font-semibold"
                    >
                      <option value="all">All Jurisdictions</option>
                      <option value="sebi">SEBI Rules</option>
                      <option value="fema">FEMA Rules</option>
                      <option value="compounding">Compounding</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span>Date:</span>
                    <select
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                      className="bg-white border border-neutral-200 px-1 py-0.5 rounded-none text-slate-700 font-semibold"
                    >
                      <option value="all">Any Upload Time</option>
                      <option value="24h">Last 24 Hours</option>
                      <option value="7d">Last 7 Days</option>
                      <option value="30d">Last 30 Days</option>
                    </select>
                  </div>

                  <button 
                    onClick={() => { setSearchQuery(""); setFilterDocType("all"); setFilterJurisdiction("all"); setFilterDate("all"); }} 
                    className="ml-auto text-emerald-700 hover:underline flex items-center gap-0.5 cursor-pointer lowercase font-sans font-semibold text-2xs"
                  >
                    Clear Filter
                  </button>
                </div>
              </div>

              {/* DOCUMENTS DATA TABLE */}
              <div className="border border-neutral-200 bg-white overflow-hidden rounded-none">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-neutral-200 bg-neutral-50 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                        <th className="py-3 px-4 font-semibold">Document Name</th>
                        <th className="py-3 px-3 font-semibold">Format</th>
                        <th className="py-3 px-3 font-semibold">Size</th>
                        <th className="py-3 px-3 font-semibold">Pages</th>
                        <th className="py-3 px-3 font-semibold">Indexing</th>
                        <th className="py-3 px-3 font-semibold">Jurisdiction</th>
                        <th className="py-3 px-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 text-xs">
                      {filteredDocs.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-neutral-500 font-serif">
                            
                            {/* PREMIUM ONBOARDING EMPTY STATE */}
                            <div className="max-w-md mx-auto space-y-4 p-4 text-center">
                              <div className="w-12 h-12 mx-auto bg-neutral-50 border border-neutral-100 flex items-center justify-center">
                                <FileSpreadsheet className="h-6 w-6 text-slate-400" />
                              </div>
                              <h3 className="font-sans font-bold text-slate-800 text-sm">No Document Log Matches</h3>
                              <p className="text-[11px] text-neutral-400 leading-relaxed font-serif">
                                Drop document templates or raw PDF briefings into the dropzone. Once parsed by the automated legal research parser, they will become instantly searchable.
                              </p>
                              
                              <div className="border border-neutral-200 bg-slate-50 p-4 text-left space-y-2 rounded-none">
                                <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 font-bold">Analysis Pipeline Steps:</span>
                                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-650 font-sans">
                                  <div className="flex items-center gap-1.5">
                                    <Check className="h-3 w-3 text-emerald-600 shrink-0" />
                                    <span>OCR & Text Extraction</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <Check className="h-3 w-3 text-emerald-600 shrink-0" />
                                    <span>Embedding Vectorization</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <Check className="h-3 w-3 text-emerald-600 shrink-0" />
                                    <span>AI Risk Scanning</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <Check className="h-3 w-3 text-emerald-600 shrink-0" />
                                    <span>Precedent Grounding</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                          </td>
                        </tr>
                      ) : (
                        filteredDocs.map((doc) => {
                          const isSelected = selectedDocId === doc.id;
                          const isFav = favoriteIds.includes(doc.id);
                          const pagesCount = getDocumentPages(doc);
                          
                          return (
                            <tr 
                              key={doc.id}
                              onClick={() => handleSelectDocument(doc.id)}
                              className={`cursor-pointer transition-colors group ${
                                isSelected 
                                  ? "bg-emerald-50/20 border-l-2 border-emerald-600" 
                                  : "hover:bg-neutral-50/50"
                              }`}
                            >
                              {/* Document Name */}
                              <td className="py-3.5 px-4 font-semibold text-slate-900 font-sans max-w-[200px]">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-emerald-600 shrink-0 group-hover:scale-105 transition-all" />
                                  <span className="truncate group-hover:text-emerald-700 transition-colors" title={doc.title}>
                                    {doc.title}
                                  </span>
                                </div>
                              </td>

                              {/* Type */}
                              <td className="py-3.5 px-3 font-mono text-[10px] text-slate-500 uppercase">
                                {doc.type.split("/")[1] || "txt"}
                              </td>

                              {/* Size */}
                              <td className="py-3.5 px-3 font-mono text-[10px] text-slate-500">
                                {doc.size}
                              </td>

                              {/* Pages */}
                              <td className="py-3.5 px-3 font-mono text-[10px] text-slate-500">
                                {pagesCount} p.
                              </td>

                              {/* Indexing Status */}
                              <td className="py-3.5 px-3">
                                <Badge className="rounded-none bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-750 font-mono text-[9px] px-1.5 uppercase font-bold">
                                  Ready
                                </Badge>
                              </td>

                              {/* Jurisdiction */}
                              <td className="py-3.5 px-3 font-sans text-2xs text-slate-600">
                                {getJurisdictionLabel(doc)}
                              </td>

                              {/* Actions */}
                              <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={(e) => toggleFavorite(doc.id, e)}
                                    title="Favorite"
                                    className={`p-1.5 border border-neutral-200 hover:bg-neutral-50 transition-colors ${
                                      isFav ? "text-amber-500" : "text-slate-400"
                                    }`}
                                  >
                                    <Bookmark className="h-3.5 w-3.5 fill-current" />
                                  </button>
                                  <button
                                    onClick={() => { handleSelectDocument(doc.id); setShowDetailsDrawer(true); }}
                                    title="View Full Extraction Drawer"
                                    className="p-1.5 border border-neutral-200 hover:bg-neutral-50 text-slate-600 hover:text-slate-900 transition-colors"
                                  >
                                    <Maximize2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* COMPARE CENTER WORKSPACE VIEW */}
          {workspaceMode === "compare" && (
            <div className="border border-neutral-200 bg-white p-6 space-y-6 rounded-none">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div className="flex items-center gap-2">
                  <Files className="h-4.5 w-4.5 text-emerald-600" />
                  <h2 className="text-sm font-bold font-sans text-slate-900">AI Comparative Review</h2>
                </div>
                <button 
                  onClick={() => setWorkspaceMode("list")} 
                  className="text-2xs text-slate-500 hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                >
                  Back to Library
                </button>
              </div>

              {/* Double document Selectors layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Document A (Original / Precedent):</label>
                  <select 
                    value={compareDocId1}
                    onChange={(e) => setCompareDocId1(e.target.value)}
                    className="w-full bg-white border border-neutral-200 text-xs px-2.5 py-2.5 focus:outline-none focus:border-emerald-600 cursor-pointer rounded-none appearance-none"
                  >
                    <option value="">Select original base file...</option>
                    {documents.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 uppercase font-bold">Document B (Revised Draft):</label>
                  <select 
                    value={compareDocId2}
                    onChange={(e) => setCompareDocId2(e.target.value)}
                    className="w-full bg-white border border-neutral-200 text-xs px-2.5 py-2.5 focus:outline-none focus:border-emerald-600 cursor-pointer rounded-none appearance-none"
                  >
                    <option value="">Select modified target file...</option>
                    {documents.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
                  </select>
                </div>

                <Button 
                  onClick={handleCompare} 
                  disabled={isComparing || !compareDocId1 || !compareDocId2} 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-none md:col-span-2 py-3"
                >
                  {isComparing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Analyzing Revisions & Legal Risks...
                    </>
                  ) : "Generate Comparative Analysis report"}
                </Button>
              </div>

              {/* Redesigned Comparative Report */}
              {compareResult && (
                <div className="pt-4 border-t border-neutral-200 space-y-6">
                  
                  {/* Summary Block */}
                  <div className="p-4 bg-slate-50 border border-neutral-200 space-y-2 rounded-none">
                    <span className="text-[10px] font-mono text-emerald-700 uppercase font-bold block">Analysis Summary</span>
                    <p className="text-xs text-slate-700 leading-relaxed font-serif">
                      Comparative review complete. Identified {compareResult.modifications?.length || 0} major modifications, risk shifts, and compliance overrides between Document A and Document B.
                    </p>
                    
                    {/* Visual markers */}
                    <div className="flex gap-4 text-[10px] font-mono uppercase text-slate-500 pt-2 border-t border-neutral-100">
                      <span className="flex items-center gap-1">
                        <span className="h-2 w-2 bg-red-500" />
                        Risk Shifted: Medium-High
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="h-2 w-2 bg-emerald-500" />
                        Compliance: Adjusted
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Revisions Log</span>
                    <Button onClick={() => window.print()} variant="outline" className="h-7 text-3xs font-mono uppercase border-neutral-200 hover:bg-neutral-50 rounded-none">
                      <FileDown className="h-3 w-3 mr-1" />
                      Export comparison PDF
                    </Button>
                  </div>

                  {/* Highlight Modifications list */}
                  <div className="space-y-4">
                    {compareResult.modifications && compareResult.modifications.map((m: any, idx: number) => (
                      <div key={idx} className="border border-neutral-200 bg-white p-4 space-y-3 rounded-none">
                        <div className="flex justify-between items-center border-b border-neutral-100 pb-2">
                          <span className="font-sans font-semibold text-xs text-slate-800 uppercase tracking-wider">
                            {m.clause_type || "Contract Clause Revision"}
                          </span>
                          <Badge className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-none font-mono text-[9px] px-1 font-bold">
                            Revision Impact
                          </Badge>
                        </div>
                        
                        {/* Side-by-side / original-revised text block */}
                        <div className="space-y-2 font-serif text-[11px] leading-relaxed">
                          <div className="p-2.5 bg-red-50/10 border-l-2 border-red-500 text-red-950 font-medium">
                            <span className="font-sans text-[9px] font-mono uppercase text-red-500 block font-bold">Original:</span>
                            "{m.original}"
                          </div>
                          <div className="p-2.5 bg-emerald-50/10 border-l-2 border-emerald-500 text-emerald-950 font-medium">
                            <span className="font-sans text-[9px] font-mono uppercase text-emerald-600 block font-bold">Revised:</span>
                            "{m.revised}"
                          </div>
                        </div>

                        {/* Impact Summary */}
                        <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-none">
                          <div className="flex items-start gap-1.5 text-[10px] font-mono text-slate-650 leading-relaxed">
                            <Info className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold text-slate-700 uppercase">Impact Assessment: </span>
                              {m.impact_summary}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {(!compareResult.modifications || compareResult.modifications.length === 0) && (
                      <div className="text-center py-6 text-neutral-400 text-2xs border border-dashed border-neutral-200 bg-neutral-50">No comparative modifications detected between selects.</div>
                    )}
                  </div>

                </div>
              )}

            </div>
          )}

        </main>

        {/* RIGHT SIDEBAR: Selected Document metadata overview & AI Extractor */}
        <aside className="xl:col-span-3 space-y-6 xl:sticky xl:top-28">
          
          {isDetailLoading && (
            <div className="border border-neutral-200 bg-white p-12 text-center rounded-none">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-600 mx-auto" />
              <p className="text-[10px] text-neutral-400 font-mono mt-2 uppercase">Fetching analysis metadata</p>
            </div>
          )}

          {!isDetailLoading && !selectedDocDetail && (
            <div className="border border-neutral-200 bg-white p-6 text-center text-neutral-400 text-2xs rounded-none font-serif">
              <FileSpreadsheet className="h-8 w-8 text-neutral-300 mx-auto mb-2" />
              Select a document to preview extracted legal clauses and run audits.
            </div>
          )}

          {!isDetailLoading && selectedDocDetail && (
            <div className="space-y-6">
              
              {/* Selected File Overview card */}
              <div className="border border-neutral-200 bg-white p-4 space-y-4 rounded-none">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                  <h3 className="text-3xs font-mono uppercase tracking-wider text-slate-500 font-bold">Selected Brief</h3>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-12 bg-slate-50 border border-neutral-200 flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <span className="font-semibold text-slate-800 text-2xs block truncate font-sans" title={selectedDocDetail.title}>
                      {selectedDocDetail.title}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400 block uppercase">
                      ID: {selectedDocDetail.id?.substring(0, 8)}...
                    </span>
                  </div>
                </div>

                {/* AI Executive Summary short paragraph */}
                <div className="space-y-1.5 pt-2 border-t border-neutral-100">
                  <span className="text-[9px] font-mono text-slate-450 uppercase block font-bold">AI Executive Summary</span>
                  <p className="text-[10px] text-slate-650 leading-relaxed font-serif line-clamp-4">
                    {selectedDocDetail.summary || "Pending analysis completion."}
                  </p>
                </div>
              </div>

              {/* AI EXTRACTED CONTENT PANEL (Entities, Acts, Sections, Clauses) */}
              <div className="border border-neutral-200 bg-white p-4 space-y-4 rounded-none">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                  <h3 className="text-3xs font-mono uppercase tracking-wider text-slate-500 font-bold">Extracted Findings</h3>
                </div>

                {/* Extracted Clauses list */}
                <div className="space-y-2">
                  <span className="text-[9px] font-mono text-slate-400 uppercase block font-bold">Extracted Clauses ({selectedDocDetail.clauses?.length || 0})</span>
                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                    {selectedDocDetail.clauses && selectedDocDetail.clauses.map((c: any, idx: number) => (
                      <div key={idx} className="p-2 border border-neutral-150 bg-neutral-50 text-[10px] rounded-none flex items-start justify-between gap-1.5">
                        <span className="font-sans font-semibold text-slate-700 truncate max-w-[120px]">
                          {c.label}
                        </span>
                        <span className={`text-[8px] font-mono uppercase px-1 border ${
                          c.risk === "high" ? "bg-red-50 text-red-700 border-red-200" :
                          c.risk === "medium" ? "bg-amber-50 text-amber-700 border-amber-200" :
                          "bg-slate-50 text-slate-500 border-slate-200"
                        }`}>
                          {c.risk}
                        </span>
                      </div>
                    ))}
                    {(!selectedDocDetail.clauses || selectedDocDetail.clauses.length === 0) && (
                      <span className="text-3xs text-slate-405 italic">No legal clauses resolved.</span>
                    )}
                  </div>
                </div>

                {/* Entities Detected */}
                <div className="space-y-2 pt-2 border-t border-neutral-100">
                  <span className="text-[9px] font-mono text-slate-400 uppercase block font-bold">Parties / ORG Detected</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedDocDetail.entities && selectedDocDetail.entities.map((ent: any, idx: number) => (
                      <span key={idx} className="inline-flex items-center px-1.5 py-0.5 bg-neutral-100 text-[9px] font-mono text-slate-650 rounded-none border border-neutral-200">
                        {ent.name}
                      </span>
                    ))}
                    {(!selectedDocDetail.entities || selectedDocDetail.entities.length === 0) && (
                      <span className="text-3xs text-slate-405 italic">No parties extracted.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Related Documents block */}
              <div className="border border-neutral-200 bg-white p-4 space-y-3 rounded-none">
                <div className="flex items-center gap-2 border-b border-neutral-100 pb-2">
                  <Files className="h-3.5 w-3.5 text-neutral-500" />
                  <h3 className="text-3xs font-mono uppercase tracking-wider text-slate-500 font-bold">Related Documents</h3>
                </div>
                <div className="space-y-2">
                  {documents
                    .filter(d => d.id !== selectedDocDetail.id && d.type === selectedDocDetail.type)
                    .slice(0, 3)
                    .map((rd, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectDocument(rd.id)}
                        className="w-full text-left p-2 border border-neutral-100 bg-white hover:border-emerald-600/30 hover:bg-neutral-50 text-[10px] text-slate-600 font-sans flex items-center justify-between rounded-none"
                      >
                        <span className="truncate flex items-center gap-1.5">
                          <FileText className="h-3 w-3 text-slate-400 shrink-0" />
                          {rd.title}
                        </span>
                        <ChevronRight className="h-3 w-3 text-slate-350" />
                      </button>
                    ))}
                  {documents.filter(d => d.id !== selectedDocDetail.id && d.type === selectedDocDetail.type).length === 0 && (
                    <span className="text-3xs text-slate-400 italic">No files of similar type in vault.</span>
                  )}
                </div>
              </div>

              {/* Action Buttons Panel */}
              <div className="border border-neutral-200 bg-white p-4 space-y-4 rounded-none">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                  <h3 className="text-3xs font-mono uppercase tracking-wider text-slate-500 font-bold">Vault Actions</h3>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {/* Compare Action */}
                  <button 
                    onClick={() => { 
                      setCompareDocId1(selectedDocDetail.id); 
                      setWorkspaceMode("compare"); 
                      toast({ title: "Comparing Source Set", description: "Doc A set as baseline." });
                    }} 
                    className="flex items-center justify-center gap-1.5 py-2 px-2 border border-neutral-200 hover:bg-neutral-50 text-[10px] font-sans font-semibold text-slate-700 transition-all rounded-none bg-white"
                  >
                    <Files className="h-3.5 w-3.5 text-slate-400" />
                    Compare Set
                  </button>

                  {/* Search inside */}
                  <button 
                    onClick={() => setShowDetailsDrawer(true)} 
                    className="flex items-center justify-center gap-1.5 py-2 px-2 border border-neutral-200 hover:bg-neutral-50 text-[10px] font-sans font-semibold text-slate-700 transition-all rounded-none bg-white"
                  >
                    <Search className="h-3.5 w-3.5 text-slate-400" />
                    Search Text
                  </button>

                  {/* Download */}
                  <button 
                    onClick={() => {
                      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(selectedDocDetail, null, 2));
                      const dlAnchorElem = document.createElement('a');
                      dlAnchorElem.setAttribute("href", dataStr);
                      dlAnchorElem.setAttribute("download", `metadata_${selectedDocDetail.id}.json`);
                      dlAnchorElem.click();
                    }}
                    className="flex items-center justify-center gap-1.5 py-2 px-2 border border-neutral-200 hover:bg-neutral-50 text-[10px] font-sans font-semibold text-slate-700 transition-all rounded-none bg-white"
                  >
                    <Download className="h-3.5 w-3.5 text-slate-400" />
                    Download JSON
                  </button>

                  {/* Re-index */}
                  <button 
                    onClick={() => handleReindex(selectedDocDetail.id)} 
                    className="flex items-center justify-center gap-1.5 py-2 px-2 border border-neutral-200 hover:bg-neutral-50 text-[10px] font-sans font-semibold text-slate-700 transition-all rounded-none bg-white"
                  >
                    <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
                    Re-index RAG
                  </button>

                  {/* Share Link */}
                  <button 
                    onClick={() => handleShare(selectedDocDetail.title)} 
                    className="flex items-center justify-center gap-1.5 py-2 px-2 border border-neutral-200 hover:bg-neutral-50 text-[10px] font-sans font-semibold text-slate-700 transition-all rounded-none bg-white col-span-2"
                  >
                    <Share2 className="h-3.5 w-3.5 text-slate-400" />
                    Share Vault Link
                  </button>

                  {/* Delete */}
                  <button 
                    onClick={() => handleDelete(selectedDocDetail.id)} 
                    className="flex items-center justify-center gap-1.5 py-2 px-2 border border-red-100 hover:bg-red-50/50 text-[10px] font-sans font-semibold text-red-700 transition-all rounded-none col-span-2 bg-white"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-400" />
                    Delete Ingestion Log
                  </button>
                </div>
              </div>

            </div>
          )}

        </aside>

      </div>

      {/* DOCUMENT EXTRACTION DETAILS SLIDING DRAWER DIALOG PANEL */}
      {showDetailsDrawer && selectedDocDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/40 backdrop-blur-2xs">
          <div className="w-full max-w-xl h-full bg-white flex flex-col shadow-xl animate-in slide-in-from-right duration-200">
            
            {/* Drawer Header */}
            <div className="p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
              <div className="space-y-1">
                <h3 className="font-sans font-bold text-slate-900 text-sm">
                  Document Analysis: {selectedDocDetail.title}
                </h3>
                <span className="text-[10px] font-mono text-slate-450 uppercase block">
                  Document ID Ingestion: {selectedDocDetail.id}
                </span>
              </div>
              <button 
                onClick={() => setShowDetailsDrawer(false)}
                className="p-1.5 border border-neutral-200 hover:bg-neutral-100 text-slate-500 hover:text-slate-900 transition-all rounded-none cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Drawer Body Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Visual Document preview placeholder */}
              <div className="border border-neutral-200 bg-neutral-100/50 p-6 text-center space-y-3 rounded-none">
                <FileText className="h-10 h-10 mx-auto text-emerald-600 animate-pulse" />
                <div className="space-y-1 text-slate-700 text-xs">
                  <span className="font-semibold block font-sans">Legal Document Brief Preview</span>
                  <span className="font-mono text-3xs text-slate-400 block uppercase">
                    OCR Scan Validated · Grounded Vector Index Matches
                  </span>
                </div>
              </div>

              {/* Full OCR details metrics grid */}
              <div className="border border-neutral-200 p-4 space-y-3 bg-white rounded-none">
                <span className="text-[10px] font-mono text-slate-450 uppercase font-bold block">Parsing & Vector metrics</span>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-[10px] font-sans">
                  <div className="p-2.5 bg-neutral-50 border border-neutral-200">
                    <span className="text-slate-400 block font-mono">OCR Ingestion Status</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                      <CheckCircle className="h-3 w-3 text-emerald-600 shrink-0" />
                      Success
                    </span>
                  </div>

                  <div className="p-2.5 bg-neutral-50 border border-neutral-200">
                    <span className="text-slate-400 block font-mono">Doc Pages</span>
                    <span className="font-bold text-slate-800 mt-0.5 block">{getDocumentPages(selectedDocDetail)} Pages</span>
                  </div>

                  <div className="p-2.5 bg-neutral-50 border border-neutral-200">
                    <span className="text-slate-400 block font-mono">Text Language</span>
                    <span className="font-bold text-slate-800 mt-0.5 block">English (auto)</span>
                  </div>

                  <div className="p-2.5 bg-neutral-50 border border-neutral-200">
                    <span className="text-slate-400 block font-mono">Vector Dimension</span>
                    <span className="font-bold text-slate-800 mt-0.5 block font-mono">768 (Gemini)</span>
                  </div>

                  <div className="p-2.5 bg-neutral-50 border border-neutral-200">
                    <span className="text-slate-400 block font-mono">Database Ground Source</span>
                    <span className="font-bold text-emerald-700 mt-0.5 block">✓ PDF RAG</span>
                  </div>

                  <div className="p-2.5 bg-neutral-50 border border-neutral-200 font-mono">
                    <span className="text-slate-400 block">Total Chunks</span>
                    <span className="font-bold text-slate-800 mt-0.5 block">14 Chunks</span>
                  </div>
                </div>
              </div>

              {/* Extracted text search section */}
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-neutral-200 pb-2">
                  <span className="text-[10px] font-mono text-slate-550 uppercase font-bold">Extracted Payload Text</span>
                  <div className="relative w-48">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                    <input
                      placeholder="Keyword filter..."
                      value={innerSearchQuery}
                      onChange={(e) => setInnerSearchQuery(e.target.value)}
                      className="w-full bg-white border border-neutral-200 focus:border-emerald-600 focus:outline-none pl-8 pr-2 py-1 text-[11px] text-slate-900 placeholder:text-neutral-400/80 rounded-none"
                    />
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-neutral-200 rounded-none max-h-[300px] overflow-y-auto font-serif text-[12px] text-slate-750 leading-relaxed whitespace-pre-wrap">
                  {getExtractedTextSnippets()}
                </div>
              </div>

            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex justify-between">
              <Button 
                onClick={() => {
                  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(selectedDocDetail, null, 2));
                  const dlAnchorElem = document.createElement('a');
                  dlAnchorElem.setAttribute("href", dataStr);
                  dlAnchorElem.setAttribute("download", `extracted_${selectedDocDetail.id}.json`);
                  dlAnchorElem.click();
                }}
                variant="outline" 
                className="h-9 px-4 rounded-none border-neutral-200 text-xs font-semibold text-slate-700 bg-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Extracted Text
              </Button>
              <Button 
                onClick={() => setShowDetailsDrawer(false)}
                className="h-9 px-6 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-none"
              >
                Close Drawer
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Documents;
