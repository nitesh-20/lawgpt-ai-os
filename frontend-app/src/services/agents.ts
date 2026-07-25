/**
 * AI Agents data access. Backed by mock data until the real endpoints below exist.
 * See /MISSING_BACKEND.md for the full contract.
 *
 * GET  /agents          -> Agent[]
 * POST /agents/execute  -> ExecutionRun  (body: { query: string })
 */
import { agents, mockExecutionRun } from "@/data/agentsMock";
import type { Agent, ExecutionRun } from "@/types/agents";

export async function listAgents(): Promise<Agent[]> {
  return agents;
}

export async function runAgentExecution(query: string): Promise<ExecutionRun> {
  return { ...mockExecutionRun, query };
}
