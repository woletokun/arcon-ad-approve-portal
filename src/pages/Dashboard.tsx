import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

export const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check user session on mount
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data?.session) {
        navigate("/auth");
      } else {
        setSession(data.session);
      }
      setLoading(false);
    };

    getSession();
  }, [navigate]);

  if (loading) {
    return <p>Loading dashboard...</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Welcome to your Dashboard</h1>
      <p className="mt-2 text-gray-600">User: {session?.user?.email}</p>
    </div>
  );
};
