
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatInputProps {
  message: string;
  setMessage: (message: string) => void;
  handleSend: (e: React.FormEvent) => void;
}

const ChatInput = ({ message, setMessage, handleSend }: ChatInputProps) => {
  return (
    <form onSubmit={handleSend} className="p-3 md:p-4 border-t border-white/10 bg-white/5 backdrop-blur-xl">
      <div className="flex gap-2">
        <Input
          placeholder="Ask any legal question..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 bg-white/5 border-white/20 text-neutral-800 placeholder:text-neutral-500 text-sm md:text-base"
        />
        <Button 
          type="submit" 
          disabled={!message.trim()}
          className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity px-4 md:px-6"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </form>
  );
};

export default ChatInput;
