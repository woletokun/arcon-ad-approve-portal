// src/pages/dashboard.tsx or wherever you route this
import { useAuth } from "@/lib/auth";
import { Navigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-destructive mb-2">No profile data</h2>
          <p className="text-muted-foreground">We couldn’t load your profile. Please try again.</p>
          <Button onClick={() => window.location.reload()} className="mt-4">Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <Card className="max-w-md mx-auto">
        <CardContent className="space-y-4 p-6">
          <h2 className="text-xl font-semibold">Welcome, {profile.full_name || profile.username || profile.email}</h2>
          <p className="text-muted-foreground text-sm">Email: {user.email}</p>
        </CardContent>
      </Card>
    </div>
  );
}
