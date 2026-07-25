export interface CaseResult {
  id: string;
  title: string;
  citation: string;
  court: string;
  date: string;
  summary: string;
  relevance: number;
  jurisdiction: string;
  tags: string[];
  citedBy: number;
}

export interface StatuteResult {
  id: string;
  title: string;
  citation: string;
  jurisdiction: string;
  enacted: string;
  summary: string;
  relevance: number;
  category: string;
  sections: string[];
}

export interface ArticleResult {
  id: string;
  title: string;
  author: string;
  journal: string;
  date: string;
  summary: string;
  relevance: number;
  topics: string[];
  citations: number;
}

export const sampleCases: CaseResult[] = [
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
    citedBy: 245,
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
    citedBy: 178,
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
    citedBy: 156,
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
    citedBy: 203,
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
    citedBy: 189,
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
    citedBy: 137,
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
    citedBy: 128,
  },
];

export const sampleStatutes: StatuteResult[] = [
  {
    id: "stat-1",
    title: "Information Technology Act, 2000",
    citation: "Act No. 21 of 2000",
    jurisdiction: "India",
    enacted: "2000-06-09",
    summary: "Comprehensive legislation providing legal recognition for electronic transactions, digital signatures, and addressing cybercrimes. Amended in 2008 to strengthen provisions related to data protection and cybersecurity.",
    relevance: 96,
    category: "Cyber Law",
    sections: ["Definitions", "Digital Signatures", "Electronic Records", "Cybercrimes", "Penalties"],
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
    sections: ["Consent", "Rights of Data Principal", "Data Fiduciary Obligations", "Penalties", "Exemptions"],
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
    sections: ["Incorporation", "Directors", "Financial Statements", "Corporate Governance", "Winding Up"],
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
    sections: ["Consumer Rights", "E-commerce", "Product Liability", "Consumer Disputes", "Penalties"],
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
    sections: ["Fundamental Rights", "Directive Principles", "Fundamental Duties", "Union Government", "State Government"],
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
    sections: ["General Explanations", "Offences Against the State", "Offences Against the Human Body", "Offences Against Property", "Criminal Conspiracy"],
  },
];

export const sampleArticles: ArticleResult[] = [
  {
    id: "art-1",
    title: "The Evolution of Data Privacy Law in India: From IT Act to the PDP Bill",
    author: "Dr. Swati Sharma, LL.D.",
    journal: "Indian Journal of Law and Technology",
    date: "2023-11-15",
    summary: "Comprehensive analysis of the development of data privacy jurisprudence in India, from the Information Technology Act amendments to the proposed Personal Data Protection framework and its implications for businesses.",
    relevance: 95,
    topics: ["Data Privacy", "Information Technology", "Constitutional Law"],
    citations: 42,
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
    citations: 38,
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
    citations: 31,
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
    citations: 27,
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
    citations: 25,
  },
];
