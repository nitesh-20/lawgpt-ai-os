
import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon, Filter, SlidersHorizontal, Clock, ArrowRight, BookOpen, Building2, Gavel, Scale, FileText, User, MapPin, Calendar, BarChart4, MessagesSquare, Bookmark, Minus, Plus, X, ChevronDown, ChevronUp, Brain } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

// Sample Indian case results data
const SAMPLE_CASES = [
  {
    id: "case-1",
    title: "K.S. Puttaswamy v. Union of India",
    citation: "(2017) 10 SCC 1",
    court: "Supreme Court of India",
    date: "2017-08-24",
    summary: "Landmark judgment establishing the right to privacy as a fundamental right under the Indian Constitution. The Court held that privacy is intrinsic to freedom and liberty protected under Article 21.",
    relevance: 98,
    jurisdiction: "India",
    tags: ["Constitutional Law", "Right to Privacy", "Fundamental Rights"],
    citedBy: 245
  },
  {
    id: "case-2",
    title: "Shreya Singhal v. Union of India",
    citation: "(2015) 5 SCC 1",
    court: "Supreme Court of India",
    date: "2015-03-24",
    summary: "Significant case concerning free speech on the internet. The Supreme Court struck down Section 66A of the Information Technology Act as unconstitutional and violative of Article 19(1)(a) of the Constitution.",
    relevance: 92,
    jurisdiction: "India",
    tags: ["Information Technology", "Free Speech", "Constitutional Law"],
    citedBy: 178
  },
  {
    id: "case-3",
    title: "Navtej Singh Johar v. Union of India",
    citation: "(2018) 10 SCC 1",
    court: "Supreme Court of India",
    date: "2018-09-06",
    summary: "Historic judgment that decriminalized consensual sexual conduct between adults of the same sex by reading down Section 377 of the Indian Penal Code as unconstitutional to the extent it criminalized such conduct.",
    relevance: 90,
    jurisdiction: "India",
    tags: ["Constitutional Law", "LGBTQ+ Rights", "Criminal Law"],
    citedBy: 156
  },
  {
    id: "case-4",
    title: "Vishaka v. State of Rajasthan",
    citation: "AIR 1997 SC 3011",
    court: "Supreme Court of India",
    date: "1997-08-13",
    summary: "Groundbreaking case that established guidelines for prevention of sexual harassment at the workplace, later codified into the Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013.",
    relevance: 87,
    jurisdiction: "India",
    tags: ["Labour Law", "Women's Rights", "Sexual Harassment"],
    citedBy: 203
  },
  {
    id: "case-5",
    title: "M.C. Mehta v. Union of India",
    citation: "1987 SCR (1) 819",
    court: "Supreme Court of India",
    date: "1986-12-20",
    summary: "Landmark environmental law case that established the principle of absolute liability for industries engaged in hazardous activities. Led to the development of environmental jurisprudence in India.",
    relevance: 85,
    jurisdiction: "India",
    tags: ["Environmental Law", "Absolute Liability", "Public Interest Litigation"],
    citedBy: 189
  },
  {
    id: "case-6",
    title: "State of West Bengal v. Anwar Ali Sarkar",
    citation: "AIR 1952 SC 75",
    court: "Supreme Court of India",
    date: "1952-05-11",
    summary: "Important case on the principle of equality before law. The Supreme Court struck down the West Bengal Special Courts Act, 1950 as violative of Article 14 of the Constitution.",
    relevance: 82,
    jurisdiction: "India",
    tags: ["Constitutional Law", "Equality", "Article 14"],
    citedBy: 137
  },
  {
    id: "case-7",
    title: "NALSA v. Union of India",
    citation: "(2014) 5 SCC 438",
    court: "Supreme Court of India",
    date: "2014-04-15",
    summary: "Progressive judgment recognizing transgender persons as a 'third gender' and affirming their fundamental rights under the Constitution of India.",
    relevance: 84,
    jurisdiction: "India",
    tags: ["Constitutional Law", "Transgender Rights", "Gender Identity"],
    citedBy: 128
  }
];

