import { Citation } from "@/types/chat";

export const suggestedPrompts: string[] = [
  "Summarize the indemnification clause risks in a standard MSA",
  "What is the notice period for contract termination under Indian law?",
  "Find recent Supreme Court judgments on arbitration clause enforceability",
  "Draft a compliance checklist for a data-processing agreement",
];

interface MockAnswer {
  keywords: string[];
  response: string;
  citations: Citation[];
}

const mockAnswers: MockAnswer[] = [
  {
    keywords: ["indemnif", "liability", "msa", "risk"],
    response:
      "Indemnification clauses in standard MSAs typically shift risk from one party to another for third-party claims, IP infringement, and breach of confidentiality. The main risk to watch for is an uncapped liability clause without a mutual carve-out, which leaves one party fully exposed regardless of fault. Courts have generally upheld indemnification clauses when the language is unambiguous, but have narrowed their scope where the drafting is vague about what triggers the obligation.",
    citations: [
      { id: "c1", label: "§ 9.2 Indemnification", source: "Master Services Agreement (standard form)" },
      { id: "c2", label: "Bhagwati Developers v. Peerless General Finance", source: "Supreme Court of India", court: "Supreme Court", year: "2013" },
    ],
  },
  {
    keywords: ["notice period", "termination", "terminate"],
    response:
      "Under Indian contract law, there is no statutory default notice period for commercial contract termination; the period is whatever the parties agree in the contract. Thirty (30) days' written notice is the most common market standard for services agreements. Where a contract is silent on notice, courts apply a 'reasonable notice' standard under Section 173 of the Indian Contract Act, assessed on the nature and duration of the relationship.",
    citations: [
      { id: "c3", label: "§ 12.1 Termination", source: "Master Services Agreement (standard form)" },
      { id: "c4", label: "Indian Contract Act, 1872", source: "Statute", year: "1872" },
    ],
  },
  {
    keywords: ["arbitration", "clause enforceability"],
    response:
      "Recent Supreme Court decisions have consistently upheld arbitration clauses even where the underlying agreement is disputed, applying the doctrine of separability. Courts have narrowed the grounds on which an arbitration clause can be challenged, limiting judicial intervention to cases of clear fraud or incapacity at the time of contracting.",
    citations: [
      { id: "c5", label: "Vidya Drolia v. Durga Trading Corporation", source: "Supreme Court of India", court: "Supreme Court", year: "2020" },
      { id: "c6", label: "N.N. Global Mercantile v. Indo Unique Flame", source: "Supreme Court of India", court: "Supreme Court", year: "2023" },
    ],
  },
  {
    keywords: ["compliance", "checklist", "data-processing", "data processing"],
    response:
      "A compliance checklist for a data-processing agreement should confirm: a lawful basis for processing is documented, data retention periods are specified, sub-processor obligations flow down contractually, breach notification timelines are defined (typically 72 hours), and cross-border transfer mechanisms are in place where applicable under the Digital Personal Data Protection Act, 2023.",
    citations: [
      { id: "c7", label: "Digital Personal Data Protection Act, 2023", source: "Statute", year: "2023" },
    ],
  },
];

const defaultAnswer: MockAnswer = {
  keywords: [],
  response:
    "Based on your question, here is a preliminary analysis: this would draw on relevant statutes, precedent, and any uploaded documents to produce a grounded answer with citations. This is a mock response for demonstration; connect the chat-assistant API to generate live answers.",
  citations: [],
};

export const getMockAnswer = (userMessage: string): MockAnswer => {
  const lower = userMessage.toLowerCase();
  const match = mockAnswers.find((a) => a.keywords.some((k) => lower.includes(k)));
  return match ?? defaultAnswer;
};
