// src/lib/auth.tsx
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔁 Fetch user profile from 'profiles' table
  const fetchProfile = async (userId) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error.message);
    } else {
      setProfile(data);
    }
  };

  // 🔐 Load session and user on mount
  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      }

      setLoading(false);
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
      }
    );

    return () => authListener?.subscription?.unsubscribe();
  }, []);

  // 🧠 Sign in method
  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email, password });

  // 🧠 Sign up method
  const signUp = (email, password, metadata) =>
    supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp }}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Safe useAuth hook with error check
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within <AuthProvider>");
  return context;
};
