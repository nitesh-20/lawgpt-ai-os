import { useEffect, useState } from "react";
import { Bot, Play, Cpu, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listAgents, runAgentExecution } from "@/services/agents";
import type { Agent, AgentStatus, ExecutionRun, ExecutionStep } from "@/types/agents";
import { motion, AnimatePresence } from "framer-motion";

const STEP_DELAY_MS = 550;

const AgentDashboard = () => {
  const [query, setQuery] = useState("");
  const [agents, setAgents] = useState<Agent[]>([]);
  const [steps, setSteps] = useState<ExecutionStep[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    listAgents().then(setAgents).catch(err => console.error(err));
  }, []);

  const setAgentStatus = (key: string, status: AgentStatus) => {
    setAgents((prev) => prev.map((a) => (a.key === key ? { ...a, status } : a)));
  };

  const runExecution = async () => {
    if (isRunning || !query.trim()) return;
    setIsRunning(true);

    try {
      const run: ExecutionRun = await runAgentExecution(query);
      setSteps(run.steps.map((s) => ({ ...s, status: "idle" as AgentStatus })));
      setAgents((prev) => prev.map((a) => ({ ...a, status: "idle" })));

      for (let i = 0; i < run.steps.length; i++) {
        const step = run.steps[i];

        setSteps((prev) => prev.map((s, idx) => (idx === i ? { ...s, status: "running" } : s)));
        setAgentStatus(step.agentKey, "running");

        await new Promise((resolve) => setTimeout(resolve, STEP_DELAY_MS));

        setSteps((prev) => prev.map((s, idx) => (idx === i ? { ...s, status: "done" } : s)));
        setAgentStatus(step.agentKey, "done");
      }

      setAgents((prev) =>
        prev.map((a) => ({ ...a, lastExecution: "Just now", activity: "Completed in the latest run." }))
      );
    } catch (e) {
      console.error(e);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 md:px-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Cpu className="h-4.5 w-4.5 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">AI Agent Mesh</h1>
          </div>
          <p className="text-xs text-muted-foreground/80 font-mono uppercase tracking-wider">
            Multi-agent execution tracking and sub-agent orchestration
          </p>
        </div>
      </div>

      {/* Query panel */}
      <div className="glass-card p-6 border-white/[0.06]">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Conduct compliance review on uploaded NDA and search related supreme court precedents..."
            disabled={isRunning}
            className="input-premium flex-1 text-xs"
          />
          <Button onClick={runExecution} disabled={isRunning || !query.trim()} className="btn-primary flex items-center gap-2">
            {isRunning ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Running...</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" />
                <span>Execute Mesh</span>
              </>
            )}
          </Button>
        </div>

        {/* Steps simulation logs */}
        {steps.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-white/[0.04] animate-fade-in">
            <span className="text-[10px] font-mono text-primary uppercase">Execution Log Sequence:</span>
            <div className="space-y-2.5">
              {steps.map((step, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.01] border border-white/[0.04] text-xs">
                  <div className="flex items-center gap-3">
                    {step.status === "done" && <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />}
                    {step.status === "running" && <Loader2 className="h-4 w-4 text-primary animate-spin shrink-0" />}
                    {step.status === "idle" && <Clock className="h-4 w-4 text-muted-foreground shrink-0" />}
                    <span className="font-semibold text-white">{step.description}</span>
                  </div>
                  <span className="font-mono text-3xs text-muted-foreground uppercase">{step.agentKey}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Agents status list */}
      <div className="space-y-4">
        <h2 className="text-xs font-mono text-muted-foreground/80 uppercase tracking-wider">Operational Agent Registry</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {agents.map((agent) => (
            <div key={agent.key} className="glass-card p-5 hover:border-white/[0.1] transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-xs text-white uppercase font-mono tracking-wider">{agent.name}</h3>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={
                      agent.status === "running" ? "bg-primary/10 border-primary/20 text-primary animate-pulse" :
                      agent.status === "done" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" :
                      "bg-white/5 border-white/10 text-muted-foreground"
                    }
                  >
                    {agent.status}
                  </Badge>
                </div>
                <p className="text-2xs text-muted-foreground leading-relaxed">{agent.description}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/[0.04] flex justify-between items-center text-3xs font-mono text-muted-foreground/60">
                <span>LAST RUN: {agent.lastExecution || "Never"}</span>
                <span className="truncate max-w-[120px]">{agent.activity || "Inactive"}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Internal Loader component for ease of use
const Loader2 = ({ className }: { className?: string }) => (
  <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export default AgentDashboard;
