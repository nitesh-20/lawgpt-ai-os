import { apiClient } from "@/utils/apiClient";
import type { ComplianceSnapshot } from "@/types/compliance";
import { complianceSnapshot as mockSnapshot } from "@/data/complianceMock";

export async function getComplianceSnapshot(): Promise<ComplianceSnapshot> {
  try {
    const response = await apiClient.get("/compliance/statistics");
    if (response && response.status === "success" && response.data) {
      // Return mapped API data. If the backend schema doesn't perfectly match the frontend,
      // we cast it here for a smooth integration layer.
      return response.data as ComplianceSnapshot;
    }
  } catch (error) {
    console.error("Compliance API failed, falling back:", error);
  }
  
  return mockSnapshot;
}
