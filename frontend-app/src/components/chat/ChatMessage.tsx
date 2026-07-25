
import { Bot, User } from "lucide-react";
import { Message } from "@/types/chat";

interface ChatMessageProps {
  message: Message;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  return (
    <div
      className={`flex ${
        message.sender === 'user' ? 'justify-end' : 'justify-start'
      } fade-in`}
    >
      <div className="flex items-start max-w-[85%] md:max-w-[80%] gap-3">
        {message.sender === 'bot' ? (
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full glass-card flex items-center justify-center flex-shrink-0">
            <Bot className="h-4 w-4 md:h-6 md:w-6 text-primary" />
          </div>
        ) : (
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full glass-card flex items-center justify-center flex-shrink-0">
            <User className="h-4 w-4 md:h-6 md:w-6 text-primary" />
          </div>
        )}
        <div
          className={`rounded-xl p-3 md:p-4 ${
            message.sender === 'user'
              ? 'bg-gradient-to-br from-primary/90 to-accent/90 text-white'
              : 'glass-card'
          }`}
        >
          <div className="prose prose-sm md:prose-base max-w-none">
            {message.content}
          </div>
          <div className="text-[10px] md:text-xs mt-2 opacity-50">
            {message.timestamp.toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
