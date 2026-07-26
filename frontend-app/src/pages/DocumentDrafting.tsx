import { useState, useEffect } from "react";
import { 
  FileEdit, 
  Files, 
  Sparkles, 
  RotateCcw, 
  FileText, 
  Download, 
  AlertTriangle, 
  CheckCircle, 
  ArrowRight,
  Plus,
  Loader2,
  Copy,
  Languages,
  Share2,
  Scale,
  Calendar,
  Tag,
  Maximize2,
  FileMinus,
  Check,
  User,
  Clock,
  Briefcase,
  HelpCircle,
  TrendingUp,
  FileCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { VoiceButton } from "@/components/voice/VoiceButton";
import { AudioPlaybackButton } from "@/components/voice/AudioPlaybackButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  generateDraft, 
  reviewDraft, 
  redlineDraft, 
  improveDraft 
} from "@/services/drafting";

interface LegalTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  useCase: string;
  backendId: string;
  fields: string[];
}

const DocumentDrafting = () => {
  const [activeTab, setActiveTab] = useState("templates");
  const { toast } = useToast();

  // Structured Templates List (21 Realistic templates)
  const templatesList: LegalTemplate[] = [
    {
      id: "nda",
      name: "Non-Disclosure Agreement (NDA)",
      description: "Protects proprietary and confidential information shared during joint commercial discussions.",
      category: "Confidentiality",
      useCase: "Exchanging source code, vendor specs, or corporate metrics with prospective partners.",
      backendId: "nda",
      fields: ["Effective Date", "Disclosing Party (Party A)", "Receiving Party (Party B)", "Purpose"]
    },
    {
      id: "employment_agreement",
      name: "Employment Agreement",
      description: "Binding contract outlining job responsibilities, compensation, and general work conditions.",
      category: "HR / Employment",
      useCase: "Hiring executive-level or operational full-time staff under regional labor guidelines.",
      backendId: "employment_agreement",
      fields: ["Effective Date", "Employer Name (Party A)", "Employee Name (Party B)", "Job Title", "Salary"]
    },
    {
      id: "independent_contractor",
      name: "Independent Contractor Agreement",
      description: "Defines non-employee project scopes, retainer payouts, and intellectual property transfers.",
      category: "HR / Employment",
      useCase: "Engaging freelance product designers, contract developers, or advisory personnel.",
      backendId: "service_agreement",
      fields: ["Effective Date", "Client Name (Party A)", "Contractor Name (Party B)", "Scope of Services", "Retainer Fees"]
    },
    {
      id: "service_agreement",
      name: "Service Agreement",
      description: "Standard service level framework defining vendor duties, KPIs, and payments.",
      category: "Commercial",
      useCase: "Outsourcing facility management, cloud monitoring, or customer support operations.",
      backendId: "service_agreement",
      fields: ["Effective Date", "Client Name (Party A)", "Service Provider (Party B)", "Scope of Services", "Fees"]
    },
    {
      id: "software_dev",
      name: "Software Development Agreement",
      description: "Specifies agile dev iterations, milestone reviews, and custom IP assignments.",
      category: "Intellectual Property",
      useCase: "Commissioning an external software agency to build a custom SaaS or mobile application.",
      backendId: "service_agreement",
      fields: ["Effective Date", "Client Name (Party A)", "Developer Name (Party B)", "Tech Stack & Milestones", "Project Cost"]
    },
    {
      id: "msa",
      name: "Master Service Agreement (MSA)",
      description: "Umbrella framework governing future purchase orders, liability caps, and warrant covenants.",
      category: "Commercial",
      useCase: "Establishing multi-year B2B vendor relations prior to executing statements of work.",
      backendId: "general_contract",
      fields: ["Effective Date", "Client Name (Party A)", "Provider Name (Party B)", "Overall Scope", "Term Duration"]
    },
    {
      id: "partnership_agreement",
      name: "Partnership Agreement",
      description: "Drafts governance rules, voting thresholds, and capital ratios for new partnerships.",
      category: "Corporate",
      useCase: "Structuring equity ratios and operating rules between managing partners.",
      backendId: "partnership_agreement",
      fields: ["Effective Date", "Partner A Name", "Partner B Name", "Capital Contributions", "Voting Control %"]
    },
    {
      id: "shareholders_agreement",
      name: "Shareholders Agreement",
      description: "Governs rights, tag-along/drag-along exits, board seats, and share valuations.",
      category: "Corporate",
      useCase: "Aligning venture investors and original co-founders on seed round milestones.",
      backendId: "general_contract",
      fields: ["Effective Date", "Company Name", "Lead Investor Name", "Founder Names", "Board Seat Allocations"]
    },
    {
      id: "vendor_agreement",
      name: "Vendor Agreement",
      description: "Specifies purchase timelines, delivery inspections, and defect remedies.",
      category: "Commercial",
      useCase: "Acquiring hardware inventories or manufacturing goods from standard suppliers.",
      backendId: "vendor_agreement",
      fields: ["Effective Date", "Customer Name (Party A)", "Vendor Name (Party B)", "Goods Description", "Purchase Cost"]
    },
    {
      id: "consulting_agreement",
      name: "Consulting Agreement",
      description: "Covers advisory scopes, board attendance, and stock options vesting.",
      category: "Commercial",
      useCase: "Retaining corporate consultants or financial strategists for restructuring.",
      backendId: "service_agreement",
      fields: ["Effective Date", "Client Name (Party A)", "Consultant Name (Party B)", "Advisory Scope", "Hourly Rate"]
    },
    {
      id: "terms_conditions",
      name: "Terms & Conditions",
      description: "Website/app governance rules, acceptable use codes, and liability disclaimers.",
      category: "E-Commerce / Tech",
      useCase: "Setting legal requirements for registering on a public web forum or online store.",
      backendId: "terms_and_conditions",
      fields: ["Effective Date", "Company Name", "Website URL", "Jurisdiction Forum"]
    },
    {
      id: "privacy_policy",
      name: "Privacy Policy",
      description: "Details data collection methodologies, cookie tracking, and user consent.",
      category: "Compliance / Tech",
      useCase: "Ensuring store compliance for mobile apps gathering analytics or emails.",
      backendId: "privacy_policy",
      fields: ["Effective Date", "Company Name", "Website URL", "User Data Types Collected"]
    },
    {
      id: "cookie_policy",
      name: "Cookie Policy",
      description: "Explains local storage tracers, marketing pixel pixels, and cookie opt-out paths.",
      category: "Compliance / Tech",
      useCase: "Publishing mandatory EU cookie compliance notices on active sites.",
      backendId: "privacy_policy",
      fields: ["Effective Date", "Company Name", "Website URL", "Third-party Pixels Used"]
    },
    {
      id: "dpa",
      name: "Data Processing Agreement (DPA)",
      description: "Specifies secure sub-processor compliance under GPDP and GDPR constraints.",
      category: "Compliance / Tech",
      useCase: "Passing user logs to hosting databases or analytical microservices.",
      backendId: "nda",
      fields: ["Effective Date", "Data Exporter (Party A)", "Data Importer (Party B)", "Categories of Data", "Data Security Covenants"]
    },
    {
      id: "offer_letter",
      name: "Employment Offer Letter",
      description: "Formal non-binding onboarding letter outlining role offers and salary structures.",
      category: "HR / Employment",
      useCase: "Extending a formal job offer package to a chosen engineer or manager.",
      backendId: "offer_letter",
      fields: ["Start Date", "Employer Name (Party A)", "Candidate Name (Party B)", "Job Title Offered", "Base Compensation"]
    },
    {
      id: "legal_notice",
      name: "Legal Notice",
      description: "Formal pre-action notification demanding immediate resolution of defaults.",
      category: "Litigation",
      useCase: "Serving notices to non-paying corporate debtors prior to arbitration filing.",
      backendId: "legal_notice",
      fields: ["Issue Date", "Sender Name (Party A)", "Recipient Name (Party B)", "Breach Details", "Demands & Cure Period"]
    },
    {
      id: "cease_desist",
      name: "Cease and Desist Notice",
      description: "Urgent warning demanding immediate suspension of infringement behaviors.",
      category: "Litigation",
      useCase: "Demanding copyright infringers pull down copyrighted images online.",
      backendId: "legal_notice",
      fields: ["Issue Date", "Sender Name (Party A)", "Recipient Name (Party B)", "Infringement Facts", "Halt Directives"]
    },
    {
      id: "rental_agreement",
      name: "Rental / Lease Agreement",
      description: "Outlines residential or commercial property leases, security deposits, and rules.",
      category: "Real Estate",
      useCase: "Leasing warehouse real estate or corporate office structures to commercial clients.",
      backendId: "lease_agreement",
      fields: ["Effective Date", "Landlord Name (Party A)", "Tenant Name (Party B)", "Premises Address", "Rent & Security Deposit"]
    },
    {
      id: "mou",
      name: "Memorandum of Understanding (MoU)",
      description: "Documents consensus on project goals prior to signing binding deals.",
      category: "Commercial",
      useCase: "Reaching a baseline understanding with research institutes for co-development.",
      backendId: "memorandum_of_understanding",
      fields: ["Effective Date", "Party A Name", "Party B Name", "Mutual Cooperation Goals", "Term Duration"]
    },
    {
      id: "board_resolution",
      name: "Board Resolution",
      description: "Official record documenting corporate board authorizations.",
      category: "Corporate",
      useCase: "Passing resolutions to authorize directors to sign loan facilities.",
      backendId: "general_contract",
      fields: ["Effective Date", "Company Name", "Resolution Details", "Voting Directors Names"]
    },
    {
      id: "power_of_attorney",
      name: "Power of Attorney",
      description: "Appoints an attorney-in-fact to represent a principal in designated legal matters.",
      category: "Corporate",
      useCase: "Authorizing localized agents to clear customs or register properties.",
      backendId: "affidavit",
      fields: ["Effective Date", "Principal Name", "Attorney Name", "Specific Powers Granted", "Jurisdiction Limit"]
    }
  ];

  // Selected Template
  const [selectedTemplate, setSelectedTemplate] = useState<LegalTemplate>(templatesList[0]);
  const [filterCategory, setFilterCategory] = useState("all");

  // Form Fields State
  const [partyA, setPartyA] = useState("");
  const [partyB, setPartyB] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [term, setTerm] = useState("");
  const [purpose, setPurpose] = useState("");
  const [jurisdiction, setJurisdiction] = useState("Central Govt, India");
  const [language, setLanguage] = useState("en");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [additionalClauses, setAdditionalClauses] = useState("");
  const [userInstructions, setUserInstructions] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Generated Document State
  const [generatedDraft, setGeneratedDraft] = useState("");
  const [docTitle, setDocTitle] = useState("");
  const [docDate, setDocDate] = useState("");
  const [docJurisdiction, setDocJurisdiction] = useState("");
  const [docLanguage, setDocLanguage] = useState("");

  // Review State
  const [reviewText, setReviewText] = useState("");
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewResult, setReviewResult] = useState<any | null>(null);

  // Redline State
  const [originalText, setOriginalText] = useState("");
  const [revisedText, setRevisedText] = useState("");
  const [isRedlining, setIsRedlining] = useState(false);
  const [redlineResult, setRedlineResult] = useState<any | null>(null);

  // Improve State
  const [improveText, setImproveText] = useState("");
  const [improveInstructions, setImproveInstructions] = useState("Make this clause reciprocal and mutual.");
  const [isImproving, setIsImproving] = useState(false);
  const [improveResult, setImproveResult] = useState<any | null>(null);

  // Set initial template variables
  const handleSelectTemplate = (tpl: LegalTemplate) => {
    setSelectedTemplate(tpl);
    setActiveTab("generate");
    toast({ 
      title: "Template Loaded", 
      description: `Drafting console configured for ${tpl.name}.` 
    });
  };

  // Build the generation payload and send to backend
  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedDraft("");
    
    // Map variables depending on backend expectations
    const variables: Record<string, any> = {};
    const backendId = selectedTemplate.backendId;

    if (backendId === "nda") {
      variables["effective_date"] = effectiveDate || new Date().toISOString().split('T')[0];
      variables["disclosing_party"] = partyA || "Disclosing Party";
      variables["receiving_party"] = partyB || "Receiving Party";
      variables["purpose"] = purpose || "Confidential discussions";
    } else if (backendId === "employment_agreement") {
      variables["effective_date"] = effectiveDate || new Date().toISOString().split('T')[0];
      variables["employer_name"] = partyA || "Employer Corp";
      variables["employee_name"] = partyB || "Employee";
      variables["job_title"] = term || "Specialist";
      variables["salary"] = purpose || "Market rate";
    } else if (backendId === "offer_letter") {
      variables["employer_name"] = partyA || "Employer Corp";
      variables["candidate_name"] = partyB || "Candidate";
      variables["job_title"] = term || "Executive";
      variables["start_date"] = effectiveDate || new Date().toISOString().split('T')[0];
      variables["salary"] = purpose || "Standard benefits";
    } else if (backendId === "lease_agreement") {
      variables["effective_date"] = effectiveDate || new Date().toISOString().split('T')[0];
      variables["landlord_name"] = partyA || "Landlord";
      variables["tenant_name"] = partyB || "Tenant";
      variables["property_address"] = purpose || "Designated premises";
      variables["monthly_rent"] = term || "Negotiated sum";
    } else if (backendId === "service_agreement") {
      variables["effective_date"] = effectiveDate || new Date().toISOString().split('T')[0];
      variables["client_name"] = partyA || "Client";
      variables["service_provider"] = partyB || "Service Provider";
      variables["scope_of_services"] = purpose || "Contracted tasks";
      variables["fees"] = term || "Milestone milestones";
    } else if (backendId === "partnership_agreement") {
      variables["effective_date"] = effectiveDate || new Date().toISOString().split('T')[0];
      variables["partner_1"] = partyA || "Partner A";
      variables["partner_2"] = partyB || "Partner B";
      variables["capital_contributions"] = purpose || "Mutual capital";
    } else if (backendId === "vendor_agreement") {
      variables["effective_date"] = effectiveDate || new Date().toISOString().split('T')[0];
      variables["customer_name"] = partyA || "Customer";
      variables["vendor_name"] = partyB || "Vendor";
      variables["goods_services"] = purpose || "Deliverables";
    } else if (backendId === "privacy_policy" || backendId === "terms_and_conditions") {
      variables["effective_date"] = effectiveDate || new Date().toISOString().split('T')[0];
      variables["company_name"] = partyA || "Company Inc.";
      variables["website_url"] = purpose || "https://example.com";
    } else if (backendId === "legal_notice") {
      variables["issue_date"] = effectiveDate || new Date().toISOString().split('T')[0];
      variables["sender_name"] = partyA || "Sender Claimant";
      variables["recipient_name"] = partyB || "Recipient Defendant";
      variables["facts_of_case"] = purpose || "Breach statements";
      variables["demands"] = specialInstructions || "Specific remediation requests";
    } else if (backendId === "memorandum_of_understanding") {
      variables["effective_date"] = effectiveDate || new Date().toISOString().split('T')[0];
      variables["party_a"] = partyA || "Cooperating Party A";
      variables["party_b"] = partyB || "Cooperating Party B";
      variables["mutual_goals"] = purpose || "Alliance benchmarks";
    } else if (backendId === "affidavit") {
      variables["effective_date"] = effectiveDate || new Date().toISOString().split('T')[0];
      variables["deponent_name"] = partyA || "Deponent";
      variables["deponent_address"] = partyB || "Deponent residence";
      variables["statements"] = purpose || "Sworn deposition facts";
    } else {
      variables["effective_date"] = effectiveDate || new Date().toISOString().split('T')[0];
      variables["party_a"] = partyA || "Party A";
      variables["party_b"] = partyB || "Party B";
      variables["recitals"] = purpose || "Contracted recitals";
    }

    // Build compound user instructions to guide Gemini
    const compoundInstructions = `
Document Type: Please generate a high-quality ${selectedTemplate.name}.
Target Jurisdiction: ${jurisdiction}
Draft Language: ${language}
Term / Duration: ${term}
Special Drafting Requirements: ${specialInstructions}
Additional Custom Clauses to Integrate: ${additionalClauses}
Extra guidelines: ${userInstructions}
`.trim();

    try {
      const res = await generateDraft({
        doc_type: selectedTemplate.backendId,
        variables,
        user_instructions: compoundInstructions
      });
      
      const resData = res.data || res;
      const draftText = resData.generated_draft || resData.draft || "Draft generation succeeded.";
      
      setGeneratedDraft(draftText);
      setDocTitle(selectedTemplate.name);
      setDocDate(effectiveDate || new Date().toLocaleDateString());
      setDocJurisdiction(jurisdiction);
      setDocLanguage(language === "en" ? "English" : language);
      
      toast({ 
        title: "Draft Compiled", 
        description: "Legal workspace document successfully generated by AI." 
      });
    } catch (e) {
      console.error(e);
      toast({ 
        title: "Generation Failed", 
        description: "Could not compile the legal draft templates.", 
        variant: "destructive" 
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Audit document text
  const handleReview = async () => {
    if (!reviewText.trim()) return;
    setIsReviewing(true);
    setReviewResult(null);
    try {
      const res = await reviewDraft({
        text: reviewText,
        doc_type: selectedTemplate.backendId
      });
      const data = res.data || res;
      setReviewResult(data.review_analysis || data);
      toast({ 
        title: "Audit Completed", 
        description: "Found risk provisions and missing clause indexes." 
      });
    } catch (e) {
      console.error(e);
      toast({ 
        title: "Audit Failed", 
        description: "Failed to audit draft contract.", 
        variant: "destructive" 
      });
    } finally {
      setIsReviewing(false);
    }
  };

  // Compare original vs revised
  const handleRedline = async () => {
    if (!originalText.trim() || !revisedText.trim()) return;
    setIsRedlining(true);
    setRedlineResult(null);
    try {
      const res = await redlineDraft({
        original_text: originalText,
        revised_text: revisedText
      });
      setRedlineResult(res.data || res);
      toast({ 
        title: "Redlines Generated", 
        description: "Version differences indexed successfully." 
      });
    } catch (e) {
      console.error(e);
      toast({ 
        title: "Redline Failed", 
        description: "Failed to compile redlines.", 
        variant: "destructive" 
      });
    } finally {
      setIsRedlining(false);
    }
  };

  // Improve specific clause text
  const handleImprove = async () => {
    if (!improveText.trim()) return;
    setIsImproving(true);
    setImproveResult(null);
    try {
      const res = await improveDraft({
        text: improveText,
        instructions: improveInstructions
      });
      const data = res.data || res;
      setImproveResult(data);
      toast({ 
        title: "Clause Rewritten", 
        description: "AI successfully improved your clause." 
      });
    } catch (e) {
      console.error(e);
      toast({ 
        title: "Improvement Failed", 
        description: "Failed to rewrite clause.", 
        variant: "destructive" 
      });
    } finally {
      setIsImproving(false);
    }
  };

  // Download draft file
  const handleExportText = (content: string, filename = "draft.txt") => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Unique category filter lists
  const categories = ["all", "Confidentiality", "HR / Employment", "Corporate", "Commercial", "Compliance / Tech", "Real Estate", "Litigation"];
  
  const filteredTemplates = filterCategory === "all" 
    ? templatesList 
    : templatesList.filter(t => t.category === filterCategory);

  // Markdown styling parser wrapper
  const renderFormattedDoc = (text: string) => {
    if (!text) return null;
    return text.split("\n").map((line, idx) => {
      const cleanLine = line.trim();
      if (cleanLine.startsWith("# ")) {
        return (
          <h1 key={idx} className="text-center text-base font-bold font-sans tracking-tight uppercase border-b border-neutral-350 pb-2.5 my-6 text-slate-900">
            {cleanLine.replace("# ", "")}
          </h1>
        );
      }
      if (cleanLine.startsWith("## ")) {
        return (
          <h2 key={idx} className="text-xs font-bold font-sans uppercase tracking-wider mt-5 mb-2 text-slate-800">
            {cleanLine.replace("## ", "")}
          </h2>
        );
      }
      if (cleanLine.startsWith("### ")) {
        return (
          <h3 key={idx} className="text-[11px] font-bold font-sans uppercase tracking-wider pl-2 mt-4 mb-2 text-slate-700">
            {cleanLine.replace("### ", "")}
          </h3>
        );
      }
      if (cleanLine.startsWith("- ") || cleanLine.startsWith("* ")) {
        return (
          <li key={idx} className="list-disc pl-6 leading-relaxed my-1.5 font-serif text-slate-750">
            {cleanLine.substring(2)}
          </li>
        );
      }
      if (cleanLine === "") {
        return <div key={idx} className="h-3" />;
      }
      // Indent double bracket variables or highlight clauses
      const isIndented = cleanLine.match(/^\d+\./) || cleanLine.startsWith("1.") || cleanLine.startsWith("2.") || cleanLine.startsWith("3.");
      return (
        <p key={idx} className={`leading-relaxed my-2 font-serif text-slate-750 text-justify text-xs ${isIndented ? "pl-4 font-semibold" : ""}`}>
          {cleanLine}
        </p>
      );
    });
  };

  return (
    <div className="h-full">
      {/* Workspace Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-neutral-200 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              <FileEdit className="h-5 w-5 text-emerald-600" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 font-sans">Drafting Workspace</h1>
          </div>
          <p className="text-3xs text-slate-400 font-mono uppercase tracking-widest">
            AI-driven legal document generation, redlining, audit, and clause refinement
          </p>
        </div>
      </div>

      {/* Premium Sticky Top Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-neutral-50 border border-neutral-200 p-1 h-10 w-full grid grid-cols-5 sticky top-28 z-20 rounded-none shadow-xs">
          <TabsTrigger value="templates" className="text-3xs font-mono uppercase tracking-wider data-[state=active]:bg-slate-800 data-[state=active]:text-white rounded-none">1. Templates</TabsTrigger>
          <TabsTrigger value="generate" className="text-3xs font-mono uppercase tracking-wider data-[state=active]:bg-slate-800 data-[state=active]:text-white rounded-none">2. Generate</TabsTrigger>
          <TabsTrigger value="review" className="text-3xs font-mono uppercase tracking-wider data-[state=active]:bg-slate-800 data-[state=active]:text-white rounded-none">3. Review & Audit</TabsTrigger>
          <TabsTrigger value="redline" className="text-3xs font-mono uppercase tracking-wider data-[state=active]:bg-slate-800 data-[state=active]:text-white rounded-none">4. Redline Compare</TabsTrigger>
          <TabsTrigger value="improve" className="text-3xs font-mono uppercase tracking-wider data-[state=active]:bg-slate-800 data-[state=active]:text-white rounded-none">5. Improve Clauses</TabsTrigger>
        </TabsList>

        {/* 1. TEMPLATES GALLERY */}
        <TabsContent value="templates" className="mt-0 space-y-6">
          
          {/* Category Filter Chips */}
          <div className="flex flex-wrap gap-1.5 border-b border-neutral-100 pb-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1 text-3xs font-mono uppercase tracking-wider transition-all border rounded-none ${
                  filterCategory === cat
                    ? "bg-emerald-600 text-white border-emerald-600 font-bold"
                    : "bg-white text-slate-500 border-neutral-200 hover:bg-neutral-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid of Templates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {filteredTemplates.map((tpl) => (
              <div 
                key={tpl.id} 
                className="border border-neutral-200 bg-white p-5 hover:border-emerald-600/40 hover:scale-[1.01] transition-all flex flex-col justify-between h-full rounded-none group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400">{tpl.category}</span>
                    <Badge className="bg-neutral-100 text-slate-650 hover:bg-neutral-100 text-[8px] font-mono border border-neutral-200 rounded-none uppercase">
                      {tpl.backendId}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="font-bold text-xs text-slate-800 group-hover:text-emerald-700 transition-colors font-sans">
                      {tpl.name}
                    </h3>
                    <p className="text-[11px] text-slate-450 leading-relaxed font-serif">
                      {tpl.description}
                    </p>
                  </div>

                  <div className="p-2.5 bg-neutral-50 border border-neutral-150 text-[10px] space-y-0.5 rounded-none">
                    <span className="font-mono text-3xs uppercase tracking-wider text-slate-450 block font-bold">Use Case:</span>
                    <p className="text-slate-600 leading-normal font-sans">{tpl.useCase}</p>
                  </div>
                </div>

                <Button 
                  onClick={() => handleSelectTemplate(tpl)} 
                  className="w-full h-8 bg-slate-800 hover:bg-slate-900 text-white rounded-none font-semibold text-3xs uppercase tracking-wider mt-5"
                >
                  Configure Template
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* 2. GENERATE DRAFT PANEL */}
        <TabsContent value="generate" className="mt-0">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
            
            {/* Left: Input parameters form */}
            <div className="xl:col-span-5 border border-neutral-200 bg-white p-5 space-y-5 rounded-none">
              
              <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
                <span className="text-[10px] font-mono text-emerald-700 uppercase font-bold">
                  Configuring: {selectedTemplate.name}
                </span>
                <button 
                  onClick={() => setActiveTab("templates")}
                  className="text-3xs font-mono uppercase text-slate-400 hover:text-slate-900 underline"
                >
                  Change Template
                </button>
              </div>

              {/* Structured Drafting Fields */}
              <div className="space-y-4">
                
                {/* Form fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                  
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-slate-450 uppercase block font-bold">Document Type</label>
                    <select
                      value={selectedTemplate.id}
                      onChange={(e) => {
                        const matched = templatesList.find(t => t.id === e.target.value);
                        if (matched) setSelectedTemplate(matched);
                      }}
                      className="w-full bg-white border border-neutral-200 px-2 py-1.5 focus:outline-none focus:border-emerald-600 rounded-none cursor-pointer text-slate-800"
                    >
                      {templatesList.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-slate-450 uppercase block font-bold">Jurisdiction</label>
                    <select
                      value={jurisdiction}
                      onChange={(e) => setJurisdiction(e.target.value)}
                      className="w-full bg-white border border-neutral-200 px-2 py-1.5 focus:outline-none focus:border-emerald-600 rounded-none cursor-pointer text-slate-800"
                    >
                      <option value="Central Govt, India">India (Central Laws)</option>
                      <option value="State of Maharashtra, India">Maharashtra State</option>
                      <option value="State of Delhi, India">Delhi NCR</option>
                      <option value="State of Karnataka, India">Karnataka State</option>
                      <option value="United Kingdom (E&W)">United Kingdom</option>
                      <option value="State of California, USA">California, USA</option>
                      <option value="Delaware Corporate Court, USA">Delaware Corporate Court</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-slate-450 uppercase block font-bold">Drafting Language</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full bg-white border border-neutral-200 px-2 py-1.5 focus:outline-none focus:border-emerald-600 rounded-none cursor-pointer text-slate-800"
                    >
                      <option value="en">English (Default)</option>
                      <option value="hi-IN">Hindi (हिंदी)</option>
                      <option value="ta-IN">Tamil (தமிழ்)</option>
                      <option value="te-IN">Telugu (తెలుగు)</option>
                      <option value="bn-IN">Bengali (বাংলা)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-slate-450 uppercase block font-bold">Effective Date</label>
                    <input
                      type="date"
                      value={effectiveDate}
                      onChange={(e) => setEffectiveDate(e.target.value)}
                      className="w-full bg-white border border-neutral-200 px-2 py-1.5 focus:outline-none focus:border-emerald-600 rounded-none text-slate-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-slate-450 uppercase block font-bold">Party A (First Party)</label>
                    <input
                      type="text"
                      placeholder="e.g. Acme Corp Inc."
                      value={partyA}
                      onChange={(e) => setPartyA(e.target.value)}
                      className="w-full bg-white border border-neutral-200 px-2 py-1.5 focus:outline-none focus:border-emerald-600 rounded-none text-slate-800 placeholder:text-neutral-350"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-slate-450 uppercase block font-bold">Party B (Second Party)</label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      value={partyB}
                      onChange={(e) => setPartyB(e.target.value)}
                      className="w-full bg-white border border-neutral-200 px-2 py-1.5 focus:outline-none focus:border-emerald-600 rounded-none text-slate-800 placeholder:text-neutral-350"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[9px] font-mono text-slate-450 uppercase block font-bold">Agreement Term (Duration)</label>
                    <input
                      type="text"
                      placeholder="e.g. 12 Months from Effective Date / Indefinite until terminated"
                      value={term}
                      onChange={(e) => setTerm(e.target.value)}
                      className="w-full bg-white border border-neutral-200 px-2 py-1.5 focus:outline-none focus:border-emerald-600 rounded-none text-slate-800 placeholder:text-neutral-350"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[9px] font-mono text-slate-450 uppercase block font-bold">Purpose / Scope of Agreement</label>
                    <textarea
                      placeholder="Explain what transaction or relationship this contract governs..."
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      rows={2}
                      className="w-full bg-white border border-neutral-200 px-2 py-1.5 focus:outline-none focus:border-emerald-600 rounded-none text-slate-800 placeholder:text-neutral-350 resize-none leading-relaxed"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[9px] font-mono text-slate-455 uppercase block font-bold">Additional Specific Clauses</label>
                    <textarea
                      placeholder="Optionally paste or type custom clause provisions you want included..."
                      value={additionalClauses}
                      onChange={(e) => setAdditionalClauses(e.target.value)}
                      rows={2}
                      className="w-full bg-white border border-neutral-200 px-2 py-1.5 focus:outline-none focus:border-emerald-600 rounded-none text-slate-800 placeholder:text-neutral-350 resize-none leading-relaxed"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[9px] font-mono text-slate-450 uppercase block font-bold">Drafting Instructions / Guidance</label>
                      <VoiceButton onTranscribe={(t) => setSpecialInstructions(prev => prev + (prev ? " " : "") + t)} />
                    </div>
                    <textarea
                      placeholder="e.g. Set confidentiality threshold to 5 years, add 90-day cure period for default, etc."
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      rows={2}
                      className="w-full bg-white border border-neutral-200 px-2 py-1.5 focus:outline-none focus:border-emerald-600 rounded-none text-slate-800 placeholder:text-neutral-350 resize-none leading-relaxed"
                    />
                  </div>

                </div>

              </div>

              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating} 
                className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-none font-semibold text-xs uppercase tracking-wider"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Assembling legal draft...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Draft
                  </>
                )}
              </Button>

            </div>

            {/* Right: Professional virtual A4 Document Viewer */}
            <div className="xl:col-span-7 space-y-6">
              {generatedDraft ? (
                <div className="space-y-4">
                  
                  {/* Actions Header Bar */}
                  <div className="flex flex-wrap items-center justify-between bg-neutral-50 border border-neutral-200 p-3 rounded-none">
                    <div className="flex items-center gap-1.5">
                      <AudioPlaybackButton text={generatedDraft} className="scale-90 bg-white border-neutral-200" />
                      <Button
                        onClick={() => {
                          setReviewText(generatedDraft);
                          setActiveTab("review");
                          toast({ title: "Transferring draft", description: "Vulnerability audit panel loaded." });
                        }}
                        variant="outline"
                        className="h-8 px-3.5 border-neutral-200 text-3xs uppercase tracking-wider font-mono rounded-none bg-white hover:bg-neutral-50"
                      >
                        <FileCheck className="h-3.5 w-3.5 mr-1" />
                        Audit Draft
                      </Button>
                      <Button
                        onClick={() => {
                          setOriginalText(generatedDraft);
                          setActiveTab("redline");
                          toast({ title: "Transferring draft", description: "Redline comparison panel loaded." });
                        }}
                        variant="outline"
                        className="h-8 px-3.5 border-neutral-200 text-3xs uppercase tracking-wider font-mono rounded-none bg-white hover:bg-neutral-50"
                      >
                        <Files className="h-3.5 w-3.5 mr-1" />
                        Set Baseline
                      </Button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Button
                        onClick={() => {
                          navigator.clipboard.writeText(generatedDraft);
                          toast({ title: "Copied", description: "Draft text copied to clipboard." });
                        }}
                        variant="outline"
                        className="h-8 w-8 p-0 border-neutral-200 rounded-none bg-white"
                        title="Copy draft"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button 
                        onClick={() => handleExportText(generatedDraft, `${selectedTemplate.id}_draft.md`)}
                        className="h-8 px-3 bg-slate-800 hover:bg-slate-900 text-white text-3xs font-mono uppercase tracking-wider rounded-none"
                      >
                        <Download className="h-3.5 w-3.5 mr-1.5" />
                        Export .md
                      </Button>
                    </div>
                  </div>

                  {/* Virtual A4 Paper document container */}
                  <div className="bg-white border border-neutral-200 shadow-sm p-12 min-h-[750px] relative overflow-hidden rounded-none mx-auto max-w-[21cm]">
                    
                    {/* Document Watermark / Header */}
                    <div className="flex justify-between items-center text-[9px] font-mono uppercase tracking-wider text-slate-400 border-b border-neutral-100 pb-3 mb-8">
                      <span>{docTitle}</span>
                      <span className="text-emerald-700 font-bold">✓ AI Generated Draft</span>
                      <span>DATE: {docDate}</span>
                    </div>

                    {/* Meta Section */}
                    <div className="text-[10px] font-mono text-slate-500 uppercase space-y-1 border-l-2 border-slate-305 pl-3 mb-6">
                      <p><span className="text-slate-400">Jurisdiction Forum:</span> {docJurisdiction}</p>
                      <p><span className="text-slate-400">Draft Language:</span> {docLanguage}</p>
                    </div>

                    {/* Parsed legal content rendering */}
                    <div className="space-y-4">
                      {renderFormattedDoc(generatedDraft)}
                    </div>

                    {/* Signatures placeholder */}
                    <div className="grid grid-cols-2 gap-12 border-t border-neutral-100 pt-8 mt-12 text-[10px] font-mono uppercase text-slate-550">
                      <div className="space-y-8">
                        <span>For Party A (Principal):</span>
                        <div className="border-b border-neutral-250 w-32 h-6" />
                        <span>Authorized Representative</span>
                      </div>
                      <div className="space-y-8">
                        <span>For Party B (Counterparty):</span>
                        <div className="border-b border-neutral-250 w-32 h-6" />
                        <span>Authorized Representative</span>
                      </div>
                    </div>

                  </div>

                </div>
              ) : (
                <div className="border border-neutral-200 border-dashed bg-neutral-50/50 p-12 text-center space-y-4 rounded-none min-h-[500px] flex flex-col justify-center items-center font-serif">
                  <FileText className="h-10 w-10 text-neutral-350" />
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-700 font-sans">Draft Workspace Viewport</p>
                    <p className="text-[10px] text-slate-400 max-w-xs mx-auto leading-relaxed">
                      Fill out the document variables and click "Generate Draft" to compile the virtual contract page.
                    </p>
                  </div>
                </div>
              )}
            </div>

          </div>
        </TabsContent>

        {/* 3. REVIEW & AUDIT PANEL */}
        <TabsContent value="review" className="mt-0">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
            
            {/* Input target contract */}
            <div className="xl:col-span-6 border border-neutral-200 bg-white p-5 space-y-5 rounded-none">
              <div className="flex justify-between items-center border-b border-neutral-100 pb-2">
                <span className="text-[10px] font-mono text-slate-450 uppercase font-bold">Vulnerability Audit Console</span>
                <VoiceButton onTranscribe={(t) => setReviewText(prev => prev + (prev ? " " : "") + t)} />
              </div>

              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Paste contract code or drafting lines here to scan for missing clauses, ambiguities, and liabilities..."
                rows={16}
                className="w-full bg-white border border-neutral-200 focus:border-emerald-600 focus:outline-none p-3 text-xs text-slate-800 placeholder:text-neutral-400 font-serif leading-relaxed rounded-none"
              />

              <Button 
                onClick={handleReview} 
                disabled={isReviewing || !reviewText.trim()} 
                className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-none font-semibold text-xs uppercase tracking-wider"
              >
                {isReviewing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Running compliance check...
                  </>
                ) : (
                  <>
                    <FileCheck className="h-4 w-4 mr-2" />
                    Analyze Draft
                  </>
                )}
              </Button>
            </div>

            {/* Audit Scorecard display */}
            <div className="xl:col-span-6 space-y-6">
              {reviewResult ? (
                <div className="space-y-6">
                  
                  {/* Overall Risk Banner */}
                  <div className={`p-4 border rounded-none flex items-center justify-between ${
                    (reviewResult.risks?.length || 0) > 3 
                      ? "bg-red-50/50 border-red-200 text-red-900"
                      : (reviewResult.risks?.length || 0) > 0 
                        ? "bg-amber-50/50 border-amber-200 text-amber-900"
                        : "bg-emerald-50/50 border-emerald-200 text-emerald-950"
                  }`}>
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-mono uppercase tracking-wider block font-bold">Vulnerability Audit Rating</span>
                      <span className="font-sans font-bold text-xs uppercase">
                        {(reviewResult.risks?.length || 0) > 3 ? "HIGH RISK LIABILITY OUTLINE" : (reviewResult.risks?.length || 0) > 0 ? "MEDIUM RISK ALLOCATION" : "SECURE CONTRACT BASELINE"}
                      </span>
                    </div>

                    <div className={`text-2xs font-mono font-bold border px-2.5 py-1 ${
                      (reviewResult.risks?.length || 0) > 3 ? "bg-red-100 border-red-300 text-red-800" :
                      (reviewResult.risks?.length || 0) > 0 ? "bg-amber-100 border-amber-300 text-amber-800" :
                      "bg-emerald-100 border-emerald-300 text-emerald-800"
                    }`}>
                      {(reviewResult.risks?.length || 0) > 3 ? "HIGH" : (reviewResult.risks?.length || 0) > 0 ? "MEDIUM" : "LOW"} RISK
                    </div>
                  </div>

                  {/* 1. Missing Clauses */}
                  <div className="border border-neutral-200 bg-white p-5 space-y-3.5 rounded-none">
                    <span className="text-[10px] font-mono text-slate-450 uppercase block font-bold border-b border-neutral-100 pb-2">
                      Missing Clauses ({reviewResult.missing_clauses?.length || 0})
                    </span>
                    
                    <div className="space-y-2">
                      {reviewResult.missing_clauses && reviewResult.missing_clauses.length > 0 ? (
                        reviewResult.missing_clauses.map((c: string, idx: number) => (
                          <div key={idx} className="p-3 bg-red-50/40 border border-red-150 rounded-none text-2xs flex justify-between items-center">
                            <span className="font-sans font-semibold text-red-900">📄 {c}</span>
                            <Badge className="bg-red-100 border-red-200 text-red-805 hover:bg-red-100 text-[8px] font-mono uppercase rounded-none">
                              High severity
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center gap-1.5 text-emerald-700 text-2xs font-semibold">
                          <Check className="h-4 w-4" />
                          All standard baseline template clauses detected.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 2. Ambiguous Clauses */}
                  <div className="border border-neutral-200 bg-white p-5 space-y-3.5 rounded-none">
                    <span className="text-[10px] font-mono text-slate-450 uppercase block font-bold border-b border-neutral-100 pb-2">
                      Ambiguous Clauses ({reviewResult.ambiguous_wording?.length || 0})
                    </span>
                    
                    <div className="space-y-3.5 text-2xs text-slate-700">
                      {reviewResult.ambiguous_wording && reviewResult.ambiguous_wording.length > 0 ? (
                        reviewResult.ambiguous_wording.map((c: any, idx: number) => {
                          const clauseName = typeof c === 'object' ? c.clause : `Provision #${idx+1}`;
                          const description = typeof c === 'object' ? c.description || c.reason : String(c);
                          const severity = typeof c === 'object' ? c.severity || "medium" : "medium";
                          
                          return (
                            <div key={idx} className="space-y-1.5 border-b border-neutral-100 pb-3 last:border-0 last:pb-0">
                              <div className="flex justify-between items-center">
                                <span className="font-sans font-semibold text-slate-800">{clauseName}</span>
                                <Badge className={`text-[8px] font-mono uppercase rounded-none border ${
                                  severity === 'high' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}>
                                  {severity} severity
                                </Badge>
                              </div>
                              <p className="font-serif leading-relaxed text-slate-600">{description}</p>
                            </div>
                          );
                        })
                      ) : (
                        <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                          <Check className="h-4 w-4" />
                          No ambiguous clauses flagged.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 3. Compliance Issues */}
                  <div className="border border-neutral-200 bg-white p-5 space-y-3.5 rounded-none">
                    <span className="text-[10px] font-mono text-slate-450 uppercase block font-bold border-b border-neutral-100 pb-2">
                      Compliance Issues / Risks ({reviewResult.risks?.length || 0})
                    </span>
                    
                    <div className="space-y-3">
                      {reviewResult.risks && reviewResult.risks.length > 0 ? (
                        reviewResult.risks.map((r: any, idx: number) => (
                          <div key={idx} className="p-3 border border-neutral-150 bg-neutral-50 text-2xs space-y-1.5 rounded-none">
                            <div className="flex justify-between items-center">
                              <span className="font-sans font-semibold text-slate-850">{r.clause || "Liability Provision"}</span>
                              <Badge className={`text-[8px] font-mono uppercase rounded-none ${
                                r.level === 'Critical' || r.level === 'High' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                              }`}>
                                {r.level || "Medium"}
                              </Badge>
                            </div>
                            <p className="font-serif text-slate-600 leading-normal">"{r.excerpt || r.reason}"</p>
                            <p className="text-slate-700 font-sans font-semibold"><span className="text-slate-400 font-mono text-[9px] uppercase">Filing Fix:</span> {r.recommendation}</p>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                          <Check className="h-4 w-4" />
                          Compliance audit verified: No active anomalies detected.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 4. Suggestions */}
                  <div className="border border-neutral-200 bg-white p-5 space-y-3.5 rounded-none text-2xs text-slate-700">
                    <span className="text-[10px] font-mono text-slate-450 uppercase block font-bold border-b border-neutral-100 pb-2">
                      Audit Recommendations
                    </span>
                    
                    <ul className="list-disc pl-5 space-y-1.5 leading-relaxed font-serif">
                      {reviewResult.recommendations && reviewResult.recommendations.length > 0 ? (
                        reviewResult.recommendations.map((rec: string, idx: number) => (
                          <li key={idx} className="text-slate-650">{rec}</li>
                        ))
                      ) : (
                        <li className="text-slate-400 italic">No recommendations required.</li>
                      )}
                    </ul>
                  </div>

                </div>
              ) : (
                <div className="border border-neutral-200 border-dashed bg-neutral-50/50 p-12 text-center space-y-4 rounded-none min-h-[400px] flex flex-col justify-center items-center font-serif">
                  <FileCheck className="h-10 w-10 text-neutral-350" />
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-700 font-sans">Audit Results panel</p>
                    <p className="text-[10px] text-slate-400 max-w-xs mx-auto leading-relaxed">
                      Insert contract text in the console panel and run analysis to populate regulatory scores.
                    </p>
                  </div>
                </div>
              )}
            </div>

          </div>
        </TabsContent>

        {/* 4. REDLINE COMPARE PANEL */}
        <TabsContent value="redline" className="mt-0">
          <div className="space-y-6">
            
            {/* Side-by-side editing text fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="border border-neutral-200 bg-white p-5 space-y-3 rounded-none">
                <label className="text-[10px] font-mono text-slate-450 uppercase font-bold block">Document Version A (Baseline)</label>
                <textarea
                  value={originalText}
                  onChange={(e) => setOriginalText(e.target.value)}
                  placeholder="Paste original contract draft lines..."
                  rows={10}
                  className="w-full bg-white border border-neutral-200 focus:border-emerald-600 focus:outline-none p-3 text-xs text-slate-800 font-serif leading-relaxed rounded-none"
                />
              </div>

              <div className="border border-neutral-200 bg-white p-5 space-y-3 rounded-none">
                <label className="text-[10px] font-mono text-slate-450 uppercase font-bold block">Document Version B (Counterparty / Revised)</label>
                <textarea
                  value={revisedText}
                  onChange={(e) => setRevisedText(e.target.value)}
                  placeholder="Paste revised contract draft lines..."
                  rows={10}
                  className="w-full bg-white border border-neutral-200 focus:border-emerald-600 focus:outline-none p-3 text-xs text-slate-800 font-serif leading-relaxed rounded-none"
                />
              </div>

            </div>

            <Button 
              onClick={handleRedline} 
              disabled={isRedlining || !originalText.trim() || !revisedText.trim()} 
              className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-none font-semibold text-xs uppercase tracking-wider"
            >
              {isRedlining ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Generating redlines...
                </>
              ) : (
                <>
                  <Scale className="h-4 w-4 mr-2" />
                  Compare Drafts
                </>
              )}
            </Button>

            {/* Redline Output details */}
            {redlineResult ? (
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start pt-6 border-t border-neutral-200">
                
                {/* Left: Modifications Diff Lists */}
                <div className="xl:col-span-8 space-y-4">
                  <span className="text-[10px] font-mono text-slate-450 uppercase block font-bold">Clause Comparison redlines</span>
                  
                  <div className="space-y-4">
                    {redlineResult.modifications && redlineResult.modifications.map((mod: any, idx: number) => (
                      <div key={idx} className="p-4 bg-white border border-neutral-200 rounded-none space-y-3 text-2xs">
                        <div className="flex justify-between items-center text-[9px] font-mono border-b border-neutral-100 pb-2">
                          <span className="font-bold text-slate-800 uppercase">📄 {mod.clause_type || "Provision"}</span>
                          <span className="text-emerald-700 font-bold bg-emerald-50 px-1 border border-emerald-100 uppercase">MODIFIED</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-3 bg-red-50/40 border border-red-150 rounded-none text-red-950 font-serif leading-relaxed relative">
                            <span className="absolute right-2 top-2 text-[8px] font-mono text-red-400 uppercase font-bold">Removed</span>
                            <span className="font-mono text-[8px] text-red-500 uppercase block font-bold mb-1">Original clause text:</span>
                            {mod.original}
                          </div>
                          <div className="p-3 bg-emerald-50/40 border border-emerald-150 rounded-none text-emerald-950 font-serif leading-relaxed relative">
                            <span className="absolute right-2 top-2 text-[8px] font-mono text-emerald-600 uppercase font-bold">Added</span>
                            <span className="font-mono text-[8px] text-emerald-600 uppercase block font-bold mb-1">Revised clause text:</span>
                            {mod.revised}
                          </div>
                        </div>

                        {mod.impact_summary && (
                          <div className="bg-neutral-50 p-2.5 border border-neutral-200 text-slate-650 font-sans leading-relaxed mt-2 rounded-none">
                            <span className="font-mono text-[9px] uppercase tracking-wider text-slate-450 block font-bold">AI Legal Risk Shift Assessment:</span>
                            {mod.impact_summary}
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Insertions & Deletions list arrays */}
                    {redlineResult.insertions && redlineResult.insertions.length > 0 && (
                      <div className="p-4 bg-emerald-50/20 border border-emerald-100 space-y-2 rounded-none">
                        <span className="text-[9px] font-mono uppercase text-emerald-700 block font-bold">Additions / Inserted text lines</span>
                        <ul className="list-disc pl-5 text-2xs font-serif text-slate-750 leading-relaxed">
                          {redlineResult.insertions.map((ins: any, idx: number) => (
                            <li key={idx}>{typeof ins === 'string' ? ins : ins.text}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {redlineResult.deletions && redlineResult.deletions.length > 0 && (
                      <div className="p-4 bg-red-50/20 border border-red-150 space-y-2 rounded-none">
                        <span className="text-[9px] font-mono uppercase text-red-700 block font-bold">Deletions / Removed text lines</span>
                        <ul className="list-disc pl-5 text-2xs font-serif text-slate-750 leading-relaxed">
                          {redlineResult.deletions.map((del: any, idx: number) => (
                            <li key={idx}>{typeof del === 'string' ? del : del.text}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Summary cards */}
                <div className="xl:col-span-4 space-y-6">
                  
                  {/* Summary of changes */}
                  <div className="border border-neutral-200 bg-white p-4 space-y-3 rounded-none text-2xs text-slate-700">
                    <span className="text-[10px] font-mono text-slate-450 uppercase block font-bold border-b border-neutral-100 pb-2">
                      Comparison Summary
                    </span>
                    <p className="font-serif leading-relaxed text-slate-650">{redlineResult.summary}</p>
                  </div>

                  {/* Legal impact block */}
                  <div className="border border-neutral-200 bg-white p-4 space-y-3 rounded-none text-2xs text-slate-700">
                    <span className="text-[10px] font-mono text-slate-450 uppercase block font-bold border-b border-neutral-100 pb-2">
                      Overall Legal Impact
                    </span>
                    <p className="font-serif leading-relaxed text-slate-655">{redlineResult.legal_impact || redlineResult.risk_changes}</p>
                  </div>

                </div>

              </div>
            ) : (
              <div className="border border-neutral-200 border-dashed bg-neutral-50/50 p-12 text-center space-y-4 rounded-none min-h-[300px] flex flex-col justify-center items-center font-serif">
                <Files className="h-10 w-10 text-neutral-350" />
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-700 font-sans">Redline Analysis panel</p>
                  <p className="text-[10px] text-slate-400 max-w-xs mx-auto leading-relaxed">
                    Select original and counterparty drafts in columns and click compare to render the color-coded variations.
                  </p>
                </div>
              </div>
            )}

          </div>
        </TabsContent>

        {/* 5. IMPROVE CLAUSES PANEL */}
        <TabsContent value="improve" className="mt-0">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
            
            {/* Input clause console */}
            <div className="xl:col-span-6 border border-neutral-200 bg-white p-5 space-y-5 rounded-none">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-450 uppercase font-bold block">Target Clause Provision Text</label>
                <textarea
                  value={improveText}
                  onChange={(e) => setImproveText(e.target.value)}
                  placeholder="Paste specific clause text lines here to modify or improve..."
                  rows={8}
                  className="w-full bg-white border border-neutral-200 focus:border-emerald-600 focus:outline-none p-3 text-xs text-slate-800 font-serif leading-relaxed rounded-none"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-mono text-slate-450 uppercase font-bold block">Refinement Prompts / Instructions</label>
                  <VoiceButton onTranscribe={(t) => setImproveInstructions(prev => prev + (prev ? " " : "") + t)} />
                </div>
                <input
                  type="text"
                  value={improveInstructions}
                  onChange={(e) => setImproveInstructions(e.target.value)}
                  placeholder="e.g. Rewrite to make liability caps mutual, or make notices written instead of oral."
                  className="w-full bg-white border border-neutral-200 focus:border-emerald-600 focus:outline-none px-3 py-2 text-xs text-slate-800 placeholder:text-neutral-350 rounded-none font-sans"
                />
              </div>

              <Button 
                onClick={handleImprove} 
                disabled={isImproving || !improveText.trim()} 
                className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-none font-semibold text-xs uppercase tracking-wider"
              >
                {isImproving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Optimizing clause...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Optimize Clause
                  </>
                )}
              </Button>
            </div>

            {/* AI Optimization Results */}
            <div className="xl:col-span-6 space-y-6">
              {improveResult ? (
                <div className="space-y-6 text-2xs text-slate-700">
                  
                  {/* Improved Version */}
                  <div className="border border-emerald-200 bg-white p-5 space-y-3 rounded-none relative">
                    <span className="absolute right-4 top-4 text-[8px] font-mono text-emerald-700 font-bold bg-emerald-50 px-1.5 border border-emerald-200 uppercase">
                      Improved Draft Clause
                    </span>
                    <span className="text-[10px] font-mono text-slate-450 uppercase block font-bold border-b border-neutral-100 pb-2">
                      Optimized Version
                    </span>
                    <div className="font-serif leading-relaxed text-slate-800 bg-neutral-50 p-4 border border-neutral-200 rounded-none whitespace-pre-wrap">
                      {improveResult.generated_draft || improveResult.improved_text || improveResult.text || "No draft returned."}
                    </div>

                    <div className="flex justify-end pt-3">
                      <Button
                        onClick={() => {
                          navigator.clipboard.writeText(improveResult.generated_draft || improveResult.improved_text || "");
                          toast({ title: "Copied", description: "Improved clause copied." });
                        }}
                        className="h-8 px-4 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-3xs uppercase tracking-wider rounded-none"
                      >
                        <Copy className="h-3.5 w-3.5 mr-1.5" />
                        Copy Clause
                      </Button>
                    </div>
                  </div>

                  {/* Reason for Improvement */}
                  {(improveResult.executive_summary || improveResult.reason) && (
                    <div className="border border-neutral-200 bg-white p-5 space-y-2 rounded-none">
                      <span className="text-[10px] font-mono text-slate-450 uppercase block font-bold border-b border-neutral-100 pb-2">
                        Reason for Improvement
                      </span>
                      <p className="font-serif leading-relaxed text-slate-650">
                        {improveResult.executive_summary || improveResult.reason}
                      </p>
                    </div>
                  )}

                  {/* Legal Benefit */}
                  {improveResult.clause_explanations && (
                    <div className="border border-neutral-200 bg-white p-5 space-y-3 rounded-none">
                      <span className="text-[10px] font-mono text-slate-450 uppercase block font-bold border-b border-neutral-100 pb-2">
                        Legal Benefit Assessment
                      </span>
                      <div className="space-y-2">
                        {Object.entries(improveResult.clause_explanations).map(([key, exp]: any, idx) => (
                          <div key={idx} className="space-y-1">
                            <span className="font-sans font-semibold text-[9px] uppercase tracking-wider text-slate-400 block font-mono">
                              {key.replace("_", " ")}
                            </span>
                            <p className="font-serif leading-relaxed text-slate-600">{exp}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Risks */}
                  {improveResult.risk_assessment && improveResult.risk_assessment.length > 0 && (
                    <div className="border border-neutral-200 bg-white p-5 space-y-3 rounded-none">
                      <span className="text-[10px] font-mono text-slate-450 uppercase block font-bold border-b border-neutral-100 pb-2">
                        Potential Residual Risks
                      </span>
                      <div className="space-y-2.5">
                        {improveResult.risk_assessment.map((r: any, idx: number) => (
                          <div key={idx} className="p-3 bg-red-50/30 border border-red-150 rounded-none text-2xs space-y-1.5">
                            <div className="flex justify-between items-center">
                              <span className="font-sans font-semibold text-red-900">{r.clause || "Residual Provision"}</span>
                              <Badge className="bg-red-100 text-red-750 text-[8px] font-mono uppercase rounded-none border border-red-200">
                                {r.level || "Medium"}
                              </Badge>
                            </div>
                            <p className="font-serif text-slate-600 leading-normal">{r.reason}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              ) : (
                <div className="border border-neutral-200 border-dashed bg-neutral-50/50 p-12 text-center space-y-4 rounded-none min-h-[300px] flex flex-col justify-center items-center font-serif">
                  <Sparkles className="h-10 w-10 text-neutral-350" />
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-700 font-sans">Optimized Clause Results panel</p>
                    <p className="text-[10px] text-slate-400 max-w-xs mx-auto leading-relaxed">
                      Provide a clause and refining prompt to generate the optimized, risk-assessed rewrite options.
                    </p>
                  </div>
                </div>
              )}
            </div>

          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
};

export default DocumentDrafting;
