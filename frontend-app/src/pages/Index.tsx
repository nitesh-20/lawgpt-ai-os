import { Scale, Briefcase, Clock, Calendar, Activity, ChevronRight, ChevronUp, BellRing, AlertCircle, CheckCircle2, BarChart3, LineChart, Layers } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import {
  dashboardStats,
  dashboardNotifications,
  taskCompletion,
  caseStatusBreakdown,
  teamActivity,
  type CaseStatusKey,
} from '@/data/dashboardMock';

const STAT_ICONS = [Scale, Briefcase, Clock, Calendar];

const STATUS_DOT: Record<CaseStatusKey, string> = {
  active: 'bg-primary',
  pending: 'bg-accent',
  resolved: 'bg-primary/60',
  archived: 'bg-muted-foreground',
};

const NOTIFICATION_ICON = {
  urgent: { Icon: AlertCircle, className: 'text-destructive' },
  completed: { Icon: CheckCircle2, className: 'text-primary' },
  pending: { Icon: BellRing, className: 'text-accent' },
};

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const recentCases = [...JSON.parse(localStorage.getItem('cases') || '[]')].slice(0, 3);

  const handleNotificationClick = () => {
    toast({
      title: "Notification System",
      description: "Viewing all notifications...",
    });
  };

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <Scale className="h-5 w-5 text-primary-foreground" strokeWidth={1.75} />
          </div>
          <h1 className="page-title mb-0">Dashboard Overview</h1>
        </div>
        <p className="page-description">Monitor your legal practice performance and activity</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          {Array(4).fill(0).map((_, index) => (
            <div key={index} className="h-32 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          {dashboardStats.map((stat, index) => (
            <StatCard key={stat.title} title={stat.title} value={stat.value} icon={STAT_ICONS[index]} trend={stat.trend} />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="glass-card lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="font-serif text-xl font-semibold text-ink">Performance Metrics</CardTitle>
              <CardDescription>Monthly activity overview</CardDescription>
            </div>
            <Tabs defaultValue="tasks" className="w-[260px]">
              <TabsList>
                <TabsTrigger value="tasks">
                  <Layers className="h-4 w-4 mr-2" />
                  Tasks
                </TabsTrigger>
                <TabsTrigger value="cases">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Cases
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <div className="mt-2 space-y-4">
              {taskCompletion.map((task) => (
                <div key={task.category} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{task.category}</span>
                    <span className="font-mono text-sm text-muted-foreground">{task.completed}%</span>
                  </div>
                  <Progress value={task.completed} className="h-1.5" />
                </div>
              ))}
              <div className="flex justify-end mt-4">
                <Button variant="link" className="gap-1 text-primary">
                  View detailed report
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="font-serif text-xl font-semibold text-ink">Notifications</CardTitle>
              <Button variant="ghost" size="sm" onClick={handleNotificationClick} className="h-8">
                <BellRing className="h-4 w-4 mr-2" />
                View All
              </Button>
            </div>
            <CardDescription>Recent updates and alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardNotifications.map((notification) => {
                const { Icon, className } = NOTIFICATION_ICON[notification.status];
                return (
                  <div
                    key={notification.id}
                    className="p-3 bg-card rounded-md border border-border hover:border-primary/30 hover:bg-secondary/40 cursor-pointer transition-colors duration-200"
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${className}`} strokeWidth={1.75} />
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-sm text-ink">{notification.title}</p>
                          <span className="font-mono text-xs text-muted-foreground shrink-0">{notification.time}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{notification.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="font-serif text-xl font-semibold text-ink">Recent Cases</CardTitle>
              <CardDescription>Latest case updates</CardDescription>
            </div>
            <div className="p-2 bg-muted rounded-md">
              <Activity className="h-5 w-5 text-primary" strokeWidth={1.75} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentCases.map((case_: any, i: number) => (
                <div
                  key={case_.id ?? i}
                  className="p-4 rounded-md border border-border hover:border-primary/30 transition-colors duration-200 cursor-pointer"
                  onClick={() => navigate(`/cases/${case_.id}`)}
                >
                  <h3 className="font-medium text-base text-ink">{case_.party_name || `Case #${i + 1}`}</h3>
                  <div className="flex justify-between items-center mt-2">
                    <p className="font-mono text-sm text-muted-foreground">{case_.case_number || `C-${100 + i}`}</p>
                    <div className="px-2.5 py-0.5 bg-primary/10 rounded-full text-xs text-primary font-medium capitalize">
                      {case_.status || 'active'}
                    </div>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={() => navigate('/cases')}
              >
                View All Cases
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="font-serif text-xl font-semibold text-ink">Case Status</CardTitle>
              <CardDescription>Distribution by status</CardDescription>
            </div>
            <div className="p-2 bg-muted rounded-md">
              <LineChart className="h-5 w-5 text-accent" strokeWidth={1.75} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="mt-4 space-y-4">
              {caseStatusBreakdown.map((status) => (
                <div key={status.key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${STATUS_DOT[status.key]}`} />
                    <span className="text-sm font-medium text-foreground">{status.status}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium text-ink">{status.count}</span>
                    <span className="text-xs text-muted-foreground">cases</span>
                  </div>
                </div>
              ))}
              <div className="h-[150px] w-full flex items-end justify-around mt-6 px-4">
                {caseStatusBreakdown.map((status) => (
                  <div key={status.key} className="flex flex-col items-center gap-2">
                    <div
                      className={`w-12 ${STATUS_DOT[status.key]} rounded-t-md`}
                      style={{ height: `${(status.count / Math.max(...caseStatusBreakdown.map(d => d.count))) * 100}px` }}
                    />
                    <span className="text-xs text-muted-foreground">{status.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="font-serif text-xl font-semibold text-ink">Team Activity</CardTitle>
              <CardDescription>Team performance metrics</CardDescription>
            </div>
            <div className="p-2 bg-muted rounded-md">
              <Activity className="h-5 w-5 text-accent" strokeWidth={1.75} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              {teamActivity.map((metric) => (
                <div key={metric.label} className="p-4 rounded-md border border-border">
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">{metric.label}</h3>
                  <div className="flex items-center justify-between">
                    <div className="font-mono text-2xl font-medium text-ink">{metric.value}</div>
                    <div className="flex items-center gap-1 text-xs text-primary">
                      <ChevronUp className="h-3 w-3" />
                      <span>{metric.trendLabel}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
