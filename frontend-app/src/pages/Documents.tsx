
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileUp, Search, Filter, SortDesc, FileText, Folder, Calendar, Tag } from "lucide-react";
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
  
  const documents: Document[] = [
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

  const handleUpload = () => {
    toast({
      title: "Upload Document",
      description: "Select files to upload...",
    });
  };

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || doc.category === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl shadow-md">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <h1 className="page-title">Documents</h1>
        </div>
        <p className="page-description">Manage and organize your legal documents</p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex-1 w-full md:max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 glass-card bg-white/50"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="bg-white/80 hover:bg-white">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" className="bg-white/80 hover:bg-white">
            <SortDesc className="mr-2 h-4 w-4" />
            Sort
          </Button>
          <Button 
            onClick={handleUpload} 
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
        <TabsList className="bg-white/50 p-1 rounded-lg border border-white/60 shadow-md">
          <TabsTrigger 
            value="all"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-accent/20 data-[state=active]:text-primary"
          >
            All Documents
          </TabsTrigger>
          <TabsTrigger 
            value="contracts"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-accent/20 data-[state=active]:text-primary"
          >
            Contracts
          </TabsTrigger>
          <TabsTrigger 
            value="templates"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-accent/20 data-[state=active]:text-primary"
          >
            Templates
          </TabsTrigger>
          <TabsTrigger 
            value="notes" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-accent/20 data-[state=active]:text-primary"
          >
            Notes
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="animate-fade-in">
          {filteredDocs.length === 0 ? (
            <div className="text-center py-12 glass-card">
              <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No documents found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="card-grid">
              {filteredDocs.map((doc) => (
                <Card 
                  key={doc.id} 
                  className="hover-scale glass-card cursor-pointer border-0"
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl gradient-text">{doc.title}</CardTitle>
                    <CardDescription>{doc.type}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between text-sm text-gray-500 mb-3">
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {doc.lastModified}
                      </span>
                      <span>{doc.size}</span>
                    </div>
                    
                    {doc.tags && doc.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {doc.tags.map((tag, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full flex items-center"
                          >
                            <Tag className="h-2 w-2 mr-1" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Documents;
