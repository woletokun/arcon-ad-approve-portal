// src/App.tsx

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Global UI Providers
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

// Authentication
import { AuthProvider } from "@/lib/auth";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Pages
import { Landing } from "@/pages/Landing";
import { Auth } from "@/pages/Auth";
import { Dashboard } from "@/pages/Dashboard";
import { SubmitAd } from "@/pages/SubmitAd";
import { MySubmissions } from "@/pages/MySubmissions";
import { ReviewPanel } from "@/pages/ReviewPanel";
import { Verify } from "@/pages/Verify";
import NotFound from "@/pages/NotFound";

// 🧠 Initialize React Query Client
const queryClient = new QueryClient();

const App = () => (
  <AuthProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <BrowserRouter>
          <Routes>
            {/* 🔓 Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/verify/:certificateId" element={<Verify />} />

            {/* 🔐 Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/submit"
              element={
                <ProtectedRoute>
                  <SubmitAd />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-submissions"
              element={
                <ProtectedRoute>
                  <MySubmissions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/review"
              element={
                <ProtectedRoute>
                  <ReviewPanel />
                </ProtectedRoute>
              }
            />

            {/* 🚫 404 Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </AuthProvider>
);

export default App;
