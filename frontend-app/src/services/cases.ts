import { apiClient } from "@/utils/apiClient";
import type { Case, Hearing } from "@/types/case";

const STORAGE_KEY = "cases";

function readCases(): Case[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch (e) {
    return [];
  }
}

function writeCases(cases: Case[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
}

export async function listCases(): Promise<Case[]> {
  try {
    const response = await apiClient.get("/cases");
    if (response && Array.isArray(response.data)) {
      writeCases(response.data);
      return response.data;
    } else if (Array.isArray(response)) {
      writeCases(response);
      return response;
    }
  } catch (error) {
    console.warn("Backend /cases not reachable, falling back to local cache.");
  }
  return readCases();
}

export async function getCase(id: string): Promise<Case | undefined> {
  try {
    const response = await apiClient.get(`/cases/${id}`);
    if (response && response.status === "success" && response.data) {
      return response.data;
    } else if (response && response.id === id) {
      return response as Case;
    }
  } catch (error) {
    console.warn(`Backend /cases/${id} not reachable, falling back to local cache.`);
  }
  return readCases().find((c) => c.id === id);
}

export type CaseInput = Omit<Case, "id" | "user_id" | "created_at" | "updated_at" | "hearings">;

export async function createCase(input: CaseInput): Promise<Case> {
  try {
    const response = await apiClient.post("/cases", input);
    if (response && (response.data || response.id)) {
      const serverCase = response.data || response;
      writeCases([serverCase, ...readCases()]);
      return serverCase;
    }
  } catch (error) {
    console.warn("Backend case creation failed, performing local optimistic update.", error);
  }

  const newCase: Case = {
    ...input,
    id: crypto.randomUUID(),
    user_id: "demo-user",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    hearings: [],
  };
  writeCases([newCase, ...readCases()]);
  return newCase;
}

export async function addHearing(caseId: string, hearing: Omit<Hearing, "id" | "case_id" | "created_at">): Promise<Case> {
  try {
    const response = await apiClient.post(`/cases/${caseId}/hearings`, hearing);
    if (response && (response.data || response.id)) {
      const serverCase = response.data || response;
      const cases = readCases();
      writeCases(cases.map((c) => (c.id === caseId ? serverCase : c)));
      return serverCase;
    }
  } catch (error) {
    console.warn("Backend hearing creation failed, performing local optimistic update.", error);
  }

  const cases = readCases();
  const target = cases.find((c) => c.id === caseId);
  if (!target) throw new Error(`Case ${caseId} not found`);

  const newHearing: Hearing = {
    ...hearing,
    id: crypto.randomUUID(),
    case_id: caseId,
    created_at: new Date().toISOString(),
  };
  const updated: Case = { ...target, hearings: [...target.hearings, newHearing] };
  writeCases(cases.map((c) => (c.id === caseId ? updated : c)));
  return updated;
}

export async function deleteCase(id: string): Promise<void> {
  try {
    await apiClient.post(`/cases/${id}/delete`, {});
  } catch (error) {
    console.warn(`Backend case deletion failed, performing local optimistic update for ${id}.`);
  }
  writeCases(readCases().filter((c) => c.id !== id));
}
