import { useState } from "react";
import { Scale } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Message, UploadedDocument } from "@/types/chat";
import { streamChatResponse } from "@/services/chat";
import ChatContainer from "@/components/chat/ChatContainer";

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

    try {
      for await (const chunk of streamChatResponse(userMessage, documents)) {
        if (!created) {
          setMessages((prev) => [
            ...prev,
            { id: botId, content: chunk.token, sender: "bot", timestamp: new Date(), isStreaming: true },
          ]);
          created = true;
        } else if (!chunk.done) {
          setMessages((prev) =>
            prev.map((m) => (m.id === botId ? { ...m, content: m.content + chunk.token } : m))
          );
        }

        if (chunk.done) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === botId ? { ...m, isStreaming: false, citations: chunk.citations } : m
            )
          );
        }
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to generate a response. Please try again.", variant: "destructive" });
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
        onSelectPrompt={handleSelectPrompt}
        onRegenerate={handleRegenerate}
        isStreaming={isStreaming}
      />
    </div>
  );
};

export default Chatbot;
