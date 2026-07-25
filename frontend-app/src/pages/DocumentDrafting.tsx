import { useState } from "react";
import TemplateGallery from "@/components/document-drafting/TemplateGallery";
import DocumentGenerator from "@/components/document-drafting/DocumentGenerator";
import RecentDocuments from "@/components/document-drafting/RecentDocuments";
import { Files, FileEdit, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const DocumentDrafting = () => {
  const [activeTab, setActiveTab] = useState("templates");
  const { toast } = useToast();

  const handleTemplateSelect = (title: string, prompt: string) => {
    setActiveTab("generate");
    toast({
      title: "Template Selected",
      description: `Loaded drafting guidelines for ${title}.`,
    });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 md:px-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <FileEdit className="h-4.5 w-4.5 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Document Drafting</h1>
          </div>
          <p className="text-xs text-muted-foreground/80 font-mono uppercase tracking-wider">AI-powered legal draft generation and compiling</p>
        </div>
      </div>

      {/* Feature cards row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          { icon: Files, title: "Template Library", desc: "Select pre-structured outlines for agreements and pleadings." },
          { icon: FileEdit, title: "AI Generation", desc: "Compose unique clauses and legal templates via RAG." },
          { icon: FileText, title: "History Log", desc: "Access previously generated document briefs." }
        ].map((item, idx) => (
          <div key={idx} className="glass-card p-5 hover:border-white/[0.1] transition-all">
            <item.icon className="h-6 w-6 text-primary mb-3" />
            <h3 className="font-semibold text-xs text-white uppercase font-mono tracking-wider">{item.title}</h3>
            <p className="text-2xs text-muted-foreground mt-1.5 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Navigation tabs */}
      <div className="space-y-6">
        <div className="flex border-b border-white/[0.06] gap-2 pb-px">
          {[
            { id: "templates", label: "Templates", icon: Files },
            { id: "generate", label: "Generate", icon: FileEdit },
            { id: "recent", label: "Recent Docs", icon: FileText }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-xs font-semibold tracking-wide uppercase border-b-2 transition-all duration-200 flex items-center gap-2 ${
                activeTab === tab.id 
                  ? "border-primary text-primary" 
                  : "border-transparent text-muted-foreground hover:text-white"
              }`}
            >
              <tab.icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab content panels */}
        <div className="min-h-[400px]">
          {activeTab === "templates" && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
              <TemplateGallery onSelectTemplate={handleTemplateSelect} />
            </motion.div>
          )}

          {activeTab === "generate" && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 border-white/[0.06]">
              <DocumentGenerator />
            </motion.div>
          )}

          {activeTab === "recent" && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
              <RecentDocuments />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentDrafting;
