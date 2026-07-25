import { Scale, Briefcase, Clock, Calendar, Activity, ChevronRight, ChevronUp, BellRing, AlertCircle, CheckCircle2, BarChart3, LineChart, Layers, ArrowUpRight } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  alert: { icon: AlertCircle, className: 'text-destructive border-destructive/20 bg-destructive/5' },
  success: { icon: CheckCircle2, className: 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5' },
  info: { icon: BellRing, className: 'text-blue-500 border-blue-500/20 bg-blue-500/5' },
  warning: { icon: AlertCircle, className: 'text-amber-500 border-amber-500/20 bg-amber-500/5' },
};

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [notifications, setNotifications] = useState<DashboardNotification[]>([]);
  const [tasks, setTasks] = useState<TaskCompletion[]>([]);
  const [caseStatus, setCaseStatus] = useState<CaseStatusCount[]>([]);
  const [team, setTeam] = useState<TeamMetric[]>([]);
  const [recentCases, setRecentCases] = useState<Case[]>([]);
  const { toast } = useToast();
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

  return (
    <div className="page-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header section with HSL gradients */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/65 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-primary/80 flex items-center justify-center shadow-md">
              <Scale className="h-5.5 w-5.5 text-primary-foreground" strokeWidth={1.5} />
            </div>
            <h1 className="text-3xl font-serif font-bold text-ink tracking-tight">Legal Command Center</h1>
          </div>
          <p className="text-muted-foreground text-sm">Real-time system telemetry and practice intelligence.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => navigate('/chatbot')} className="bg-primary text-primary-foreground shadow-sm hover:bg-primary/90">
            Ask Legal AI
            <ArrowUpRight className="ml-1.5 h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {Array(4).fill(0).map((_, index) => (
            <div key={index} className="h-32 bg-secondary/55 rounded-2xl animate-pulse border border-border/50" />
          ))}
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.45 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
        >
          {stats.map((stat, index) => (
            <StatCard 
              key={stat.title} 
              title={stat.title} 
              value={stat.value} 
              icon={STAT_ICONS[index] || Scale} 
              trend={stat.trend} 
            />
          ))}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-card/40 backdrop-blur-md border border-border/80 shadow-sm rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/50">
            <div>
              <CardTitle className="font-serif text-lg font-semibold text-ink">Ingestion Progress</CardTitle>
              <CardDescription>Task mapping for document analysis pipelines.</CardDescription>
            </div>
            <Layers className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-5">
              {tasks.length > 0 ? tasks.map((task) => (
                <div key={task.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{task.name}</span>
                    <span className="font-mono text-muted-foreground">{task.completed}% completed</span>
                  </div>
                  <Progress value={task.completed} className="h-2 rounded-full" />
                </div>
              )) : (
                <div className="text-center py-6 text-sm text-muted-foreground">No active analysis queues.</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-md border border-border/80 shadow-sm rounded-2xl">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="font-serif text-lg font-semibold text-ink">Alerts & System Audits</CardTitle>
            <CardDescription>Event log and security triggers.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
              {notifications.length > 0 ? notifications.map((notif) => {
                const style = NOTIFICATION_STYLE[notif.type] || NOTIFICATION_STYLE.info;
                const Icon = style.icon;
                return (
                  <div
                    key={notif.id}
                    className={`p-3.5 rounded-xl border ${style.className} transition-all duration-200 hover:scale-[1.01]`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className="h-5 w-5 mt-0.5 shrink-0" strokeWidth={1.5} />
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-sm text-ink truncate">{notif.title}</p>
                          <span className="font-mono text-2xs text-muted-foreground shrink-0">
                            {new Date(notif.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs leading-relaxed text-muted-foreground">{notif.message}</p>
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="text-center py-10 text-sm text-muted-foreground">No pending alerts.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-card/40 backdrop-blur-md border border-border/80 shadow-sm rounded-2xl">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="font-serif text-lg font-semibold text-ink">Active Dossiers</CardTitle>
            <CardDescription>Click to inspect details and hearings</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3.5">
              {recentCases.length > 0 ? recentCases.map((case_) => (
                <div
                  key={case_.id}
                  className="p-4 rounded-xl border border-border/60 hover:border-primary/45 bg-card/65 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
                  onClick={() => navigate(`/cases/${case_.id}`)}
                >
                  <h3 className="font-semibold text-sm text-ink truncate">{case_.title}</h3>
                  <div className="flex justify-between items-center mt-2.5">
                    <p className="font-mono text-xs text-muted-foreground">{case_.client}</p>
                    <div className="px-2 py-0.5 bg-primary/10 rounded-full text-2xs text-primary font-medium capitalize">
                      {case_.status}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-10 text-sm text-muted-foreground">No active cases. Create one inside Dossiers.</div>
              )}
              <Button
                variant="outline"
                className="w-full rounded-xl border-border/60 hover:bg-secondary/40 mt-2"
                onClick={() => navigate('/cases')}
              >
                Go to Case Registry
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-md border border-border/80 shadow-sm rounded-2xl">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="font-serif text-lg font-semibold text-ink">Case Allocations</CardTitle>
            <CardDescription>Audit statuses in Firestore</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {caseStatus.length > 0 ? (
                <>
                  {caseStatus.map((status) => (
                    <div key={status.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: status.fill }} />
                        <span className="font-medium text-foreground">{status.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-ink">{status.count}</span>
                        <span className="text-xs text-muted-foreground">matters</span>
                      </div>
                    </div>
                  ))}
                  <div className="h-[140px] w-full flex items-end justify-around mt-6 border-t border-border/30 pt-4">
                    {caseStatus.map((status) => (
                      <div key={status.name} className="flex flex-col items-center gap-2">
                        <div
                          className="w-12 rounded-t-md transition-all duration-300"
                          style={{ 
                            height: `${(status.count / Math.max(...caseStatus.map(d => d.count), 1)) * 90}px`,
                            backgroundColor: status.fill
                          }}
                        />
                        <span className="text-2xs text-muted-foreground capitalize">{status.name}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-10 text-sm text-muted-foreground">No case distributions.</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-md border border-border/80 shadow-sm rounded-2xl">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="font-serif text-lg font-semibold text-ink">Active Metrics</CardTitle>
            <CardDescription>Global performance and hours worked</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {team.length > 0 ? team.map((metric) => (
                <div key={metric.name} className="p-4 rounded-xl border border-border/60 bg-card/65">
                  <h3 className="text-2xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{metric.name}</h3>
                  <div className="flex items-center justify-between">
                    <div className="font-mono text-2xl font-semibold text-ink">{metric.cases} cases</div>
                    <div className="flex items-center gap-1 text-xs text-emerald-500 font-medium">
                      <ChevronUp className="h-4 w-4" />
                      <span>{metric.hours} hours logged</span>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-10 text-sm text-muted-foreground">No telemetry metrics compiled.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
