export interface DashboardStat {
  title: string;
  value: number;
  trend: { value: number; isPositive: boolean };
}

export interface DashboardNotification {
  id: string;
  title: string;
  description: string;
  time: string;
  status: "urgent" | "pending" | "completed";
}

export interface TaskCompletion {
  category: string;
  completed: number;
}

export type CaseStatusKey = "active" | "pending" | "resolved" | "archived";

export interface CaseStatusCount {
  status: string;
  key: CaseStatusKey;
  count: number;
}

export interface TeamMetric {
  label: string;
  value: string;
  trendLabel: string;
}

export const dashboardStats: DashboardStat[] = [
  { title: "Active Cases", value: 20, trend: { value: 12, isPositive: true } },
  { title: "Documents", value: 37, trend: { value: 5, isPositive: true } },
  { title: "Total Hearings", value: 48, trend: { value: 8, isPositive: true } },
  { title: "Upcoming Hearings", value: 16, trend: { value: 3, isPositive: false } },
];

export const dashboardNotifications: DashboardNotification[] = [
  {
    id: "n-1",
    title: "Upcoming hearing",
    description: "Smith v. Johnson hearing scheduled for tomorrow at 10:00 AM",
    time: "1 day",
    status: "pending",
  },
  {
    id: "n-2",
    title: "Document review needed",
    description: "Client contract awaiting your review",
    time: "2 hours",
    status: "urgent",
  },
  {
    id: "n-3",
    title: "New case assigned",
    description: "You have been assigned to Williams v. Tech Corp",
    time: "3 days",
    status: "completed",
  },
];

export const taskCompletion: TaskCompletion[] = [
  { category: "Document Review", completed: 65 },
  { category: "Client Meetings", completed: 80 },
  { category: "Court Filings", completed: 45 },
  { category: "Case Research", completed: 90 },
];

export const caseStatusBreakdown: CaseStatusCount[] = [
  { status: "Active", key: "active", count: 12 },
  { status: "Pending", key: "pending", count: 8 },
  { status: "Resolved", key: "resolved", count: 5 },
  { status: "Archived", key: "archived", count: 3 },
];

export const teamActivity: TeamMetric[] = [
  { label: "Documents Created", value: "24", trendLabel: "8% from last week" },
  { label: "Cases Assigned", value: "7", trendLabel: "12% from last week" },
  { label: "Compliance Score", value: "92%", trendLabel: "5% from last week" },
];
