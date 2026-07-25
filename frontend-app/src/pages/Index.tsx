import { 
  Scale, 
  Briefcase, 
  Clock, 
  Calendar, 
  Activity, 
  ChevronRight, 
  ChevronUp, 
  BellRing, 
  AlertCircle, 
  CheckCircle2, 
  Layers, 
  ArrowUpRight,
  TrendingUp,
  Cpu,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
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
  type TeamMetric,
} from '@/services/dashboard';
import { listCases } from '@/services/cases';
import type { Case } from '@/types/case';

const STAT_ICONS = [Scale, Briefcase, Clock, Calendar];

const NOTIFICATION_STYLE: Record<string, { icon: any, className: string }> = {
  alert: { icon: AlertCircle, className: 'text-destructive border-destructive/10 bg-destructive/5' },
  success: { icon: CheckCircle2, className: 'text-emerald-500 border-emerald-500/10 bg-emerald-500/5' },
  info: { icon: BellRing, className: 'text-primary border-primary/10 bg-primary/5' },
  warning: { icon: AlertCircle, className: 'text-amber-500 border-amber-500/10 bg-amber-500/5' },
};

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [notifications, setNotifications] = useState<DashboardNotification[]>([]);
  const [tasks, setTasks] = useState<TaskCompletion[]>([]);
  const [caseStatus, setCaseStatus] = useState<CaseStatusCount[]>([]);
  const [team, setTeam] = useState<TeamMetric[]>([]);
  const [recentCases, setRecentCases] = useState<Case[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      getDashboardStats(),
      getDashboardNotifications(),
      getTaskCompletion(),
      getCaseStatusBreakdown(),
      getTeamActivity(),
      listCases(),
    ]).then(([s, n, t, cs, ta, cases]) => {
      setStats(s);
      setNotifications(n);
      setTasks(t);
      setCaseStatus(cs);
      setTeam(ta);
      setRecentCases(cases.slice(0, 3));
      setIsLoading(false);
    }).catch(err => {
      console.error("Error loading dashboard data:", err);
      setIsLoading(false);
    });
  }, []);

  // Simple telemetry data for chart
  const telemetryData = [
    { name: '00:00', load: 12 },
    { name: '04:00', load: 19 },
    { name: '08:00', load: 32 },
    { name: '12:00', load: 45 },
    { name: '16:00', load: 38 },
    { name: '20:00', load: 52 },
    { name: '24:00', load: 30 },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 md:px-6">
      {/* Upper Title Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Activity className="h-4.5 w-4.5 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Legal Command Center</h1>
          </div>
          <p className="text-xs text-muted-foreground/80 font-mono uppercase tracking-wider">Real-time system telemetry and practice intelligence</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => navigate('/chat')} className="btn-primary flex items-center gap-2">
            <span>Consult Assistant</span>
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Grid of 4 key stats */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array(4).fill(0).map((_, idx) => (
            <div key={idx} className="h-28 bg-white/[0.02] border border-white/[0.04] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {stats.map((stat, idx) => {
            const Icon = STAT_ICONS[idx] || Scale;
            return (
              <div 
                key={stat.title}
                className="glass-card glass-card-hover p-5 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xs font-mono tracking-wider text-muted-foreground/75 uppercase">{stat.title}</span>
                  <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.05] flex items-center justify-center">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline justify-between">
                  <span className="text-2xl font-semibold tracking-tight text-white">{stat.value}</span>
                  <div className="flex items-center gap-1 text-2xs text-emerald-500 font-mono bg-emerald-500/5 px-1.5 py-0.5 rounded border border-emerald-500/10">
                    <TrendingUp className="h-3 w-3" />
                    <span>{stat.change}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>
      )}

      {/* Analytics Chart & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Telemetry Chart */}
        <Card className="lg:col-span-2 bg-card/45 border-white/[0.06] backdrop-blur-md rounded-xl">
          <CardHeader className="border-b border-white/[0.04] pb-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold text-white">Core Agent Query Load</CardTitle>
              <CardDescription className="text-2xs font-mono">Real-time inference tracking and pipeline metrics</CardDescription>
            </div>
            <Cpu className="h-4.5 w-4.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={telemetryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#09090b', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '8px' }}
                    labelStyle={{ color: '#a1a1aa', fontFamily: 'monospace', fontSize: '10px' }}
                    itemStyle={{ color: '#fff', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="load" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorLoad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* System Audits and Notifications */}
        <Card className="bg-card/45 border-white/[0.06] backdrop-blur-md rounded-xl">
          <CardHeader className="border-b border-white/[0.04] pb-4">
            <CardTitle className="text-sm font-semibold text-white">System Events & Audits</CardTitle>
            <CardDescription className="text-2xs font-mono">Agent intent executions and security events</CardDescription>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="space-y-3 max-h-[225px] overflow-y-auto pr-1">
              {notifications.length > 0 ? notifications.map((notif) => {
                const style = NOTIFICATION_STYLE[notif.type] || NOTIFICATION_STYLE.info;
                const Icon = style.icon;
                return (
                  <div
                    key={notif.id}
                    className={`p-3 rounded-lg border ${style.className} transition-all duration-200`}
                  >
                    <div className="flex items-start gap-2.5">
                      <Icon className="h-4 w-4 mt-0.5 shrink-0" />
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-xs text-white truncate">{notif.title}</p>
                          <span className="font-mono text-[9px] text-muted-foreground shrink-0">
                            {new Date(notif.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-muted-foreground/80">{notif.message}</p>
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="text-center py-8 text-xs text-muted-foreground">No pending alerts.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row for dossiers & tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Cases / Dossiers */}
        <Card className="bg-card/45 border-white/[0.06] backdrop-blur-md rounded-xl">
          <CardHeader className="border-b border-white/[0.04] pb-4">
            <CardTitle className="text-sm font-semibold text-white">Active Dossiers</CardTitle>
            <CardDescription className="text-2xs font-mono">Quick inspection of registered matters</CardDescription>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="space-y-3">
              {recentCases.length > 0 ? recentCases.map((case_) => (
                <div
                  key={case_.id}
                  className="p-3.5 rounded-lg border border-white/[0.05] hover:border-primary/40 bg-black/20 hover:bg-black/30 transition-all cursor-pointer flex justify-between items-center"
                  onClick={() => navigate(`/cases/${case_.id}`)}
                >
                  <div className="min-w-0 pr-2">
                    <h3 className="font-semibold text-xs text-white truncate">{case_.title}</h3>
                    <p className="text-3xs font-mono text-muted-foreground/75 mt-0.5">{case_.client}</p>
                  </div>
                  <div className="px-2 py-0.5 bg-primary/10 rounded-full text-3xs text-primary font-mono capitalize border border-primary/20">
                    {case_.status}
                  </div>
                </div>
              )) : (
                <div className="text-center py-6 text-xs text-muted-foreground">No active cases. Create one in Cases.</div>
              )}
              <Button
                variant="outline"
                className="w-full text-xs rounded-lg border-white/[0.06] hover:bg-white/[0.03] mt-1 text-muted-foreground hover:text-white"
                onClick={() => navigate('/cases')}
              >
                Go to Case Registry
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Ingestion progress */}
        <Card className="bg-card/45 border-white/[0.06] backdrop-blur-md rounded-xl">
          <CardHeader className="border-b border-white/[0.04] pb-4">
            <CardTitle className="text-sm font-semibold text-white">Ingestion Queue</CardTitle>
            <CardDescription className="text-2xs font-mono">Document processing indexing progress</CardDescription>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="space-y-4">
              {tasks.length > 0 ? tasks.map((task) => (
                <div key={task.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-muted-foreground">{task.name}</span>
                    <span className="font-mono text-2xs text-primary">{task.completed}%</span>
                  </div>
                  <Progress value={task.completed} className="h-1 bg-white/[0.04] rounded-full" />
                </div>
              )) : (
                <div className="text-center py-6 text-xs text-muted-foreground">No active ingestion queues.</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Case Allocations breakdown */}
        <Card className="bg-card/45 border-white/[0.06] backdrop-blur-md rounded-xl">
          <CardHeader className="border-b border-white/[0.04] pb-4">
            <CardTitle className="text-sm font-semibold text-white">Status Allocation</CardTitle>
            <CardDescription className="text-2xs font-mono">Matters classification in Firestore</CardDescription>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="space-y-3">
              {caseStatus.length > 0 ? (
                caseStatus.map((status) => (
                  <div key={status.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: status.fill }} />
                      <span className="font-medium text-muted-foreground capitalize">{status.name}</span>
                    </div>
                    <span className="font-mono font-semibold text-white">{status.count} matters</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-muted-foreground">No active distributions.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
