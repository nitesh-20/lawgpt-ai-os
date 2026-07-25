import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, FileText, Users, Scale, Clock, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { mockDocumentDetail } from "@/data/documentIntelligenceMock";
import type { DocClause } from "@/types/documentIntelligence";

const RISK_STYLE: Record<DocClause["risk"], string> = {
  high: "bg-destructive/10 border-b-2 border-destructive text-ink",
  medium: "bg-accent/10 border-b-2 border-accent text-ink",
  low: "text-ink",
};

const DocumentIntelligence = () => {
  const { id } = useParams();
  // In production this fetches DocumentDetail by `id` from the document-intelligence API;
  // the mock is used here so the page renders standalone with no backend dependency.
  const doc = mockDocumentDetail;
  const [selectedClauseId, setSelectedClauseId] = useState<string>(doc.clauses[0]?.id ?? "");
  const selectedClause = doc.clauses.find((c) => c.id === selectedClauseId);

  return (
    <div className="page-container fade-in">
      <Link
        to="/documents"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to documents
      </Link>

      <div className="page-header">
        <div className="flex items-center gap-3 mb-1.5">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <FileText className="h-5 w-5 text-primary-foreground" strokeWidth={1.75} />
          </div>
          <h1 className="page-title mb-0">{doc.title}</h1>
        </div>
        <p className="page-description">{doc.type} · Document ID {id ?? doc.id}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6">
        {/* Mock PDF preview with clause highlighting */}
        <div className="rounded-lg border border-border bg-card shadow-card">
          <div className="flex items-center justify-between px-5 py-3 border-b border-border">
            <p className="font-mono text-xs text-muted-foreground">Page 1 of 12</p>
            <Badge variant="secondary" className="font-mono text-[11px]">Reviewed</Badge>
          </div>
          <div className="p-6 sm:p-8 space-y-5">
            {doc.clauses.map((clause) => (
              <button
                key={clause.id}
                type="button"
                onClick={() => setSelectedClauseId(clause.id)}
                className={`block w-full text-left rounded-sm px-1 -mx-1 transition-colors ${RISK_STYLE[clause.risk]} ${
                  selectedClauseId === clause.id ? "ring-2 ring-primary/40" : ""
                }`}
              >
                <p className="font-mono text-xs font-medium text-accent mb-1">{clause.label}</p>
                <p className="text-[15px] leading-relaxed">{clause.text}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Analysis panel */}
        <div className="space-y-6">
          {selectedClause && (
            <div className="rounded-lg border border-border bg-card shadow-card p-5">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-primary" strokeWidth={1.75} />
                <p className="font-mono text-xs font-medium text-accent">{selectedClause.label}</p>
                <Badge
                  variant={selectedClause.risk === "high" ? "destructive" : "secondary"}
                  className="ml-auto text-[11px] capitalize"
                >
                  {selectedClause.risk} risk
                </Badge>
              </div>
              <p className="text-[14px] text-foreground leading-relaxed">{selectedClause.note}</p>
            </div>
          )}

          <Tabs defaultValue="summary">
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="summary" className="text-xs">Summary</TabsTrigger>
              <TabsTrigger value="entities" className="text-xs">Entities</TabsTrigger>
              <TabsTrigger value="judgments" className="text-xs">Judgments</TabsTrigger>
              <TabsTrigger value="timeline" className="text-xs">Timeline</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="rounded-lg border border-border bg-card shadow-card p-5 mt-3">
              <p className="text-[14px] text-foreground leading-relaxed mb-5">{doc.summary}</p>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-3.5 w-3.5 text-primary" strokeWidth={1.75} />
                <p className="font-mono text-xs font-medium text-ink">AI notes</p>
              </div>
              <ul className="space-y-2.5">
                {doc.aiNotes.map((n) => (
                  <li key={n.id} className="text-[13px] text-muted-foreground leading-snug flex gap-2">
                    <span className="text-primary shrink-0">·</span>
                    {n.note}
                  </li>
                ))}
              </ul>
            </TabsContent>

            <TabsContent value="entities" className="rounded-lg border border-border bg-card shadow-card p-5 mt-3">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-3.5 w-3.5 text-primary" strokeWidth={1.75} />
                <p className="font-mono text-xs font-medium text-ink">Extracted entities</p>
              </div>
              <div className="space-y-3">
                {doc.entities.map((entity) => (
                  <div key={entity.id} className="flex items-start justify-between gap-3 text-[13px]">
                    <div>
                      <p className="text-ink font-medium">{entity.name}</p>
                      <p className="text-muted-foreground">{entity.value}</p>
                    </div>
                    <Badge variant="secondary" className="text-[10px] shrink-0">{entity.type}</Badge>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="judgments" className="rounded-lg border border-border bg-card shadow-card p-5 mt-3">
              <div className="flex items-center gap-2 mb-3">
                <Scale className="h-3.5 w-3.5 text-primary" strokeWidth={1.75} />
                <p className="font-mono text-xs font-medium text-ink">Related judgments</p>
              </div>
              <div className="space-y-4">
                {doc.relatedJudgments.map((j) => (
                  <div key={j.id}>
                    <p className="text-[13px] font-medium text-ink leading-snug">{j.title}</p>
                    <p className="font-mono text-[11px] text-accent mb-1">{j.court} · {j.year}</p>
                    <p className="text-[13px] text-muted-foreground leading-snug">{j.relevance}</p>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="timeline" className="rounded-lg border border-border bg-card shadow-card p-5 mt-3">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-3.5 w-3.5 text-primary" strokeWidth={1.75} />
                <p className="font-mono text-xs font-medium text-ink">Processing timeline</p>
              </div>
              <div className="space-y-3">
                {doc.timeline.map((event) => (
                  <div key={event.id} className="flex gap-3 text-[13px]">
                    <span className="font-mono text-[11px] text-muted-foreground shrink-0 pt-0.5">{event.date}</span>
                    <span className="text-foreground">{event.label}</span>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default DocumentIntelligence;
