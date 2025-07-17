// src/pages/Dashboard.tsx
import { useAuth } from "@/lib/auth";
import { Navigate } from "react-router-dom";

export const Dashboard = () => {
  const auth = useAuth();

  // Optional: if loading, show spinner
  if (auth.loading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  // If not authenticated, redirect
  if (!auth.user) {
    return <Navigate to="/auth" replace />;
  }

  // Access user or profile
  const { user, profile } = auth;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Welcome, {profile?.full_name || "User"}!</h1>
      <p>Email: {user.email}</p>
      {/* You can add more dashboard features here */}
    </div>
  );
};
