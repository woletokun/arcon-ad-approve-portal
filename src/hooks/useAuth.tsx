import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'

// Define the shape of the AuthContext
interface AuthContextType {
  user: User | null
  session: Session | null
  profile: any | null
  loading: boolean
  signUp: (email: string, password: string, userData: any) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  updateProfile: (data: any) => Promise<{ error: any }>
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Hook to use AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// AuthProvider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  // Load session and profile once at start
  useEffect(() => {
    const initializeAuth = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      if (error) {
        console.error('Error getting session:', error)
        setLoading(false)
        return
      }

      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        await fetchUserProfile(session.user.id)
      }

      setLoading(false)
    }

    initializeAuth()

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      const loggedInUser = session?.user ?? null
      setUser(loggedInUser)

      if (loggedInUser) {
        await fetchUserProfile(loggedInUser.id)
      } else {
        setProfile(null)
      }
    })

    return () => {
      listener?.subscription.unsubscribe()
    }
  }, [])

  // Fetch profile from Supabase table
  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.warn('Profile not found:', error.message)
      setProfile(null)
    } else {
      setProfile(data)
    }
  }

  const signUp = async (email: string, password: string, userData: any) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: userData,
      },
    })
    return { error }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setProfile(null)
  }

  const updateProfile = async (data: any) => {
    if (!user) return { error: { message: 'No user logged in' } }

    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('user_id', user.id)

    if (!error) {
      setProfile({ ...profile, ...data })
    }

    return { error }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
