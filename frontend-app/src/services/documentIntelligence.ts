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
           aiNotes: results.risk_factors ? results.risk_factors.map((n: string, i: number) => ({ id: `n${i}`, note: n })) : [],
           entities: results.parties ? results.parties.map((p: string, i: number) => ({ id: `e${i}`, name: p, value: "Party Identified", type: "ORG" })) : [],
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
         aiNotes: res.risk_factors ? res.risk_factors.map((n: string, i: number) => ({ id: `n${i}`, note: n })) : [],
         entities: res.parties ? res.parties.map((p: string, i: number) => ({ id: `e${i}`, name: p, value: "Party Identified", type: "ORG" })) : [],
         relatedJudgments: [],
         timeline: []
       };
    }
    
    throw new Error("Failed to get document detail");
}

export async function summarizeDocument(documentId: string): Promise<string> {
  const formData = new FormData();
  formData.append("document_id", documentId);
  const response = await apiClient.postMultipart("/document/summarize", formData);
  if (response && response.status === "success") {
    return response.summary || response.data?.summary || "";
  }
  return response.summary || "";
}

export async function compareDocuments(docId1: string, docId2: string): Promise<any> {
  const formData = new FormData();
  formData.append("doc_id_1", docId1);
  formData.append("doc_id_2", docId2);
  const response = await apiClient.postMultipart("/document/compare", formData);
  return response;
}
