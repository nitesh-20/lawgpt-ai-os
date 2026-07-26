import { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  Paperclip,
  Sparkles,
  Loader2,
  X,
  BookOpen,
  Download,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Message, UploadedDocument } from "@/types/chat";
import { apiClient } from "@/utils/apiClient";
import { AnimatePresence, motion } from "framer-motion";
import { VoiceButton } from "@/components/voice/VoiceButton";
import { AudioPlaybackButton } from "@/components/voice/AudioPlaybackButton";

const Chatbot = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setDocuments((prev) => [
          ...prev,
          { id: crypto.randomUUID(), name: file.name, content, uploadDate: new Date() },
        ]);
        toast({ title: "Document Attached", description: `"${file.name}" added to session context.` });
      };
      reader.readAsText(file);
    });

    event.target.value = "";
  };

  const handleRemoveDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  const runStream = async (userMessage: string) => {
    setIsStreaming(true);
    const botId = crypto.randomUUID();

    const documentContext = documents.length > 0
      ? documents.map(doc => `Document "${doc.name}":\n${doc.content}`).join('\n\n')
      : '';

    try {
      const response = await apiClient.post("/orchestrator/chat", {
        message: userMessage + (documentContext ? `\n\nContext:\n${documentContext}` : ""),
        session_id: "default_session"
      });

      if (response && response.status === "success") {
        const citations = (response.citations || []).map((cit: any, idx: number) => ({
          id: cit.citation_id || `cit-${idx}`,
          label: cit.document_name || cit.document_id || "Citation",
          source: cit.text || "Authority source reference"
        }));

        setMessages((prev) => [
          ...prev,
          {
            id: botId,
            content: response.response || response.message || "Request processed successfully.",
            sender: "bot",
            timestamp: new Date(),
            citations
          }
        ]);
      } else {
        throw new Error("Local backend returned error status");
      }
    } catch (error) {
      console.error("FastAPI Orchestrator Chat failed:", error);
      toast({
        title: "Error",
        description: "Failed to generate a response. Please verify FastAPI backend connections.",
        variant: "destructive"
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isStreaming) return;

    const userMessage = message;
    setMessage("");
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), content: userMessage, sender: "user", timestamp: new Date() },
    ]);

    await runStream(userMessage);
  };

  const handleClearHistory = () => {
    setMessages([]);
    toast({ title: "History Cleared", description: "All message logs removed." });
  };

  const handleExportHistory = () => {
    if (messages.length === 0) return;
    const historyString = messages.map(m => `[${m.timestamp?.toLocaleTimeString()}] ${m.sender === 'user' ? 'USER' : 'ASSISTANT'}: ${m.content}`).join("\n\n");
    const blob = new Blob([historyString], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "conversation_history.txt");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "History Exported", description: "Downloaded conversation_history.txt" });
  };

  const SUGGESTED_PROMPTS = [
    "What are the main liability issues in an NDA?",
    "Summarize Section 420 of the IPC.",
    "Draft a standard termination clause for service agreements."
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_300px] gap-6 max-w-5xl mx-auto h-[calc(100vh-140px)] items-stretch">

      {/* Left Side: Main Chat Area */}
      <div className="flex flex-col bg-white border border-border rounded overflow-hidden">

        {/* Chat Title header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-neutral-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="text-xs font-semibold text-neutral-800 font-mono uppercase tracking-wider">AI Legal Assistant</h2>
              <p className="text-[10px] text-neutral-400">Ask questions or attach files for localized RAG queries</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={handleExportHistory} disabled={messages.length === 0} variant="ghost" size="icon" className="h-8 w-8 text-neutral-500 hover:text-neutral-900 rounded">
              <Download size={14} />
            </Button>
            <Button onClick={handleClearHistory} disabled={messages.length === 0} variant="ghost" size="icon" className="h-8 w-8 text-neutral-500 hover:text-red-600 rounded">
              <Trash2 size={14} />
            </Button>
          </div>
        </div>

        {/* Message logs */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <AnimatePresence>
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-full text-center max-w-sm mx-auto space-y-6"
              >
                <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-900">Initiate AI Consultation</h3>
                  <p className="text-2xs text-neutral-500 leading-relaxed">Enter a query, upload files to context, or select a prompt below.</p>
                </div>

                <div className="space-y-2 w-full pt-4">
                  {SUGGESTED_PROMPTS.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => setMessage(p)}
                      className="w-full text-left p-3 text-2xs text-neutral-600 hover:text-neutral-900 rounded bg-neutral-50 border border-border hover:border-neutral-300 transition-all font-mono"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 max-w-[85%] ${m.sender === "user" ? "ml-auto flex-row-reverse" : ""}`}
              >
                <div className={`w-7 h-7 rounded shrink-0 flex items-center justify-center text-2xs ${m.sender === "user" ? "bg-primary text-white" : "bg-neutral-50 border border-border"}`}>
                  {m.sender === "user" ? "U" : <Bot size={13} className="text-primary" />}
                </div>

                <div className="space-y-2">
                  <div className={`p-3.5 rounded-lg text-xs leading-relaxed ${m.sender === "user" ? "bg-primary/10 text-primary border border-primary/20" : "bg-neutral-50 text-neutral-800 border border-border"}`}>
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {m.sender === "bot" && (
                      <AudioPlaybackButton text={m.content} />
                    )}
                    {m.citations && m.citations.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {m.citations.map((c: any) => (
                          <div
                            key={c.id}
                            className="flex items-center gap-1 px-2 py-0.5 rounded bg-neutral-50 border border-border text-3xs font-mono text-primary"
                          >
                            <BookOpen className="h-2.5 w-2.5" />
                            <span>{c.label}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {isStreaming && (
              <div className="flex gap-3 max-w-[80%]">
                <div className="w-7 h-7 rounded shrink-0 flex items-center justify-center bg-neutral-50 border border-border">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                </div>
                <div className="p-3.5 rounded bg-neutral-50 text-xs text-neutral-500 border border-border flex items-center gap-1.5 font-mono text-3xs uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-ping" />
                  Formulating response citations...
                </div>
              </div>
            )}
          </AnimatePresence>
          <div ref={chatEndRef} />
        </div>

        {/* Document attachment preview */}
        {documents.length > 0 && (
          <div className="px-5 py-2.5 bg-neutral-50 border-t border-border flex flex-wrap gap-2">
            {documents.map((d) => (
              <div key={d.id} className="flex items-center gap-1.5 px-2 py-1 rounded bg-white border border-border text-3xs font-mono">
                <Paperclip className="h-3 w-3 text-primary" />
                <span className="text-neutral-800 max-w-[120px] truncate">{d.name}</span>
                <button onClick={() => handleRemoveDocument(d.id)} className="text-neutral-400 hover:text-neutral-900">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input panel */}
        <form onSubmit={handleSend} className="p-4 border-t border-border flex gap-2 items-center bg-neutral-50/50">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileUpload}
            multiple
            accept=".pdf,.docx,.txt"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            className="text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded shrink-0"
          >
            <Paperclip className="h-4.5 w-4.5" />
          </Button>

          <input
            type="text"
            placeholder="Ask your legal question..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full bg-white border border-border rounded px-4 py-2.5 text-xs text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-primary transition-all"
            disabled={isStreaming}
          />

          {/* Reusable Voice button dictation */}
          <VoiceButton
            onTranscribe={(t) => setMessage((prev) => prev + (prev ? " " : "") + t)}
          />

          <Button
            type="submit"
            disabled={isStreaming || !message.trim()}
            className="btn-primary p-2.5 rounded shrink-0"
          >
            <Send className="h-4 w-4 text-white" />
          </Button>
        </form>
      </div>

      {/* Right Side: Context Parameter Sidebar */}
      <div className="hidden lg:flex flex-col bg-white border border-border rounded p-5 space-y-6">
        <div>
          <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest">Active Context</span>
          <h3 className="text-xs font-semibold text-neutral-800 uppercase font-mono tracking-wider mt-1 border-b border-border pb-2">Session Files</h3>
        </div>

        <div className="space-y-4 flex-1 overflow-y-auto">
          {documents.length > 0 ? (
            <div className="space-y-2">
              <span className="text-[9px] font-mono text-primary uppercase">Context attachments:</span>
              <div className="space-y-2">
                {documents.map((d) => (
                  <div key={d.id} className="p-3 bg-neutral-50 border border-border rounded">
                    <p className="font-semibold text-3xs text-neutral-800 truncate">{d.name}</p>
                    <p className="text-[9px] font-mono text-neutral-400 mt-1">Size: {d.content.length} chars</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-neutral-400 border border-dashed border-border rounded p-4">
              <Paperclip className="h-8 w-8 mx-auto text-neutral-300 mb-3" />
              <p className="text-2xs font-semibold text-neutral-800">No context files attached</p>
              <p className="text-[10px] text-neutral-500 mt-1 leading-relaxed">Attach document drafts to perform localized RAG comparisons.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
