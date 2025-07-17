// src/lib/auth.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabase";

// Define the shape of the AuthContext
interface AuthContextType {
  user: any;
  profile: any;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, metadata: any) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from Supabase "profiles" table
  const fetchProfile = async (userId: string) => {
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

  // Initialize session and user on mount
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

  // Login
  const signIn = (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password });

  // Register
  const signUp = (email: string, password: string, metadata: any) =>
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

// useAuth Hook with error handling
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("❌ useAuth must be used within <AuthProvider>");
  }
  return context;
};
