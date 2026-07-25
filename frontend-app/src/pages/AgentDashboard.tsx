import { useState } from "react";
import { Bot, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { agents as agentsSeed, mockExecutionRun } from "@/data/agentsMock";
import type { Agent, AgentStatus, ExecutionStep } from "@/types/agents";
import AgentCard from "@/components/agents/AgentCard";
import ExecutionTimeline from "@/components/agents/ExecutionTimeline";

const STEP_DELAY_MS = 550;

const AgentDashboard = () => {
  const [query, setQuery] = useState(mockExecutionRun.query);
  const [agents, setAgents] = useState<Agent[]>(agentsSeed);
  const [steps, setSteps] = useState<ExecutionStep[]>(
    mockExecutionRun.steps.map((s) => ({ ...s, status: "idle" as AgentStatus }))
  );
  const [isRunning, setIsRunning] = useState(false);

  const setAgentStatus = (key: string, status: AgentStatus) => {
    setAgents((prev) => prev.map((a) => (a.key === key ? { ...a, status } : a)));
  };

  const runExecution = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setSteps(mockExecutionRun.steps.map((s) => ({ ...s, status: "idle" })));
    setAgents((prev) => prev.map((a) => ({ ...a, status: "idle" })));

    for (let i = 0; i < mockExecutionRun.steps.length; i++) {
      const step = mockExecutionRun.steps[i];

      setSteps((prev) => prev.map((s, idx) => (idx === i ? { ...s, status: "running" } : s)));
      setAgentStatus(step.agentKey, "running");

      await new Promise((resolve) => setTimeout(resolve, STEP_DELAY_MS));

      setSteps((prev) => prev.map((s, idx) => (idx === i ? { ...s, status: "done" } : s)));
      setAgentStatus(step.agentKey, "done");
    }

    setAgents((prev) =>
      prev.map((a) => ({ ...a, lastExecution: "Just now", activity: "Completed in the latest run." }))
    );
    setIsRunning(false);
  };

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div className="flex items-center gap-3 mb-1.5">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <Bot className="h-5 w-5 text-primary-foreground" strokeWidth={1.75} />
          </div>
          <h1 className="page-title mb-0">AI Agents</h1>
        </div>
        <p className="page-description">
          Watch how LawGPT routes a request across specialist agents, and check each agent's current status.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card shadow-card p-6 mb-8">
        <div className="flex flex-col sm:flex-row gap-2 mb-6">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Describe what you need the agents to do…"
            disabled={isRunning}
            className="flex-1"
          />
          <Button onClick={runExecution} disabled={isRunning || !query.trim()} className="shrink-0 gap-2">
            <Play className="h-4 w-4" />
            {isRunning ? "Running…" : "Run"}
          </Button>
        </div>

        <ExecutionTimeline steps={steps} />
      </div>

      <h2 className="font-serif text-xl font-semibold text-ink mb-4">Agent status</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {agents.map((agent) => (
          <AgentCard key={agent.key} agent={agent} />
        ))}
      </div>
    </div>
  );
};

export default AgentDashboard;
