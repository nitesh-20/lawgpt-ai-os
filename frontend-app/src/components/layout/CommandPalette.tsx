import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Command } from "cmdk";
import { 
  LayoutGrid, 
  FileText, 
  Search, 
  FolderOpen, 
  FileEdit, 
  Shield, 
  Bot, 
  Cpu, 
  Sparkles 
} from "lucide-react";

export const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // Listen for Cmd+K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (action: () => void) => {
    action();
    setOpen(false);
  };

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Command Menu"
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 bg-black/60 backdrop-blur-sm"
    >
      <div className="w-full max-w-[640px] bg-card border border-white/[0.08] rounded-xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] overflow-hidden animate-scale-in">
        <div className="flex items-center border-b border-white/[0.08] px-4 py-3">
          <Search className="h-5 w-5 text-muted-foreground mr-3" />
          <Command.Input
            placeholder="Type a command or search..."
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-0.5 rounded border border-white/[0.1] bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground ml-auto">
            ESC
          </kbd>
        </div>

        <Command.List className="max-h-[300px] overflow-y-auto p-2 space-y-1">
          <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
            No results found.
          </Command.Empty>

          <Command.Group heading="Navigation" className="text-2xs font-semibold tracking-wider text-muted-foreground/75 px-3 py-1.5 uppercase">
            <Command.Item
              onSelect={() => runCommand(() => navigate("/dashboard"))}
              className="flex items-center gap-3 px-3 py-2 text-sm text-foreground/80 hover:text-white rounded-lg hover:bg-white/[0.05] cursor-pointer transition-colors duration-150"
            >
              <LayoutGrid className="h-4 w-4" />
              <span>Go to Dashboard</span>
            </Command.Item>
            <Command.Item
              onSelect={() => runCommand(() => navigate("/cases"))}
              className="flex items-center gap-3 px-3 py-2 text-sm text-foreground/80 hover:text-white rounded-lg hover:bg-white/[0.05] cursor-pointer transition-colors duration-150"
            >
              <FileText className="h-4 w-4" />
              <span>Go to Cases</span>
            </Command.Item>
            <Command.Item
              onSelect={() => runCommand(() => navigate("/search"))}
              className="flex items-center gap-3 px-3 py-2 text-sm text-foreground/80 hover:text-white rounded-lg hover:bg-white/[0.05] cursor-pointer transition-colors duration-150"
            >
              <Search className="h-4 w-4" />
              <span>Go to Legal Search</span>
            </Command.Item>
            <Command.Item
              onSelect={() => runCommand(() => navigate("/documents"))}
              className="flex items-center gap-3 px-3 py-2 text-sm text-foreground/80 hover:text-white rounded-lg hover:bg-white/[0.05] cursor-pointer transition-colors duration-150"
            >
              <FolderOpen className="h-4 w-4" />
              <span>Go to Documents</span>
            </Command.Item>
            <Command.Item
              onSelect={() => runCommand(() => navigate("/drafting"))}
              className="flex items-center gap-3 px-3 py-2 text-sm text-foreground/80 hover:text-white rounded-lg hover:bg-white/[0.05] cursor-pointer transition-colors duration-150"
            >
              <FileEdit className="h-4 w-4" />
              <span>Go to Document Drafting</span>
            </Command.Item>
            <Command.Item
              onSelect={() => runCommand(() => navigate("/compliance"))}
              className="flex items-center gap-3 px-3 py-2 text-sm text-foreground/80 hover:text-white rounded-lg hover:bg-white/[0.05] cursor-pointer transition-colors duration-150"
            >
              <Shield className="h-4 w-4" />
              <span>Go to Compliance Checker</span>
            </Command.Item>
            <Command.Item
              onSelect={() => runCommand(() => navigate("/chat"))}
              className="flex items-center gap-3 px-3 py-2 text-sm text-foreground/80 hover:text-white rounded-lg hover:bg-white/[0.05] cursor-pointer transition-colors duration-150"
            >
              <Bot className="h-4 w-4" />
              <span>Go to Legal Assistant (Chat)</span>
            </Command.Item>
            <Command.Item
              onSelect={() => runCommand(() => navigate("/agents"))}
              className="flex items-center gap-3 px-3 py-2 text-sm text-foreground/80 hover:text-white rounded-lg hover:bg-white/[0.05] cursor-pointer transition-colors duration-150"
            >
              <Cpu className="h-4 w-4" />
              <span>Go to AI Agents</span>
            </Command.Item>
          </Command.Group>

          <Command.Group heading="Quick Actions" className="text-2xs font-semibold tracking-wider text-muted-foreground/75 px-3 py-1.5 uppercase mt-3">
            <Command.Item
              onSelect={() => runCommand(() => navigate("/chat"))}
              className="flex items-center gap-3 px-3 py-2 text-sm text-primary hover:text-primary rounded-lg hover:bg-primary/5 cursor-pointer transition-colors duration-150 font-medium"
            >
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              <span>Ask Legal AI Assistant</span>
            </Command.Item>
          </Command.Group>
        </Command.List>
      </div>
    </Command.Dialog>
  );
};
