import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import Index from "./pages/Index";
import Mappa from "./pages/Mappa";
import Eventi from "./pages/Eventi";
import Community from "./pages/Community";
import Trofei from "./pages/Trofei";
import Impostazioni from "./pages/Impostazioni";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <div className="min-h-screen flex w-full">
            <AppSidebar />
            <div className="flex-1 flex flex-col">
              <header className="h-12 flex items-center border-b border-border/50 bg-card/50">
                <SidebarTrigger className="ml-4 text-roma-gold" />
                <h2 className="ml-4 text-roma-gold font-semibold">Ovunque Romanisti</h2>
              </header>
              <main className="flex-1 bg-gradient-dark">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/mappa" element={<Mappa />} />
                  <Route path="/eventi" element={<Eventi />} />
                  <Route path="/community" element={<Community />} />
                  <Route path="/trofei" element={<Trofei />} />
                  <Route path="/impostazioni" element={<Impostazioni />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
