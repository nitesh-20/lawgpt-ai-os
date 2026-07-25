import { apiClient } from "@/utils/apiClient";

export type ResearchContentType = "cases" | "statutes" | "articles" | "all";

export interface ResearchSource {
  title: string;
  url: string;
  type?: string;
}

export interface ResearchReportResponse {
  summary: string;
  key_points: string[];
  acts: string[];
  sections: string[];
  judgments: string[];
  compliance_notes: string;
  risk_level: string;
  confidence_score: number;
  citations: string[];
  sources: ResearchSource[];
  related_documents: string[];
}

export interface ResearchSearchParams {
  query: string;
  contentType: ResearchContentType;
  jurisdiction?: string;
}

export async function search(params: ResearchSearchParams): Promise<ResearchReportResponse | null> {
  const response = await apiClient.post("/research/query", {
    query: params.query,
    filters: {
      category: params.contentType === "all" ? undefined : params.contentType,
      jurisdiction: params.jurisdiction || undefined,
    }
  });

  if (response && response.status === "success" && response.data) {
    return response.data as ResearchReportResponse;
  }
  return null;
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