// Sample Indian statute results data
const SAMPLE_STATUTES = [
  {
    id: "stat-1",
    title: "Information Technology Act, 2000",
    citation: "Act No. 21 of 2000",
    jurisdiction: "India",
    enacted: "2000-06-09",
    summary: "Comprehensive legislation providing legal recognition for electronic transactions, digital signatures, and addressing cybercrimes. Amended in 2008 to strengthen provisions related to data protection and cybersecurity.",
    relevance: 96,
    category: "Cyber Law",
    sections: ["Definitions", "Digital Signatures", "Electronic Records", "Cybercrimes", "Penalties"]
  },
  {
    id: "stat-2",
    title: "Personal Data Protection Bill",
    citation: "Bill No. 373 of 2019",
    jurisdiction: "India",
    enacted: "Pending",
    summary: "Proposed legislation aimed at providing a legal framework for the protection of personal data in India. Establishes a Data Protection Authority and codifies consent requirements for data processing.",
    relevance: 94,
    category: "Data Privacy",
    sections: ["Consent", "Rights of Data Principal", "Data Fiduciary Obligations", "Penalties", "Exemptions"]
  },
  {
    id: "stat-3",
    title: "Companies Act, 2013",
    citation: "Act No. 18 of 2013",
    jurisdiction: "India",
    enacted: "2013-08-29",
    summary: "Modernized legislation governing the incorporation, regulation and dissolution of companies in India. Includes provisions for corporate social responsibility, class action suits, and enhanced disclosure requirements.",
    relevance: 88,
    category: "Corporate Law",
    sections: ["Incorporation", "Directors", "Financial Statements", "Corporate Governance", "Winding Up"]
  },
  {
    id: "stat-4",
    title: "Consumer Protection Act, 2019",
    citation: "Act No. 35 of 2019",
    jurisdiction: "India",
    enacted: "2019-08-09",
    summary: "Updated legislation replacing the Consumer Protection Act, 1986. Introduces provisions for e-commerce, product liability, and establishes the Central Consumer Protection Authority for enforcing consumer rights.",
    relevance: 86,
    category: "Consumer Law",
    sections: ["Consumer Rights", "E-commerce", "Product Liability", "Consumer Disputes", "Penalties"]
  },
  {
    id: "stat-5",
    title: "Constitution of India",
    citation: "Adopted on 26 November 1949",
    jurisdiction: "India",
    enacted: "1950-01-26",
    summary: "The supreme law of India that establishes the framework defining fundamental political principles, establishes the structure, procedures, powers and duties of government institutions, and sets out fundamental rights.",
    relevance: 98,
    category: "Constitutional Law",
    sections: ["Fundamental Rights", "Directive Principles", "Fundamental Duties", "Union Government", "State Government"]
  },
  {
    id: "stat-6",
    title: "Indian Penal Code, 1860",
    citation: "Act No. 45 of 1860",
    jurisdiction: "India",
    enacted: "1860-10-06",
    summary: "Primary criminal code of India that covers all substantive aspects of criminal law. Defines offenses and prescribes punishments for various crimes.",
    relevance: 92,
    category: "Criminal Law",
    sections: ["General Explanations", "Offences Against the State", "Offences Against the Human Body", "Offences Against Property", "Criminal Conspiracy"]
  }
];

