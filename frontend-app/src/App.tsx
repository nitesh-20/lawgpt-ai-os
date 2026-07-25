
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Index";
import Cases from "./pages/Cases";
import CaseDetails from "./pages/CaseDetails";
import Search from "./pages/Search";
import Documents from "./pages/Documents";
import DocumentDrafting from "./pages/DocumentDrafting";
import ComplianceChecker from "./pages/ComplianceChecker";
import Chatbot from "./pages/Chatbot";
import NotFound from "./pages/NotFound";
import AppLayout from "./components/layout/AppLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/cases" element={<Cases />} />
            <Route path="/cases/:id" element={<CaseDetails />} />
            <Route path="/search" element={<Search />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/document-drafting" element={<DocumentDrafting />} />
            <Route path="/compliance" element={<ComplianceChecker />} />
            <Route path="/chatbot" element={<Chatbot />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
