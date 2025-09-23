"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase, User, DEMO_MODE } from '@/lib/supabase'
import { mockUser } from '@/lib/mockData'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  switchRole: (role: 'admin' | 'panitia' | 'member') => void
  isAdmin: boolean
  isPanitia: boolean
  isMember: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const defaultGuestUser: User = {
      id: 'guest-user',
      name: 'Guest',
      email: 'guest@local',
      role: 'admin',
      created_at: new Date().toISOString()
    }

    if (DEMO_MODE) {
      // Demo mode - langsung set user sebagai admin
      setUser(mockUser)
      setLoading(false)
      return
    }

    // Check active sessions and sets the user
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        // Fetch user data from our custom users table
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
        if (userData) setUser(userData)
      } else {
        // tanpa login: set user default agar UI role-based tetap tampil
        setUser(defaultGuestUser)
      }
      setLoading(false)
    }

    getSession()

    // Listen for changes on auth state (signed in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: unknown, session: { user?: { id: string } } | null) => {
        if (session?.user) {
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()
          if (userData) setUser(userData)
        } else {
          setUser(defaultGuestUser)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    if (DEMO_MODE) {
      setUser(mockUser)
      return
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signOut = async () => {
    if (DEMO_MODE) {
      setUser(null)
      return
    }
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const switchRole = (role: 'admin' | 'panitia' | 'member') => {
    if (user) setUser({ ...user, role })
  }

  const value = {
    user,
    loading,
    signIn,
    signOut,
    switchRole,
    isAdmin: user?.role === 'admin',
    isPanitia: user?.role === 'panitia',
    isMember: user?.role === 'member',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

