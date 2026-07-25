import { useEffect, useState } from "react";
import { Shield, TriangleAlert, ShieldCheck, Lightbulb, History, Download, Play, FileText, CheckCircle2, Loader2 } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  getComplianceSnapshot, 
  checkCompliance, 
  generateComplianceReport, 
  getComplianceHistory 
} from "@/services/compliance";
import { listDocuments } from "@/services/documents";
import type { ComplianceSnapshot } from "@/types/compliance";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AudioPlaybackButton } from "@/components/voice/AudioPlaybackButton";

const ComplianceChecker = () => {
  const [snapshot, setSnapshot] = useState<ComplianceSnapshot>({
    complianceScore: 85,
    riskScore: 15,
    documentsReviewed: 0,
    lastScan: "",
    categoryScores: [
      { category: "Corporate", score: 90 },
      { category: "Labor Laws", score: 80 },
      { category: "SEBI Guide", score: 85 }
    ],
    violations: [],
    recommendations: [],
  });
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Audit Form state
  const [auditQuery, setAuditQuery] = useState("");
  const [auditDocId, setAuditDocId] = useState("");
  const [auditRegs, setAuditRegs] = useState("sebi_regulations");
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<any | null>(null);

  const fetchComplianceData = () => {
    Promise.all([
      getComplianceSnapshot(),
      getComplianceHistory(),
      listDocuments()
    ]).then(([snap, hist, docs]) => {
      if (snap && snap.categoryScores) {
        setSnapshot(snap);
      }
      setHistoryLogs(hist);
      setDocuments(docs);
      setIsLoading(false);
    }).catch(err => {
      console.error(err);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    fetchComplianceData();
  }, []);

  const handleAudit = async () => {
    setIsAuditing(true);
    setAuditResult(null);
    try {
      const regList = auditRegs.split(",").map(r => r.trim()).filter(Boolean);
      const res = await checkCompliance({
        query: auditQuery || undefined,
        document_id: auditDocId || undefined,
        regulation_ids: regList.length ? regList : undefined
      });
      
      setAuditResult(res.data || res);
      toast({ title: "Compliance Audit Completed", description: "Vulnerabilities and regulations evaluated." });
      fetchComplianceData();
    } catch (e) {
      toast({ title: "Error", description: "Audit failed.", variant: "destructive" });
    } finally {
      setIsAuditing(false);
    }
  };

  const handleDownloadMarkdownReport = async () => {
    try {
      const regList = auditRegs.split(",").map(r => r.trim()).filter(Boolean);
      const res = await generateComplianceReport({
        query: auditQuery || undefined,
        document_id: auditDocId || undefined,
        regulation_ids: regList.length ? regList : undefined,
        report_format: "markdown"
      });

      if (res && res.report) {
        const blob = new Blob([res.report], { type: "text/markdown;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "compliance_report.md");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({ title: "Report Exported", description: "Downloaded compliance_report.md" });
      }
    } catch (e) {
      toast({ title: "Error", description: "Report export failed.", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <div className="text-2xs font-mono tracking-widest text-neutral-500 uppercase">Analyzing compliance calendars</div>
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
              <Shield className="h-4.5 w-4.5 text-primary" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900">Compliance Audit</h1>
          </div>
          <p className="text-xs text-neutral-500 font-mono uppercase tracking-wider">
            Portfolio posture across {snapshot.documentsReviewed || documents.length} reviewed files
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          { title: "Compliance Index", value: `${snapshot.complianceScore || 100}%`, icon: ShieldCheck, color: "text-emerald-600" },
          { title: "Portfolio Risk Factor", value: `${snapshot.riskScore || 0}%`, icon: TriangleAlert, color: "text-red-500" },
          { title: "Indexed Documents", value: snapshot.documentsReviewed || documents.length, icon: Shield, color: "text-primary" }
        ].map((item, idx) => (
          <div key={idx} className="glass-card p-5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono tracking-wider text-neutral-400 uppercase">{item.title}</span>
              <p className={`text-xl font-bold mt-1 text-neutral-900`}>{item.value}</p>
            </div>
            <div className="w-8 h-8 rounded bg-neutral-50 flex items-center justify-center border border-border">
              <item.icon className={`h-4.5 w-4.5 ${item.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Audit Planner vs Recharts metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6 items-start">
        {/* Compliance checker form */}
        <div className="glass-card p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <span className="text-[10px] font-mono text-primary uppercase">Trigger Compliance Check</span>
          </div>

          <div className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-[9px] font-mono text-neutral-500 uppercase">Operational workflow query to audit:</label>
              <textarea 
                value={auditQuery}
                onChange={(e) => setAuditQuery(e.target.value)}
                placeholder="e.g. Verify if sharing employee identifiers violates the personal privacy norms under the DPDP Act..."
                className="w-full input-premium min-h-[70px] text-xs py-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-mono text-neutral-500 uppercase">Audit Target File:</label>
                <select 
                  value={auditDocId}
                  onChange={(e) => setAuditDocId(e.target.value)}
                  className="w-full input-premium text-xs"
                >
                  <option value="">Choose document context...</option>
                  {documents.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-mono text-neutral-500 uppercase">Regulation IDs (Comma Separated):</label>
                <input 
                  type="text" 
                  value={auditRegs}
                  onChange={(e) => setAuditRegs(e.target.value)}
                  placeholder="e.g. sebi_regulations, dpdp"
                  className="w-full input-premium text-xs"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={handleAudit} disabled={isAuditing} className="flex-1 btn-primary">
                {isAuditing ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : <Play className="h-3.5 w-3.5 mr-2" />}
                Run Live Compliance Audit
              </Button>
              {auditResult && (
                <Button onClick={handleDownloadMarkdownReport} className="btn-secondary">
                  <Download className="h-4 w-4 mr-1.5" />
                  Report MD
                </Button>
              )}
            </div>
          </div>

          {auditResult && (
            <div className="pt-4 border-t border-border space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono text-primary uppercase">Audit Results:</span>
                <AudioPlaybackButton text={auditResult.executive_summary || auditResult.message || "Audit parsed successfully."} />
              </div>
              <div className="p-3.5 bg-neutral-50 border border-border rounded text-2xs space-y-2 max-h-[250px] overflow-y-auto">
                <p className="font-semibold text-neutral-800">Status: {auditResult.status || "Completed"}</p>
                <p className="leading-relaxed text-neutral-600">{auditResult.executive_summary || auditResult.message || "Audit parsed successfully."}</p>
                
                {auditResult.compliance_gaps && auditResult.compliance_gaps.map((gap: any, idx: number) => (
                  <div key={idx} className="p-2.5 bg-red-50 border border-red-100 rounded text-red-900 mt-2">
                    <p className="font-semibold">{gap.rule_id || "Gap detected"}:</p>
                    <p className="mt-0.5">{gap.findings}</p>
                    <p className="mt-1 font-mono text-[9px] text-red-500">Section: {gap.regulatory_section}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Recharts chart */}
        <div className="glass-card p-6">
          <h2 className="text-[10px] font-mono tracking-wider text-neutral-400 uppercase mb-6">Compliance By Rule Category</h2>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={snapshot.categoryScores} margin={{ top: 10, right: 10, left: -30, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="rgba(0,0,0,0.04)" />
                <XAxis
                  dataKey="category"
                  stroke="#888888"
                  fontSize={9}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  stroke="#888888"
                  fontSize={9}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(0,0,0,0.01)" }}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e4e4e7', borderRadius: '4px', fontSize: '10px' }}
                />
                <Bar dataKey="score" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Audit Logs list */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-primary" />
          <h2 className="text-xs font-mono uppercase text-neutral-800 tracking-wider">Audit History Logs</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {historyLogs.length > 0 ? (
            historyLogs.map((log, idx) => (
              <div key={idx} className="glass-card p-4 space-y-2">
                <div className="flex justify-between items-center text-[9px] font-mono text-neutral-400">
                  <span>SCAN COMPLETED</span>
                  <span>{log.timestamp ? new Date(log.timestamp).toLocaleString() : "Just Now"}</span>
                </div>
                <p className="font-semibold text-xs text-neutral-900 leading-snug line-clamp-2">{log.executive_summary || "Audit log entry"}</p>
                <div className="flex items-center gap-2 pt-2 border-t border-border/60">
                  <Badge variant="outline" className="text-3xs font-mono bg-emerald-50 text-emerald-600 border-emerald-200">
                    SCORE: {log.metrics?.overall_compliance_score || 100}%
                  </Badge>
                  <span className="text-3xs font-mono text-neutral-400 ml-auto">RISK: {log.metrics?.risk_level || "LOW"}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-8 text-xs text-neutral-400">No previous audits found. Run an audit to log entries.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplianceChecker;
