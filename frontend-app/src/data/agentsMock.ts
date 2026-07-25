import type { Agent, ExecutionStep } from "@/types/agents";

export const agents: Agent[] = [
  {
    key: "orchestrator",
    name: "Orchestrator Agent",
    status: "idle",
    lastExecution: "Never",
    activity: "Waiting for tasks..."
  },
  {
    key: "research_agent",
    name: "Research Agent",
    status: "idle",
    lastExecution: "Never",
    activity: "Waiting for tasks..."
  },
  {
    key: "compliance_agent",
    name: "Compliance Agent",
    status: "idle",
    lastExecution: "Never",
    activity: "Waiting for tasks..."
  },
  {
    key: "document_agent",
    name: "Document Intelligence Agent",
    status: "idle",
    lastExecution: "Never",
    activity: "Waiting for tasks..."
  }
];

export const mockExecutionRun = {
  query: "Analyze this employment contract for high-risk clauses.",
  steps: [
    { id: "s1", label: "Query Received", agentKey: "orchestrator", detail: "Parsing user intent and routing task..." },
    { id: "s2", label: "Document Ingestion", agentKey: "document_agent", detail: "Extracting contract clauses and OCR..." },
    { id: "s3", label: "Legal Research", agentKey: "research_agent", detail: "Cross-referencing employment laws..." },
    { id: "s4", label: "Risk Assessment", agentKey: "compliance_agent", detail: "Identifying non-compete risks..." },
    { id: "s5", label: "Synthesis", agentKey: "orchestrator", detail: "Formatting final legal response..." }
  ] as ExecutionStep[]
};
