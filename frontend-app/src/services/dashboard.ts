import { apiClient } from "@/utils/apiClient";
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
  try {
    const response = await apiClient.get("/dashboard/stats");
    if (response && response.status === "success" && response.data) {
      return response.data as DashboardStat[];
    }
  } catch(e) {
    console.error("Failed to fetch dashboard stats", e);
  }
  return dashboardStats;
}

export async function getDashboardNotifications(): Promise<DashboardNotification[]> {
  try {
    const response = await apiClient.get("/dashboard/notifications");
    if (response && response.status === "success" && response.data) {
      return response.data as DashboardNotification[];
    }
  } catch(e) {
    console.error("Failed to fetch notifications", e);
  }
  return dashboardNotifications;
}

export async function getTaskCompletion(): Promise<TaskCompletion[]> {
  try {
    const response = await apiClient.get("/dashboard/task-completion");
    if (response && response.status === "success" && response.data) {
      return response.data as TaskCompletion[];
    }
  } catch(e) {
    console.error("Failed to fetch task completion", e);
  }
  return taskCompletion;
}

export async function getCaseStatusBreakdown(): Promise<CaseStatusCount[]> {
  try {
    const response = await apiClient.get("/dashboard/case-status");
    if (response && response.status === "success" && response.data) {
      return response.data as CaseStatusCount[];
    }
  } catch(e) {
    console.error("Failed to fetch case status", e);
  }
  return caseStatusBreakdown;
}

export async function getTeamActivity(): Promise<TeamMetric[]> {
  try {
    const response = await apiClient.get("/dashboard/team-activity");
    if (response && response.status === "success" && response.data) {
      return response.data as TeamMetric[];
    }
  } catch(e) {
    console.error("Failed to fetch team activity", e);
  }
  return teamActivity;
}
