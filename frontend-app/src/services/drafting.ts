import { apiClient } from "@/utils/apiClient";

export interface GenerateDocumentInput {
  documentType: string;
  details: string;
  jurisdiction: string;
}

export async function generateDocument(input: GenerateDocumentInput): Promise<{ document: string }> {
  try {
    const response = await apiClient.post("/drafting/generate", {
      doc_type: input.documentType === "contract" ? "general_contract" :
                input.documentType === "employment_contract" ? "employment_agreement" :
                input.documentType === "letter" ? "legal_notice" :
                input.documentType,
      user_instructions: input.details,
      variables: {
        jurisdiction: input.jurisdiction
      }
    });

    if (response && response.status === "success" && response.data) {
      return { document: response.data.generated_draft };
    }
    throw new Error("Invalid response from drafting API");
  } catch (error) {
    console.error("Failed to generate document:", error);
    throw error;
  }
}
