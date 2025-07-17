// src/components/ProtectedRoute.tsx
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        <Loader2 className="h-6 w-6 mr-2 animate-spin" />
        Checking session...
      </div>
    );
  }

  if (!user) return null; // ⛔ prevent flicker while redirecting

  return <>{children}</>;
};
