import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileUp, Search, Filter, SortDesc, FileText, Folder, Calendar, Tag } from "lucide-react";
import { apiClient } from "@/utils/apiClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Document {
  id: string;
  title: string;
  type: string;
  lastModified: string;
  size: string;
  category: string;
  tags?: string[];
}

const Documents = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const initialDocuments: Document[] = [
    {
      id: "1",
      title: "Contract Agreement v2.1",
      type: "Legal Contract",
      lastModified: "2024-02-19",
      size: "1.2 MB",
      category: "contracts",
      tags: ["Contract", "Agreement", "Client"]
    },
    {
      id: "2",
      title: "NDA Template",
      type: "Template",
      lastModified: "2024-02-18",
      size: "524 KB",
      category: "templates",
      tags: ["NDA", "Confidentiality", "Template"]
    },
    {
      id: "3",
      title: "Client Meeting Notes",
      type: "Notes",
      lastModified: "2024-02-17",
      size: "256 KB",
      category: "notes",
      tags: ["Notes", "Meeting", "Client"]
    }
  ];

  const [documentsList, setDocumentsList] = useState<Document[]>(initialDocuments);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    toast({
      title: "Analyzing Document",
      description: `Uploading and parsing "${file.name}"...`,
    });

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await apiClient.postMultipart("/document/analyze", formData);

      if (response && response.status === "success") {
        const newDoc: Document = {
          id: response.document_id || crypto.randomUUID(),
          title: file.name,
          type: file.type || "PDF Document",
          lastModified: new Date().toISOString().split("T")[0],
          size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
          category: "contracts",
          tags: ["Uploaded", "Analyzed"]
        };

        setDocumentsList(prev => [newDoc, ...prev]);

        toast({
          title: "Document Analyzed Successfully",
          description: `"${file.name}" has been uploaded, parsed, and indexed in the vector store.`,
        });
      } else {
        throw new Error("Analysis failed");
      }
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Upload Failed",
        description: err.message || "Failed to analyze document.",
        variant: "destructive"
      });
    } finally {
      if (event.target) event.target.value = "";
    }
  };

  const filteredDocs = documentsList.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || doc.category === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <FileText className="h-5 w-5 text-primary-foreground" strokeWidth={1.75} />
          </div>
          <h1 className="page-title mb-0">Documents</h1>
        </div>
        <p className="page-description">Manage and organize your legal documents</p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex-1 w-full md:max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept=".pdf,.docx,.doc,.txt"
          />
          <Button 
            onClick={handleUploadClick} 
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white"
          >
            <FileUp className="mr-2 h-4 w-4" />
            Upload
          </Button>
        </div>
      </div>

      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList>
          <TabsTrigger value="all">All Documents</TabsTrigger>
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="fade-in">
          {filteredDocs.length === 0 ? (
            <div className="text-center py-12 rounded-lg border border-border bg-card">
              <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" strokeWidth={1.5} />
              <h3 className="text-lg font-medium text-ink mb-1">No documents found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="card-grid">
              {filteredDocs.map((doc) => (
                <Link key={doc.id} to={`/documents/${doc.id}`}>
                  <Card className="glass-card cursor-pointer h-full">
                    <CardHeader className="pb-2">
                      <CardTitle className="font-serif text-xl text-ink">{doc.title}</CardTitle>
                      <CardDescription>{doc.type}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between text-sm text-muted-foreground mb-3">
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {doc.lastModified}
                        </span>
                        <span className="font-mono text-xs">{doc.size}</span>
                      </div>

                      {doc.tags && doc.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {doc.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-secondary text-foreground text-xs rounded-full flex items-center"
                            >
                              <Tag className="h-2 w-2 mr-1" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Documents;
