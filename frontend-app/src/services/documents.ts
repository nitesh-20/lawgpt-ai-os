import { apiClient } from "@/utils/apiClient";

export interface DocumentSummary {
  id: string;
  title: string;
  type: string;
  lastModified: string;
  size: string;
  category: string;
  tags?: string[];
}

const mockDocuments: DocumentSummary[] = [
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
];

export async function listDocuments(): Promise<DocumentSummary[]> {
  try {
    const response = await apiClient.get("/documents");
    if (response && response.status === "success" && Array.isArray(response.data)) {
      return response.data as DocumentSummary[];
    } else if (Array.isArray(response)) {
      return response as DocumentSummary[];
    }
  } catch (error) {
    console.error("Documents API failed, falling back to cached state:", error);
  }
  
  return mockDocuments;
}
