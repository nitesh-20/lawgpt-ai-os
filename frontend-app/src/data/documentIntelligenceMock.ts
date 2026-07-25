import { DocumentDetail } from "@/types/documentIntelligence";

export const mockDocumentDetail: DocumentDetail = {
  id: "1",
  title: "Contract Agreement v2.1",
  type: "Legal Contract",
  summary:
    "A 48-clause master services agreement between two commercial parties. Overall risk is moderate: one indemnification clause is uncapped, and the termination notice period is shorter than market standard. Governing law and dispute resolution clauses are standard and enforceable.",
  clauses: [
    {
      id: "cl-1",
      label: "§ 9.2 Indemnification",
      text: "Each party shall indemnify and hold harmless the other from any and all claims, damages, and liabilities arising from a breach of this Agreement, without limitation as to amount.",
      risk: "high",
      note: "Uncapped liability with no mutual carve-out. Recommend adding a liability cap tied to fees paid in the prior 12 months.",
    },
    {
      id: "cl-2",
      label: "§ 12.1 Termination",
      text: "Either party may terminate this Agreement upon fifteen (15) days written notice to the other party.",
      risk: "medium",
      note: "Shorter than the 30-day market standard. Consider negotiating for more transition time.",
    },
    {
      id: "cl-3",
      label: "§ 14.3 Governing Law",
      text: "This Agreement shall be governed by and construed in accordance with the laws of India, with courts in Mumbai having exclusive jurisdiction.",
      risk: "low",
      note: "Standard governing law clause, no issues identified.",
    },
  ],
  entities: [
    { id: "e-1", name: "Disclosing Party", type: "Party", value: "Coastal Freight Ltd." },
    { id: "e-2", name: "Receiving Party", type: "Party", value: "Nair Logistics Pvt. Ltd." },
    { id: "e-3", name: "Effective Date", type: "Date", value: "1 March 2024" },
    { id: "e-4", name: "Contract Value", type: "Amount", value: "₹42,00,000" },
    { id: "e-5", name: "Governing Jurisdiction", type: "Jurisdiction", value: "Mumbai, India" },
    { id: "e-6", name: "Notice Obligation", type: "Obligation", value: "15 days written notice to terminate" },
  ],
  relatedJudgments: [
    {
      id: "rj-1",
      title: "Bhagwati Developers v. Peerless General Finance",
      court: "Supreme Court of India",
      year: "2013",
      relevance: "Cited on enforceability of uncapped indemnification clauses.",
    },
    {
      id: "rj-2",
      title: "Vidya Drolia v. Durga Trading Corporation",
      court: "Supreme Court of India",
      year: "2020",
      relevance: "Relevant to the dispute resolution clause in § 14.",
    },
  ],
  timeline: [
    { id: "t-1", date: "2024-02-19", label: "Document uploaded and queued for review" },
    { id: "t-2", date: "2024-02-19", label: "Clause extraction completed, 48 clauses identified" },
    { id: "t-3", date: "2024-02-19", label: "Risk analysis flagged 1 high-risk, 1 medium-risk clause" },
    { id: "t-4", date: "2024-02-20", label: "Compliance check passed, no regulatory conflicts" },
  ],
  aiNotes: [
    { id: "n-1", note: "Indemnification clause is the single biggest risk in this contract. Recommend legal review before signature." },
    { id: "n-2", note: "Termination notice period is negotiable; counterparty has accepted 30 days in 3 prior agreements." },
  ],
};
