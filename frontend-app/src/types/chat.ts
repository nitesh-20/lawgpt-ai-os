
export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  documentRef?: string;
}

export interface Feature {
  icon: any;
  title: string;
  description: string;
}

// Renamed from Document to UploadedDocument to avoid collision with DOM Document type
export interface UploadedDocument {
  id: string;
  name: string;
  content: string;
  uploadDate: Date;
}
