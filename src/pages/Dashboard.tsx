// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { Navigate } from "react-router-dom";

export const Dashboard = () => {
  const auth = useAuth();
  const [timedOut, setTimedOut] = useState(false);


  useEffect(() => {
    const timeout = setTimeout(() => {
      setTimedOut(true);
    }, 5000); // 5 seconds

    return () => clearTimeout(timeout);
  }, []);

  if (auth.loading && !timedOut) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  if (!auth.user) {
    return <Navigate to="/auth" replace />;
  }

  const { user, profile } = auth;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Welcome, {profile?.full_name || "User"}!</h1>
      <p>Email: {user.email}</p>
    </div>
  );
};
