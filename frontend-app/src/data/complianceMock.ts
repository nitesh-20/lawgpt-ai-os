import { ComplianceSnapshot } from "@/types/compliance";

export const complianceSnapshot: ComplianceSnapshot = {
  complianceScore: 82,
  riskScore: 24,
  documentsReviewed: 37,
  lastScan: "2026-07-25 07:58 PM",
  categoryScores: [
    { category: "Data Protection", score: 91 },
    { category: "Contract Terms", score: 76 },
    { category: "Employment Law", score: 88 },
    { category: "IP & Confidentiality", score: 69 },
    { category: "Regulatory Filings", score: 84 },
  ],
  violations: [
    {
      id: "v-1",
      title: "Uncapped indemnification liability",
      description: "Master Services Agreement § 9.2 has no liability cap or mutual carve-out.",
      severity: "critical",
      regulation: "Indian Contract Act, 1872 — reasonableness of terms",
    },
    {
      id: "v-2",
      title: "Missing data breach notification clause",
      description: "Data Processing Agreement does not specify a 72-hour breach notification window.",
      severity: "critical",
      regulation: "Digital Personal Data Protection Act, 2023",
    },
    {
      id: "v-3",
      title: "Termination notice below market standard",
      description: "Services Agreement § 12.1 specifies 15 days notice, below the 30-day standard.",
      severity: "warning",
      regulation: "Internal policy guideline",
    },
  ],
  recommendations: [
    { id: "r-1", text: "Add a liability cap tied to 12 months' fees on all indemnification clauses." },
    { id: "r-2", text: "Standardize a 72-hour breach notification clause across all data-processing agreements." },
    { id: "r-3", text: "Extend termination notice periods to 30 days in the next contract cycle." },
    { id: "r-4", text: "Schedule a quarterly review of IP & Confidentiality clauses, the lowest-scoring category." },
  ],
};
