import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { PlayerProvider } from "@/features/music/state/playerContext";
import Index from "./pages/Index";
import Mappa from "./pages/Mappa";
import Eventi from "./pages/Eventi";
import Community from "./pages/Community";
import Trofei from "./pages/Trofei";
import Impostazioni from "./pages/Impostazioni";
import Forum from "./pages/Forum";
import Articles from "./pages/Articles";
import AboutForum from "./pages/AboutForum";
import Upload from "./pages/Upload";
import NotFound from "./pages/NotFound";
import AlbumsPage from "./features/music/pages/AlbumsPage";
import PlayerPage from "./features/music/pages/PlayerPage";
import EqualizerPage from "./features/music/pages/EqualizerPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <PlayerProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/mappa" element={<Mappa />} />
              <Route path="/eventi" element={<Eventi />} />
              <Route path="/community" element={<Community />} />
              <Route path="/forum" element={<Forum />} />
              <Route path="/articles" element={<Articles />} />
              <Route path="/about-forum" element={<AboutForum />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/trofei" element={<Trofei />} />
              <Route path="/impostazioni" element={<Impostazioni />} />
              <Route path="/albums" element={<AlbumsPage />} />
              <Route path="/player" element={<PlayerPage />} />
              <Route path="/equalizer" element={<EqualizerPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </PlayerProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
