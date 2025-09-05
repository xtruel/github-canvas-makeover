import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import Index from "./pages/Index";
import Mappa from "./pages/Mappa";
import Eventi from "./pages/Eventi";
import Community from "./pages/Community";
import Trofei from "./pages/Trofei";
import Impostazioni from "./pages/Impostazioni";
// Removed Forum
import Articles from "./pages/Articles";
import ArticleDetail from "./pages/ArticleDetail";
// Removed AboutForum
import Upload from "./pages/Upload";
import NotFound from "./pages/NotFound";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import SecretAdminLogin from "./pages/SecretAdminLogin";

const queryClient = new QueryClient();

const ProtectedRoute: React.FC<{ children: React.ReactNode; requiredRole?: 'ADMIN' | 'USER' }> = ({ children, requiredRole = 'ADMIN' }) => {
  const { role, loading } = useAuth();
  if (loading) return null;
  if (requiredRole === 'ADMIN' && role !== 'ADMIN') {
    return <Navigate to="/community" replace />;
  }
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      {/* Use basename so routes work under GitHub Pages project path */}
      <AuthProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <Layout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/mappa" element={<Mappa />} />
              <Route path="/eventi" element={<Eventi />} />
              <Route path="/community" element={<Community />} />
              <Route path="/articles" element={<Articles />} />
              <Route path="/articles/:slug" element={<ArticleDetail />} />
              <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
              <Route path="/trofei" element={<Trofei />} />
              <Route path="/impostazioni" element={<Impostazioni />} />
              {/* Secret admin login URL - share only with admin */}
              <Route path="/__admin_only__" element={<SecretAdminLogin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
