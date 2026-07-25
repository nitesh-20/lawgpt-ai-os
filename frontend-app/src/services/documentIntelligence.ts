import { apiClient } from "@/utils/apiClient";
import type { DocumentDetail } from "@/types/documentIntelligence";

export async function getDocumentDetail(id: string): Promise<DocumentDetail> {
    try {
      // 1. First attempt to query GET /document/status?document_id=id
      const response = await apiClient.get(`/document/status?document_id=${id}`);
      if (response && response.results) {
         const results = response.results;
         return {
           id,
           title: response.title || `Document ${id}`,
           type: response.type || "Agreement",
           summary: results.executive_summary || "No summary available.",
           clauses: (results.key_findings || []).map((c: any, i: number) => ({
             id: `c${i}`,
             label: c.clause_type || "Clause",
             text: c.findings || "No text.",
             risk: c.severity === "High" ? "high" : c.severity === "Medium" ? "medium" : "low",
             note: c.recommended_action || "No notes."
           })),
           aiNotes: [],
           entities: [],
           relatedJudgments: [],
           timeline: []
         };
      }
    } catch (e) {
      console.warn("GET /document/status failed, falling back to analyze status check", e);
    }
    
    // 2. Fallback check: POST /document/analyze with document_id in FormData
    const formData = new FormData();
    formData.append("document_id", id);
    const statusRecord = await apiClient.postMultipart("/document/analyze", formData);
    if (statusRecord && statusRecord.results) {
       const res = statusRecord.results;
       return {
         id,
         title: `Document ${id}`,
         type: "Agreement",
         summary: res.executive_summary || "Processing...",
         clauses: (res.key_findings || []).map((c: any, i: number) => ({
           id: `c${i}`,
           label: c.clause_type || "Clause",
           text: c.findings || "No text.",
           risk: c.severity === "High" ? "high" : c.severity === "Medium" ? "medium" : "low",
           note: c.recommended_action || "No notes."
         })),
         aiNotes: [],
         entities: [],
         relatedJudgments: [],
         timeline: []
       };
    }
    
    throw new Error("Failed to get document detail");
}
