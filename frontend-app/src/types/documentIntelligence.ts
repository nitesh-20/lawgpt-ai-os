export interface DocClause {
  id: string;
  label: string;
  text: string;
  risk: "low" | "medium" | "high";
  note: string;
}

export interface DocEntity {
  id: string;
  name: string;
  type: "Party" | "Date" | "Amount" | "Jurisdiction" | "Obligation";
  value: string;
}

export interface RelatedJudgment {
  id: string;
  title: string;
  court: string;
  year: string;
  relevance: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  label: string;
}

export interface AINote {
  id: string;
  note: string;
}

export interface DocumentDetail {
  id: string;
  title: string;
  type: string;
  summary: string;
  clauses: DocClause[];
  entities: DocEntity[];
  relatedJudgments: RelatedJudgment[];
  timeline: TimelineEvent[];
  aiNotes: AINote[];
}
