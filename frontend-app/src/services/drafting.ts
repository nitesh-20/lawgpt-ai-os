/**
 * Document drafting data access. Backed by mock generation until the real
 * endpoint below exists. See /MISSING_BACKEND.md for the full contract.
 *
 * Previously this called supabase.functions.invoke('generate-document', ...),
 * but no such edge function exists (Supabase schema has zero deployed functions).
 * That call failed at runtime; this replaces it with an honest mock.
 *
 * POST /drafting/generate (body: { documentType, details, jurisdiction }) -> { document: string }
 */

export interface GenerateDocumentInput {
  documentType: string;
  details: string;
  jurisdiction: string;
}

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  contract: "Contract Agreement",
  employment_contract: "Employment Contract",
  nda: "Non-Disclosure Agreement",
  letter: "Legal Letter",
  motion: "Court Motion",
  brief: "Legal Brief",
  memo: "Legal Memorandum",
  pleading: "Legal Pleading",
  affidavit: "Affidavit",
  settlement: "Settlement Agreement",
  power_of_attorney: "Power of Attorney",
  will: "Last Will and Testament",
};

export async function generateDocument(input: GenerateDocumentInput): Promise<{ document: string }> {
  const label = DOCUMENT_TYPE_LABELS[input.documentType] ?? input.documentType;
  const document = [
    `${label.toUpperCase()}`,
    `Jurisdiction: ${input.jurisdiction}`,
    "",
    "This is a mock draft generated from the details below. Connect the drafting API to",
    "produce a live, jurisdiction-checked document.",
    "",
    "Requested details:",
    input.details,
  ].join("\n");

  return { document };
}
