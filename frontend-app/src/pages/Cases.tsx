import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search, Scale, FilterIcon, Calendar, ArrowUpDown, ChevronRight, Clock, Clipboard, Users } from "lucide-react";
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
import { motion } from "framer-motion";

const Cases = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [showNewCaseDialog, setShowNewCaseDialog] = useState(false);
  const [cases, setCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState("recent");

  useEffect(() => {
    listCases().then((storedCases) => {
      setCases(storedCases);
      setIsLoading(false);
    }).catch(err => {
      console.error(err);
      setIsLoading(false);
    });
  }, []);

  const handleAddCase = async (newCase: CaseInput) => {
    try {
      const caseToAdd = await createCase(newCase);
      setCases((prevCases) => [caseToAdd, ...prevCases]);
      toast({
        title: "Success",
        description: "New case has been registered successfully",
      });
    } catch (error) {
      console.error('Error adding case:', error);
      toast({
        title: "Error",
        description: "Failed to add case. Please try again.",
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
      <div className="space-y-6 max-w-7xl mx-auto px-4 md:px-6">
        <div className="h-10 w-1/4 bg-white/[0.03] animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-24 bg-white/[0.02] border border-white/[0.04] rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 md:px-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Scale className="h-4.5 w-4.5 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Cases Registry</h1>
          </div>
          <p className="text-xs text-muted-foreground/80 font-mono uppercase tracking-wider">Manage dossiers, hearing schedules, and client files</p>
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
              <span className="text-3xs font-mono tracking-wider text-muted-foreground/80 uppercase">{item.title}</span>
              <p className="text-2xl font-bold text-white mt-1">{item.value}</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-white/[0.03] flex items-center justify-center border border-white/[0.05]">
              <item.icon className="h-4 w-4 text-primary" />
            </div>
          </div>
        ))}
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search dossiers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-premium pl-10 w-full text-sm"
          />
        </div>
        
        <div className="flex flex-wrap gap-2 items-center">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px] bg-black/40 border-white/[0.08] text-xs">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-card border-white/[0.08] text-white">
              <SelectGroup>
                <SelectLabel className="text-2xs text-muted-foreground">Order</SelectLabel>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="name">Client Name (A-Z)</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-white/[0.08] text-xs hover:bg-white/[0.04]">
                <FilterIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card border-white/[0.08] text-white">
              <DropdownMenuItem className="focus:bg-white/[0.04] text-xs">Civil</DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-white/[0.04] text-xs">Criminal</DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-white/[0.04] text-xs">Corporate</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="space-y-4">
        <div className="flex border-b border-white/[0.06] gap-2 pb-px">
          {["all", "active", "pending", "closed"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-xs font-semibold tracking-wide uppercase border-b-2 transition-all duration-200 ${
                activeTab === tab 
                  ? "border-primary text-primary" 
                  : "border-transparent text-muted-foreground hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="glass-card overflow-hidden border-white/[0.06]">
          <Table>
            <TableHeader className="bg-white/[0.01] border-b border-white/[0.06]">
              <TableRow className="hover:bg-transparent border-b-0">
                <TableHead className="text-2xs font-mono text-muted-foreground uppercase py-3.5">Client Name</TableHead>
                <TableHead className="text-2xs font-mono text-muted-foreground uppercase py-3.5">Case/Title</TableHead>
                <TableHead className="text-2xs font-mono text-muted-foreground uppercase py-3.5 hidden md:table-cell">Jurisdiction</TableHead>
                <TableHead className="text-2xs font-mono text-muted-foreground uppercase py-3.5">Status</TableHead>
                <TableHead className="text-2xs font-mono text-muted-foreground uppercase py-3.5 hidden md:table-cell">Next Hearing</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedCases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-16 text-muted-foreground">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <Scale className="h-8 w-8 text-muted-foreground/60" strokeWidth={1.5} />
                      <p className="text-sm font-semibold text-white">No dossiers recorded</p>
                      <p className="text-xs text-muted-foreground/80 max-w-xs leading-relaxed">Get started by registering a new matter with the command panel or using the Register button.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                sortedCases.map((case_) => (
                  <TableRow
                    key={case_.id}
                    className="cursor-pointer border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                    onClick={() => navigate(`/cases/${case_.id}`)}
                  >
                    <TableCell className="font-semibold text-xs py-4 text-white">{case_.party_name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{case_.case_number}</TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground">{case_.jurisdiction || 'Federal'}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={
                          case_.status === 'active' ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/10 font-mono text-3xs' :
                          case_.status === 'pending' ? 'bg-amber-500/5 text-amber-500 border-amber-500/10 font-mono text-3xs' :
                          'bg-white/5 text-muted-foreground border-white/10 font-mono text-3xs'
                        }
                      >
                        {case_.status || 'active'}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                      {case_.next_date ? (
                        <div className="flex items-center gap-1.5 font-mono text-2xs">
                          <Calendar className="h-3 w-3 text-primary" />
                          {new Date(case_.next_date).toLocaleDateString()}
                        </div>
                      ) : (
                        <span className="text-muted-foreground/50">—</span>
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
