import { createContext, useContext, useEffect, useState, useRef, useCallback, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loginMethod: "email" | "google" | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loginMethod, setLoginMethod] = useState<"email" | "google" | null>(null);
  
  // Track if initial auth check has completed to prevent redundant updates
  const initializedRef = useRef(false);
  const currentUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        // Skip if this is a redundant update for the same user (prevents tab-focus re-renders)
        const newUserId = newSession?.user?.id ?? null;
        if (initializedRef.current && currentUserIdRef.current === newUserId && event !== "SIGNED_OUT") {
          return;
        }
        
        currentUserIdRef.current = newUserId;
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        // Determine login method
        if (newSession?.user) {
          const provider = newSession.user.app_metadata?.provider;
          setLoginMethod(provider === "google" ? "google" : "email");
        } else {
          setLoginMethod(null);
        }
        
        setIsLoading(false);
        initializedRef.current = true;
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      // Only set if not already initialized by auth state change
      if (!initializedRef.current) {
        currentUserIdRef.current = existingSession?.user?.id ?? null;
        setSession(existingSession);
        setUser(existingSession?.user ?? null);
        
        if (existingSession?.user) {
          const provider = existingSession.user.app_metadata?.provider;
          setLoginMethod(provider === "google" ? "google" : "email");
        }
        
        setIsLoading(false);
        initializedRef.current = true;
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/app/dashboard`,
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        loginMethod,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
