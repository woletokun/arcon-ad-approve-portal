import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Landing } from "./pages/Landing";
import { Dashboard } from "./pages/Dashboard";
import { Auth } from "./pages/Auth";
import { SubmitAd } from "./pages/SubmitAd";
import { MySubmissions } from "./pages/MySubmissions";
import { ReviewPanel } from "./pages/ReviewPanel";
import { Verify } from "./pages/Verify";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./hooks/useAuth";

// ✅ Only ONE App component should be declared
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider> {/* ✅ this must wrap everything */}
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} /> {/* etc */}
            <Route path="/submit" element={<SubmitAd />} />
            <Route path="/my-submissions" element={<MySubmissions />} />
            <Route path="/review" element={<ReviewPanel />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/verify/:certificateId" element={<Verify />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
