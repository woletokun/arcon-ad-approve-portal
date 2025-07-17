// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Pages
import { Landing } from "@/pages/Landing";
import { Dashboard } from "@/pages/Dashboard";
import { Auth } from "@/pages/Auth";
import { SubmitAd } from "@/pages/SubmitAd";
import { MySubmissions } from "@/pages/MySubmissions";
import { ReviewPanel } from "@/pages/ReviewPanel";
import { Verify } from "@/pages/Verify";
import NotFound from "@/pages/NotFound";

// ✅ Correct AuthProvider import
import { AuthProvider } from "@/lib/auth";

// ✅ Only ONE App component should be declared
const queryClient = new QueryClient();

const App = () => (
  <AuthProvider> {/* ✅ This must be outermost so all routes and providers have access */}
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/submit" element={<SubmitAd />} />
            <Route path="/my-submissions" element={<MySubmissions />} />
            <Route path="/review" element={<ReviewPanel />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/verify/:certificateId" element={<Verify />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/submit" element={<ProtectedRoute><SubmitAd /></ProtectedRoute>} />
            <Route path="/my-submissions" element={<ProtectedRoute><MySubmissions /></ProtectedRoute>} />
            <Route path="/review" element={<ProtectedRoute><ReviewPanel /></ProtectedRoute>} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </AuthProvider>
);

export default App;
