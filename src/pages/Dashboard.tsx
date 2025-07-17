import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

interface UserData {
  id: string;
  email: string;
}

export const Dashboard = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        setError("Failed to get session.");
        setLoading(false);
        return;
      }

      const currentUser = session?.user;
      if (!currentUser) {
        navigate("/auth");
        return;
      }

      setUser({ id: currentUser.id, email: currentUser.email ?? "" });
      setLoading(false);
    };

    fetchUser();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="text-xl font-medium">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">Welcome to your Dashboard</h1>
        <p className="text-gray-700">You are logged in as: <strong>{user?.email}</strong></p>
        <div className="mt-6">
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              navigate("/auth");
            }}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};
