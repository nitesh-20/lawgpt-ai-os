import { useState, useEffect } from "react";
import { 
  FileEdit, 
  Files, 
  Sparkles, 
  RotateCcw, 
  FileText, 
  Download, 
  AlertTriangle, 
  CheckCircle, 
  ArrowRight,
  Compare,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  listDraftTemplates, 
  generateDraft, 
  reviewDraft, 
  redlineDraft, 
  improveDraft 
} from "@/services/drafting";

const DocumentDrafting = () => {
  const [activeTab, setActiveTab] = useState("templates");
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const { toast } = useToast();

  // Generator State
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
  const [docVariables, setDocVariables] = useState<Record<string, string>>({});
  const [userInstructions, setUserInstructions] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState("");

  // Review State
  const [reviewText, setReviewText] = useState("");
  const [reviewDocType, setReviewDocType] = useState("general_contract");
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewResult, setReviewResult] = useState<any | null>(null);

  // Redline State
  const [originalText, setOriginalText] = useState("");
  const [revisedText, setRevisedText] = useState("");
  const [isRedlining, setIsRedlining] = useState(false);
  const [redlineResult, setRedlineResult] = useState<any | null>(null);

  // Improve State
  const [improveText, setImproveText] = useState("");
  const [improveInstructions, setImproveInstructions] = useState("Rewrite to be more client-friendly.");
  const [isImproving, setIsImproving] = useState(false);
  const [improveResult, setImproveResult] = useState("");

  useEffect(() => {
    listDraftTemplates()
      .then((data) => {
        // Fallback static list if data is not array
        const list = Array.isArray(data) ? data : (data && Array.isArray(data.templates) ? data.templates : [
          { id: "nda", name: "Non-Disclosure Agreement", description: "Standard NDA contract for commercial engagements.", fields: ["parties", "governing_law", "term"] },
          { id: "lease_agreement", name: "Commercial Lease", description: "Lease agreement for rental of office spaces.", fields: ["landlord", "tenant", "rent_amount"] },
          { id: "service_agreement", name: "Service Agreement", description: "Contract for consulting or software development services.", fields: ["client", "provider", "scope_of_work"] }
        ]);
        setTemplates(list);
        setIsLoadingTemplates(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoadingTemplates(false);
      });
  }, []);

  const handleSelectTemplate = (tpl: any) => {
    setSelectedTemplate(tpl);
    const initialVars: Record<string, string> = {};
    (tpl.fields || []).forEach((f: string) => {
      initialVars[f] = "";
    });
    setDocVariables(initialVars);
    setActiveTab("generate");
    toast({ title: "Template Loaded", description: `Configuring fields for ${tpl.name}.` });
  };

  const handleGenerate = async () => {
    if (!selectedTemplate) return;
    setIsGenerating(true);
    try {
      const res = await generateDraft({
        doc_type: selectedTemplate.id,
        variables: docVariables,
        user_instructions: userInstructions
      });
      const draft = res.generated_draft || res.draft || "Draft generation succeeded.";
      setGeneratedDraft(draft);
      toast({ title: "Draft Compiled", description: "AI has successfully generated your contract." });
    } catch (e) {
      toast({ title: "Error", description: "Failed to generate draft.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReview = async () => {
    if (!reviewText.trim()) return;
    setIsReviewing(true);
    setReviewResult(null);
    try {
      const res = await reviewDraft({
        text: reviewText,
        doc_type: reviewDocType
      });
      setReviewResult(res);
      toast({ title: "Audit Finished", description: "Legal review and recommendations compiled." });
    } catch (e) {
      toast({ title: "Error", description: "Failed to review contract.", variant: "destructive" });
    } finally {
      setIsReviewing(false);
    }
  };

  const handleRedline = async () => {
    if (!originalText.trim() || !revisedText.trim()) return;
    setIsRedlining(true);
    setRedlineResult(null);
    try {
      const res = await redlineDraft({
        original_text: originalText,
        revised_text: revisedText
      });
      setRedlineResult(res);
      toast({ title: "Redlines Generated", description: "Discrepancies and risks indexed." });
    } catch (e) {
      toast({ title: "Error", description: "Failed to execute redline comparison.", variant: "destructive" });
    } finally {
      setIsRedlining(false);
    }
  };

  const handleImprove = async () => {
    if (!improveText.trim()) return;
    setIsImproving(true);
    setImproveResult("");
    try {
      const res = await improveDraft({
        text: improveText,
        instructions: improveInstructions
      });
      setImproveResult(res.improved_text || res.text || "Draft improved.");
      toast({ title: "Clause Rewritten", description: "AI successfully updated your clause." });
    } catch (e) {
      toast({ title: "Error", description: "Failed to improve draft.", variant: "destructive" });
    } finally {
      setIsImproving(false);
    }
  };

  const handleExportText = (content: string, filename = "draft.txt") => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 md:px-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded bg-primary/10 border border-primary/20 flex items-center justify-center">
              <FileEdit className="h-4.5 w-4.5 text-primary" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900">Document Drafting</h1>
          </div>
          <p className="text-xs text-neutral-500 font-mono uppercase tracking-wider">
            AI-powered legal draft generation, review, redline, and improvements
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-neutral-50 border border-border p-1 h-9 w-full grid grid-cols-5">
          <TabsTrigger value="templates" className="text-2xs">Templates</TabsTrigger>
          <TabsTrigger value="generate" className="text-2xs">Generate</TabsTrigger>
          <TabsTrigger value="review" className="text-2xs">Review & Audit</TabsTrigger>
          <TabsTrigger value="redline" className="text-2xs">Redline Compare</TabsTrigger>
          <TabsTrigger value="improve" className="text-2xs">Improve Clauses</TabsTrigger>
        </TabsList>

        {/* Templates Panel */}
        <TabsContent value="templates" className="mt-0">
          {isLoadingTemplates ? (
            <div className="text-center py-12 text-neutral-500 text-xs">
              <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2 text-primary" />
              Loading templates...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {templates.map((tpl) => (
                <div key={tpl.id} className="glass-card p-5 hover:border-neutral-300 flex flex-col justify-between h-full">
                  <div>
                    <h3 className="font-semibold text-xs text-neutral-800 uppercase font-mono tracking-wider mb-2">{tpl.name}</h3>
                    <p className="text-2xs text-neutral-500 leading-relaxed mb-4">{tpl.description}</p>
                  </div>
                  <Button onClick={() => handleSelectTemplate(tpl)} className="w-full btn-secondary">
                    Use Template
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Generate Panel */}
        <TabsContent value="generate" className="glass-card p-6 mt-0 space-y-6">
          {!selectedTemplate ? (
            <div className="text-center py-12 text-neutral-400 text-xs">
              Please select a template from the Templates tab first.
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-border pb-3">
                <span className="text-[10px] font-mono text-primary uppercase">Template: {selectedTemplate.name}</span>
                <Button onClick={() => setSelectedTemplate(null)} variant="ghost" className="text-neutral-500 text-2xs p-1 h-auto">
                  Change Template
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(selectedTemplate.fields || []).map((f: string) => (
                  <div key={f} className="space-y-1.5">
                    <label className="text-[9px] font-mono text-neutral-500 uppercase">{f.replace("_", " ")}:</label>
                    <input
                      type="text"
                      value={docVariables[f] || ""}
                      onChange={(e) => setDocVariables({ ...docVariables, [f]: e.target.value })}
                      placeholder={`Enter ${f.replace("_", " ")}...`}
                      className="w-full input-premium"
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-mono text-neutral-500 uppercase">Custom Drafting Instructions:</label>
                <textarea
                  value={userInstructions}
                  onChange={(e) => setUserInstructions(e.target.value)}
                  placeholder="e.g. Make termination clause require 60-day notice, and add strict intellectual property retention clauses..."
                  className="w-full input-premium min-h-[80px]"
                />
              </div>

              <Button onClick={handleGenerate} disabled={isGenerating} className="w-full btn-primary">
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Generate Document Draft
              </Button>

              {generatedDraft && (
                <div className="space-y-3 pt-4 border-t border-border">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono text-primary uppercase">Generated Content:</span>
                    <Button onClick={() => handleExportText(generatedDraft, `${selectedTemplate.id}_draft.txt`)} className="btn-secondary flex items-center gap-1.5 px-2 py-1 h-auto text-2xs">
                      <Download size={13} />
                      Export Draft
                    </Button>
                  </div>
                  <textarea
                    value={generatedDraft}
                    readOnly
                    className="w-full input-premium min-h-[250px] font-mono text-[11px] leading-relaxed"
                  />
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* Review & Audit Panel */}
        <TabsContent value="review" className="glass-card p-6 mt-0 space-y-6">
          <div className="space-y-1.5">
            <label className="text-[9px] font-mono text-neutral-500 uppercase">Document Text to Review:</label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Paste contract text here to perform a regulatory and vulnerability review..."
              className="w-full input-premium min-h-[200px]"
            />
          </div>

          <Button onClick={handleReview} disabled={isReviewing || !reviewText.trim()} className="w-full btn-primary">
            {isReviewing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Analyze Draft
          </Button>

          {reviewResult && (
            <div className="space-y-4 pt-4 border-t border-border">
              <span className="text-[10px] font-mono text-primary uppercase">AI Risk Analysis:</span>
              <div className="space-y-3">
                {reviewResult.missing_clauses && reviewResult.missing_clauses.length > 0 && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded text-xs space-y-1.5">
                    <div className="flex items-center gap-1.5 text-red-700 font-semibold uppercase text-3xs font-mono">
                      <AlertTriangle size={13} />
                      Missing Clauses Detected ({reviewResult.missing_clauses.length})
                    </div>
                    <ul className="list-disc pl-4 text-2xs text-red-900 space-y-1">
                      {reviewResult.missing_clauses.map((c: string, idx: number) => <li key={idx}>{c}</li>)}
                    </ul>
                  </div>
                )}
                {reviewResult.risky_clauses && reviewResult.risky_clauses.length > 0 && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs space-y-2">
                    <div className="flex items-center gap-1.5 text-amber-700 font-semibold uppercase text-3xs font-mono">
                      <AlertTriangle size={13} />
                      Unfavorable Provisions Found
                    </div>
                    {reviewResult.risky_clauses.map((c: any, idx: number) => (
                      <div key={idx} className="text-2xs text-amber-900 border-b border-amber-200/50 pb-2 last:border-0 last:pb-0">
                        <p className="font-semibold">{c.clause_name}:</p>
                        <p className="italic text-neutral-700 mt-1">"{c.excerpt}"</p>
                        <p className="mt-1 font-semibold text-amber-800">Recommendation: {c.alternative}</p>
                      </div>
                    ))}
                  </div>
                )}
                {reviewResult.status === "success" && !reviewResult.missing_clauses && !reviewResult.risky_clauses && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded flex items-center gap-2 text-emerald-800 text-xs font-semibold">
                    <CheckCircle size={14} className="text-emerald-600" />
                    No major vulnerabilities or missing items flagged.
                  </div>
                )}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Redline Panel */}
        <TabsContent value="redline" className="glass-card p-6 mt-0 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-mono text-neutral-500 uppercase">Original Document Text:</label>
              <textarea
                value={originalText}
                onChange={(e) => setOriginalText(e.target.value)}
                placeholder="Paste original contract draft..."
                className="w-full input-premium min-h-[180px]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-mono text-neutral-500 uppercase">Revised / Counterparty Text:</label>
              <textarea
                value={revisedText}
                onChange={(e) => setRevisedText(e.target.value)}
                placeholder="Paste revised contract draft..."
                className="w-full input-premium min-h-[180px]"
              />
            </div>
          </div>

          <Button onClick={handleRedline} disabled={isRedlining || !originalText.trim() || !revisedText.trim()} className="w-full btn-primary">
            {isRedlining ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Generate Redline Diff
          </Button>

          {redlineResult && (
            <div className="space-y-4 pt-4 border-t border-border">
              <span className="text-[10px] font-mono text-primary uppercase">Modified Redlines:</span>
              <div className="space-y-3">
                {redlineResult.modifications && redlineResult.modifications.map((m: any, idx: number) => (
                  <div key={idx} className="p-3 bg-neutral-50 border border-border rounded text-xs space-y-1.5">
                    <div className="flex justify-between items-center text-[9px] font-mono">
                      <span className="text-primary font-semibold">{m.clause_type || "Provision"}</span>
                      <span className="text-neutral-400 uppercase">{m.change_type}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-1.5 text-2xs">
                      <div className="p-2 bg-red-50 text-red-900 rounded border border-red-100">
                        <span className="font-mono text-[9px] block text-red-500 uppercase">Original:</span>
                        {m.original}
                      </div>
                      <div className="p-2 bg-emerald-50 text-emerald-900 rounded border border-emerald-100">
                        <span className="font-mono text-[9px] block text-emerald-500 uppercase">Revised:</span>
                        {m.revised}
                      </div>
                    </div>
                    <p className="text-2xs text-neutral-600 mt-2 font-mono"><span className="font-semibold text-neutral-800">Impact:</span> {m.impact_summary}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Improve Panel */}
        <TabsContent value="improve" className="glass-card p-6 mt-0 space-y-6">
          <div className="space-y-1.5">
            <label className="text-[9px] font-mono text-neutral-500 uppercase">Target Clause / Provision Text:</label>
            <textarea
              value={improveText}
              onChange={(e) => setImproveText(e.target.value)}
              placeholder="Paste specific clause text here to modify or improve..."
              className="w-full input-premium min-h-[150px]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-mono text-neutral-500 uppercase">Refining Prompts / Instructions:</label>
            <input
              type="text"
              value={improveInstructions}
              onChange={(e) => setImproveInstructions(e.target.value)}
              placeholder="e.g. Rewrite to protect the service provider's intellectual property rights completely."
              className="w-full input-premium"
            />
          </div>

          <Button onClick={handleImprove} disabled={isImproving || !improveText.trim()} className="w-full btn-primary">
            {isImproving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Improve Clause
          </Button>

          {improveResult && (
            <div className="space-y-3 pt-4 border-t border-border">
              <span className="text-[10px] font-mono text-primary uppercase">Optimized Clause Output:</span>
              <textarea
                value={improveResult}
                readOnly
                className="w-full input-premium min-h-[120px] font-mono text-[11px]"
              />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

const Loader2 = ({ className }: { className?: string }) => (
  <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export default DocumentDrafting;
export { Loader2 };
