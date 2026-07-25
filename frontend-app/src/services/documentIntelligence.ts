import { apiClient } from "@/utils/apiClient";
import type { DocumentDetail } from "@/types/documentIntelligence";

export async function getDocumentDetail(id: string): Promise<DocumentDetail> {
    const response = await apiClient.post(`/document/status?document_id=${id}`, {});

    if (response && response.status === "success" && response.results) {
       const results = response.results;
       return {
         id,
         title: results.metadata?.title || `Document ${id}`,
         type: results.metadata?.document_type || "Agreement",
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
    
    // If not completed or not in DB, query status endpoint
    const statusRecord = await apiClient.post("/document/analyze", { document_id: id });
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
