/**
 * Compliance data access. Backed by mock data until the real endpoint below exists.
 * See /MISSING_BACKEND.md for the full contract.
 *
 * GET /compliance/snapshot -> ComplianceSnapshot
 */
import { complianceSnapshot } from "@/data/complianceMock";
import type { ComplianceSnapshot } from "@/types/compliance";

export async function getComplianceSnapshot(): Promise<ComplianceSnapshot> {
  return complianceSnapshot;
}
