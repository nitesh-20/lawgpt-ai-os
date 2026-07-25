
import { Bot, Zap, Award, Server } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const ChatHeader = () => {
  return (
    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 mb-8 md:mb-12 animate-fade-in">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-full blur-2xl opacity-20 animate-pulse"></div>
        <div className="p-4 md:p-5 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl backdrop-blur-xl border border-white/10 shadow-xl relative z-10 overflow-hidden group hover:border-white/30 transition-all duration-500">
          <Bot className="h-8 w-8 md:h-10 md:w-10 text-primary animate-pulse relative z-10" />
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>
      </div>
      
      <div className="text-center md:text-left">
        <div className="flex flex-col md:flex-row items-center md:items-baseline gap-2 mb-1">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white via-primary-light to-accent bg-clip-text text-transparent">
            AVENIX.PRO Legal AI
          </h1>
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 backdrop-blur-sm relative overflow-hidden">
            <Zap className="w-3 h-3 mr-1" />
            <span>Quantum Engine</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
          </Badge>
        </div>
        <p className="text-neutral-400 mt-2 text-base md:text-lg max-w-2xl">
          Neural network-powered legal analysis with multi-jurisdictional knowledge and real-time regulatory updates
        </p>
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-3">
          <div className="flex items-center text-xs text-neutral-500">
            <Server className="w-3 h-3 mr-1 text-primary/70" />
            <span>Advanced Legal Database</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-neutral-400"></div>
          <div className="flex items-center text-xs text-neutral-500">
            <Award className="w-3 h-3 mr-1 text-primary/70" />
            <span>ABA Certified Responses</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-neutral-400"></div>
          <div className="flex items-center text-xs text-neutral-500">
            <Zap className="w-3 h-3 mr-1 text-primary/70" />
            <span>Real-time Updates</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
