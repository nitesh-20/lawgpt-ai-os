import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, FileText, Users, Scale, Clock, Sparkles, Languages, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getDocumentDetail } from "@/services/documentIntelligence";
import type { DocClause, DocumentDetail } from "@/types/documentIntelligence";
import { apiClient } from "@/utils/apiClient";
import { Badge } from "@/components/ui/badge";

const RISK_STYLE: Record<DocClause["risk"], string> = {
  high: "bg-red-500/10 border-l-2 border-red-500 text-white hover:bg-red-500/15",
  medium: "bg-amber-500/10 border-l-2 border-amber-500 text-white hover:bg-amber-500/15",
  low: "border-l-2 border-transparent text-muted-foreground hover:text-white hover:bg-white/[0.02]",
};

const DocumentIntelligence = () => {
  const { id } = useParams();
  const [doc, setDoc] = useState<DocumentDetail | null>(null);
  const [selectedClauseId, setSelectedClauseId] = useState<string>("");
  const [translatedClauseText, setTranslatedClauseText] = useState<string | null>(null);
  const [translatedClauseNote, setTranslatedClauseNote] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getDocumentDetail(id).then((d) => {
      setDoc(d);
      setSelectedClauseId(d.clauses[0]?.id ?? "");
      setIsLoading(false);
    }).catch(err => {
      console.error(err);
      setIsLoading(false);
    });
  }, [id]);

  const selectedClause = doc?.clauses.find((c) => c.id === selectedClauseId);

  const SUPPORTED_LANGUAGES = [
    { code: "hi-IN", label: "Hindi" },
    { code: "ta-IN", label: "Tamil" },
    { code: "te-IN", label: "Telugu" },
    { code: "bn-IN", label: "Bengali" }
  ];

  const handleTranslateClause = async (langCode: string) => {
    if (!selectedClause || isTranslating) return;
    setIsTranslating(true);
    try {
      const resText = await apiClient.post("/voice/translate", {
        text: selectedClause.text,
        language_code: langCode,
        speaker: "shubh"
      });
      const resNote = await apiClient.post("/voice/translate", {
        text: selectedClause.note,
        language_code: langCode,
        speaker: "shubh"
      });
      
      if (resText.status === "success") {
        setTranslatedClauseText(resText.data.translated_text);
      }
      if (resNote.status === "success") {
        setTranslatedClauseNote(resNote.data.translated_text);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleClauseClick = (id: string) => {
    setSelectedClauseId(id);
    setTranslatedClauseText(null);
    setTranslatedClauseNote(null);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <div className="text-2xs font-mono tracking-widest text-muted-foreground uppercase">Processing AI analysis</div>
      </div>
    );
  }

  if (!doc) return null;

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 md:px-6">
      {/* Back button */}
      <div>
        <Link
          to="/documents"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Documents
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <FileText className="h-4.5 w-4.5 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">{doc.title}</h1>
          </div>
          <p className="text-xs text-muted-foreground/80 font-mono uppercase tracking-wider">{doc.type} · Document ID {id}</p>
        </div>
      </div>

      {/* Split Pane View */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6 items-start">
        {/* Left Side: Document Clause Highlights */}
        <div className="glass-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06] bg-white/[0.01]">
            <span className="text-3xs font-mono text-muted-foreground/80 uppercase">Clause Viewer</span>
            <Badge variant="outline" className="text-3xs font-mono bg-emerald-500/5 text-emerald-500 border-emerald-500/10">Reviewed</Badge>
          </div>
          <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
            {doc.clauses.map((clause) => (
              <button
                key={clause.id}
                type="button"
                onClick={() => handleClauseClick(clause.id)}
                className={`block w-full text-left rounded-lg p-3.5 transition-all duration-200 ${RISK_STYLE[clause.risk]} ${selectedClauseId === clause.id ? "ring-1 ring-primary" : ""}`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-mono uppercase text-primary font-semibold">{clause.label}</span>
                  {clause.risk !== 'low' && (
                    <span className={`text-[9px] font-mono uppercase px-1 bg-white/5 rounded border text-inherit`}>{clause.risk} risk</span>
                  )}
                </div>
                <p className="text-xs leading-relaxed mt-1.5">{clause.text}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: AI summary & Deep Analysis tabs */}
        <div className="space-y-6">
          {selectedClause && (
            <div className="glass-card p-5 border-white/[0.06] bg-primary/[0.02]">
              <div className="flex items-center gap-2 mb-3.5 border-b border-white/[0.04] pb-2.5">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-xs font-mono uppercase text-white font-semibold">{selectedClause.label} Analysis</span>
                
                <div className="ml-auto flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="text-muted-foreground hover:text-white transition-colors" title="Translate Clause">
                        {isTranslating ? <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" /> : <Languages className="h-3.5 w-3.5" />}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-card border-white/[0.08] text-white">
                      {SUPPORTED_LANGUAGES.map(lang => (
                        <DropdownMenuItem key={lang.code} className="focus:bg-white/[0.04] text-xs cursor-pointer" onClick={() => handleTranslateClause(lang.code)}>
                          {lang.label}
                        </DropdownMenuItem>
                      ))}
                      {(translatedClauseText || translatedClauseNote) && (
                        <DropdownMenuItem className="focus:bg-white/[0.04] text-xs cursor-pointer text-primary" onClick={() => {
                          setTranslatedClauseText(null);
                          setTranslatedClauseNote(null);
                        }}>
                          Revert to English
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <p className="text-xs leading-relaxed text-muted-foreground">
                {translatedClauseNote || selectedClause.note}
              </p>
              
              {translatedClauseText && (
                <div className="mt-4 pt-4 border-t border-white/[0.05]">
                  <span className="text-[10px] font-mono uppercase text-primary">Translated Excerpt:</span>
                  <p className="text-xs text-white leading-relaxed mt-1.5 p-3 rounded-lg bg-black/40 border border-white/[0.04]">
                    {translatedClauseText}
                  </p>
                </div>
              )}
            </div>
          )}

          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="w-full bg-white/[0.02] border border-white/[0.06] p-1 h-9">
              <TabsTrigger value="summary" className="w-full text-2xs data-[state=active]:bg-primary/20">Summary</TabsTrigger>
              <TabsTrigger value="entities" className="w-full text-2xs data-[state=active]:bg-primary/20">Entities</TabsTrigger>
              <TabsTrigger value="judgments" className="w-full text-2xs data-[state=active]:bg-primary/20">Citations</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="glass-card p-5 mt-3 space-y-4">
              <p className="text-xs leading-relaxed text-muted-foreground">{doc.summary}</p>
              {doc.aiNotes && doc.aiNotes.length > 0 && (
                <div className="space-y-2.5 pt-3 border-t border-white/[0.04]">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    <span className="text-2xs font-mono uppercase text-white">AI Notes</span>
                  </div>
                  <ul className="space-y-1.5 pl-3 list-disc text-3xs text-muted-foreground/90 font-mono">
                    {doc.aiNotes.map((n) => (
                      <li key={n.id}>{n.note}</li>
                    ))}
                  </ul>
                </div>
              )}
            </TabsContent>

            <TabsContent value="entities" className="glass-card p-5 mt-3">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-2xs font-mono uppercase text-white">Extracted Entities</span>
              </div>
              <div className="space-y-3">
                {doc.entities && doc.entities.length > 0 ? (
                  doc.entities.map((entity) => (
                    <div key={entity.id} className="flex justify-between items-center text-xs py-1 border-b border-white/[0.03]">
                      <div>
                        <p className="font-semibold text-white">{entity.name}</p>
                        <p className="text-[10px] text-muted-foreground">{entity.value}</p>
                      </div>
                      <Badge variant="secondary" className="text-3xs font-mono uppercase bg-white/[0.04]">{entity.type}</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-6">No entities detected.</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="judgments" className="glass-card p-5 mt-3">
              <div className="flex items-center gap-2 mb-4">
                <Scale className="h-4 w-4 text-primary" />
                <span className="text-2xs font-mono uppercase text-white">Related Case Citations</span>
              </div>
              <div className="space-y-4">
                {doc.relatedJudgments && doc.relatedJudgments.length > 0 ? (
                  doc.relatedJudgments.map((j) => (
                    <div key={j.id} className="p-3 bg-white/[0.01] border border-white/[0.04] rounded-lg">
                      <p className="font-semibold text-xs text-white leading-relaxed">{j.title}</p>
                      <p className="text-3xs font-mono text-primary mt-1">{j.court} · {j.year}</p>
                      <p className="text-2xs text-muted-foreground mt-2">{j.relevance}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-6">No related citations found.</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default DocumentIntelligence;
