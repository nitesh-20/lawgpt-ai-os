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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded bg-primary/10 border border-primary/20 flex items-center justify-center">
              <FileText className="h-4.5 w-4.5 text-primary" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900">Document Vault</h1>
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
            className="btn-primary cursor-pointer"
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
                  <FileUp className="mr-2 h-4 w-4" />
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
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              placeholder="Search indexed documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-premium pl-10 w-full text-xs"
            />
          </div>

          <div className="glass-card overflow-hidden">
            <div className="px-5 py-3 border-b border-border bg-neutral-50 flex justify-between items-center">
              <span className="text-[10px] font-mono text-neutral-500 uppercase">Tracked Files</span>
              <span className="text-3xs font-mono text-neutral-400">{filteredDocs.length} total</span>
            </div>

            <div className="divide-y divide-border">
              {filteredDocs.length === 0 ? (
                <div className="text-center py-12 text-neutral-500 p-8">
                  <Folder className="h-8 w-8 mx-auto text-neutral-300 mb-3" />
                  <p className="text-xs font-semibold text-neutral-800">No documents found</p>
                  <p className="text-3xs text-neutral-400 mt-1">Upload a document to index it in RAG database.</p>
                </div>
              ) : (
                filteredDocs.map((doc) => (
                  <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-neutral-50/50 transition-colors">
                    <div>
                      <Link to={`/documents/${doc.id}`} className="font-semibold text-xs text-neutral-900 hover:text-primary transition-colors block">
                        {doc.title}
                      </Link>
                      <div className="flex items-center gap-2 mt-1 text-3xs font-mono text-neutral-400">
                        <span className="uppercase">{doc.type}</span>
                        <span>·</span>
                        <span>{doc.size}</span>
                        <span>·</span>
                        <span>ID: {doc.id.substring(0, 8)}...</span>
                      </div>
                    </div>

                    <Button asChild size="sm" variant="ghost" className="h-7 text-xs text-primary hover:bg-primary/10">
                      <Link to={`/documents/${doc.id}`}>
                        Analyze
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Link>
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right side: Compare Documents Panel */}
        <div className="glass-card p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Files className="h-4 w-4 text-primary" />
            <h2 className="text-xs font-mono uppercase text-neutral-800 tracking-wider">Compare Documents</h2>
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-[9px] font-mono text-neutral-500 uppercase">Document A (Original):</label>
              <select
                value={compareDocId1}
                onChange={(e) => setCompareDocId1(e.target.value)}
                className="w-full input-premium"
              >
                <option value="">Select original...</option>
                {documents.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-mono text-neutral-500 uppercase">Document B (Revised):</label>
              <select
                value={compareDocId2}
                onChange={(e) => setCompareDocId2(e.target.value)}
                className="w-full input-premium"
              >
                <option value="">Select revised...</option>
                {documents.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
              </select>
            </div>

            <Button onClick={handleCompare} disabled={isComparing || !compareDocId1 || !compareDocId2} className="w-full btn-primary">
              {isComparing ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : null}
              Generate Comparative Report
            </Button>
          </div>

          {compareResult && (
            <div className="pt-4 border-t border-border space-y-3">
              <span className="text-[10px] font-mono text-primary uppercase">Comparison Log:</span>
              <div className="p-3 bg-neutral-50 border border-border rounded text-2xs space-y-2 max-h-[250px] overflow-y-auto">
                {compareResult.modifications && compareResult.modifications.map((m: any, idx: number) => (
                  <div key={idx} className="border-b border-border/60 pb-2 last:border-0 last:pb-0">
                    <p className="font-semibold text-neutral-800">{m.clause_type || "Clause"}:</p>
                    <p className="text-[10px] text-red-600 line-through mt-0.5">Original: "{m.original}"</p>
                    <p className="text-[10px] text-emerald-600 mt-0.5">Revised: "{m.revised}"</p>
                    <p className="text-[9px] font-mono text-neutral-400 mt-1">Impact: {m.impact_summary}</p>
                  </div>
                ))}
                {(!compareResult.modifications || compareResult.modifications.length === 0) && (
                  <div className="text-center py-4 text-neutral-400">No revisions or changes detected between documents.</div>
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
