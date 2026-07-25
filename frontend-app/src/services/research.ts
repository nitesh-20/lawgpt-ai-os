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

  if (response && response.status === "success" && response.data?.results) {
    return response.data.results as ResearchResult[];
  }
  return [];
}
