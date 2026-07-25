import { useEffect, useState } from "react";
import { Shield, TriangleAlert, ShieldCheck, Lightbulb, Activity } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { getComplianceSnapshot } from "@/services/compliance";
import type { ComplianceSnapshot } from "@/types/compliance";
import { motion } from "framer-motion";

const EMPTY_SNAPSHOT: ComplianceSnapshot = {
  complianceScore: 0,
  riskScore: 0,
  documentsReviewed: 0,
  lastScan: "",
  categoryScores: [],
  violations: [],
  recommendations: [],
};

const ComplianceChecker = () => {
  const [snapshot, setSnapshot] = useState<ComplianceSnapshot>(EMPTY_SNAPSHOT);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getComplianceSnapshot().then((data) => {
      setSnapshot(data);
      setIsLoading(false);
    }).catch(err => {
      console.error(err);
      setIsLoading(false);
    });
  }, []);

  const { complianceScore, riskScore, documentsReviewed, lastScan, categoryScores, violations, recommendations } =
    snapshot;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <div className="text-2xs font-mono tracking-widest text-muted-foreground uppercase">Analyzing compliance posture</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 md:px-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Shield className="h-4.5 w-4.5 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Compliance Audit</h1>
          </div>
          <p className="text-xs text-muted-foreground/80 font-mono uppercase tracking-wider">
            Portfolio posture across {documentsReviewed} reviewed files · last run {lastScan ? new Date(lastScan).toLocaleDateString() : "Just Now"}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          { title: "Compliance Score", value: `${complianceScore}%`, icon: ShieldCheck, color: "text-emerald-500" },
          { title: "Portfolio Risk Factor", value: `${riskScore}%`, icon: TriangleAlert, color: "text-red-500" },
          { title: "Audited Documents", value: documentsReviewed, icon: Shield, color: "text-primary" }
        ].map((item, idx) => (
          <div key={idx} className="glass-card p-5 flex items-center justify-between">
            <div>
              <span className="text-3xs font-mono tracking-wider text-muted-foreground/80 uppercase">{item.title}</span>
              <p className={`text-2xl font-bold mt-1 text-white`}>{item.value}</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-white/[0.03] flex items-center justify-center border border-white/[0.05]">
              <item.icon className={`h-4.5 w-4.5 ${item.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Recharts distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h2 className="text-xs font-mono tracking-wider text-muted-foreground/80 uppercase mb-6">Compliance By Rule Category</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryScores} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  dataKey="category"
                  stroke="#52525b"
                  fontSize={9}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  stroke="#52525b"
                  fontSize={9}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.02)" }}
                  contentStyle={{ backgroundColor: '#09090b', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '10px' }}
                />
                <Bar dataKey="score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category progress bars */}
        <div className="glass-card p-6">
          <h2 className="text-xs font-mono tracking-wider text-muted-foreground/80 uppercase mb-6">Category Posture Index</h2>
          <div className="space-y-5">
            {categoryScores.map((c) => (
              <div key={c.category} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-muted-foreground">{c.category}</span>
                  <span className="font-mono text-2xs text-primary">{c.score}%</span>
                </div>
                <Progress value={c.score} className="h-1 bg-white/[0.04] rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Violations and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Violations log */}
        <div className="glass-card p-6">
          <h2 className="text-xs font-mono tracking-wider text-muted-foreground/80 uppercase mb-6">Detected Compliance Violations</h2>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {violations.length > 0 ? (
              violations.map((v) => (
                <div key={v.id} className="p-3.5 rounded-lg border border-white/[0.04] bg-white/[0.01]">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <p className="font-semibold text-xs text-white leading-relaxed">{v.title}</p>
                    <Badge 
                      variant={v.severity === "critical" ? "destructive" : "secondary"} 
                      className={`text-[9px] font-mono uppercase shrink-0 ${v.severity === "critical" ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-white/5 border-white/10 text-muted-foreground'}`}
                    >
                      {v.severity}
                    </Badge>
                  </div>
                  <p className="text-2xs text-muted-foreground/85 leading-relaxed mt-1.5">{v.description}</p>
                  <p className="font-mono text-3xs text-primary mt-2.5">{v.regulation}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-muted-foreground">No violations recorded.</div>
            )}
          </div>
        </div>

        {/* Actionable recommendations */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <Lightbulb className="h-4 w-4 text-primary" />
            <h2 className="text-xs font-mono tracking-wider text-muted-foreground/80 uppercase">AI Remediation Suggestions</h2>
          </div>
          <ul className="space-y-4">
            {recommendations.map((r, idx) => (
              <li key={r.id} className="text-xs text-muted-foreground leading-relaxed flex gap-2.5 items-start">
                <span className="h-5 w-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-mono text-3xs shrink-0">{idx + 1}</span>
                <span className="pt-0.5">{r.text}</span>
              </li>
            ))}
            {recommendations.length === 0 && (
              <div className="text-center py-8 text-xs text-muted-foreground">No recommendations pending.</div>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ComplianceChecker;
