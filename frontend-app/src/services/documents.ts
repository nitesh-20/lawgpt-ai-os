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

export async function listDocuments(): Promise<DocumentSummary[]> {
  const response = await apiClient.get("/documents");
  if (response && response.status === "success" && Array.isArray(response.data)) {
    return response.data as DocumentSummary[];
  } else if (Array.isArray(response)) {
    return response as DocumentSummary[];
  }
  return [];
}
