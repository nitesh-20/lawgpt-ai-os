/**
 * Dashboard data access. Backed by mock data until the real endpoints below exist.
 * See /MISSING_BACKEND.md for the full contract.
 *
 * GET /dashboard/stats           -> DashboardStat[]
 * GET /dashboard/notifications   -> DashboardNotification[]
 * GET /dashboard/task-completion -> TaskCompletion[]
 * GET /dashboard/case-status     -> CaseStatusCount[]
 * GET /dashboard/team-activity   -> TeamMetric[]
 */
import {
  dashboardStats,
  dashboardNotifications,
  taskCompletion,
  caseStatusBreakdown,
  teamActivity,
  type DashboardStat,
  type DashboardNotification,
  type TaskCompletion,
  type CaseStatusCount,
  type TeamMetric,
} from "@/data/dashboardMock";

export async function getDashboardStats(): Promise<DashboardStat[]> {
  return dashboardStats;
}

export async function getDashboardNotifications(): Promise<DashboardNotification[]> {
  return dashboardNotifications;
}

export async function getTaskCompletion(): Promise<TaskCompletion[]> {
  return taskCompletion;
}

export async function getCaseStatusBreakdown(): Promise<CaseStatusCount[]> {
  return caseStatusBreakdown;
}

export async function getTeamActivity(): Promise<TeamMetric[]> {
  return teamActivity;
}
