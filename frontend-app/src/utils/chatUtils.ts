
import { UploadedDocument } from '@/types/chat';

export const generateResponse = (userMessage: string, documents: UploadedDocument[] = []): string => {
  // Check for document-related queries
  if (userMessage.toLowerCase().includes('document') || 
      userMessage.toLowerCase().includes('file') ||
      userMessage.toLowerCase().includes('upload')) {
    if (documents.length === 0) {
      return "I notice you're asking about documents. You can upload documents using the upload button above, and I'll help you analyze them.";
    }
    return `I see you have ${documents.length} document(s) uploaded. I can help you analyze them or answer specific questions about their content.`;
  }

  // Original legal response logic
  if (userMessage.toLowerCase().includes('hello') || userMessage.toLowerCase().includes('hi')) {
    return "Hello! I'm your AVENIX.PRO Legal Assistant. How can I help you with your legal questions today?";
  }
  
  if (!userMessage.toLowerCase().includes('law') && 
      !userMessage.toLowerCase().includes('legal') && 
      !userMessage.toLowerCase().includes('court') && 
      !userMessage.toLowerCase().includes('rights') &&
      !userMessage.toLowerCase().includes('contract') &&
      !userMessage.toLowerCase().includes('case')) {
    return "I'm your AVENIX.PRO Legal Assistant. I specialize in legal matters and can help analyze documents. Could you please rephrase your question in a legal context?";
  }
  
  return "Based on your legal question, here's my analysis: [Legal response would be generated here]. Please note that this is general legal information and not legal advice. For specific legal advice, please consult with a qualified attorney.";
};
