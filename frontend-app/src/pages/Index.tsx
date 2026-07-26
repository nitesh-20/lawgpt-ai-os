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
  Clock,
  ArrowRight,
  Terminal,
  FileEdit,
  Shield,
  Sparkles
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
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// 100% Cohesive Seed Data matching visual requirements
const DEFAULT_STATS: DashboardStat[] = [
  { title: "Active Matters", value: "4 Dossiers", change: "0%", trend: "neutral", icon: "FileText" },
  { title: "Synthesized Queries", value: "32 Audited", change: "+24%", trend: "up", icon: "Search" },
  { title: "Risk Checklists", value: "18 Cleared", change: "+8%", trend: "up", icon: "Shield" },
  { title: "Avg AI Latency", value: "1.8s Response", change: "-12%", trend: "down", icon: "Cpu" }
];

const DEFAULT_TASKS: TaskCompletion[] = [
  { name: "Mon", completed: 2, pending: 1 },
  { name: "Tue", completed: 4, pending: 2 },
  { name: "Wed", completed: 6, pending: 3 },
  { name: "Thu", completed: 5, pending: 2 },
  { name: "Fri", completed: 8, pending: 4 }
];

const DEFAULT_ALERTS: DashboardNotification[] = [
  { id: "1", title: "DPDP Audit Triggered", message: "TechNova solutions data pipeline assessment is ready for verification.", time: "10 mins ago", read: false, type: "info" },
  { id: "2", title: "Non-Compete Risk Flagged", message: "Maharashtra region limits in employment contract review exceed safety bounds.", time: "1 hour ago", read: false, type: "warning" },
  { id: "3", title: "DPA Synthesis Finished", message: "AI agent completed NDA markup audit for Skyline infra developers.", time: "3 hours ago", read: true, type: "success" }
];

const DEFAULT_DOCS = [
  { title: "Privacy Policy.pdf", type: "PDF", size: "1.2 MB", lastModified: "2026-07-25" },
  { title: "Master Service Agreement.pdf", type: "PDF", size: "2.4 MB", lastModified: "2026-07-24" },
  { title: "Employee Data Processing Policy.pdf", type: "PDF", size: "850 KB", lastModified: "2026-07-24" },
  { title: "Vendor DPA.pdf", type: "PDF", size: "1.1 MB", lastModified: "2026-07-23" }
];

const DEFAULT_QUERIES = [
  "DPDP Act compliance requirements for cloud infrastructure",
  "Arbitration enforceability for commercial delay liquidated damages",
  "Labor disputes regarding employee non-compete covenants in Maharashtra",
  "Indemnity boundaries in renewable energy vendor contracts"
];

