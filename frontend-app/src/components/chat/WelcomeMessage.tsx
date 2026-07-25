
import { Bot } from "lucide-react";

const WelcomeMessage = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 p-6 md:p-12">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 blur-2xl opacity-75" />
        <Bot className="w-16 md:w-20 h-16 md:h-20 text-primary relative z-10 animate-pulse duration-3000" />
      </div>
      <h2 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-white via-primary-light to-accent bg-clip-text text-transparent text-center">
        How can I assist you today?
      </h2>
    </div>
  );
};

export default WelcomeMessage;
