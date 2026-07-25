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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NewCaseDialog } from "@/components/cases/NewCaseDialog";
import { Case } from "@/types/case";
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

  useEffect(() => {
    // Load cases from localStorage with delay to simulate API
    setTimeout(() => {
      const storedCases = JSON.parse(localStorage.getItem('cases') || '[]');
      setCases(storedCases);
      setIsLoading(false);
      
      // Create demo cases if none exist
      if (storedCases.length === 0) {
        const demoCases = [
          {
            id: crypto.randomUUID(),
            user_id: 'demo-user',
            party_name: 'Smith v. Johnson',
            case_number: 'CV-2024-1234',
            court_name: 'Superior Court',
            jurisdiction: 'Federal',
            case_type: 'Civil',
            filing_date: new Date().toISOString(),
            status: 'active',
            next_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            hearings: []
          },
          {
            id: crypto.randomUUID(),
            user_id: 'demo-user',
            party_name: 'Williams v. Tech Corp',
            case_number: 'CV-2024-5678',
            court_name: 'District Court',
            jurisdiction: 'State',
            case_type: 'Employment',
            filing_date: new Date().toISOString(),
            status: 'pending',
            next_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            hearings: []
          }
        ];
        
        localStorage.setItem('cases', JSON.stringify(demoCases));
        setCases(demoCases);
      }
    }, 1000);
  }, []);

  const handleAddCase = async (newCase: Omit<Case, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'hearings'>) => {
    try {
      const caseToAdd = {
        ...newCase,
        id: crypto.randomUUID(),
        user_id: 'demo-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        hearings: []
      };

      setCases(prevCases => [caseToAdd, ...prevCases]);
      
      // Save to localStorage
      const updatedCases = [caseToAdd, ...cases];
      localStorage.setItem('cases', JSON.stringify(updatedCases));

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
        case_.party_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        case_.case_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        case_.court_name.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTab = 
        activeTab === "all" || 
        (activeTab === "active" && case_.status === "active") ||
        (activeTab === "pending" && case_.status === "pending") ||
        (activeTab === "closed" && case_.status === "closed");
      
      return matchesSearch && matchesTab;
    }
  );

  // Sort the filtered cases
  const sortedCases = [...filteredCases].sort((a, b) => {
    if (sortBy === "recent") {
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    } else if (sortBy === "oldest") {
      return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
    } else if (sortBy === "name") {
      return a.party_name.localeCompare(b.party_name);
    }
    return 0;
  });

  const caseStatistics = {
    total: cases.length,
    active: cases.filter(c => c.status === 'active').length,
    pending: cases.filter(c => c.status === 'pending').length,
    closed: cases.filter(c => c.status === 'closed').length
  };

  const handleCaseClick = (caseId: string) => {
    navigate(`/cases/${caseId}`);
  };

  if (isLoading) {
    return (
      <div className="page-container fade-in">
        <div className="page-header">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl shadow-md">
              <Scale className="h-6 w-6 text-primary" />
            </div>
            <h1 className="page-title">Cases</h1>
          </div>
          <p className="page-description">Manage your legal cases and court hearings</p>
        </div>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl shadow-md">
            <Scale className="h-6 w-6 text-primary" />
          </div>
          <h1 className="page-title">Cases</h1>
        </div>
        <p className="page-description">Manage your legal cases and court hearings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white/50 hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{caseStatistics.total}</CardTitle>
            <CardDescription>Total Cases</CardDescription>
          </CardHeader>
          <CardContent>
            <Clipboard className="h-5 w-5 text-neutral-500" />
          </CardContent>
        </Card>
        
        <Card className="bg-white/50 hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl text-green-600">{caseStatistics.active}</CardTitle>
            <CardDescription>Active Cases</CardDescription>
          </CardHeader>
          <CardContent>
            <Users className="h-5 w-5 text-green-500" />
          </CardContent>
        </Card>
        
        <Card className="bg-white/50 hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl text-yellow-600">{caseStatistics.pending}</CardTitle>
            <CardDescription>Pending Cases</CardDescription>
          </CardHeader>
          <CardContent>
            <Clock className="h-5 w-5 text-yellow-500" />
          </CardContent>
        </Card>
        
        <Card className="bg-white/50 hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl text-blue-600">{cases.filter(c => c.next_date).length}</CardTitle>
            <CardDescription>Upcoming Hearings</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar className="h-5 w-5 text-blue-500" />
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search cases..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-full bg-white/80 backdrop-blur-sm"
          />
        </div>
        
        <div className="flex gap-2 items-center">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Sort By</SelectLabel>
                <SelectItem value="recent">
                  <div className="flex items-center">
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                    Most Recent
                  </div>
                </SelectItem>
                <SelectItem value="oldest">
                  <div className="flex items-center">
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                    Oldest First
                  </div>
                </SelectItem>
                <SelectItem value="name">
                  <div className="flex items-center">
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                    Case Name (A-Z)
                  </div>
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-white">
                <FilterIcon className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuItem>Federal Cases</DropdownMenuItem>
              <DropdownMenuItem>State Cases</DropdownMenuItem>
              <DropdownMenuItem>Civil Cases</DropdownMenuItem>
              <DropdownMenuItem>Criminal Cases</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            onClick={() => setShowNewCaseDialog(true)}
            className="w-full md:w-auto bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white transition-all"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            New Case
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white/50 p-1 rounded-lg border border-white/60 shadow-md">
          <TabsTrigger 
            value="all"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-accent/20 data-[state=active]:text-primary"
          >
            All Cases
          </TabsTrigger>
          <TabsTrigger 
            value="active"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-accent/20 data-[state=active]:text-primary"
          >
            Active
          </TabsTrigger>
          <TabsTrigger 
            value="pending"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-accent/20 data-[state=active]:text-primary"
          >
            Pending
          </TabsTrigger>
          <TabsTrigger 
            value="closed"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-accent/20 data-[state=active]:text-primary"
          >
            Closed
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 animate-fade-in">
          <div className="glass-card rounded-xl overflow-hidden shadow-xl border border-white/60">
            <Table>
              <TableHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold text-neutral-700">Party Name</TableHead>
                  <TableHead className="font-semibold text-neutral-700">Case No.</TableHead>
                  <TableHead className="font-semibold text-neutral-700 hidden md:table-cell">Court</TableHead>
                  <TableHead className="font-semibold text-neutral-700 hidden md:table-cell">Filing Date</TableHead>
                  <TableHead className="font-semibold text-neutral-700">Status</TableHead>
                  <TableHead className="font-semibold text-neutral-700 hidden md:table-cell">Next Hearing</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedCases.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-neutral-600">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <Scale className="h-10 w-10 text-neutral-400" />
                        <p className="text-lg font-medium">No cases found</p>
                        <p className="text-sm text-neutral-500">Create your first case by clicking the "New Case" button</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedCases.map((case_) => (
                    <TableRow 
                      key={case_.id}
                      className="cursor-pointer transition-colors hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5"
                      onClick={() => handleCaseClick(case_.id)}
                    >
                      <TableCell className="font-medium">{case_.party_name}</TableCell>
                      <TableCell>{case_.case_number}</TableCell>
                      <TableCell className="hidden md:table-cell">{case_.court_name}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {case_.filing_date ? new Date(case_.filing_date).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={
                            case_.status === 'active' ? 'bg-green-50 text-green-600 border-green-200' :
                            case_.status === 'pending' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' :
                            'bg-blue-50 text-blue-600 border-blue-200'
                          }
                        >
                          {case_.status || 'active'}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {case_.next_date ? (
                          <div className="flex items-center text-neutral-600">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(case_.next_date).toLocaleDateString()}
                          </div>
                        ) : (
                          <span className="text-neutral-400">Not scheduled</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {sortedCases.length > 0 && (
            <div className="flex justify-between items-center text-sm text-neutral-500 px-2">
              <div>Showing {sortedCases.length} of {cases.length} cases</div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="h-8 px-2">
                  <ChevronRight className="h-4 w-4 rotate-180" />
                  Previous
                </Button>
                <Button variant="ghost" size="sm" className="h-8 px-2">
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <NewCaseDialog 
        open={showNewCaseDialog}
        onOpenChange={setShowNewCaseDialog}
        onSuccess={handleAddCase}
      />
    </div>
  );
};

export default Cases;
