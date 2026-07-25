import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { CommandPalette } from "./CommandPalette";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";

const AppLayout = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isLoading, setIsLoading] = useState(true);
  
  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Connection Restored", {
        description: "FastAPI sync is active.",
        duration: 3000,
      });
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast.error("Network Interrupted", {
        description: "Running in read-only offline mode.",
        duration: 5000,
      });
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Set up initial system load skeleton
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <CommandPalette />
      
      {isLoading ? (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50">
          <div className="flex flex-col items-center gap-4">
            <div className="relative flex items-center justify-center">
              <div className="w-10 h-10 border border-primary/25 border-t-primary rounded-full animate-spin" />
              <div className="absolute w-6 h-6 bg-primary/10 rounded-full animate-pulse" />
            </div>
            <div className="text-2xs font-mono tracking-widest text-neutral-500 uppercase">Booting LawGPT OS</div>
          </div>
        </div>
      ) : (
        <div className="relative min-h-screen flex">
          <Sidebar />
          
          <div className="flex-1 flex flex-col min-w-0">
            <Header isOnline={isOnline} />
            
            <main
              className={`flex-1 transition-all duration-300 ${
                isMobile ? 'ml-0' : 'ml-60'
              } pt-24 px-4 md:px-8 pb-12`}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15, ease: "easeInOut" }}
                  className="h-full"
                >
                  <Outlet />
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppLayout;
