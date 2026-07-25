import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ChartContainer, ChartLegend, ChartTooltip } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { ArrowLeft, CalendarDays, Gavel, Clock, Trash2, FileText, TrendingUp, Users, Building, Scale, ArrowUpRight, Plus } from "lucide-react";
import { CaseHearing } from "@/components/cases/CaseHearing";
import { CaseTimeline } from "@/components/cases/CaseTimeline";
import { formatDate } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Hearing } from "@/types/case";

const CaseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [caseData, setCaseData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [newHearing, setNewHearing] = useState<Partial<Hearing>>({
    date: '',
    summary: '',
    stage: '',
    amount: 0
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      const storedCases = JSON.parse(localStorage.getItem('cases') || '[]');
      const currentCase = storedCases.find((c: any) => c.id === id);
      if (currentCase) {
        setCaseData(currentCase);
        setIsLoading(false);
      } else {
        navigate('/cases');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [id, navigate]);

  const handleAddHearing = () => {
    if (!newHearing.date || !newHearing.summary || !newHearing.stage) {
      toast({
        title: "Error",
        description: "Please fill all hearing details",
        variant: "destructive",
      });
      return;
    }

    const hearingToAdd: Hearing = {
      id: crypto.randomUUID(),
      case_id: id || '',
      date: newHearing.date || '',
      summary: newHearing.summary || '',
      stage: newHearing.stage || '',
      amount: newHearing.amount || 0,
      created_at: new Date().toISOString()
    };

    const updatedCase = {
      ...caseData,
      hearings: [...(caseData.hearings || []), hearingToAdd],
    };

    const storedCases = JSON.parse(localStorage.getItem('cases') || '[]');
    const updatedCases = storedCases.map((c: any) => 
      c.id === id ? updatedCase : c
    );

    localStorage.setItem('cases', JSON.stringify(updatedCases));
    setCaseData(updatedCase);
    setNewHearing({
      date: '',
      summary: '',
      stage: '',
      amount: 0
    });
    
    toast({
      title: "Success",
      description: "Hearing details added successfully",
    });
  };

  const handleDeleteCase = () => {
    const storedCases = JSON.parse(localStorage.getItem('cases') || '[]');
    const updatedCases = storedCases.filter((c: any) => c.id !== id);
    localStorage.setItem('cases', JSON.stringify(updatedCases));
    toast({
      title: "Success",
      description: "Case deleted successfully",
    });
    navigate('/cases');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <div className="mt-4 text-lg font-medium text-primary animate-pulse">Loading case details...</div>
        </div>
      </div>
    );
  }

  if (!caseData) return null;

  const chartData = (caseData.hearings || []).map((hearing: Hearing) => ({
    date: formatDate(hearing.date),
    amount: hearing.amount,
  }));

  const chartConfig = {
    amount: {
      label: "Amount per Hearing",
      theme: {
        light: "#4f46e5",
        dark: "#818cf8",
      },
    },
  };

  const hearingsByStage = (caseData.hearings || []).reduce((acc: any, hearing: Hearing) => {
    acc[hearing.stage] = (acc[hearing.stage] || 0) + 1;
    return acc;
  }, {});

  const pieChartData = Object.keys(hearingsByStage).map(stage => ({
    name: stage,
    value: hearingsByStage[stage]
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  return (
    <div className="min-h-screen fade-in">
      <main className="ml-0 md:ml-0 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
          <div className="flex justify-between items-center">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/cases')}
              className="hover:scale-105 transition-all"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Cases
            </Button>
            <Button 
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              className="hover:scale-105 transition-all"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Case
            </Button>
          </div>

          <div className="futuristic-card p-6 animate-scale-in overflow-visible">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div className="space-y-2">
                <Badge className="mb-2 bg-gradient-to-r from-primary to-accent border-none text-white">
                  {caseData.case_type || 'Civil'}
                </Badge>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {caseData.party_name}
                </h1>
                <div className="flex items-center gap-2 text-neutral-600">
                  <Scale className="h-4 w-4" />
                  <span className="text-sm">Case Number: {caseData.case_number}</span>
                </div>
              </div>
              
              <div className="mt-4 md:mt-0 flex flex-col md:items-end">
                <div className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 inline-flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    caseData.status === 'active' ? 'bg-green-500 animate-pulse' :
                    caseData.status === 'pending' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}></div>
                  <span className="font-medium capitalize">{caseData.status || 'Active'}</span>
                </div>
                <span className="text-xs text-neutral-500 mt-1">Updated: {formatDate(caseData.updated_at)}</span>
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full animate-fade-in">
            <TabsList className="bg-white/70 backdrop-blur-md w-full justify-start overflow-x-auto border border-white/60 p-1 rounded-xl shadow-md">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-accent/20 data-[state=active]:text-primary"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="hearings"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-accent/20 data-[state=active]:text-primary"
              >
                Hearings
              </TabsTrigger>
              <TabsTrigger 
                value="timeline"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-accent/20 data-[state=active]:text-primary"
              >
                Timeline
              </TabsTrigger>
              <TabsTrigger 
                value="financials"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-accent/20 data-[state=active]:text-primary"
              >
                Financials
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                  <div className="futuristic-card p-6">
                    <h2 className="text-xl font-semibold mb-4 futuristic-text">Case Details</h2>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-gradient-to-r from-primary/20 to-accent/20">
                          <Gavel className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-neutral-500">Court</p>
                          <p className="font-medium">{caseData.court_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-gradient-to-r from-primary/20 to-accent/20">
                          <Building className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-neutral-500">Jurisdiction</p>
                          <p className="font-medium">{caseData.jurisdiction || 'Federal'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-gradient-to-r from-primary/20 to-accent/20">
                          <CalendarDays className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-neutral-500">Filing Date</p>
                          <p className="font-medium">{formatDate(caseData.filing_date)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-gradient-to-r from-primary/20 to-accent/20">
                          <Clock className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-neutral-500">Stage</p>
                          <p className="font-medium">{caseData.stage || 'Pre-trial'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-gradient-to-r from-primary/20 to-accent/20">
                          <CalendarDays className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-neutral-500">Previous Date</p>
                          <p className="font-medium">{formatDate(caseData.previous_date)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-gradient-to-r from-primary/20 to-accent/20">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-neutral-500">Next Date</p>
                          <p className="font-medium">{formatDate(caseData.next_date)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="futuristic-card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold futuristic-text">Recent Activity</h2>
                      <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                        View All
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      {(caseData.hearings || []).slice(0, 3).map((hearing: Hearing, i: number) => (
                        <div key={i} className="p-4 neo-glass rounded-lg hover:shadow-md transition-all">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{hearing.stage}</h3>
                              <p className="text-sm text-neutral-600 mt-1">{hearing.summary}</p>
                            </div>
                            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                              {formatDate(hearing.date)}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      
                      {(caseData.hearings || []).length === 0 && (
                        <div className="text-center py-8 text-neutral-500">
                          <Clock className="h-8 w-8 mx-auto mb-2 text-neutral-400" />
                          <p>No hearing records found</p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2"
                            onClick={() => setActiveTab("hearings")}
                          >
                            <Plus className="h-4 w-4 mr-1" /> Add Hearing
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="futuristic-card p-6">
                    <h2 className="text-xl font-semibold mb-4 futuristic-text">Case Summary</h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">Hearings</span>
                        </div>
                        <span className="font-bold">{(caseData.hearings || []).length}</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">Parties</span>
                        </div>
                        <span className="font-bold">2</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">Documents</span>
                        </div>
                        <span className="font-bold">7</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">Total Value</span>
                        </div>
                        <span className="font-bold">
                          ${(caseData.hearings || []).reduce((sum: number, h: Hearing) => sum + (h.amount || 0), 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    
                    {(caseData.hearings || []).length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-sm font-medium mb-3">Hearings by Stage</h3>
                        <div className="h-[180px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={pieChartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={70}
                                fill="#8884d8"
                                paddingAngle={2}
                                dataKey="value"
                                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                              >
                                {pieChartData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="futuristic-card p-6">
                    <h2 className="text-xl font-semibold mb-4 futuristic-text">Related Cases</h2>
                    <div className="text-center py-4 text-neutral-500">
                      <p>No related cases found</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="hearings" className="mt-6 animate-fade-in space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 futuristic-card p-6">
                  <h2 className="text-xl font-semibold mb-4 futuristic-text">Hearing Records</h2>
                  
                  {(caseData.hearings || []).length === 0 ? (
                    <div className="text-center py-12 text-neutral-500">
                      <Clock className="h-12 w-12 mx-auto mb-3 text-neutral-400" />
                      <p className="text-lg">No hearing records found</p>
                      <p className="text-sm">Add your first hearing using the form</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {(caseData.hearings || []).map((hearing: Hearing, i: number) => (
                        <CaseHearing key={i} hearing={hearing} />
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="futuristic-card p-6">
                  <h2 className="text-xl font-semibold mb-4 futuristic-text">Add New Hearing</h2>
                  <div className="space-y-4">
                    <Input
                      type="date"
                      value={newHearing.date}
                      onChange={(e) => setNewHearing({ ...newHearing, date: e.target.value })}
                      className="w-full bg-white/70"
                    />
                    <Input
                      type="text"
                      value={newHearing.stage}
                      onChange={(e) => setNewHearing({ ...newHearing, stage: e.target.value })}
                      placeholder="Stage"
                      className="w-full bg-white/70"
                    />
                    <Input
                      type="number"
                      value={newHearing.amount}
                      onChange={(e) => setNewHearing({ ...newHearing, amount: Number(e.target.value) })}
                      placeholder="Amount"
                      className="w-full bg-white/70"
                    />
                    <Input
                      type="text"
                      value={newHearing.summary}
                      onChange={(e) => setNewHearing({ ...newHearing, summary: e.target.value })}
                      placeholder="Summary"
                      className="w-full bg-white/70"
                    />
                    <Button 
                      onClick={handleAddHearing}
                      className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white transition-all"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Hearing
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="timeline" className="mt-6 animate-fade-in">
              <div className="futuristic-card p-6">
                <h2 className="text-xl font-semibold mb-6 futuristic-text">Case Timeline</h2>
                <CaseTimeline hearings={caseData.hearings || []} />
              </div>
            </TabsContent>

            <TabsContent value="financials" className="mt-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="futuristic-card p-6">
                  <h2 className="text-xl font-semibold mb-4 futuristic-text">Financial Breakdown</h2>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="amount" name="Amount ($)" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="futuristic-card p-6">
                  <h2 className="text-xl font-semibold mb-4 futuristic-text">Cost Trend Analysis</h2>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="amount" name="Amount ($)" stroke="#7E69AB" strokeWidth={2} dot={{ r: 5 }} activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="neo-glass border-white/30">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the case
              and all its associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteCase}
              className="bg-gradient-to-r from-destructive to-red-400 text-white hover:opacity-90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CaseDetails;

