
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Message, UploadedDocument } from "@/types/chat";
import WelcomeMessage from "./WelcomeMessage";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";

interface ChatContainerProps {
  messages: Message[];
  documents: UploadedDocument[];
  message: string;
  setMessage: (message: string) => void;
  handleSend: (e: React.FormEvent) => void;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const ChatContainer = ({
  messages,
  documents,
  message,
  setMessage,
  handleSend,
  handleFileUpload,
}: ChatContainerProps) => {
  return (
    <div className="glass-card rounded-2xl shadow-xl flex flex-col h-[500px] md:h-[700px] animate-fade-in">
      <div className="flex items-center justify-between p-3 md:p-4 border-b border-white/20">
        <div className="text-xs md:text-sm text-neutral-600">
          {documents.length > 0 ? `${documents.length} document(s) uploaded` : 'No documents uploaded'}
        </div>
        <Button variant="outline" size="sm" className="bg-white/50 border-white/20 hover:bg-white/60" asChild>
          <label className="cursor-pointer flex items-center text-xs md:text-sm">
            <input
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              accept=".txt,.doc,.docx,.pdf"
              multiple
            />
            <Upload className="w-3 h-3 md:w-4 md:h-4 mr-2" />
            Upload Document
          </label>
        </Button>
      </div>

      <div className="p-4 flex-1 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
        {messages.length === 0 ? (
          <WelcomeMessage />
        ) : (
          messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))
        )}
      </div>

      <ChatInput 
        message={message}
        setMessage={setMessage}
        handleSend={handleSend}
      />
    </div>
  );
};

export default ChatContainer;
