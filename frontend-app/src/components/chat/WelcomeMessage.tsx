import { Scale } from "lucide-react";
import SuggestedPrompts from "./SuggestedPrompts";
import { suggestedPrompts } from "@/data/chatMocks";

interface WelcomeMessageProps {
  onSelectPrompt: (prompt: string) => void;
}

const WelcomeMessage = ({ onSelectPrompt }: WelcomeMessageProps) => (
  <div className="flex flex-col items-center justify-center text-center gap-6 p-6 md:p-12">
    <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
      <Scale className="h-6 w-6 text-primary-foreground" strokeWidth={1.75} />
    </div>
    <div>
      <h2 className="font-serif text-2xl md:text-3xl font-semibold text-ink mb-2 text-balance">
        Ask LawGPT anything
      </h2>
      <p className="text-muted-foreground text-[15px] max-w-md">
        Research case law, review a clause, or draft a document. Every answer comes with citations you can verify.
      </p>
    </div>
    <SuggestedPrompts prompts={suggestedPrompts} onSelect={onSelectPrompt} />
  </div>
);

export default WelcomeMessage;
