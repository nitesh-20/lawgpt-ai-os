import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileUp, Search, Folder, Calendar, Tag, ArrowRight, FileText, Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { listDocuments, uploadDocument, type DocumentSummary } from "@/services/documents";
import { motion } from "framer-motion";

const Documents = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

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
      title: "Processing Document",
      description: `Uploading and running AI vector indexing for ${file.name}...`,
    });

    try {
      await uploadDocument(file);
      toast({
        title: "Success",
        description: `Document '${file.name}' processed and indexed into vector database.`,
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
        <div className="text-2xs font-mono tracking-widest text-muted-foreground uppercase">Syncing Document vault</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 md:px-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <FileText className="h-4.5 w-4.5 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Document vault</h1>
          </div>
          <p className="text-xs text-muted-foreground/80 font-mono uppercase tracking-wider">Semantic document indexing and structural analysis</p>
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
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
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

      {/* Filter and search controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-premium pl-10 w-full text-sm"
          />
        </div>
      </div>

      {/* Scope filter tabs */}
      <div className="space-y-6">
        <div className="flex border-b border-white/[0.06] gap-2 pb-px">
          {["all", "uploaded", "contracts", "notes"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-xs font-semibold tracking-wide uppercase border-b-2 transition-all duration-200 ${
                activeTab === tab 
                  ? "border-primary text-primary" 
                  : "border-transparent text-muted-foreground hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content list */}
        <div className="min-h-[300px]">
          {filteredDocs.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground glass-card border-white/[0.04] p-8 max-w-lg mx-auto">
              <Folder className="h-10 w-10 mx-auto text-muted-foreground/45 mb-4" strokeWidth={1.5} />
              <h3 className="text-sm font-semibold text-white">No documents found</h3>
              <p className="text-xs text-muted-foreground/80 mt-1 leading-relaxed">Drag and drop or upload a document to begin structural and semantic RAG indexing.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredDocs.map((doc, idx) => (
                <Link key={doc.id} to={`/documents/${doc.id}`}>
                  <motion.div 
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="glass-card glass-card-hover p-5 flex flex-col justify-between h-full group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="font-semibold text-sm text-white group-hover:text-primary transition-colors line-clamp-1">{doc.title}</h3>
                        <Sparkles className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-3xs font-mono text-muted-foreground/60 uppercase">{doc.type}</p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/[0.04] flex items-center justify-between text-2xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-primary" />
                        <span>{new Date(doc.lastModified).toLocaleDateString()}</span>
                      </div>
                      <span className="font-mono text-3xs bg-white/[0.03] border border-white/[0.05] px-1.5 py-0.5 rounded">{doc.size}</span>
                    </div>

                    {doc.tags && doc.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {doc.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="bg-white/[0.01] border-white/[0.08] text-3xs font-mono py-0.5">
                            <Tag className="h-2 w-2 mr-1 text-primary" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Documents;
