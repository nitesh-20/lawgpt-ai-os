import { useState } from "react";
import { Shield, AlertTriangle, CheckCircle, XCircle, FileText, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

interface ComplianceIssue {
  title: string;
  description: string;
  section: string;
  legalReference: string;
  remediation: string;
}

interface ComplianceAnalysis {
  riskPercentage: number;
  overallAssessment: string;
  criticalIssues: ComplianceIssue[];
  warnings: ComplianceIssue[];
  compliantAspects: string[];
  suggestedImprovements: string[];
}

const ComplianceChecker = () => {
  const [text, setText] = useState("");
  const [documentType, setDocumentType] = useState("contract");
  const [jurisdiction, setJurisdiction] = useState("federal");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ComplianceAnalysis | null>(null);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setText(content);
      toast({
        title: "Document Uploaded",
        description: "Your document has been loaded for analysis",
      });
    };
    reader.readAsText(file);
  };

  const handleCheck = async () => {
    if (!text.trim()) {
      toast({
        title: "Missing Document",
        description: "Please enter or upload a document to analyze",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysis(null);
    
    toast({
      title: "Analyzing Document",
      description: "Our AI is performing deep compliance analysis...",
    });

    try {
      const { data, error } = await supabase.functions.invoke('check-compliance', {
        body: {
          documentText: text,
          documentType,
          jurisdiction
        }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setAnalysis(data);
      
      toast({
        title: "Analysis Complete",
        description: `Compliance score: ${100 - data.riskPercentage}%. Risk level: ${data.riskPercentage}%`,
      });

    } catch (error: any) {
      console.error('Compliance check error:', error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze document. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskColor = (risk: number) => {
    if (risk < 30) return "text-green-600";
    if (risk < 60) return "text-amber-600";
    return "text-red-600";
  };

  const getRiskBgColor = (risk: number) => {
    if (risk < 30) return "bg-green-100";
    if (risk < 60) return "bg-amber-100";
    return "bg-red-100";
  };

  return (
    <div className="page-container fade-in">
      <div className="page-header mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl shadow-md">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <h1 className="page-title text-4xl">LawGPT Compliance Engine</h1>
        </div>
        <p className="page-description text-lg">Advanced AI-powered legal compliance analysis and risk assessment</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-lg bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Document Input
              </CardTitle>
              <CardDescription>
                Upload or paste your legal document for AI-powered compliance analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Document Type</Label>
                  <Select value={documentType} onValueChange={setDocumentType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="policy">Policy Document</SelectItem>
                      <SelectItem value="agreement">Agreement</SelectItem>
                      <SelectItem value="terms">Terms & Conditions</SelectItem>
                      <SelectItem value="privacy">Privacy Policy</SelectItem>
                      <SelectItem value="employment">Employment Document</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Jurisdiction</Label>
                  <Select value={jurisdiction} onValueChange={setJurisdiction}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="federal">Federal</SelectItem>
                      <SelectItem value="state">State</SelectItem>
                      <SelectItem value="international">International</SelectItem>
                      <SelectItem value="gdpr">GDPR (EU)</SelectItem>
                      <SelectItem value="ccpa">CCPA (California)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Document Text</Label>
                  <Button variant="outline" size="sm" asChild>
                    <label className="cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload File
                      <input
                        type="file"
                        accept=".txt,.doc,.docx"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </Button>
                </div>
                <Textarea
                  placeholder="Paste your document text here or upload a file..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="min-h-[300px] font-mono text-sm"
                />
              </div>

              <Button
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white"
                onClick={handleCheck}
                disabled={isAnalyzing || !text.trim()}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing Compliance...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Analyze Document
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {analysis ? (
            <>
              {/* Risk Score */}
              <Card className={`border-none shadow-lg ${getRiskBgColor(analysis.riskPercentage)}`}>
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 ${getRiskColor(analysis.riskPercentage)}`}>
                    <Shield className="h-5 w-5" />
                    Risk Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className={`text-5xl font-bold ${getRiskColor(analysis.riskPercentage)}`}>
                      {analysis.riskPercentage}%
                    </div>
                    <p className="text-sm text-gray-600 mt-2">Risk Level</p>
                    <Progress value={analysis.riskPercentage} className="mt-4" />
                    <p className="text-sm mt-4 text-gray-700">{analysis.overallAssessment}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="border-none shadow-lg bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Issue Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-red-600">
                      <XCircle className="h-4 w-4" />
                      Critical Issues
                    </span>
                    <Badge variant="destructive">{analysis.criticalIssues.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-amber-600">
                      <AlertTriangle className="h-4 w-4" />
                      Warnings
                    </span>
                    <Badge className="bg-amber-500">{analysis.warnings.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      Compliant Aspects
                    </span>
                    <Badge className="bg-green-500">{analysis.compliantAspects.length}</Badge>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="border-none shadow-lg bg-white/70 backdrop-blur-sm">
              <CardContent className="pt-6 text-center text-gray-500">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Upload a document to begin compliance analysis</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Detailed Results */}
      {analysis && (
        <div className="mt-8 space-y-6">
          {/* Critical Issues */}
          {analysis.criticalIssues.length > 0 && (
            <Card className="border-red-200 shadow-lg">
              <CardHeader className="bg-red-50">
                <CardTitle className="text-red-700 flex items-center gap-2">
                  <XCircle className="h-5 w-5" />
                  Critical Issues ({analysis.criticalIssues.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {analysis.criticalIssues.map((issue, idx) => (
                  <div key={idx} className="border-l-4 border-red-500 pl-4 py-2">
                    <h4 className="font-semibold text-red-700">{issue.title}</h4>
                    <p className="text-sm text-gray-700 mt-1">{issue.description}</p>
                    <p className="text-sm text-gray-600 mt-2"><strong>Section:</strong> {issue.section}</p>
                    <p className="text-sm text-gray-600"><strong>Legal Reference:</strong> {issue.legalReference}</p>
                    <p className="text-sm text-green-700 mt-2"><strong>Remediation:</strong> {issue.remediation}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Warnings */}
          {analysis.warnings.length > 0 && (
            <Card className="border-amber-200 shadow-lg">
              <CardHeader className="bg-amber-50">
                <CardTitle className="text-amber-700 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Warnings ({analysis.warnings.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {analysis.warnings.map((issue, idx) => (
                  <div key={idx} className="border-l-4 border-amber-500 pl-4 py-2">
                    <h4 className="font-semibold text-amber-700">{issue.title}</h4>
                    <p className="text-sm text-gray-700 mt-1">{issue.description}</p>
                    <p className="text-sm text-gray-600 mt-2"><strong>Section:</strong> {issue.section}</p>
                    <p className="text-sm text-gray-600"><strong>Legal Reference:</strong> {issue.legalReference}</p>
                    <p className="text-sm text-green-700 mt-2"><strong>Remediation:</strong> {issue.remediation}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Compliant Aspects */}
          {analysis.compliantAspects.length > 0 && (
            <Card className="border-green-200 shadow-lg">
              <CardHeader className="bg-green-50">
                <CardTitle className="text-green-700 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Compliant Aspects ({analysis.compliantAspects.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-2">
                  {analysis.compliantAspects.map((aspect, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span className="text-sm text-gray-700">{aspect}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Suggested Improvements */}
          {analysis.suggestedImprovements.length > 0 && (
            <Card className="border-blue-200 shadow-lg">
              <CardHeader className="bg-blue-50">
                <CardTitle className="text-blue-700">Suggested Improvements</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-2">
                  {analysis.suggestedImprovements.map((improvement, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span className="text-sm text-gray-700">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default ComplianceChecker;