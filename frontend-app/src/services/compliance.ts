import { apiClient } from "@/utils/apiClient";
import type { ComplianceSnapshot } from "@/types/compliance";

export async function getComplianceSnapshot(): Promise<ComplianceSnapshot> {
  const response = await apiClient.get("/compliance/statistics");
  if (response && response.status === "success" && response.data) {
    return response.data as ComplianceSnapshot;
  }
  throw new Error("Failed to fetch compliance snapshot");
}
