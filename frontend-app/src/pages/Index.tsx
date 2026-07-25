import { useEffect, useState } from "react";
import { 
  Activity, 
  FileText, 
  Search, 
  ShieldAlert, 
  TrendingUp, 
  TrendingDown, 
  FolderOpen, 
  Bell, 
  Cpu, 
  CheckCircle,
  Clock
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { 
  getDashboardStats, 
  getDashboardNotifications, 
  getTaskCompletion, 
  getCaseStatusBreakdown, 
  getTeamActivity,
  type DashboardStat,
  type DashboardNotification,
  type TaskCompletion,
  type CaseStatusCount,
  type TeamMetric
} from "@/services/dashboard";
import { listDocuments } from "@/services/documents";
import { getResearchHistory } from "@/services/research";
import { getComplianceSnapshot } from "@/services/compliance";
import { Badge } from "@/components/ui/badge";

const DashboardIndex = () => {
  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [notifications, setNotifications] = useState<DashboardNotification[]>([]);
  const [tasks, setTasks] = useState<TaskCompletion[]>([]);
  const [caseStatus, setCaseStatus] = useState<CaseStatusCount[]>([]);
  const [teamMetrics, setTeamMetrics] = useState<TeamMetric[]>([]);
  
  const [recentDocs, setRecentDocs] = useState<any[]>([]);
  const [recentQueries, setRecentQueries] = useState<any[]>([]);
  const [complianceScore, setComplianceScore] = useState(85);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getDashboardStats(),
      getDashboardNotifications(),
      getTaskCompletion(),
      getCaseStatusBreakdown(),
      getTeamActivity(),
      listDocuments(),
      getResearchHistory(),
      getComplianceSnapshot()
    ]).then(([st, nt, tk, cs, tm, docs, queries, comp]) => {
      setStats(st);
      setNotifications(nt);
      setTasks(tk);
      setCaseStatus(cs);
      setTeamMetrics(tm);
      setRecentDocs(docs.slice(0, 4));
      setRecentQueries(queries.slice(0, 4));
      if (comp) {
        setComplianceScore(comp.complianceScore);
      }
      setIsLoading(false);
    }).catch((err) => {
      console.error("Dashboard error:", err);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <div className="text-2xs font-mono tracking-widest text-neutral-500 uppercase">Synchronizing Command Center</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 md:px-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Activity className="h-4.5 w-4.5 text-primary" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900">Command Center</h1>
          </div>
          <p className="text-xs text-neutral-500 font-mono uppercase tracking-wider">
            Live telemetry monitoring of legal RAG indexes, agent subtasks, and portfolios
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, idx) => {
          const isUp = stat.trend === "up";
          const isDown = stat.trend === "down";
          return (
            <div key={idx} className="glass-card p-5 space-y-2">
              <span className="text-[10px] font-mono tracking-wider text-neutral-400 uppercase">{stat.title}</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-neutral-900">{stat.value}</span>
                <span className={`text-[10px] font-mono font-medium flex items-center gap-0.5 ${isUp ? 'text-emerald-600' : isDown ? 'text-red-500' : 'text-neutral-500'}`}>
                  {isUp ? <TrendingUp size={11} /> : isDown ? <TrendingDown size={11} /> : null}
                  {stat.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Completion Recharts Chart vs Live Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6">
        <div className="glass-card p-6">
          <h2 className="text-[10px] font-mono tracking-wider text-neutral-400 uppercase mb-6">Execution Progression Metrics</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tasks} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="rgba(0,0,0,0.04)" />
                <XAxis dataKey="name" stroke="#888888" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={9} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e4e4e7', fontSize: '10px' }} />
                <Legend verticalAlign="top" height={36} iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
                <Bar dataKey="completed" name="Completed Tasks" fill="hsl(var(--primary))" barSize={16} radius={[2, 2, 0, 0]} />
                <Bar dataKey="pending" name="Pending Audits" fill="#94a3b8" barSize={16} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Notifications */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-border pb-3.5 mb-4">
              <Bell className="h-4 w-4 text-primary" />
              <h2 className="text-xs font-mono uppercase text-neutral-800 tracking-wider">Live System Alerts</h2>
            </div>
            <div className="space-y-3 max-h-[220px] overflow-y-auto">
              {notifications.map((n) => (
                <div key={n.id} className="p-3 rounded border border-border bg-neutral-50/50 flex gap-2.5 items-start">
                  <ShieldAlert size={14} className="text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-neutral-900 text-2xs">{n.title}</p>
                    <p className="text-[10px] text-neutral-500 mt-0.5 leading-relaxed">{n.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Recent Dossiers and RAG Searches */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Documents */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <FolderOpen className="h-4 w-4 text-primary" />
            <h2 className="text-xs font-mono uppercase text-neutral-800 tracking-wider">Recent Documents</h2>
          </div>
          <div className="divide-y divide-border">
            {recentDocs.map((doc, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-neutral-800">{doc.title}</p>
                  <p className="text-3xs font-mono text-neutral-400 mt-0.5 uppercase">{doc.type} · {doc.size}</p>
                </div>
                <span className="text-3xs font-mono text-neutral-400">{new Date(doc.lastModified).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Search queries */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Search className="h-4 w-4 text-primary" />
            <h2 className="text-xs font-mono uppercase text-neutral-800 tracking-wider">Recent RAG Queries</h2>
          </div>
          <div className="divide-y divide-border">
            {recentQueries.length > 0 ? (
              recentQueries.slice(0, 4).map((q, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs font-mono text-neutral-600">
                  <span className="truncate max-w-[280px]">{q.query || q}</span>
                  <Badge variant="outline" className="text-3xs bg-neutral-50">Vector Inquired</Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-neutral-400">No RAG search audits executed.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardIndex;
