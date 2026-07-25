/**
 * Document Intelligence data access. Backed by mock data until the real endpoint below exists.
 * See /MISSING_BACKEND.md for the full contract.
 *
 * GET /documents/:id/intelligence -> DocumentDetail
 */
import { mockDocumentDetail } from "@/data/documentIntelligenceMock";
import type { DocumentDetail } from "@/types/documentIntelligence";

export async function getDocumentDetail(id: string): Promise<DocumentDetail> {
  return { ...mockDocumentDetail, id };
}
