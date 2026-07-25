export const complianceSnapshot = {
  complianceScore: 85,
  riskScore: 15,
  documentsReviewed: 124,
  lastScan: "Today, 10:45 AM",
  categoryScores: [
    { category: "Data Privacy", score: 92 },
    { category: "Labor Laws", score: 78 },
    { category: "Financial", score: 88 },
    { category: "Corporate", score: 95 }
  ],
  violations: [
    {
      id: "v1",
      title: "Missing Opt-Out Clause",
      severity: "critical" as const,
      description: "Marketing terms lack explicit opt-out mechanisms.",
      regulation: "GDPR Art. 7(3)"
    },
    {
      id: "v2",
      title: "Overbroad Non-Compete",
      severity: "medium" as const,
      description: "Employee non-compete extends beyond standard 12 months.",
      regulation: "State Labor Code 16600"
    }
  ],
  recommendations: [
    { id: "r1", text: "Update marketing templates to include explicit opt-out links." },
    { id: "r2", text: "Review standard employment agreements and restrict non-competes to 12 months." }
  ]
};
