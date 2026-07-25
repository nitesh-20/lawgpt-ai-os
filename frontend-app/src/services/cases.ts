/**
 * Case data access. Backed by localStorage (seeded demo data) until the real
 * endpoints below exist. See /MISSING_BACKEND.md for the full contract.
 *
 * GET    /cases              -> Case[]
 * GET    /cases/:id          -> Case
 * POST   /cases              -> Case  (body: CaseInput)
 * POST   /cases/:id/hearings -> Case  (body: Hearing)
 * DELETE /cases/:id          -> void
 */
import type { Case, Hearing } from "@/types/case";

const STORAGE_KEY = "cases";

function readCases(): Case[] {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

function writeCases(cases: Case[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
}

export async function listCases(): Promise<Case[]> {
  return readCases();
}

export async function getCase(id: string): Promise<Case | undefined> {
  return readCases().find((c) => c.id === id);
}

export type CaseInput = Omit<Case, "id" | "user_id" | "created_at" | "updated_at" | "hearings">;

export async function createCase(input: CaseInput): Promise<Case> {
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
  writeCases(readCases().filter((c) => c.id !== id));
}
