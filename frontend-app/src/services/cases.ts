import { apiClient } from "@/utils/apiClient";
import type { Case, Hearing } from "@/types/case";

export async function listCases(): Promise<Case[]> {
  const response = await apiClient.get("/cases");
  if (response && Array.isArray(response.data)) {
    return response.data;
  } else if (Array.isArray(response)) {
    return response as Case[];
  }
  return [];
}

export async function getCase(id: string): Promise<Case | undefined> {
  const response = await apiClient.get(`/cases/${id}`);
  if (response && response.status === "success" && response.data) {
    return response.data;
  } else if (response && response.id === id) {
    return response as Case;
  }
  return undefined;
}

export type CaseInput = Omit<Case, "id" | "user_id" | "created_at" | "updated_at" | "hearings">;

export async function createCase(input: CaseInput): Promise<Case> {
  const response = await apiClient.post("/cases", input);
  if (response && (response.data || response.id)) {
    return response.data || response;
  }
  throw new Error("Failed to create case");
}

export async function addHearing(caseId: string, hearing: Omit<Hearing, "id" | "case_id" | "created_at">): Promise<Case> {
  const response = await apiClient.post(`/cases/${caseId}/hearings`, hearing);
  if (response && (response.data || response.id)) {
    return response.data || response;
  }
  throw new Error("Failed to add hearing");
}

export async function deleteCase(id: string): Promise<void> {
  await apiClient.post(`/cases/${id}/delete`, {});
}
