/**
 * Legal research data access. Backed by mock data until the real endpoint below exists.
 * See /MISSING_BACKEND.md for the full contract.
 *
 * GET /research/search?query=&jurisdiction=&dateRange=&contentType= -> CaseResult[] | StatuteResult[] | ArticleResult[]
 */
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
  contentType: ResearchContentType;
  jurisdiction?: string;
  dateRange?: string;
}

function yearCutoffFor(dateRange?: string): number {
  const currentYear = new Date().getFullYear();
  switch (dateRange) {
    case "last-year":
      return currentYear - 1;
    case "last-5-years":
      return currentYear - 5;
    case "last-10-years":
      return currentYear - 10;
    case "post-independence":
      return 1950;
    default:
      return 0;
  }
}

export async function search(params: ResearchSearchParams): Promise<ResearchResult[]> {
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

  const yearCutoff = yearCutoffFor(params.dateRange);
  if (yearCutoff > 0) {
    results = results.filter((r: any) => {
      const resultYear = new Date(r.date || r.enacted).getFullYear();
      return resultYear >= yearCutoff;
    });
  }

  return results;
}
