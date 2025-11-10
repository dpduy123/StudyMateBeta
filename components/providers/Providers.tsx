'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, Session } from '@supabase/supabase-js'
import { Toaster } from 'react-hot-toast'
import { SWRConfig } from 'swr'
import { swrConfig } from '@/lib/swrConfig'
import { usePresence } from '@/hooks/usePresence'

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, metaData?: Record<string, unknown>) => Promise<{ user: User | null; session: Session | null; }>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => { },
  signUp: async () => ({ user: null, session: null }),
  signIn: async () => { },
  signInWithGoogle: async () => { },
});

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  // Subscribe to own presence channel to broadcast online status
  // Only when user is authenticated and not loading
  usePresence(user && !loading ? user.id : undefined)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)

      // User profile creation is handled by auth callback route
      // No need to create profile here
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    // Redirect to login page after sign out
    window.location.href = '/auth/login';
  };

  const signUp = async (email: string, password: string, metaData?: Record<string, unknown>) => {
    // SECURITY: Backend validation for .edu email
    // This prevents bypass via API calls, DevTools, or disabled JavaScript
    // Valid: user@university.edu, user@university.edu.vn
    // Invalid: user@gmail.com, user@company.com
    const eduPattern = /@[^@]+\.edu(\.|$)/i;
    if (!eduPattern.test(email)) {
      console.error('❌ Non-.edu email rejected:', email);
      throw new Error('Chỉ chấp nhận email trường đại học (.edu). Email phải chứa .edu trong tên miền (ví dụ: @university.edu hoặc @university.edu.vn)');
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metaData,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    // Handle Supabase auth errors
    if (error) {
      console.error('Supabase signup error:', error.message);
      throw error;
    }

    // Check for duplicate email - Supabase returns user=null for existing emails
    if (!data.user) {
      console.log('Duplicate email detected:', email);
      throw new Error('Email này đã được đăng ký. Vui lòng sử dụng email khác hoặc đăng nhập.');
    }

    // Additional check: user with empty identities array = existing user
    if (data.user?.identities && data.user.identities.length === 0) {
      console.log('Existing user with empty identities:', email);
      throw new Error('Email này đã được đăng ký. Vui lòng sử dụng email khác hoặc đăng nhập.');
    }

    console.log('New user created successfully:', data.user.email);

    // User profile will be created by auth callback after email verification
    return data;
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) throw error;
  };

  return (
    <SWRConfig value={swrConfig}>
      <AuthContext.Provider value={{ user, loading, signOut, signUp, signIn, signInWithGoogle }}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#374151',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              fontSize: '14px',
              padding: '12px 16px',
              boxShadow: '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            },
            success: {
              iconTheme: {
                primary: '#22c55e',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </AuthContext.Provider>
    </SWRConfig>
  )
}