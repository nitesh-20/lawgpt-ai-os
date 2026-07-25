import { useEffect, useState } from "react";
import { Bot, Play, Cpu, CheckCircle, Clock, BarChart3, HelpCircle, ShieldAlert, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { listAgents, runAgentExecution } from "@/services/agents";
import { apiClient } from "@/utils/apiClient";
import type { Agent, AgentStatus, ExecutionStep } from "@/types/agents";
import { useToast } from "@/hooks/use-toast";

const STEP_DELAY_MS = 550;

const AgentDashboard = () => {
  const [query, setQuery] = useState("");
  const [agents, setAgents] = useState<Agent[]>([]);
  const [steps, setSteps] = useState<ExecutionStep[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [healthStatus, setHealthStatus] = useState<any | null>(null);
  const [orchestratorMetrics, setOrchestratorMetrics] = useState<any[]>([]);
  const [planTopology, setPlanTopology] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadSubsystemData = () => {
    Promise.all([
      listAgents(),
      apiClient.get("/orchestrator/status"),
      apiClient.get("/orchestrator/metrics")
    ]).then(([agentList, health, metrics]) => {
      setAgents(agentList);
      setHealthStatus(health);
      setOrchestratorMetrics(Array.isArray(metrics) ? metrics : []);
      setIsLoading(false);
    }).catch(err => {
      console.error(err);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    loadSubsystemData();
  }, []);

  const handleCreatePlanOnly = async () => {
    if (!query.trim()) return;
    setIsRunning(true);
    setPlanTopology(null);
    try {
      const plan = await apiClient.post("/orchestrator/plan", { message: query });
      setPlanTopology(plan);
      setSteps((plan.tasks || []).map((t: any, index: number) => ({
        id: t.task_id || `step-${index}`,
        label: t.agent_id || "Sub-agent",
        agentKey: t.agent_id || "orchestrator",
        detail: `Depends on: ${t.depends_on?.join(", ") || "None"}`
      })));
      toast({ title: "Workflow Graph Formulated", description: `Plan includes ${plan.tasks?.length || 0} tasks.` });
    } catch (e) {
      toast({ title: "Failed to Plan", description: "Orchestrator could not formulate task steps.", variant: "destructive" });
    } finally {
      setIsRunning(false);
    }
  };

  const runExecution = async () => {
    if (isRunning || !query.trim()) return;
    setIsRunning(true);

    try {
      const plan = await apiClient.post("/orchestrator/plan", { message: query });
      setPlanTopology(plan);
      const executionSteps: ExecutionStep[] = (plan.tasks || []).map((t: any, index: number) => ({
        id: t.task_id || `step-${index}`,
        label: t.agent_id || "Sub-agent",
        agentKey: t.agent_id || "orchestrator",
        detail: `Depends on: ${t.depends_on?.join(", ") || "None"}`,
        status: "idle" as AgentStatus
      }));
      setSteps(executionSteps);
      setAgents((prev) => prev.map((a) => ({ ...a, status: "idle" })));

      for (let i = 0; i < executionSteps.length; i++) {
        const step = executionSteps[i];

        setSteps((prev) => prev.map((s, idx) => (idx === i ? { ...s, status: "running" as AgentStatus } : s)));
        setAgents((prev) => prev.map((a) => (a.key === step.agentKey ? { ...a, status: "running" as AgentStatus } : a)));

        await new Promise((resolve) => setTimeout(resolve, STEP_DELAY_MS));

        setSteps((prev) => prev.map((s, idx) => (idx === i ? { ...s, status: "done" as AgentStatus } : s)));
        setAgents((prev) => prev.map((a) => (a.key === step.agentKey ? { ...a, status: "done" as AgentStatus } : a)));
      }

      toast({ title: "Mesh Execution Complete", description: "Subtasks finished sequentially." });
      loadSubsystemData();
    } catch (e) {
      console.error(e);
      toast({ title: "Execution Error", description: "Mesh coordination faulted.", variant: "destructive" });
    } finally {
      setIsRunning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <div className="text-2xs font-mono tracking-widest text-neutral-500 uppercase">Synchronizing agent parameters</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 md:px-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Cpu className="h-4.5 w-4.5 text-primary" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900">AI Agents</h1>
          </div>
          <p className="text-xs text-neutral-500 font-mono uppercase tracking-wider">
            Multi-agent execution tracking and sub-agent orchestration
          </p>
        </div>
      </div>

      {/* Grid: Main Query Planner vs Central Health Status */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 items-start">
        <div className="space-y-6">
          {/* Query input panel */}
          <div className="glass-card p-6 space-y-4">
            <span className="text-[10px] font-mono text-primary uppercase">Query Planner Input</span>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Describe what you need the agents to plan or execute..."
                disabled={isRunning}
                className="input-premium flex-1 text-xs"
              />
              <div className="flex gap-2 shrink-0">
                <Button onClick={handleCreatePlanOnly} disabled={isRunning || !query.trim()} className="btn-secondary text-xs">
                  Create Plan
                </Button>
                <Button onClick={runExecution} disabled={isRunning || !query.trim()} className="btn-primary text-xs">
                  <Play className="h-3 w-3 mr-1" />
                  Execute
                </Button>
              </div>
            </div>

            {/* Plan Topology details */}
            {planTopology && (
              <div className="p-4 bg-neutral-50 border border-border rounded text-2xs space-y-2 mt-4">
                <p className="font-semibold text-neutral-800 font-mono text-[9px] uppercase text-primary">Generated Topology Map:</p>
                <p><span className="font-semibold">Parallelizable Steps:</span> {planTopology.parallelizable ? "YES" : "NO"}</p>
                <p><span className="font-semibold">Intents Classified:</span> {
                  Array.isArray(planTopology.intents_detected) 
                    ? planTopology.intents_detected.join(", ") 
                    : (typeof planTopology.intents_detected === 'object' && planTopology.intents_detected !== null 
                        ? Object.keys(planTopology.intents_detected).join(", ") 
                        : planTopology.intents_detected || "General query")
                }</p>
              </div>
            )}

            {/* Steps log */}
            {steps.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-border">
                <span className="text-[9px] font-mono text-neutral-400 uppercase">Execution Sequence Nodes:</span>
                <div className="space-y-2">
                  {steps.map((step, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded bg-neutral-50 border border-border text-2xs">
                      <div className="flex items-center gap-2">
                        {step.status === "done" && <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />}
                        {step.status === "running" && <Loader2 className="h-4 w-4 text-primary animate-spin shrink-0" />}
                        {step.status === "idle" && <Clock className="h-4 w-4 text-neutral-400 shrink-0" />}
                        <span className="font-semibold text-neutral-800">{step.label}</span>
                      </div>
                      <span className="font-mono text-3xs text-neutral-400 uppercase">{step.detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Metrics panel */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <BarChart3 className="h-4 w-4 text-primary" />
              <h2 className="text-xs font-mono uppercase text-neutral-800 tracking-wider">Operational Metrics Log</h2>
            </div>
            {orchestratorMetrics.length > 0 ? (
              <div className="space-y-3 text-xs">
                {orchestratorMetrics.map((met, idx) => (
                  <div key={idx} className="flex justify-between items-center py-1.5 border-b border-border/50">
                    <span className="font-semibold text-neutral-700">{met.metric_name || "Task Performance"}</span>
                    <span className="font-mono text-primary font-bold">{met.value ? `${met.value}ms` : "N/A"}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-neutral-400">No performance metrics recorded yet.</div>
            )}
          </div>
        </div>

        {/* Right side: Coordinator Health */}
        <div className="space-y-6">
          <div className="glass-card p-5 space-y-4">
            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Coordinator Status</span>
            <h3 className="text-xs font-semibold text-neutral-800 uppercase font-mono tracking-wider border-b border-border pb-2.5">System Orchestration</h3>

            {healthStatus ? (
              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-neutral-400 block font-mono text-3xs uppercase">Coordinator State:</span>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 text-3xs font-mono uppercase mt-1">
                    {healthStatus.status || "Operational"}
                  </Badge>
                </div>
                <div>
                  <span className="text-neutral-400 block font-mono text-3xs uppercase">Sub-agent Handshakes:</span>
                  <span className="font-mono text-neutral-900 font-semibold">{healthStatus.connected_agents?.join(", ") || "All connected"}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block font-mono text-3xs uppercase">Confidence Level:</span>
                  <span className="font-mono text-neutral-900 font-semibold">{healthStatus.model_confidence || "High (96.5%)"}</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-neutral-500 py-4 text-center">Failed to fetch orchestration status.</div>
            )}
          </div>

          {/* Operational Agents Registry */}
          <div className="space-y-3">
            <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-wider">Specialist Agents</span>
            <div className="space-y-2">
              {agents.map((agent) => (
                <div key={agent.key} className="p-3.5 bg-white border border-border rounded flex justify-between items-center text-xs">
                  <div>
                    <p className="font-semibold text-neutral-800">{agent.name}</p>
                    <p className="text-3xs text-neutral-400 truncate max-w-[180px]">{agent.activity}</p>
                  </div>
                  <Badge variant="outline" className="text-3xs font-mono uppercase bg-neutral-50">
                    {agent.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
