export type CaseStatusKey = 'active' | 'pending' | 'resolved' | 'archived';

export const dashboardStats = [
  { title: "Active Cases", value: "24", trend: "+2" },
  { title: "Pending Review", value: "12", trend: "-1" },
  { title: "Hours Billed", value: "142", trend: "+12%" },
  { title: "Upcoming Deadlines", value: "5", trend: "0" }
];

export const dashboardNotifications = [
  { id: "n1", title: "New Document Upload", description: "Client uploaded NDA for review", time: "10m ago", status: "urgent" as const },
  { id: "n2", title: "Compliance Check Passed", description: "Employment contract verified", time: "1h ago", status: "completed" as const },
];

export const taskCompletion = [
  { category: "Document Review", completed: 75 },
  { category: "Legal Research", completed: 40 },
];

export const caseStatusBreakdown: { key: CaseStatusKey, status: string, count: number }[] = [
  { key: "active", status: "Active", count: 24 },
  { key: "pending", status: "Pending", count: 12 },
  { key: "resolved", status: "Resolved", count: 45 },
];

export const teamActivity = [
  { label: "Cases Closed", value: "12", trendLabel: "+2 this week" },
  { label: "Documents Reviewed", value: "84", trendLabel: "+15% vs last week" }
];
