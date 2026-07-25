/**
 * Document list data access. Backed by mock data until the real endpoint below exists.
 * See /MISSING_BACKEND.md for the full contract — including a schema mismatch note
 * between this shape and the unrelated `storedFiles` localStorage data seeded by AppLayout.
 *
 * GET /documents -> DocumentSummary[]
 */

export interface DocumentSummary {
  id: string;
  title: string;
  type: string;
  lastModified: string;
  size: string;
  category: string;
  tags?: string[];
}

const documents: DocumentSummary[] = [
  {
    id: "1",
    title: "Contract Agreement v2.1",
    type: "Legal Contract",
    lastModified: "2024-02-19",
    size: "1.2 MB",
    category: "contracts",
    tags: ["Contract", "Agreement", "Client"],
  },
  {
    id: "2",
    title: "NDA Template",
    type: "Template",
    lastModified: "2024-02-18",
    size: "524 KB",
    category: "templates",
    tags: ["NDA", "Confidentiality", "Template"],
  },
  {
    id: "3",
    title: "Client Meeting Notes",
    type: "Notes",
    lastModified: "2024-02-17",
    size: "256 KB",
    category: "notes",
    tags: ["Notes", "Meeting", "Client"],
  },
];

export async function listDocuments(): Promise<DocumentSummary[]> {
  return documents;
}
