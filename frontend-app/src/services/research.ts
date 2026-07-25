import { apiClient } from "@/utils/apiClient";
import {
  sampleCases,
  sampleStatutes,
  sampleArticles,
  type CaseResult,
  type StatuteResult,
  type ArticleResult,
} from "@/data/researchMock";

export type ResearchContentType = "cases" | "statutes" | "articles";
export type ResearchResult = CaseResult | StatuteResult | ArticleResult;

export interface ResearchSearchParams {
  query: string;
  contentType: ResearchContentType;
  jurisdiction?: string;
  dateRange?: string;
}

export async function search(params: ResearchSearchParams): Promise<ResearchResult[]> {
  try {
    const response = await apiClient.post("/research/query", {
      query: params.query,
      filters: {
        category: params.contentType === "all" ? undefined : params.contentType,
        jurisdiction: params.jurisdiction || undefined,
      }
    });

    if (response && response.status === "success" && response.data?.results) {
      // Assuming backend returns standard mapped array of results, we cast it
      // In a strict prod environment, we'd map fields explicitly
      return response.data.results as ResearchResult[];
    }
  } catch (error) {
    console.error("Research API failed, falling back to local dataset:", error);
  }

  // Graceful fallback to static dataset if backend is unreachable or vector store empty
  let results: ResearchResult[];
  switch (params.contentType) {
    case "statutes":
      results = sampleStatutes;
      break;
    case "articles":
      results = sampleArticles;
      break;
    case "cases":
    default:
      results = sampleCases;
      break;
  }

  if (params.jurisdiction) {
    results = results.filter((r: any) =>
      r.jurisdiction?.toLowerCase().includes(params.jurisdiction!.toLowerCase()) ||
      (r.court && r.court.toLowerCase().includes(params.jurisdiction!.toLowerCase()))
    );
  }

  const currentYear = new Date().getFullYear();
  let yearCutoff = 0;
  if (params.dateRange === "last-year") yearCutoff = currentYear - 1;
  else if (params.dateRange === "last-5-years") yearCutoff = currentYear - 5;
  else if (params.dateRange === "last-10-years") yearCutoff = currentYear - 10;
  else if (params.dateRange === "post-independence") yearCutoff = 1950;

  if (yearCutoff > 0) {
    results = results.filter((r: any) => {
      const resultYear = new Date(r.date || r.enacted).getFullYear();
      return resultYear >= yearCutoff;
    });
  }

  return results;
}
