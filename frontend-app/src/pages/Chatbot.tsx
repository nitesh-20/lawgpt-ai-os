import { useState } from "react";
import { Scale } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Message, UploadedDocument } from "@/types/chat";
import ChatContainer from "@/components/chat/ChatContainer";
import { apiClient } from "@/utils/apiClient";

const Chatbot = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const { toast } = useToast();

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
        toast({ title: "Document uploaded", description: `"${file.name}" added to conversation context.` });
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
    let created = false;

    const documentContext = documents.length > 0
      ? documents.map(doc => `Document "${doc.name}":\n${doc.content}`).join('\n\n')
      : '';

    try {
      // 1. Try local FastAPI Orchestrator
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

  const handleSelectPrompt = (prompt: string) => {
    setMessage(prompt);
  };

  const handleRegenerate = async () => {
    if (isStreaming) return;
    const lastUser = [...messages].reverse().find((m) => m.sender === "user");
    if (!lastUser) return;

    setMessages((prev) => {
      const lastBotIdx = [...prev].reverse().findIndex((m) => m.sender === "bot");
      if (lastBotIdx === -1) return prev;
      const idx = prev.length - 1 - lastBotIdx;
      return prev.slice(0, idx);
    });

    await runStream(lastUser.content);
  };

  const handleVoiceSubmit = async (audioBlob: Blob) => {
    setIsStreaming(true);
    const userMessageId = crypto.randomUUID();
    const botId = crypto.randomUUID();

    toast({
      title: "Processing Speech",
      description: "Transcribing and querying orchestrator...",
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
            content: `🗣️ [Voice Query]: ${resData.transcript || "(Indecipherable speech)"}`,
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

        toast({
          title: "Speech Processed",
          description: `Transcribed: "${resData.transcript}"`,
        });
      } else {
        throw new Error("Invalid voice chat response format");
      }
    } catch (err: any) {
      console.error("Voice chat failed:", err);
      toast({
        title: "Voice Chat Failed",
        description: err.message || "Failed to process audio response.",
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

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div className="flex items-center gap-3 mb-1.5">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <Scale className="h-5 w-5 text-primary-foreground" strokeWidth={1.75} />
          </div>
          <h1 className="page-title mb-0">LawGPT Assistant</h1>
        </div>
        <p className="page-description">
          Ask a legal question, upload a document, or pick up where you left off. Every answer is grounded in a citation.
        </p>
      </div>

      <ChatContainer
        messages={messages}
        documents={documents}
        onRemoveDocument={handleRemoveDocument}
        message={message}
        setMessage={setMessage}
        handleSend={handleSend}
        handleFileUpload={handleFileUpload}
        onVoiceSubmit={handleVoiceSubmit}
        onSelectPrompt={handleSelectPrompt}
        onRegenerate={handleRegenerate}
        isStreaming={isStreaming}
      />
    </div>
  );
};

export default Chatbot;
