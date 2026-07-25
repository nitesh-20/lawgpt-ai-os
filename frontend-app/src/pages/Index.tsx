
import { Scale, Briefcase, Clock, Calendar, Activity, TrendingUp, Users, ChevronRight, ChevronUp, BellRing, AlertCircle, CheckCircle2, BarChart3, LineChart, Layers } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [documentCount, setDocumentCount] = useState(0);
  const [caseStats, setCaseStats] = useState({
    totalCases: 0,
    pendingHearings: 0,
    upcomingHearings: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    // Get documents count
    const storedFiles = localStorage.getItem('storedFiles');
    if (storedFiles) {
      setDocumentCount(JSON.parse(storedFiles).length);
    }

    // Get cases data
    const storedCases = JSON.parse(localStorage.getItem('cases') || '[]');
    const today = new Date();
    const upcomingHearings = storedCases.reduce((count: number, case_: any) => {
      const nextDate = case_.next_date ? new Date(case_.next_date) : null;
      return nextDate && nextDate > today ? count + 1 : count;
    }, 0);

    setCaseStats({
      totalCases: storedCases.length,
      pendingHearings: storedCases.reduce((count: number, case_: any) => 
        count + (case_.hearings?.length || 0), 0),
      upcomingHearings
    });

    return () => clearTimeout(timer);
  }, []);

  const notifications = [
    { 
      id: 1, 
      type: 'hearing', 
      title: 'Upcoming Hearing',
      description: 'Smith v. Johnson hearing scheduled for tomorrow at 10:00 AM',
      time: '1 day',
      status: 'pending'
    },
    { 
      id: 2, 
      type: 'document', 
      title: 'Document Review Needed',
      description: 'Client contract awaiting your review',
      time: '2 hours',
      status: 'urgent'
    },
    { 
      id: 3, 
      type: 'case', 
      title: 'New Case Assigned',
      description: 'You have been assigned to Williams v. Tech Corp',
      time: '3 days',
      status: 'completed'
    }
  ];

  const stats = [
    { 
      title: 'Active Cases', 
      value: isLoading ? '-' : caseStats.totalCases, 
      icon: Scale, 
      trend: { value: 12, isPositive: true },
      bgGradient: 'from-primary/10 to-primary/30' 
    },
    { 
      title: 'Documents', 
      value: isLoading ? '-' : documentCount, 
      icon: Briefcase,
      trend: { value: 5, isPositive: true },
      bgGradient: 'from-secondary/10 to-secondary/30'
    },
    { 
      title: 'Total Hearings', 
      value: isLoading ? '-' : caseStats.pendingHearings, 
      icon: Clock,
      trend: { value: 8, isPositive: true },
      bgGradient: 'from-accent/10 to-accent/30'
    },
    { 
      title: 'Upcoming Hearings', 
      value: isLoading ? '-' : caseStats.upcomingHearings, 
      icon: Calendar,
      trend: { value: 3, isPositive: false },
      bgGradient: 'from-purple-400/10 to-purple-400/30'
    },
  ];

  const taskCompletionData = [
    { category: 'Document Review', completed: 65, total: 100 },
    { category: 'Client Meetings', completed: 80, total: 100 },
    { category: 'Court Filings', completed: 45, total: 100 },
    { category: 'Case Research', completed: 90, total: 100 },
  ];

  const caseStatusData = [
    { status: 'Active', count: 12, color: 'bg-blue-500' },
    { status: 'Pending', count: 8, color: 'bg-yellow-500' },
    { status: 'Resolved', count: 5, color: 'bg-green-500' },
    { status: 'Archived', count: 3, color: 'bg-gray-500' },
  ];

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
          <div className="p-2.5 bg-primary/10 rounded-md">
            <Scale className="h-5 w-5 text-primary" strokeWidth={1.75} />
          </div>
          <h1 className="page-title mb-0">Dashboard Overview</h1>
        </div>
        <p className="page-description">Monitor your legal practice performance and activity</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          {Array(4).fill(0).map((_, index) => (
            <div key={index} className="h-32 bg-muted rounded-lg animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="glass-card lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-xl font-bold gradient-text">Performance Metrics</CardTitle>
              <CardDescription>Monthly activity overview</CardDescription>
            </div>
            <Tabs defaultValue="tasks" className="w-[260px]">
              <TabsList className="bg-muted">
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
              {taskCompletionData.map((task, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{task.category}</span>
                    <span className="text-sm text-neutral-500">{task.completed}%</span>
                  </div>
                  <Progress value={task.completed} className="h-2" />
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
              <CardTitle className="text-xl font-bold gradient-text">Notifications</CardTitle>
              <Button variant="ghost" size="sm" onClick={handleNotificationClick} className="h-8 hover:bg-muted">
                <BellRing className="h-4 w-4 mr-2" />
                View All
              </Button>
            </div>
            <CardDescription>Recent updates and alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="p-3 bg-card rounded-md border border-border hover:border-primary/30 hover:bg-primary/5 cursor-pointer transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {notification.status === 'urgent' ? (
                      <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    ) : notification.status === 'completed' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                    ) : (
                      <BellRing className="h-5 w-5 text-blue-500 mt-0.5" />
                    )}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{notification.title}</p>
                        <span className="text-xs text-neutral-500">{notification.time}</span>
                      </div>
                      <p className="text-xs text-neutral-600">{notification.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="glass-card animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-xl font-bold gradient-text">Recent Cases</CardTitle>
              <CardDescription>Latest case updates</CardDescription>
            </div>
            <div className="p-2 bg-primary/10 rounded-md">
              <Activity className="h-5 w-5 text-primary" strokeWidth={1.75} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...JSON.parse(localStorage.getItem('cases') || '[]')]
                .slice(0, 3)
                .map((case_: any, i: number) => (
                  <div
                    key={i}
                    className="p-4 glass-card hover:border-primary/30 transition-colors cursor-pointer"
                    onClick={() => navigate(`/cases/${case_.id}`)}
                  >
                    <h3 className="font-medium text-base">{case_.party_name || `Case #${i+1}`}</h3>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-sm text-muted-foreground font-mono">Case #{case_.case_number || `C-${100+i}`}</p>
                      <div className="px-2.5 py-0.5 bg-primary/10 rounded-full text-xs text-primary font-medium">Active</div>
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

        <Card className="glass-card animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-xl font-bold gradient-text">Case Status</CardTitle>
              <CardDescription>Distribution by status</CardDescription>
            </div>
            <div className="p-2 bg-accent/10 rounded-md">
              <LineChart className="h-5 w-5 text-accent" strokeWidth={1.75} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="mt-4 space-y-4">
              {caseStatusData.map((status, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${status.color}`}></div>
                    <span className="text-sm font-medium">{status.status}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{status.count}</span>
                    <span className="text-xs text-neutral-500">cases</span>
                  </div>
                </div>
              ))}
              <div className="h-[150px] w-full flex items-end justify-around mt-6 px-4">
                {caseStatusData.map((status, index) => (
                  <div key={index} className="flex flex-col items-center gap-2">
                    <div 
                      className={`w-12 ${status.color} rounded-t-md`} 
                      style={{ height: `${(status.count / Math.max(...caseStatusData.map(d => d.count))) * 100}px` }}
                    ></div>
                    <span className="text-xs">{status.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-xl font-bold gradient-text">Team Activity</CardTitle>
              <CardDescription>Team performance metrics</CardDescription>
            </div>
            <div className="p-2 bg-accent/10 rounded-md">
              <Users className="h-5 w-5 text-accent" strokeWidth={1.75} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              <div className="p-4 glass-card">
                <h3 className="text-sm font-medium text-neutral-500 mb-1">Documents Created</h3>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">24</div>
                  <div className="flex items-center text-xs text-green-500">
                    <ChevronUp className="h-3 w-3" />
                    <span>8% from last week</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 glass-card">
                <h3 className="text-sm font-medium text-neutral-500 mb-1">Cases Assigned</h3>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">7</div>
                  <div className="flex items-center text-xs text-green-500">
                    <ChevronUp className="h-3 w-3" />
                    <span>12% from last week</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 glass-card">
                <h3 className="text-sm font-medium text-neutral-500 mb-1">Compliance Score</h3>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">92%</div>
                  <div className="flex items-center text-xs text-green-500">
                    <ChevronUp className="h-3 w-3" />
                    <span>5% from last week</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
