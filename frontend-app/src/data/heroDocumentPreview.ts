// Mock data for the landing page hero preview. Shape matches the eventual
// document-intelligence analysis response so the component can swap to a
// live API call without changing its props.
export interface ClauseFlag {
  id: string;
  clauseLabel: string;
  excerpt: string;
  note: string;
  severity: "info" | "warning";
}

export interface DocumentAnalysisPreview {
  documentId: string;
  fileName: string;
  status: "Reviewed" | "In review";
  clausesScanned: number;
  flags: ClauseFlag[];
}

export const heroDocumentPreview: DocumentAnalysisPreview = {
  documentId: "DOC-2024-0142",
  fileName: "Master Services Agreement.pdf",
  status: "Reviewed",
  clausesScanned: 48,
  flags: [
    {
      id: "flag-1",
      clauseLabel: "§ 9.2 Indemnification",
      excerpt: "...shall indemnify and hold harmless the Client from any and all claims...",
      note: "Uncapped liability. No mutual carve-out.",
      severity: "warning",
    },
    {
      id: "flag-2",
      clauseLabel: "§ 12.1 Termination",
      excerpt: "...either party may terminate with thirty (30) days written notice...",
      note: "Standard notice period, consistent with prior filings.",
      severity: "info",
    },
  ],
};
