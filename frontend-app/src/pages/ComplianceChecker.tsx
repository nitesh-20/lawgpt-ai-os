import { useEffect, useState } from "react";
import { Shield, TriangleAlert, ShieldCheck, Lightbulb } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import StatCard from "@/components/dashboard/StatCard";
import { getComplianceSnapshot } from "@/services/compliance";
import type { ComplianceSnapshot } from "@/types/compliance";

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

  useEffect(() => {
    getComplianceSnapshot().then(setSnapshot);
  }, []);

  const { complianceScore, riskScore, documentsReviewed, lastScan, categoryScores, violations, recommendations } =
    snapshot;

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div className="flex items-center gap-3 mb-1.5">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <Shield className="h-5 w-5 text-primary-foreground" strokeWidth={1.75} />
          </div>
          <h1 className="page-title mb-0">Compliance Dashboard</h1>
        </div>
        <p className="page-description">
          Portfolio-wide compliance posture across {documentsReviewed} reviewed documents · last scan {lastScan}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <StatCard title="Compliance score" value={`${complianceScore}%`} icon={ShieldCheck} />
        <StatCard title="Risk score" value={`${riskScore}%`} icon={TriangleAlert} />
        <StatCard title="Documents reviewed" value={documentsReviewed} icon={Shield} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="rounded-lg border border-border bg-card shadow-card p-6">
          <h2 className="font-serif text-lg font-semibold text-ink mb-5">Score by category</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={categoryScores} margin={{ left: -12, right: 12, top: 8 }}>
                <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="category"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={50}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  width={32}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted))" }}
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 13 }}
                />
                <Bar dataKey="score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card shadow-card p-6">
          <h2 className="font-serif text-lg font-semibold text-ink mb-5">Category progress</h2>
          <div className="space-y-4">
            {categoryScores.map((c) => (
              <div key={c.category}>
                <div className="flex items-center justify-between mb-1.5 text-[13px]">
                  <span className="text-foreground">{c.category}</span>
                  <span className="font-mono text-muted-foreground">{c.score}%</span>
                </div>
                <Progress value={c.score} className="h-1.5" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg border border-border bg-card shadow-card p-6">
          <h2 className="font-serif text-lg font-semibold text-ink mb-5">Violations</h2>
          <div className="space-y-4">
            {violations.map((v) => (
              <div key={v.id} className="rounded-md border border-border p-4">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <p className="text-[14px] font-medium text-ink leading-snug">{v.title}</p>
                  <Badge variant={v.severity === "critical" ? "destructive" : "secondary"} className="shrink-0 text-[10px] capitalize">
                    {v.severity}
                  </Badge>
                </div>
                <p className="text-[13px] text-muted-foreground leading-snug mb-2">{v.description}</p>
                <p className="font-mono text-[11px] text-accent">{v.regulation}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card shadow-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <Lightbulb className="h-4 w-4 text-primary" strokeWidth={1.75} />
            <h2 className="font-serif text-lg font-semibold text-ink">Recommendations</h2>
          </div>
          <ul className="space-y-3">
            {recommendations.map((r) => (
              <li key={r.id} className="flex gap-2.5 text-[14px] text-foreground leading-snug">
                <span className="text-primary shrink-0">·</span>
                {r.text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ComplianceChecker;