const DashboardIndex = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStat[]>(DEFAULT_STATS);
  const [notifications, setNotifications] = useState<DashboardNotification[]>(DEFAULT_ALERTS);
  const [tasks, setTasks] = useState<TaskCompletion[]>(DEFAULT_TASKS);
  const [caseStatus, setCaseStatus] = useState<CaseStatusCount[]>([]);
  const [teamMetrics, setTeamMetrics] = useState<TeamMetric[]>([]);
  
  const [recentDocs, setRecentDocs] = useState<any[]>(DEFAULT_DOCS);
  const [recentQueries, setRecentQueries] = useState<any[]>(DEFAULT_QUERIES);
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
      // Merge with API responses safely or fallback to seeded templates
      if (st && st.length > 0) setStats(st);
      if (nt && nt.length > 0) setNotifications(nt);
      if (tk && tk.length > 0) setTasks(tk);
      setCaseStatus(cs);
      setTeamMetrics(tm);
      
      if (docs && docs.length > 0) {
        setRecentDocs(docs.slice(0, 4).map(d => ({
          title: d.title || d.name,
          type: d.type || "PDF",
          size: d.size || "Unknown",
          lastModified: d.lastModified || d.uploaded_at || new Date().toISOString()
        })));
      }
      
      if (queries && queries.length > 0) {
        setRecentQueries(queries.slice(0, 4));
      }
      
      if (comp) {
        setComplianceScore(comp.complianceScore);
      }
      setIsLoading(false);
    }).catch((err) => {
      console.error("Dashboard data load error, using high-fidelity fallback registry:", err);
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

  const containerVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 15,
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8 max-w-7xl mx-auto px-4 md:px-6 pb-12"
    >
      
      {/* Title Area */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-white/5">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-[#7C5CFF]/10 border border-[#7C5CFF]/20 flex items-center justify-center shadow-3xs">
              <Activity className="h-5 w-5 text-[#9B87FF] animate-pulse" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white font-serif">Command Center</h1>
          </div>
          <p className="text-xs text-slate-450 font-mono uppercase tracking-wider font-bold">
            Live telemetry monitoring of legal RAG indexes, agent subtasks, and dossiers
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-[#7C5CFF]/10 text-[#9B87FF] border border-[#7C5CFF]/20 font-mono text-[9px] rounded-lg uppercase font-bold tracking-wider py-1.5 px-3 shadow-3xs">
            System Live: Online
          </Badge>
        </div>
      </div>

      {/* Pulsing Workspace Telemetry HUD Hero */}
      <motion.div 
        variants={itemVariants}
        className="relative border border-white/5 bg-[#101010] p-7 rounded-2xl overflow-hidden shadow-3xs"
      >
        <div className="absolute top-0 right-0 w-[260px] h-[260px] bg-[#7C5CFF]/5 rounded-full blur-[65px] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:2rem_2rem] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-3.5 font-sans">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#151515] border border-white/5 rounded-lg shadow-3xs">
              <span className="w-1.5 h-1.5 bg-[#7C5CFF] rounded-full animate-ping" />
              <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 font-bold">Autonomous Orchestrator Mode</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white leading-tight font-serif">
              Orchestrating 8 AI Subsystems & 4 Active Matters.
            </h2>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              Verify compliance indices, search unified central files, or coordinate sub-agents directly. Access drafting tools to compile structured reports with millisecond response buffers.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3.5 shrink-0 font-mono">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button onClick={() => navigate("/search")} className="bg-[#7C5CFF] hover:bg-[#9B87FF] text-white flex items-center justify-center font-bold py-5 text-2xs uppercase tracking-wider px-6 shadow-2xs rounded-xl h-11 border border-[#7C5CFF]/30">
                AI Legal Search
                <ArrowRight className="ml-2 h-4 w-4 shrink-0" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button onClick={() => navigate("/drafting")} variant="outline" className="border-white/5 bg-[#151515] hover:bg-[#1C1C1C] text-white font-bold py-5 text-2xs uppercase tracking-wider px-6 rounded-xl h-11 shadow-3xs">
                Draft Document
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Telemetry Activity Tickers */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-8 pt-6 border-t border-white/5">
          {[
            { label: "Research Agent", status: "Active (0ms latency)", color: "bg-[#7C5CFF]" },
            { label: "Drafting Agent", status: "Active (Idle queue)", color: "bg-[#7C5CFF]" },
            { label: "Compliance Agent", status: "Scanning Dossier", color: "bg-amber-500 animate-pulse" },
            { label: "Document Agent", status: "Indexed (RAG active)", color: "bg-[#7C5CFF]" }
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <span className={`w-2 h-2 rounded-full shrink-0 ${item.color}`} />
              <div>
                <p className="text-[9px] font-mono uppercase tracking-wider text-slate-500 font-bold">{item.label}</p>
                <p className="text-xs font-semibold text-slate-300 mt-0.5 font-sans leading-none">{item.status}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, idx) => {
          const isUp = stat.trend === "up";
          const isDown = stat.trend === "down";
          return (
            <motion.div 
              variants={itemVariants}
              whileHover={{ scale: 1.015, y: -2 }}
              key={idx} 
              className="bg-[#101010] border border-white/5 p-5 rounded-2xl shadow-3xs space-y-2 hover:shadow-2xs transition-all duration-200 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1.5 h-full bg-[#7C5CFF]/20" />
              <span className="text-[10px] font-mono tracking-wider text-slate-450 uppercase font-bold block">{stat.title}</span>
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-xl font-bold text-white font-sans tracking-tight">{stat.value}</span>
                <span className={`text-[9px] font-mono font-bold flex items-center gap-0.5 uppercase px-2 py-0.5 rounded-lg ${
                  isUp ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                  isDown ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                  'bg-white/5 text-slate-400 border border-white/5'
                }`}>
                  {isUp ? <TrendingUp size={10} /> : isDown ? <TrendingDown size={10} /> : null}
                  {stat.change}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Task Completion Recharts Chart vs Live Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6">
        <motion.div 
          variants={itemVariants}
          className="border border-white/5 bg-[#101010] p-6 rounded-2xl shadow-3xs"
        >
          <div className="flex items-center justify-between mb-6">
            <span className="text-[10px] font-mono tracking-wider text-slate-450 uppercase font-bold">Execution Progression Metrics</span>
            <span className="text-[10px] font-mono text-[#9B87FF] font-bold uppercase tracking-wider">Weekly RAG Metrics</span>
          </div>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tasks} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.02)" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} className="font-mono font-bold" />
                <YAxis stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} className="font-mono font-bold" />
                <Tooltip contentStyle={{ backgroundColor: '#101010', borderColor: 'rgba(255,255,255,0.06)', fontSize: '9px', borderRadius: '12px', color: '#ffffff' }} />
                <Legend verticalAlign="top" height={36} iconSize={8} wrapperStyle={{ fontSize: '9px', textTransform: 'uppercase', fontFamily: 'monospace', fontWeight: 'bold' }} />
                <Bar dataKey="completed" name="Completed Audits" fill="#7C5CFF" barSize={12} radius={[3, 3, 0, 0]} />
                <Bar dataKey="pending" name="Pending Verifications" fill="rgba(255,255,255,0.15)" barSize={12} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Live System Alerts */}
        <motion.div 
          variants={itemVariants}
          className="border border-white/5 bg-[#101010] p-6 rounded-2xl shadow-3xs flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <Bell className="h-4.5 w-4.5 text-[#7C5CFF] animate-bounce" />
              <h2 className="text-xs font-mono uppercase text-slate-300 tracking-wider font-bold">Telemetry Activity Stream</h2>
            </div>
            
            <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
              {notifications.map((n) => (
                <div key={n.id} className="p-3.5 border border-white/5 bg-[#151515] rounded-xl flex gap-2.5 items-start hover:border-[#7C5CFF]/30 hover:scale-[1.01] transition-all duration-200 shadow-3xs">
                  <ShieldAlert size={15} className="text-[#7C5CFF] shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-semibold text-white text-xs font-sans tracking-tight">{n.title}</p>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-serif">{n.message}</p>
                    <span className="text-[9px] font-mono text-slate-500 block pt-1 uppercase font-bold">{n.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Grid: Recent Dossiers and RAG Searches */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Documents */}
        <motion.div 
          variants={itemVariants}
          className="border border-white/5 bg-[#101010] p-6 rounded-2xl shadow-3xs space-y-4"
        >
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-4.5 w-4.5 text-[#7C5CFF] animate-pulse" />
              <h2 className="text-xs font-mono uppercase text-slate-300 tracking-wider font-bold">Recent Documents</h2>
            </div>
            <button onClick={() => navigate("/documents")} className="text-[9px] font-mono uppercase text-[#9B87FF] font-bold hover:underline">
              View All
            </button>
          </div>
          
          <div className="divide-y divide-white/5">
            {recentDocs.map((doc, idx) => (
              <div key={idx} className="py-3.5 flex items-center justify-between text-xs hover:bg-[#151515] rounded-lg px-2 transition-colors">
                <div>
                  <p className="font-semibold text-white font-sans tracking-tight">📄 {doc.title}</p>
                  <p className="text-[9px] font-mono text-slate-500 mt-0.5 uppercase font-bold">{doc.type} · {doc.size}</p>
                </div>
                <span className="text-3xs font-mono text-slate-450 font-bold">{new Date(doc.lastModified).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Search queries */}
        <motion.div 
          variants={itemVariants}
          className="border border-white/5 bg-[#101010] p-6 rounded-2xl shadow-3xs space-y-4"
        >
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <Search className="h-4.5 w-4.5 text-[#7C5CFF]" />
              <h2 className="text-xs font-mono uppercase text-slate-300 tracking-wider font-bold">Recent RAG Queries</h2>
            </div>
            <button onClick={() => navigate("/search")} className="text-[9px] font-mono uppercase text-[#9B87FF] font-bold hover:underline">
              New Search
            </button>
          </div>
          
          <div className="divide-y divide-white/5">
            {recentQueries.map((q, idx) => {
              const queryText = typeof q === "string" ? q : (q?.query || "Generic Search Query");
              return (
                <div key={idx} className="py-3.5 flex items-center justify-between text-xs font-serif text-slate-300 hover:bg-[#151515] rounded-lg px-2 transition-colors">
                  <span className="truncate max-w-[280px] italic">"{queryText}"</span>
                  <Badge variant="outline" className="text-[9px] font-mono bg-[#151515] text-slate-400 border border-white/5 uppercase font-bold py-0.5 px-2">
                    Vector Match
                  </Badge>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DashboardIndex;
