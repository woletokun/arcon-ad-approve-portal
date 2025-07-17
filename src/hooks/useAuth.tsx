// useAuth.tsx
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const setup = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };

    setup();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        const { data } = await supabase.auth.getUser();
        setUser(data.user);
      }
    );

    return () => listener?.subscription.unsubscribe();
  }, []);

  const signIn = (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password });

  const signUp = (email: string, password: string, metadata: any) =>
    supabase.auth.signUp({
      email,
      password,
      options: { data: metadata },
    });

  const value = {
    user,
    session,
    signIn,
    signUp,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("❌ useAuth must be used within <AuthProvider>");
  }
  return context;
};

