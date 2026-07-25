import { useState, useRef, useEffect } from "react";
import { 
  Bot, 
  Send, 
  Paperclip, 
  Mic, 
  MicOff, 
  Sparkles, 
  Loader2, 
  X, 
  AlertCircle, 
  BookOpen, 
  Volume2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Message, UploadedDocument } from "@/types/chat";
import { apiClient } from "@/utils/apiClient";
import { motion, AnimatePresence } from "framer-motion";

const Chatbot = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom on message
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
        toast({ title: "Document Attached", description: `"${file.name}" added to current context.` });
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
            content: response.response || response.message || "Audit completed successfully.",
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

  const handleVoiceSubmit = async (audioBlob: Blob) => {
    setIsStreaming(true);
    const userMessageId = crypto.randomUUID();
    const botId = crypto.randomUUID();

    toast({
      title: "Synthesizing Speech",
      description: "Running transcription and query pipeline...",
    });

    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "speech.wav");
      formData.append("session_id", "web_voice_session");

      const response = await apiClient.postMultipart("/voice/chat", formData);

      if (response && response.status === "success" && response.data) {
        const resData = response.data.data || response.data;

        setMessages((prev) => [
          ...prev,
          {
            id: userMessageId,
            content: `🗣️ [Voice Input]: ${resData.transcript || "(Speech unparsed)"}`,
            sender: "user",
            timestamp: new Date()
          },
          {
            id: botId,
            content: resData.response_text || "Audio processed successfully.",
            sender: "bot",
            timestamp: new Date()
          }
        ]);

        if (resData.response_audio) {
          playAudioBase64(resData.response_audio);
        }
      }
    } catch (err: any) {
      console.error("Voice chat failed:", err);
      toast({
        title: "Voice Transcription Failed",
        description: "Failed to parse audio input.",
        variant: "destructive"
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const playAudioBase64 = (base64Data: string) => {
    try {
      const audioSrc = `data:audio/wav;base64,${base64Data}`;
      const audio = new Audio(audioSrc);
      audio.play();
    } catch (err) {
      console.error("Audio playback failed:", err);
    }
  };

  // Recording Controls
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        handleVoiceSubmit(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied:", err);
      toast({
        title: "Microphone Error",
        description: "Please grant microphone permissions to use voice queries.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const SUGGESTED_PROMPTS = [
    "What are the main liabilities in a typical NDA?",
    "Summarize Section 420 of the IPC.",
    "Draft a standard termination clause for service agreements."
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_300px] gap-6 max-w-6xl mx-auto h-[calc(100vh-120px)] items-stretch">
      
      {/* Left Side: Main Chat Area */}
      <div className="flex flex-col bg-card/45 border border-white/[0.06] rounded-2xl overflow-hidden backdrop-blur-md">
        
        {/* Chat Title header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.05] bg-white/[0.01]">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-xs font-semibold text-white font-mono uppercase tracking-wider">AI Legal Assistant</h2>
            <p className="text-[10px] text-muted-foreground">Ask questions or upload documents for context analysis</p>
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
                <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center animate-pulse">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-white">Initiate Consultation</h3>
                  <p className="text-2xs text-muted-foreground/80 leading-relaxed">Enter a legal draft review query or select a pre-configured prompt below.</p>
                </div>
                
                <div className="space-y-2 w-full pt-4">
                  {SUGGESTED_PROMPTS.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => setMessage(p)}
                      className="w-full text-left p-3 text-2xs text-muted-foreground hover:text-white rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-primary/40 hover:bg-white/[0.04] transition-all"
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
                <div className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-xs ${m.sender === "user" ? "bg-primary text-white" : "bg-white/[0.04] border border-white/[0.08]"}`}>
                  {m.sender === "user" ? "U" : <Bot size={14} className="text-primary" />}
                </div>

                <div className="space-y-2">
                  <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${m.sender === "user" ? "bg-primary/10 text-white border border-primary/20 rounded-tr-none" : "bg-white/[0.02] text-muted-foreground border border-white/[0.04] rounded-tl-none"}`}>
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  </div>

                  {/* Citations panel if present */}
                  {m.citations && m.citations.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {m.citations.map((c: any) => (
                        <div 
                          key={c.id}
                          className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/[0.03] border border-white/[0.06] text-3xs font-mono text-primary"
                        >
                          <BookOpen className="h-2.5 w-2.5" />
                          <span>{c.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

            {isStreaming && (
              <div className="flex gap-3 max-w-[80%]">
                <div className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center bg-white/[0.04] border border-white/[0.08]">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                </div>
                <div className="p-3.5 rounded-2xl bg-white/[0.02] text-xs text-muted-foreground border border-white/[0.04] rounded-tl-none flex items-center gap-1.5 font-mono text-3xs uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-ping" />
                  Synthesizing legal references...
                </div>
              </div>
            )}
          </AnimatePresence>
          <div ref={chatEndRef} />
        </div>

        {/* File attachment preview */}
        {documents.length > 0 && (
          <div className="px-5 py-2.5 bg-black/40 border-t border-white/[0.05] flex flex-wrap gap-2">
            {documents.map((d) => (
              <div key={d.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.08] text-3xs font-mono">
                <Paperclip className="h-3 w-3 text-primary" />
                <span className="text-white max-w-[120px] truncate">{d.name}</span>
                <button onClick={() => handleRemoveDocument(d.id)} className="text-muted-foreground hover:text-white">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input panel */}
        <form onSubmit={handleSend} className="p-4 border-t border-white/[0.05] flex gap-2 items-center bg-black/20">
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
            className="text-muted-foreground hover:text-white hover:bg-white/[0.05] rounded-lg shrink-0"
          >
            <Paperclip className="h-4.5 w-4.5" />
          </Button>

          <input
            type="text"
            placeholder="Type your legal query..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
            disabled={isStreaming}
          />

          {/* Voice recording trigger */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={isRecording ? stopRecording : startRecording}
            className={`rounded-lg shrink-0 ${isRecording ? 'text-red-500 bg-red-500/10 hover:bg-red-500/20' : 'text-muted-foreground hover:text-white hover:bg-white/[0.05]'}`}
          >
            {isRecording ? <MicOff className="h-4.5 w-4.5" /> : <Mic className="h-4.5 w-4.5" />}
          </Button>

          <Button
            type="submit"
            disabled={isStreaming || !message.trim()}
            className="btn-primary p-2.5 rounded-xl shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>

      {/* Right Side: Context Parameter Sidebar */}
      <div className="hidden lg:flex flex-col bg-card/45 border border-white/[0.06] rounded-2xl p-5 space-y-6 backdrop-blur-md">
        <div>
          <span className="text-[10px] font-mono text-muted-foreground/80 uppercase tracking-widest">Active Context</span>
          <h3 className="text-sm font-semibold text-white mt-1">Dossiers & Context</h3>
        </div>

        <div className="space-y-4 flex-1 overflow-y-auto">
          {documents.length > 0 ? (
            <div className="space-y-2">
              <span className="text-[9px] font-mono text-primary uppercase">Files loaded:</span>
              <div className="space-y-2">
                {documents.map((d) => (
                  <div key={d.id} className="p-3 bg-white/[0.01] border border-white/[0.04] rounded-lg">
                    <p className="font-semibold text-2xs text-white truncate">{d.name}</p>
                    <p className="text-[9px] font-mono text-muted-foreground/50 mt-1">Size: {d.content.length} chars</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground border border-dashed border-white/[0.06] rounded-xl p-4">
              <Paperclip className="h-8 w-8 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-2xs font-semibold text-white">No files attached</p>
              <p className="text-[10px] text-muted-foreground/70 mt-1 leading-relaxed">Attach case files to restrict RAG checks specifically to those files.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
