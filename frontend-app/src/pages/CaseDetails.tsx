import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Tooltip } from "recharts";
import { ArrowLeft, CalendarDays, Gavel, Clock, Trash2, FileText, TrendingUp, Users, Building, Scale, Plus } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Case, Hearing } from "@/types/case";
import { getCase, addHearing, deleteCase } from "@/services/cases";

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1'];

const CaseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [newHearing, setNewHearing] = useState<Partial<Hearing>>({
    date: '',
    summary: '',
    stage: '',
    amount: 0
  });

  const fetchCaseDetail = () => {
    if (!id) return;
    getCase(id).then((currentCase) => {
      if (currentCase) {
        setCaseData(currentCase);
        setIsLoading(false);
      } else {
        navigate('/cases');
      }
    }).catch(err => {
      console.error(err);
      navigate('/cases');
    });
  };

  useEffect(() => {
    fetchCaseDetail();
  }, [id, navigate]);

  const handleAddHearing = async () => {
    if (!id || !newHearing.date || !newHearing.summary || !newHearing.stage) {
      toast({
        title: "Error",
        description: "Please fill all hearing details.",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedCase = await addHearing(id, {
        date: newHearing.date || '',
        summary: newHearing.summary || '',
        stage: newHearing.stage || '',
        amount: newHearing.amount || 0,
      });

      setCaseData(updatedCase);
      setNewHearing({
        date: '',
        summary: '',
        stage: '',
        amount: 0
      });

      toast({
        title: "Success",
        description: "Hearing details registered successfully.",
      });
      fetchCaseDetail();
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to add hearing.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCase = async () => {
    if (!id) return;
    try {
      await deleteCase(id);
      toast({
        title: "Success",
        description: "Case deleted successfully.",
      });
      navigate('/cases');
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to delete case.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <div className="text-2xs font-mono tracking-widest text-neutral-500 uppercase">Synchronizing Dossier Details</div>
      </div>
    );
  }

  if (!caseData) return null;

  const chartData = (caseData.hearings || []).map((hearing: Hearing) => ({
    date: formatDate(hearing.date),
    amount: hearing.amount || 0,
  }));

  const hearingsByStage = (caseData.hearings || []).reduce((acc: any, hearing: Hearing) => {
    acc[hearing.stage] = (acc[hearing.stage] || 0) + 1;
    return acc;
  }, {});

  const pieChartData = Object.keys(hearingsByStage).map(stage => ({
    name: stage,
    value: hearingsByStage[stage]
  }));
  const containerVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 85,
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
      className="space-y-8 max-w-5xl mx-auto px-4 md:px-6 pb-12"
    >
      {/* Back button and actions */}
      <div className="flex justify-between items-center">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/cases')}
          className="text-2xs font-mono font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 hover:bg-neutral-100 rounded-lg h-9 px-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4 shrink-0" />
          Back to Cases
        </Button>
        <Button 
          variant="destructive"
          onClick={() => setShowDeleteDialog(true)}
          className="bg-red-50 hover:bg-red-100 text-red-655 border border-red-200/60 text-2xs font-mono font-bold uppercase tracking-wider h-9 px-4 rounded-lg shadow-3xs"
        >
          <Trash2 className="mr-2 h-4 w-4 shrink-0" />
          Delete Case
        </Button>
      </div>

      {/* Hero Dossier Header */}
      <motion.div 
        variants={itemVariants}
        className="bg-white border border-neutral-200 p-6 rounded-2xl relative overflow-hidden shadow-3xs"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-mono uppercase tracking-wider font-bold py-0.5 rounded">
              {caseData.case_type || 'Civil'}
            </Badge>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900 font-sans">
              {caseData.party_name}
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Scale className="h-4 w-4 text-emerald-600 animate-pulse" />
              <span>Case ID: <span className="font-mono text-2xs font-bold">{caseData.case_number}</span></span>
            </div>
          </div>
          
          <div className="flex flex-col md:items-end gap-1.5">
            <div className="px-3 py-1.5 rounded-lg bg-neutral-50 border border-neutral-200 inline-flex items-center gap-2 shadow-3xs">
              <span className={`w-1.5 h-1.5 rounded-full ${caseData.status === 'active' ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`} />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-800 font-mono">{caseData.status || 'Active'}</span>
            </div>
            <span className="text-3xs text-slate-400 font-mono uppercase font-bold">UPDATED {new Date(caseData.updated_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="space-y-6">
        <div className="flex border-b border-neutral-100 gap-2 pb-px">
          {["overview", "hearings", "timeline", "financials"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-2xs font-mono font-bold uppercase tracking-wider border-b-2 transition-all duration-200 ${
                activeTab === tab 
                  ? "border-emerald-600 text-emerald-700" 
                  : "border-transparent text-slate-400 hover:text-slate-900"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="min-h-[400px]">
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6 animate-fade-in font-sans">
              <div className="space-y-6">
                {/* Meta details */}
                <div className="bg-white border border-neutral-200 p-6 rounded-2xl shadow-3xs">
                  <h2 className="text-[10px] font-mono tracking-wider text-slate-400 uppercase mb-6 font-bold">Case Parameters</h2>
                  <div className="grid grid-cols-2 gap-6">
                    {[
                      { icon: Gavel, label: "Court", val: caseData.court_name },
                      { icon: Building, label: "Jurisdiction", val: caseData.jurisdiction || 'Federal' },
                      { icon: CalendarDays, label: "Filing Date", val: caseData.filing_date ? new Date(caseData.filing_date).toLocaleDateString() : 'N/A' },
                      { icon: Clock, label: "Stage", val: caseData.stage || 'Pre-trial' }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-neutral-50 border border-neutral-200/50 shadow-3xs">
                          <item.icon className="h-4.5 w-4.5 text-emerald-605" />
                        </div>
                        <div>
                          <p className="text-[9px] font-mono text-slate-400 uppercase font-bold">{item.label}</p>
                          <p className="text-xs font-semibold text-slate-805 mt-0.5">{item.val}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent activity hearings */}
                <div className="bg-white border border-neutral-200 p-6 rounded-2xl shadow-3xs">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold">Recent Hearing Records</h2>
                    <Button variant="ghost" size="sm" className="text-[9px] font-mono uppercase text-emerald-700 font-bold hover:bg-emerald-50 h-6 px-2.5 rounded" onClick={() => setActiveTab("hearings")}>
                      Manage Hearings
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {(caseData.hearings || []).slice(0, 3).map((hearing: Hearing, idx: number) => (
                      <div key={idx} className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/30 shadow-3xs hover:border-emerald-600/30 transition-colors">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h3 className="font-bold text-xs text-slate-800 font-sans">{hearing.stage}</h3>
                            <p className="text-2xs text-slate-500 mt-1 leading-relaxed font-serif">{hearing.summary}</p>
                          </div>
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-mono text-[9px] uppercase font-bold py-0.5 rounded shrink-0">
                            {new Date(hearing.date).toLocaleDateString()}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    
                    {(caseData.hearings || []).length === 0 && (
                      <div className="text-center py-8 text-xs text-slate-400 font-serif italic bg-neutral-50/50 border border-neutral-200 rounded-xl">
                        No hearing records found.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar stats panel */}
              <div className="space-y-6">
                <div className="bg-white border border-neutral-200 p-6 rounded-2xl shadow-3xs">
                  <h2 className="text-[10px] font-mono tracking-wider text-slate-400 uppercase mb-6 font-bold">Matter Summary</h2>
                  <div className="space-y-4">
                    {[
                      { icon: CalendarDays, label: "Total Hearings", val: (caseData.hearings || []).length },
                      { icon: Users, label: "Active Parties", val: 2 },
                      { icon: FileText, label: "Referenced Documents", val: 3 },
                      { icon: TrendingUp, label: "Settlement Value", val: `$${(caseData.hearings || []).reduce((sum: number, h: Hearing) => sum + (h.amount || 0), 0).toLocaleString()}` }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 shadow-3xs">
                        <div className="flex items-center gap-2">
                          <item.icon className="h-4.5 w-4.5 text-emerald-600" />
                          <span className="text-xs text-slate-550 font-semibold">{item.label}</span>
                        </div>
                        <span className="text-xs font-semibold text-slate-800 font-mono">{item.val}</span>
                      </div>
                    ))}
                  </div>

                  {pieChartData.length > 0 && (
                    <div className="mt-8 border-t border-neutral-100 pt-6">
                      <h3 className="text-[10px] font-mono text-slate-400 mb-4 uppercase font-bold">Hearings distribution</h3>
                      <div className="h-[150px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieChartData}
                              cx="50%"
                              cy="50%"
                              innerRadius={30}
                              outerRadius={55}
                              fill="#8884d8"
                              paddingAngle={2}
                              dataKey="value"
                            >
                              {pieChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e4e4e7', fontSize: '10px' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "hearings" && (
            <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6 animate-fade-in">
              <div className="glass-card p-6">
                <h2 className="text-[10px] font-mono tracking-wider text-neutral-400 uppercase mb-6">Hearing Registry Log</h2>
                {(caseData.hearings || []).length === 0 ? (
                  <div className="text-center py-12 text-neutral-400 text-xs">
                    No hearings scheduled for this case yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(caseData.hearings || []).map((hearing: Hearing, i: number) => (
                      <CaseHearing key={i} hearing={hearing} />
                    ))}
                  </div>
                )}
              </div>

              <div className="glass-card p-6 h-fit space-y-4">
                <h2 className="text-[10px] font-mono tracking-wider text-neutral-400 uppercase">Log New Hearing</h2>
                <div className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono uppercase text-neutral-500">Hearing Date</label>
                    <input
                      type="date"
                      value={newHearing.date}
                      onChange={(e) => setNewHearing({ ...newHearing, date: e.target.value })}
                      className="input-premium w-full text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono uppercase text-neutral-500">Hearing Stage</label>
                    <input
                      type="text"
                      value={newHearing.stage || ''}
                      onChange={(e) => setNewHearing({ ...newHearing, stage: e.target.value })}
                      placeholder="e.g. Cross examination, Argument"
                      className="input-premium w-full text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono uppercase text-neutral-500">Hearing Cost ($)</label>
                    <input
                      type="number"
                      value={newHearing.amount || ''}
                      onChange={(e) => setNewHearing({ ...newHearing, amount: Number(e.target.value) })}
                      placeholder="e.g. 1500"
                      className="input-premium w-full text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono uppercase text-neutral-500">Session Summary</label>
                    <input
                      type="text"
                      value={newHearing.summary || ''}
                      onChange={(e) => setNewHearing({ ...newHearing, summary: e.target.value })}
                      placeholder="Enter session highlights"
                      className="input-premium w-full text-xs"
                    />
                  </div>
                  <Button
                    onClick={handleAddHearing}
                    className="w-full btn-primary"
                  >
                    <Plus className="mr-2 h-4 w-4 text-white" />
                    Record Hearing
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "timeline" && (
            <div className="glass-card p-6 animate-fade-in">
              <h2 className="text-[10px] font-mono tracking-wider text-neutral-400 uppercase mb-6">Procedural Timeline</h2>
              <CaseTimeline hearings={caseData.hearings || []} />
            </div>
          )}

          {activeTab === "financials" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
              <div className="glass-card p-6">
                <h2 className="text-[10px] font-mono tracking-wider text-neutral-400 uppercase mb-6">Cost Distribution</h2>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
                      <XAxis dataKey="date" stroke="#888888" fontSize={9} />
                      <YAxis stroke="#888888" fontSize={9} />
                      <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e4e4e7', fontSize: '10px' }} />
                      <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-card p-6">
                <h2 className="text-[10px] font-mono tracking-wider text-neutral-400 uppercase mb-6">Cost Trend Curve</h2>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
                      <XAxis dataKey="date" stroke="#888888" fontSize={9} />
                      <YAxis stroke="#888888" fontSize={9} />
                      <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e4e4e7', fontSize: '10px' }} />
                      <Line type="monotone" dataKey="amount" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-white border border-neutral-200 text-neutral-900 shadow-xl rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-neutral-900 font-sans font-bold">Delete this Dossier?</AlertDialogTitle>
            <AlertDialogDescription className="text-neutral-500 font-serif leading-relaxed">
              This action cannot be undone. It will permanently delete this case record and associated hearings from Firestore.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="font-sans">
            <AlertDialogCancel className="bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-800 rounded-lg">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteCase}
              className="bg-red-600 hover:bg-red-700 text-white rounded-lg"
            >
              Delete Case
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default CaseDetails;
