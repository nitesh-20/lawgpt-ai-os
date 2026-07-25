import { Copy, RotateCcw, Scale, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Message } from "@/types/chat";
import CitationCard from "./CitationCard";

interface ChatMessageProps {
  message: Message;
  onRegenerate?: () => void;
}

const ChatMessage = ({ message, onRegenerate }: ChatMessageProps) => {
  const { toast } = useToast();
  const isBot = message.sender === "bot";

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    toast({ title: "Copied", description: "Message copied to clipboard." });
  };

  return (
    <div className={`flex ${isBot ? "justify-start" : "justify-end"} fade-in`}>
      <div className={`flex items-start max-w-[85%] md:max-w-[75%] gap-3 ${isBot ? "" : "flex-row-reverse"}`}>
        <div className="w-8 h-8 rounded-full border border-border bg-card flex items-center justify-center shrink-0">
          {isBot ? (
            <Scale className="h-4 w-4 text-primary" strokeWidth={1.75} />
          ) : (
            <User className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
          )}
        </div>

        <div className="min-w-0">
          <div
            className={`rounded-lg px-4 py-3 ${
              isBot
                ? "bg-card border border-border text-foreground"
                : "bg-primary text-primary-foreground"
            }`}
          >
            <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
              {message.content}
              {message.isStreaming && (
                <span className="inline-block w-1.5 h-4 bg-current align-text-bottom ml-0.5 animate-pulse" />
              )}
            </p>
          </div>

          {isBot && message.citations && message.citations.length > 0 && (
            <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
              {message.citations.map((citation) => (
                <CitationCard key={citation.id} citation={citation} />
              ))}
            </div>
          )}

          <div className={`flex items-center gap-3 mt-1.5 ${isBot ? "" : "justify-end"}`}>
            <span className="text-xs text-muted-foreground">
              {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
            {isBot && !message.isStreaming && (
              <>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Copy message"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
                {onRegenerate && (
                  <button
                    type="button"
                    onClick={onRegenerate}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Regenerate response"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
