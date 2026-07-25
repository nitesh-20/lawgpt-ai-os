import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, Scale, FilterIcon, Calendar, Clipboard, Users, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { NewCaseDialog } from "@/components/cases/NewCaseDialog";
import { Case } from "@/types/case";
import { listCases, createCase, type CaseInput } from "@/services/cases";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Cases = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [showNewCaseDialog, setShowNewCaseDialog] = useState(false);
  const [cases, setCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState("recent");

  const fetchCasesData = () => {
    listCases().then((storedCases) => {
      setCases(storedCases);
      setIsLoading(false);
    }).catch(err => {
      console.error(err);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    fetchCasesData();
  }, []);

  const handleAddCase = async (newCase: CaseInput) => {
    try {
      const caseToAdd = await createCase(newCase);
      setCases((prevCases) => [caseToAdd, ...prevCases]);
      toast({
        title: "Success",
        description: "New case registered successfully.",
      });
      fetchCasesData();
    } catch (error) {
      console.error('Error adding case:', error);
      toast({
        title: "Error",
        description: "Failed to add case.",
        variant: "destructive",
      });
    }
  };

  const filteredCases = cases.filter(
    (case_) => {
      const matchesSearch = 
        (case_.party_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (case_.case_number || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (case_.court_name || "").toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTab = 
        activeTab === "all" || 
        (activeTab === "active" && case_.status === "active") ||
        (activeTab === "pending" && case_.status === "pending") ||
        (activeTab === "closed" && case_.status === "closed");
      
      return matchesSearch && matchesTab;
    }
  );

  const sortedCases = [...filteredCases].sort((a, b) => {
    if (sortBy === "recent") {
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    } else if (sortBy === "oldest") {
      return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
    } else if (sortBy === "name") {
      return (a.party_name || "").localeCompare(b.party_name || "");
    }
    return 0;
  });

  const caseStatistics = {
    total: cases.length,
    active: cases.filter(c => c.status === 'active').length,
    pending: cases.filter(c => c.status === 'pending').length,
    closed: cases.filter(c => c.status === 'closed').length
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <div className="text-2xs font-mono tracking-widest text-neutral-500 uppercase">Synchronizing Cases Registry</div>
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
              <Scale className="h-4.5 w-4.5 text-primary" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900">Cases Registry</h1>
          </div>
          <p className="text-xs text-neutral-500 font-mono uppercase tracking-wider">Manage dossiers, hearing schedules, and client files</p>
        </div>
        <Button onClick={() => setShowNewCaseDialog(true)} className="btn-primary">
          <PlusCircle className="mr-2 h-4 w-4" />
          Register Case
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { title: "Total Cases", value: caseStatistics.total, icon: Clipboard },
          { title: "Active Matters", value: caseStatistics.active, icon: Users },
          { title: "Pending Audits", value: caseStatistics.pending, icon: Clock },
          { title: "Upcoming hearings", value: cases.filter(c => c.next_date).length, icon: Calendar }
        ].map((item, idx) => (
          <div key={idx} className="glass-card p-5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono tracking-wider text-neutral-400 uppercase">{item.title}</span>
              <p className="text-xl font-bold text-neutral-900 mt-1">{item.value}</p>
            </div>
            <div className="w-8 h-8 rounded bg-neutral-50 flex items-center justify-center border border-border">
              <item.icon className="h-4 w-4 text-primary" />
            </div>
          </div>
        ))}
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            placeholder="Search dossiers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-premium pl-10 w-full text-xs"
          />
        </div>
        
        <div className="flex flex-wrap gap-2 items-center">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px] bg-white border border-border text-xs">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-border text-neutral-900">
              <SelectGroup>
                <SelectLabel className="text-3xs text-neutral-400">Order</SelectLabel>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="name">Client Name (A-Z)</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-border text-xs hover:bg-neutral-50">
                <FilterIcon className="mr-2 h-3.5 w-3.5 text-neutral-400" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white border border-border text-neutral-900">
              <DropdownMenuItem className="focus:bg-neutral-50 text-xs">Civil</DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-neutral-50 text-xs">Criminal</DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-neutral-50 text-xs">Corporate</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="space-y-4">
        <div className="flex border-b border-border gap-2 pb-px">
          {["all", "active", "pending", "closed"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-xs font-semibold tracking-wide uppercase border-b-2 transition-all duration-200 ${
                activeTab === tab 
                  ? "border-primary text-primary" 
                  : "border-transparent text-neutral-500 hover:text-neutral-900"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="glass-card overflow-hidden">
          <Table>
            <TableHeader className="bg-neutral-50 border-b border-border">
              <TableRow className="hover:bg-transparent border-b-0">
                <TableHead className="text-[10px] font-mono text-neutral-500 uppercase py-3.5">Client Name</TableHead>
                <TableHead className="text-[10px] font-mono text-neutral-500 uppercase py-3.5">Case/Title</TableHead>
                <TableHead className="text-[10px] font-mono text-neutral-500 uppercase py-3.5 hidden md:table-cell">Jurisdiction</TableHead>
                <TableHead className="text-[10px] font-mono text-neutral-500 uppercase py-3.5">Status</TableHead>
                <TableHead className="text-[10px] font-mono text-neutral-500 uppercase py-3.5 hidden md:table-cell">Next Hearing</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border">
              {sortedCases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-16 text-neutral-400">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <Scale className="h-8 w-8 text-neutral-300" strokeWidth={1.5} />
                      <p className="text-xs font-semibold text-neutral-800">No dossiers recorded</p>
                      <p className="text-3xs text-neutral-500 max-w-xs leading-relaxed">Register a new case to begin mapping schedules.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                sortedCases.map((case_) => (
                  <TableRow
                    key={case_.id}
                    className="cursor-pointer hover:bg-neutral-50/50 transition-colors"
                    onClick={() => navigate(`/cases/${case_.id}`)}
                  >
                    <TableCell className="font-semibold text-xs py-4 text-neutral-900">{case_.party_name}</TableCell>
                    <TableCell className="text-xs text-neutral-600">{case_.case_number}</TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-neutral-600">{case_.jurisdiction || 'Federal'}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={
                          case_.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 font-mono text-3xs' :
                          case_.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-200 font-mono text-3xs' :
                          'bg-neutral-50 text-neutral-500 border-neutral-200 font-mono text-3xs'
                        }
                      >
                        {case_.status || 'active'}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-neutral-600">
                      {case_.next_date ? (
                        <div className="flex items-center gap-1.5 font-mono text-2xs">
                          <Calendar className="h-3 w-3 text-primary" />
                          {new Date(case_.next_date).toLocaleDateString()}
                        </div>
                      ) : (
                        <span className="text-neutral-400">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <NewCaseDialog 
        open={showNewCaseDialog}
        onOpenChange={setShowNewCaseDialog}
        onSuccess={handleAddCase}
      />
    </div>
  );
};

export default Cases;