// Sample Indian legal article data
const SAMPLE_ARTICLES = [
  {
    id: "art-1",
    title: "The Evolution of Data Privacy Law in India: From IT Act to the PDP Bill",
    author: "Dr. Swati Sharma, LL.D.",
    journal: "Indian Journal of Law and Technology",
    date: "2023-11-15",
    summary: "Comprehensive analysis of the development of data privacy jurisprudence in India, from the Information Technology Act amendments to the proposed Personal Data Protection framework and its implications for businesses.",
    relevance: 95,
    topics: ["Data Privacy", "Information Technology", "Constitutional Law"],
    citations: 42
  },
  {
    id: "art-2",
    title: "Judicial Review and the Basic Structure Doctrine: Kesavananda Bharati's Enduring Legacy",
    author: "Prof. Rajesh Mehta, Ph.D.",
    journal: "Supreme Court Cases Journal",
    date: "2023-08-22",
    summary: "Exploration of the evolution and application of the Basic Structure Doctrine in Indian constitutional jurisprudence since the landmark Kesavananda Bharati judgment of 1973.",
    relevance: 93,
    topics: ["Constitutional Law", "Judicial Review", "Basic Structure Doctrine"],
    citations: 38
  },
  {
    id: "art-3",
    title: "Environmental Jurisprudence in India: The Role of Public Interest Litigation",
    author: "Arundhati Sen, LL.M.",
    journal: "Indian Law Review",
    date: "2023-09-10",
    summary: "Analysis of how Public Interest Litigation has shaped environmental protection in India through landmark judgments of the Supreme Court and National Green Tribunal.",
    relevance: 90,
    topics: ["Environmental Law", "Public Interest Litigation", "Sustainable Development"],
    citations: 31
  },
  {
    id: "art-4",
    title: "The GST Regime in India: Constitutional Challenges and Judicial Interpretations",
    author: "Dr. Vikram Agarwal, J.D.",
    journal: "National Tax Journal of India",
    date: "2023-07-30",
    summary: "Critical examination of the constitutional framework of the Goods and Services Tax in India and key judicial decisions interpreting its implementation and scope.",
    relevance: 88,
    topics: ["Tax Law", "Constitutional Law", "GST"],
    citations: 27
  },
  {
    id: "art-5",
    title: "Digital Justice Delivery in India: E-Courts Project and Beyond",
    author: "Justice (Retd.) Pradeep Kumar Mishra",
    journal: "Journal of the Indian Law Institute",
    date: "2023-10-05",
    summary: "Comprehensive review of the digitization of court processes in India, challenges in implementation, and recommendations for enhancing access to justice through technology.",
    relevance: 87,
    topics: ["Judicial Administration", "Legal Technology", "Access to Justice"],
    citations: 25
  }
];

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [jurisdiction, setJurisdiction] = useState('');
  const [courtType, setCourtType] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [contentType, setContentType] = useState('cases');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [relevanceRange, setRelevanceRange] = useState([70, 100]);
  const [dateRangeYears, setDateRangeYears] = useState([1950, 2024]);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [searchConfidence, setSearchConfidence] = useState(0);
  const [advancedMode, setAdvancedMode] = useState(false);
  const [isAiAnalysisEnabled, setIsAiAnalysisEnabled] = useState(true);

  // Jurisdictions filter options for India
  const jurisdictions = [
    { id: "india", label: "India (All)" },
    { id: "supreme", label: "Supreme Court" },
    { id: "high", label: "High Courts" },
    { id: "district", label: "District Courts" },
    { id: "tribunals", label: "Tribunals" },
    { id: "delhi", label: "Delhi" },
    { id: "maharashtra", label: "Maharashtra" },
    { id: "karnataka", label: "Karnataka" }
  ];

  // Topic filters relevant to Indian law
  const topicFilters = [
    { id: "constitutional", label: "Constitutional Law", checked: false },
    { id: "criminal", label: "Criminal Law", checked: false },
    { id: "corporate", label: "Corporate Law", checked: false },
    { id: "ip", label: "Intellectual Property", checked: false },
    { id: "data-privacy", label: "Data Privacy", checked: false },
    { id: "tax", label: "Taxation", checked: false },
    { id: "environmental", label: "Environmental Law", checked: false },
    { id: "family", label: "Family Law", checked: false },
    { id: "arbitration", label: "Arbitration", checked: false }
  ];

  // Court filters for Indian judiciary
  const courtFilters = [
    { id: "supreme", label: "Supreme Court", checked: false },
    { id: "high", label: "High Courts", checked: false },
    { id: "district", label: "District Courts", checked: false },
    { id: "ngt", label: "National Green Tribunal", checked: false },
    { id: "ncdrc", label: "National Consumer Disputes Redressal Commission", checked: false },
    { id: "tribunals", label: "Other Tribunals", checked: false }
  ];

  // Load example data on component mount
  useEffect(() => {
    if (searchQuery === '') {
      // Pre-fill with example search term
      setSearchQuery('right to privacy data protection');
    }
  }, []);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchResults([]);
    setSearchConfidence(0);
    
    // Simulate search progress
    const confidenceInterval = setInterval(() => {
      setSearchConfidence(prev => {
        if (prev >= 100) {
          clearInterval(confidenceInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 100);

    // Simulate a search request with delay
    setTimeout(() => {
      let results;
      switch (contentType) {
        case 'statutes':
          results = SAMPLE_STATUTES;
          break;
        case 'articles':
          results = SAMPLE_ARTICLES;
          break;
        case 'cases':
        default:
          results = SAMPLE_CASES;
          break;
      }
      
      // Filter by jurisdiction if selected
      if (jurisdiction) {
        results = results.filter((result: any) => 
          result.jurisdiction?.toLowerCase().includes(jurisdiction.toLowerCase()) ||
          (result.court && result.court.toLowerCase().includes(jurisdiction.toLowerCase()))
        );
      }

      // Filter by date range if selected
      if (dateRange) {
        const currentYear = new Date().getFullYear();
        let yearCutoff;
        
        switch (dateRange) {
          case 'last-year':
            yearCutoff = currentYear - 1;
            break;
          case 'last-5-years':
            yearCutoff = currentYear - 5;
            break;
          case 'last-10-years':
            yearCutoff = currentYear - 10;
            break;
          case 'post-independence':
            yearCutoff = 1950;
            break;
          default:
            yearCutoff = 0;
        }
        
        if (yearCutoff > 0) {
          results = results.filter((result: any) => {
            const resultYear = new Date(result.date || result.enacted).getFullYear();
            return resultYear >= yearCutoff;
          });
        }
      }

      // Filter by relevance range if in advanced mode
      if (advancedMode) {
        results = results.filter((result: any) => 
          result.relevance >= relevanceRange[0] && result.relevance <= relevanceRange[1]
        );
      }

      setSearchResults(results);
      setIsSearching(false);
    }, 1200);
  };

  // AI analysis for Indian cases
  const getAiAnalysis = (result: any) => {
    if (contentType === 'cases') {
      const courtLevel = result.court.includes('Supreme') ? 'Supreme Court' : 
                         result.court.includes('High') ? 'High Court' : 'Other Court';
      
      if (courtLevel === 'Supreme Court') {
        return `This ${result.tags[0]} case established significant precedent in ${result.tags.join(', ')}. It has been widely cited in subsequent judgments and has shaped Indian jurisprudence on these issues.`;
      } else if (courtLevel === 'High Court') {
        return `This ${result.tags[0]} case provides important interpretations of statutory provisions and constitutional principles relevant to your query. The judgment has been followed by several lower courts.`;
      } else {
        return `This case addresses specific factual scenarios relevant to your search and applies established legal principles in the context of ${result.tags.join(', ')}.`;
      }
    } else if (contentType === 'statutes') {
      return `This legislation is central to the Indian legal framework on ${result.category}. Recent amendments have enhanced its scope and enforcement mechanisms, making it highly relevant to current regulatory compliance.`;
    } else { // articles
      return `This scholarly analysis provides valuable insights on recent developments in ${result.topics[0]} with particular relevance to the Indian legal context. The author is a recognized authority in this field.`;
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 fade-in">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            AVENIX.PRO Indian Legal Intelligence
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            AI-powered legal research across Indian cases, statutes, and legal scholarship with neural network analysis.
          </p>
        </div>

        <Card className="neo-glass border-none p-6 shadow-2xl">
          <div className="flex flex-col gap-4">
            <div className="relative flex gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <SearchIcon className="text-muted-foreground" size={18} />
                </div>
                <Input
                  type="text"
                  placeholder="Search Indian cases, statutes, or legal articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 shadow-sm bg-white border-transparent focus:border-primary/30 h-12 text-base backdrop-blur-sm"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                {searchQuery && (
                  <button 
                    className="absolute inset-y-0 right-3 flex items-center"
                    onClick={() => setSearchQuery('')}
                  >
                    <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
              <Button 
                onClick={handleSearch} 
                size="lg"
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-md group transition-all"
              >
                <span className="mr-2 transition-transform duration-300 group-hover:scale-110">Search</span>
                <SearchIcon size={18} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setFiltersVisible(!filtersVisible)}
                className="hidden sm:flex items-center justify-center h-12 w-12 bg-white/70 backdrop-blur-sm hover:bg-white/90 border-transparent shadow-sm"
              >
                <Filter size={18} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setAdvancedMode(!advancedMode)}
                className="hidden sm:flex items-center justify-center h-12 w-12 bg-white/70 backdrop-blur-sm hover:bg-white/90 border-transparent shadow-sm"
                title={advancedMode ? "Switch to standard mode" : "Switch to advanced mode"}
              >
                <Brain size={18} className={advancedMode ? "text-primary" : "text-gray-500"} />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <Tabs value={contentType} onValueChange={setContentType} className="w-full sm:w-auto">
                <TabsList className="grid grid-cols-3 bg-white/50 p-1 h-9">
                  <TabsTrigger value="cases" className="text-xs px-3 py-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-accent/20 data-[state=active]:text-primary">
                    <Gavel className="h-3 w-3 mr-1" />
                    Cases
                  </TabsTrigger>
                  <TabsTrigger value="statutes" className="text-xs px-3 py-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-accent/20 data-[state=active]:text-primary">
                    <Scale className="h-3 w-3 mr-1" />
                    Statutes
                  </TabsTrigger>
                  <TabsTrigger value="articles" className="text-xs px-3 py-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-accent/20 data-[state=active]:text-primary">
                    <BookOpen className="h-3 w-3 mr-1" />
                    Articles
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex flex-wrap gap-2 ml-auto">
                {isAiAnalysisEnabled ? (
                  <Badge className="bg-primary/20 text-primary hover:bg-primary/30 cursor-pointer" onClick={() => setIsAiAnalysisEnabled(!isAiAnalysisEnabled)}>
                    <Brain className="h-3 w-3 mr-1" />
                    AI Analysis On
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-gray-500 hover:bg-gray-100 cursor-pointer" onClick={() => setIsAiAnalysisEnabled(!isAiAnalysisEnabled)}>
                    <Brain className="h-3 w-3 mr-1" />
                    AI Analysis Off
                  </Badge>
                )}
                
                {advancedMode && (
                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                    Advanced Mode
                  </Badge>
                )}
              </div>
            </div>

            {filtersVisible && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white/50 p-4 rounded-lg animate-fade-in mt-2">
                <div>
                  <h3 className="text-sm font-medium mb-2 flex items-center">
                    <MapPin className="h-4 w-4 mr-1 text-primary" />
                    Jurisdiction
                  </h3>
                  <Select value={jurisdiction} onValueChange={setJurisdiction}>
                    <SelectTrigger className="bg-white border-gray-200">
                      <SelectValue placeholder="Select Jurisdiction" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Jurisdictions</SelectItem>
                      {jurisdictions.map(j => (
                        <SelectItem key={j.id} value={j.id}>{j.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2 flex items-center">
                    <Building2 className="h-4 w-4 mr-1 text-primary" />
                    Court Type
                  </h3>
                  <Select value={courtType} onValueChange={setCourtType}>
                    <SelectTrigger className="bg-white border-gray-200">
                      <SelectValue placeholder="Court Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Courts</SelectItem>
                      <SelectItem value="supreme">Supreme Court</SelectItem>
                      <SelectItem value="high">High Courts</SelectItem>
                      <SelectItem value="district">District Courts</SelectItem>
                      <SelectItem value="tribunals">Tribunals</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2 flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-primary" />
                    Date Range
                  </h3>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="bg-white border-gray-200">
                      <SelectValue placeholder="Date Range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any Time</SelectItem>
                      <SelectItem value="last-year">Last Year</SelectItem>
                      <SelectItem value="last-5-years">Last 5 Years</SelectItem>
                      <SelectItem value="last-10-years">Last 10 Years</SelectItem>
                      <SelectItem value="post-independence">Post-Independence (After 1950)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {advancedMode && (
                  <>
                    <div className="md:col-span-2">
                      <h3 className="text-sm font-medium mb-2 flex items-center">
                        <BarChart4 className="h-4 w-4 mr-1 text-primary" />
                        Relevance Range
                      </h3>
                      <div className="px-3">
                        <Slider 
                          value={relevanceRange} 
                          onValueChange={setRelevanceRange} 
                          min={0} 
                          max={100} 
                          step={1}
                          className="mb-1"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{relevanceRange[0]}%</span>
                          <span>{relevanceRange[1]}%</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium mb-2 flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-primary" />
                        Year Range
                      </h3>
                      <div className="px-3">
                        <Slider 
                          value={dateRangeYears} 
                          onValueChange={setDateRangeYears} 
                          min={1950} 
                          max={2024} 
                          step={1}
                          className="mb-1"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{dateRangeYears[0]}</span>
                          <span>{dateRangeYears[1]}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {advancedMode && (
              <div className="bg-white/50 p-4 rounded-lg animate-fade-in mt-2">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="topics" className="border-b-0">
                    <AccordionTrigger className="py-2 text-sm font-medium">
                      <div className="flex items-center">
                        <MessagesSquare className="h-4 w-4 mr-2 text-primary" />
                        Legal Topic Filters
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 py-2">
                        {topicFilters.map(topic => (
                          <div key={topic.id} className="flex items-center space-x-2">
                            <Checkbox id={`topic-${topic.id}`} />
                            <Label htmlFor={`topic-${topic.id}`} className="text-sm">{topic.label}</Label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="courts" className="border-b-0">
                    <AccordionTrigger className="py-2 text-sm font-medium">
                      <div className="flex items-center">
                        <Building2 className="h-4 w-4 mr-2 text-primary" />
                        Court Filters
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-2">
                        {courtFilters.map(court => (
                          <div key={court.id} className="flex items-center space-x-2">
                            <Checkbox id={`court-${court.id}`} />
                            <Label htmlFor={`court-${court.id}`} className="text-sm">{court.label}</Label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="search-options" className="border-b-0">
                    <AccordionTrigger className="py-2 text-sm font-medium">
                      <div className="flex items-center">
                        <SlidersHorizontal className="h-4 w-4 mr-2 text-primary" />
                        Advanced Search Options
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 py-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="exact-match" />
                          <Label htmlFor="exact-match" className="text-sm">Exact Match</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="include-concurrences" />
                          <Label htmlFor="include-concurrences" className="text-sm">Include Concurrences</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="include-dissents" />
                          <Label htmlFor="include-dissents" className="text-sm">Include Dissents</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="landmark-only" />
                          <Label htmlFor="landmark-only" className="text-sm">Landmark Cases Only</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="constitution-bench" />
                          <Label htmlFor="constitution-bench" className="text-sm">Constitution Bench</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="semantic-search" defaultChecked />
                          <Label htmlFor="semantic-search" className="text-sm">Semantic Search</Label>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            )}
          </div>
        </Card>

        {isSearching && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Analyzing results with neural network...
              </div>
              <div className="text-sm font-medium">
                <span className="text-primary">{searchConfidence}%</span> confidence
              </div>
            </div>
            <Progress value={searchConfidence} className="h-1 bg-gray-100" indicatorClassName="bg-primary" />
            
            <div className="space-y-3">
              {[1, 2, 3, 4].map((_, index) => (
                <div key={index} className="bg-white/50 backdrop-blur-sm rounded-lg p-5 animate-pulse border border-gray-100 shadow-sm">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-100 rounded w-1/4 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-100 rounded w-full"></div>
                    <div className="h-3 bg-gray-100 rounded w-full"></div>
                    <div className="h-3 bg-gray-100 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isSearching && searchResults.length > 0 && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex justify-between items-center">
              <div className="text-lg font-medium">
                Results for "{searchQuery}"
              </div>
              <div className="text-sm text-muted-foreground">
                {searchResults.length} results • Sorted by relevance
              </div>
            </div>

            <div className="grid gap-4">
              {contentType === 'cases' && searchResults.map((result: any) => (
                <Card 
                  key={result.id} 
                  className="hover:shadow-lg transition-all duration-300 border-none shadow-md bg-white/70 backdrop-blur-sm hover:translate-y-[-2px]"
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <div>
                        <CardTitle className="text-lg hover:text-primary cursor-pointer transition-colors">{result.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{result.citation}</p>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Bookmark className="h-4 w-4 text-gray-400 hover:text-primary" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Save to library</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm">{result.summary}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        {result.court}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {new Date(result.date).toLocaleDateString()}
                      </div>
                      {result.citedBy && (
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Cited {result.citedBy} times
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {result.tags?.map((tag: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="bg-gray-50 text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {isAiAnalysisEnabled && (
                      <div className="rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 p-3 border border-primary/10">
                        <div className="flex items-center gap-2 text-sm font-medium text-primary mb-2">
                          <Brain className="h-4 w-4" />
                          AI Analysis
                        </div>
                        <p className="text-sm text-gray-600">
                          {getAiAnalysis(result)}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="text-xs font-medium">Relevance:</div>
                          <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full" 
                              style={{ width: `${result.relevance}%` }}
                            ></div>
                          </div>
                          <div className="text-xs font-medium">{result.relevance}%</div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="border-t border-gray-100 pt-3 justify-between">
                    <div className="flex items-center text-xs text-gray-500">
                      <MapPin className="h-3 w-3 mr-1" />
                      {result.jurisdiction}
                    </div>
                    <Button variant="outline" size="sm" className="text-xs bg-white">
                      View Full Case
                      <ArrowRight className="ml-2 h-3 w-3" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}

              {contentType === 'statutes' && searchResults.map((result: any) => (
                <Card 
                  key={result.id} 
                  className="hover:shadow-lg transition-all duration-300 border-none shadow-md bg-white/70 backdrop-blur-sm hover:translate-y-[-2px]"
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <div>
                        <CardTitle className="text-lg hover:text-primary cursor-pointer transition-colors">{result.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{result.citation}</p>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Bookmark className="h-4 w-4 text-gray-400 hover:text-primary" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Save to library</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm">{result.summary}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {result.jurisdiction}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Enacted: {result.enacted === 'Pending' ? 'Pending' : new Date(result.enacted).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        {result.category}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-2">
                      <div className="text-xs font-medium mr-2">Key Sections:</div>
                      {result.sections?.map((section: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="bg-gray-50 text-xs">
                          {section}
                        </Badge>
                      ))}
                    </div>

                    {isAiAnalysisEnabled && (
                      <div className="rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 p-3 border border-primary/10">
                        <div className="flex items-center gap-2 text-sm font-medium text-primary mb-2">
                          <Brain className="h-4 w-4" />
                          AI Analysis
                        </div>
                        <p className="text-sm text-gray-600">
                          {getAiAnalysis(result)}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="text-xs font-medium">Relevance:</div>
                          <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full" 
                              style={{ width: `${result.relevance}%` }}
                            ></div>
                          </div>
                          <div className="text-xs font-medium">{result.relevance}%</div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="border-t border-gray-100 pt-3 justify-end">
                    <Button variant="outline" size="sm" className="text-xs bg-white">
                      View Full Text
                      <ArrowRight className="ml-2 h-3 w-3" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}

              {contentType === 'articles' && searchResults.map((result: any) => (
                <Card 
                  key={result.id} 
                  className="hover:shadow-lg transition-all duration-300 border-none shadow-md bg-white/70 backdrop-blur-sm hover:translate-y-[-2px]"
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <div>
                        <CardTitle className="text-lg hover:text-primary cursor-pointer transition-colors">{result.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{result.journal}</p>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Bookmark className="h-4 w-4 text-gray-400 hover:text-primary" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Save to library</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm">{result.summary}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {result.author}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {new Date(result.date).toLocaleDateString()}
                      </div>
                      {result.citations && (
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Cited {result.citations} times
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {result.topics?.map((topic: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="bg-gray-50 text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>

                    {isAiAnalysisEnabled && (
                      <div className="rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 p-3 border border-primary/10">
                        <div className="flex items-center gap-2 text-sm font-medium text-primary mb-2">
                          <Brain className="h-4 w-4" />
                          AI Analysis
                        </div>
                        <p className="text-sm text-gray-600">
                          {getAiAnalysis(result)}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="text-xs font-medium">Relevance:</div>
                          <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full" 
                              style={{ width: `${result.relevance}%` }}
                            ></div>
                          </div>
                          <div className="text-xs font-medium">{result.relevance}%</div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="border-t border-gray-100 pt-3 justify-end">
                    <Button variant="outline" size="sm" className="text-xs bg-white">
                      View Full Article
                      <ArrowRight className="ml-2 h-3 w-3" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
