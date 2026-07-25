import { useState, useRef, useEffect } from "react";
import { Brain, Zap, MessageCircle, LayoutDashboard, Bot, Loader2, Upload, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface UploadedDocument {
  name: string;
  content: string;
}

const Chatbot = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  const features = [
    {
      icon: Brain,
      title: "Legal AI Brain",
      description: "Advanced legal knowledge processing"
    },
    {
      icon: Zap,
      title: "Real-time Streaming",
      description: "Instant AI responses as they generate"
    },
    {
      icon: MessageCircle,
      title: "Natural Dialogue",
      description: "Human-like conversation flow"
    },
    {
      icon: LayoutDashboard,
      title: "Document Analysis",
      description: "Upload and analyze legal documents"
    }
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const newDocument: UploadedDocument = {
          name: file.name,
          content: content,
        };
        
        setDocuments(prev => [...prev, newDocument]);
        
        toast({
          title: "Document Uploaded",
          description: `"${file.name}" has been added to the conversation context.`,
        });
      };
      reader.readAsText(file);
    });

    event.target.value = '';
  };

  const streamChat = async (userMessage: string) => {
    setIsStreaming(true);
    
    const documentContext = documents.length > 0
      ? documents.map(doc => `Document "${doc.name}":\n${doc.content}`).join('\n\n')
      : '';

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-assistant`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            messages: [...messages, { role: 'user', content: userMessage }],
            documentContext
          }),
        }
      );

      if (!response.ok || !response.body) {
        throw new Error('Failed to start stream');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let streamDone = false;
      let assistantContent = '';

      // Add empty assistant message that we'll update
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = {
                  role: 'assistant',
                  content: assistantContent
                };
                return newMessages;
              });
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

    } catch (error: any) {
      console.error('Chat error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to get response. Please try again.",
        variant: "destructive"
      });
      // Remove the empty assistant message on error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsStreaming(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isStreaming) return;

    const userMessage = message;
    setMessage("");
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    await streamChat(userMessage);
  };

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl shadow-md">
            <Bot className="h-6 w-6 text-primary" />
          </div>
          <h1 className="page-title">LawGPT Assistant</h1>
        </div>
        <p className="page-description">AI-powered legal assistance with real-time streaming responses</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {features.map((feature, index) => (
          <Card key={index} className="bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-sm border-none shadow-lg hover:shadow-xl transition-all hover:scale-105">
            <CardHeader>
              <feature.icon className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-lg">{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      {documents.length > 0 && (
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Uploaded Documents ({documents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {documents.map((doc, idx) => (
                <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  {doc.name}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-none shadow-2xl bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm">
        <CardContent className="p-0">
          <ScrollArea ref={scrollRef} className="h-[500px] p-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                <Bot className="h-16 w-16 mb-4 text-primary opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Welcome to LawGPT Assistant</h3>
                <p className="text-sm max-w-md">
                  Ask me anything about legal matters, upload documents for analysis, or get help with legal research.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <Avatar className="h-8 w-8 bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white">
                        <Bot className="h-5 w-5" />
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-primary to-accent text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    {msg.role === 'user' && (
                      <Avatar className="h-8 w-8 bg-gray-300 flex items-center justify-center text-gray-700">
                        <MessageCircle className="h-5 w-5" />
                      </Avatar>
                    )}
                  </div>
                ))}
                {isStreaming && (
                  <div className="flex gap-3 justify-start">
                    <Avatar className="h-8 w-8 bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white">
                      <Bot className="h-5 w-5" />
                    </Avatar>
                    <div className="bg-gray-100 rounded-2xl px-4 py-3">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          <div className="border-t p-4 bg-white/50">
            <form onSubmit={handleSend} className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="shrink-0"
                asChild
              >
                <label className="cursor-pointer">
                  <Upload className="h-4 w-4" />
                  <input
                    type="file"
                    accept=".txt,.doc,.docx,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    multiple
                  />
                </label>
              </Button>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask about legal matters, document analysis, or get legal guidance..."
                className="min-h-[60px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
              />
              <Button
                type="submit"
                size="icon"
                className="shrink-0 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                disabled={!message.trim() || isStreaming}
              >
                {isStreaming ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Chatbot;