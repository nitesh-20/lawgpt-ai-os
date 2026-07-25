import { apiClient } from "@/utils/apiClient";

export type ResearchContentType = "cases" | "statutes" | "articles" | "all";

export interface ResearchResult {
  id: string;
  title: string;
  court?: string;
  date: string;
  matchScore: number;
  summary: string;
  citations: string[];
  type: string;
  content?: string;
}

export interface ResearchSearchParams {
  query: string;
  contentType: ResearchContentType;
  jurisdiction?: string;
}

export async function search(params: ResearchSearchParams): Promise<ResearchResult[]> {
  const response = await apiClient.post("/research/query", {
    query: params.query,
    filters: {
      category: params.contentType === "all" ? undefined : params.contentType,
      jurisdiction: params.jurisdiction || undefined,
    }
  });

  if (response && response.status === "success" && response.data) {
    if (response.data.results) {
      return response.data.results as ResearchResult[];
    }
    
    // Fallback: Map the structured AI report into a single result for the UI
    const report = response.data;
    return [{
      id: `report-${Date.now()}`,
      title: "AI Legal Research Report",
      date: new Date().toISOString().split('T')[0],
      matchScore: Math.round((report.confidence_score || 0.85) * 100),
      summary: `${report.executive_summary ? report.executive_summary + '\n\n' : ''}${report.answer || ''}`,
      citations: report.citations || [],
      type: "AI Report"
    }];
  }
  return [];
}

export async function getResearchHistory(): Promise<any[]> {
  const response = await apiClient.get("/research/history");
  if (response && response.status === "success" && Array.isArray(response.data)) {
    return response.data;
  }
  return Array.isArray(response) ? response : [];
}

export async function getResearchStatistics(): Promise<any> {
  const response = await apiClient.get("/research/statistics");
  if (response && response.status === "success" && response.data) {
    return response.data;
  }
  return response;
}
