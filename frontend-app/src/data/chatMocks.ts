import { Citation } from '@/types/chat';

export const suggestedPrompts: string[] = [
  "Summarize the key liabilities in this uploaded contract.",
  "What is the standard non-compete duration under California law?",
  "Draft a mutual NDA for a software development partnership.",
  "Check this document for GDPR compliance."
];

export function getMockAnswer(userMessage: string): { response: string; citations?: Citation[] } {
  return {
    response: "Based on the provided context, the AI system has parsed your query and generated this mock response. In a production environment, this would be routed through the LawGPT orchestrator to the appropriate sub-agent (Compliance, Research, or Document) before streaming back the final legal analysis.",
    citations: [
      { id: "c1", title: "LawGPT Architecture Guidelines", type: "Document" }
    ]
  };
}
