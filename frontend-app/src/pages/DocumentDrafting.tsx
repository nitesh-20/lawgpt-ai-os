
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import TemplateGallery from "@/components/document-drafting/TemplateGallery";
import DocumentGenerator from "@/components/document-drafting/DocumentGenerator";
import RecentDocuments from "@/components/document-drafting/RecentDocuments";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Files, FileEdit, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const DocumentDrafting = () => {
  const [activeTab, setActiveTab] = useState("templates");
  const { toast } = useToast();

  const features = [
    {
      title: "Template Library",
      description: "Access professional legal document templates",
      icon: Files
    },
    {
      title: "AI Document Generation",
      description: "Create custom documents with AI assistance",
      icon: FileEdit
    },
    {
      title: "Document Management",
      description: "Organize and track all your legal documents",
      icon: FileText
    }
  ];

  const handleTemplateSelect = (title: string, prompt: string) => {
    setActiveTab("generate");
    toast({
      title: "Template Selected",
      description: `Loading the ${title} template...`,
    });
  };

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl shadow-md">
            <FileEdit className="h-6 w-6 text-primary" />
          </div>
          <h1 className="page-title">Document Drafting</h1>
        </div>
        <p className="page-description">Create and edit legal documents with AI assistance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {features.map((feature, index) => (
          <Card key={index} className="bg-white/50 backdrop-blur-sm border-none shadow-lg hover:shadow-xl transition-all hover:scale-105">
            <CardHeader>
              <feature.icon className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-lg">{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="space-y-8"
      >
        <TabsList className="bg-white/50 p-1 rounded-lg border border-white/60 shadow-md">
          <TabsTrigger 
            value="templates"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-accent/20 data-[state=active]:text-primary"
          >
            <Files className="w-4 h-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger 
            value="generate"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-accent/20 data-[state=active]:text-primary"
          >
            <FileText className="w-4 h-4 mr-2" />
            Generate
          </TabsTrigger>
          <TabsTrigger 
            value="recent"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-accent/20 data-[state=active]:text-primary"
          >
            <FileText className="w-4 h-4 mr-2" />
            Recent Documents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-8 animate-fade-in">
          <TemplateGallery onSelectTemplate={handleTemplateSelect} />
        </TabsContent>

        <TabsContent value="generate" className="animate-fade-in">
          <DocumentGenerator />
        </TabsContent>
        
        <TabsContent value="recent" className="animate-fade-in">
          <RecentDocuments />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DocumentDrafting;
