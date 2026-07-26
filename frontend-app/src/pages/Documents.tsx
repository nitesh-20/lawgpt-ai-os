import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileUp, Search, Folder, Calendar, Tag, ArrowRight, FileText, Loader2, Sparkles, Files } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { listDocuments, uploadDocument, type DocumentSummary } from "@/services/documents";
import { compareDocuments } from "@/services/documentIntelligence";
import { Badge } from "@/components/ui/badge";

const Documents = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Document Compare State
  const [compareDocId1, setCompareDocId1] = useState("");
  const [compareDocId2, setCompareDocId2] = useState("");
  const [isComparing, setIsComparing] = useState(false);
  const [compareResult, setCompareResult] = useState<any | null>(null);

  const fetchDocs = () => {
    listDocuments().then((docs) => {
      setDocuments(docs);
      setIsLoading(false);
    }).catch(err => {
      console.error(err);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    toast({
      title: "Analyzing Document",
      description: `Uploading and building vector index for ${file.name}...`,
    });

    try {
      await uploadDocument(file);
      toast({
        title: "Success",
        description: `Document '${file.name}' processed and indexed in knowledge base.`,
      });
      fetchDocs();
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to upload or analyze the document.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
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
      toast({ title: "Comparison Completed", description: "AI comparative report generated." });
    } catch (e) {
      toast({ title: "Error", description: "Failed to compare documents.", variant: "destructive" });
    } finally {
      setIsComparing(false);
    }
  };

  const filteredDocs = documents.filter(doc => {
    const titleVal = doc.title || "";
    const typeVal = doc.type || "";
    const matchesSearch = titleVal.toLowerCase().includes(searchQuery.toLowerCase()) ||
      typeVal.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || doc.category === activeTab;
    return matchesSearch && matchesTab;
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <div className="text-2xs font-mono tracking-widest text-neutral-500 uppercase">Synchronizing document vault</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 md:px-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-neutral-100">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              <FileText className="h-4.5 w-4.5 text-emerald-600 animate-pulse" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900 font-sans">Document Vault</h1>
          </div>
          <p className="text-xs text-neutral-500 font-mono uppercase tracking-wider">Semantic document indexing and structural analysis</p>
        </div>

        {/* Sleek File Upload Input Button */}
        <div className="relative">
          <input
            type="file"
            id="file-upload-input"
            className="hidden"
            onChange={handleFileUpload}
            disabled={isUploading}
            accept=".pdf,.docx,.txt"
          />
          <Button
            asChild
            className="btn-primary cursor-pointer h-9 px-4 font-mono text-[10px] font-bold uppercase tracking-wider"
            disabled={isUploading}
          >
            <label htmlFor="file-upload-input">
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
                  Processing...
                </>
              ) : (
                <>
                  <FileUp className="mr-2 h-4 w-4 shrink-0" />
                  Upload Document
                </>
              )}
            </label>
          </Button>
        </div>
      </div>

      {/* Grid Layout: Left Pane lists documents, Right Pane does Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6 items-start">
        <div className="space-y-6">
          {/* Filter and search controls */}
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              placeholder="Search indexed documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border border-neutral-200 focus:border-emerald-600 focus:outline-none pl-10 pr-4 py-2 text-xs text-slate-900 placeholder:text-neutral-450 rounded-lg w-full shadow-3xs"
            />
          </div>

          <div className="bg-white border border-neutral-200 rounded-2xl shadow-3xs overflow-hidden">
            <div className="px-5 py-3.5 border-b border-neutral-100 bg-neutral-50/50 flex justify-between items-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Tracked Files</span>
              <span className="text-3xs font-mono text-neutral-400 font-bold">{filteredDocs.length} total</span>
            </div>

            <div className="divide-y divide-neutral-100">
              {filteredDocs.length === 0 ? (
                <div className="text-center py-16 text-slate-450 p-8 space-y-2">
                  <Folder className="h-8 w-8 mx-auto text-slate-300 animate-pulse" />
                  <p className="text-xs font-semibold text-slate-700">No documents found</p>
                  <p className="text-2xs text-slate-400 max-w-xs mx-auto leading-relaxed">Upload a document to index it in RAG database.</p>
                </div>
              ) : (
                filteredDocs.map((doc) => (
                  <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-neutral-50/30 transition-colors">
                    <div>
                      <Link to={`/documents/${doc.id}`} className="font-semibold text-xs text-slate-805 hover:text-emerald-700 transition-colors block">
                        📄 {doc.title}
                      </Link>
                      <div className="flex items-center gap-2 mt-1 text-[9px] font-mono text-slate-400">
                        <span className="uppercase font-bold text-emerald-650">{doc.type}</span>
                        <span>·</span>
                        <span>{doc.size}</span>
                        <span>·</span>
                        <span>ID: {doc.id.substring(0, 8)}...</span>
                      </div>
                    </div>

                    <Button asChild size="sm" variant="ghost" className="h-7 text-2xs font-mono font-bold uppercase tracking-wider text-emerald-700 hover:bg-emerald-50">
                      <Link to={`/documents/${doc.id}`}>
                        Analyze
                        <ArrowRight className="h-3.5 w-3.5 ml-1 shrink-0" />
                      </Link>
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right side: Compare Documents Panel */}
        <div className="bg-white border border-neutral-200/85 p-5 space-y-4 rounded-2xl shadow-3xs">
          <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
            <Files className="h-4.5 w-4.5 text-emerald-600 animate-pulse" />
            <h2 className="text-xs font-mono uppercase text-neutral-805 tracking-wider font-bold">Compare Documents</h2>
          </div>

          <div className="space-y-3 font-sans text-xs">
            <div className="space-y-1.5">
              <label className="text-[9px] font-mono text-slate-400 uppercase font-bold">Document A (Original):</label>
              <select
                value={compareDocId1}
                onChange={(e) => setCompareDocId1(e.target.value)}
                className="w-full bg-white border border-neutral-200 text-xs px-2.5 py-1.5 focus:outline-none focus:border-emerald-600 rounded-lg cursor-pointer"
              >
                <option value="">Select original...</option>
                {documents.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-mono text-slate-400 uppercase font-bold">Document B (Revised):</label>
              <select
                value={compareDocId2}
                onChange={(e) => setCompareDocId2(e.target.value)}
                className="w-full bg-white border border-neutral-200 text-xs px-2.5 py-1.5 focus:outline-none focus:border-emerald-600 rounded-lg cursor-pointer"
              >
                <option value="">Select revised...</option>
                {documents.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
              </select>
            </div>

            <Button 
              onClick={handleCompare} 
              disabled={isComparing || !compareDocId1 || !compareDocId2} 
              className="w-full bg-emerald-650 hover:bg-emerald-700 text-white h-9 font-mono text-[10px] font-bold uppercase tracking-wider rounded-lg"
            >
              {isComparing ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2 shrink-0" /> : null}
              Generate Comparative Report
            </Button>
          </div>

          {compareResult && (
            <div className="pt-4 border-t border-neutral-100 space-y-3">
              <span className="text-[10px] font-mono text-emerald-600 uppercase font-bold">Revisions Log:</span>
              <div className="p-3 bg-neutral-50/50 border border-neutral-205 rounded-xl text-xs space-y-3 max-h-[250px] overflow-y-auto font-sans shadow-3xs">
                {compareResult.modifications && compareResult.modifications.map((m: any, idx: number) => (
                  <div key={idx} className="border-b border-neutral-200/60 pb-3 last:border-0 last:pb-0 space-y-1">
                    <p className="font-bold text-slate-800 text-[11px] uppercase tracking-wide font-mono">[{idx + 1}] Clause: {m.clause_type || "Clause"}</p>
                    <p className="text-[11px] text-red-650 line-through leading-normal font-serif bg-red-50/30 p-2 border border-red-100/30">Original: "{m.original}"</p>
                    <p className="text-[11px] text-emerald-705 leading-normal font-serif bg-emerald-50/30 p-2 border border-emerald-100/30">Revised: "{m.revised}"</p>
                    <p className="text-[10px] text-slate-500 font-serif leading-relaxed pt-1">Impact: {m.impact_summary}</p>
                  </div>
                ))}
                {(!compareResult.modifications || compareResult.modifications.length === 0) && (
                  <div className="text-center py-4 text-slate-400 font-serif italic text-2xs">No revisions or changes detected between documents.</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Documents;
