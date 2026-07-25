
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const AppLayout = () => {
  const isMobile = useIsMobile();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("You're back online!", {
        description: "All features are now available",
        duration: 3000,
      });
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast.warning("You're offline", {
        description: "The app will continue to work with cached data",
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

  // Create smooth page transitions
  useEffect(() => {
    // Create page transition effect on route change
    setIsTransitioning(true);
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
    
    // Reduce artificial loading time for faster transitions
    setIsLoading(true);
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
    }, 300); // Reduced from 500ms to 300ms
    
    return () => {
      clearTimeout(timer);
      clearTimeout(loadingTimer);
    };
  }, []);

  // Initialize app with example data if not already present
  useEffect(() => {
    const initializeAppData = async () => {
      try {
        // Import the utility functions
        const { generateExampleCases, generateExampleDocuments, generateExampleSearchResults } = await import("@/lib/utils");
        
        // Check if cases exist, if not create example data
        const existingCases = localStorage.getItem('cases');
        if (!existingCases || JSON.parse(existingCases).length === 0) {
          const exampleCases = generateExampleCases(20);
          localStorage.setItem('cases', JSON.stringify(exampleCases));
        }
        
        // Check if documents exist, if not create example data
        const existingFiles = localStorage.getItem('storedFiles');
        if (!existingFiles || JSON.parse(existingFiles).length === 0) {
          const exampleDocs = generateExampleDocuments(30);
          localStorage.setItem('storedFiles', JSON.stringify(exampleDocs));
        }
        
        // Add example search results
        const existingSearchResults = localStorage.getItem('searchResults');
        if (!existingSearchResults || JSON.parse(existingSearchResults).length === 0) {
          const exampleSearchResults = generateExampleSearchResults(50);
          localStorage.setItem('searchResults', JSON.stringify(exampleSearchResults));
        }

        // Add example compliance data
        if (!localStorage.getItem('complianceChecks')) {
          localStorage.setItem('complianceChecks', JSON.stringify([
            { id: '1', date: new Date().toISOString(), score: 92, documentName: 'Privacy Policy v2.0', issues: 3 },
            { id: '2', date: new Date(Date.now() - 86400000 * 7).toISOString(), score: 78, documentName: 'Terms of Service', issues: 8 },
            { id: '3', date: new Date(Date.now() - 86400000 * 14).toISOString(), score: 96, documentName: 'GDPR Statement', issues: 1 },
          ]));
        }
        
        // Add example chat history
        if (!localStorage.getItem('chatHistory')) {
          localStorage.setItem('chatHistory', JSON.stringify([
            { id: '1', question: 'What is the statute of limitations for medical malpractice in California?', answer: 'In California, the statute of limitations for medical malpractice is generally 3 years after the date of injury or 1 year after the plaintiff discovers the injury, whichever occurs first. However, there are exceptions for minors and fraud cases.', timestamp: new Date().toISOString() },
            { id: '2', question: 'How do I file a motion for summary judgment?', answer: 'To file a motion for summary judgment, you need to prepare a notice of motion, a memorandum of points and authorities, a separate statement of undisputed material facts, supporting declarations and evidence, and a proposed order. The timing requirements vary by jurisdiction.', timestamp: new Date(Date.now() - 86400000 * 2).toISOString() },
          ]));
        }
      } catch (error) {
        console.error('Error initializing app data:', error);
      }
    };
    
    initializeAppData();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {isLoading ? (
        <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <div className="text-sm text-muted-foreground">Loading LawGPT…</div>
          </div>
        </div>
      ) : (
        <>
          <Sidebar />
          <Header isOnline={isOnline} />
          <main
            className={`transition-all duration-200 ${
              isMobile ? 'ml-0' : 'ml-64'
            } pt-20 px-4 md:px-8`}
          >
            <div className={`transition-all duration-200 ${isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
              <Outlet />
            </div>
          </main>

          {!isOnline && (
            <div className="fixed bottom-4 right-4 bg-card border border-border text-foreground px-4 py-2 rounded-md shadow-card-hover flex items-center gap-2 text-sm">
              <div className="w-1.5 h-1.5 bg-accent rounded-full" />
              <span>Offline mode — using cached data</span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AppLayout;
