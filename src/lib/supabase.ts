import { createClient } from '@supabase/supabase-js'

// Demo mode - tidak memerlukan database
const DEMO_MODE = !process.env.NEXT_PUBLIC_SUPABASE_URL || 
  process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project-id.supabase.co' ||
  process.env.NEXT_PUBLIC_SUPABASE_URL === ''

let supabase: any = null // eslint-disable-line @typescript-eslint/no-explicit-any

if (!DEMO_MODE) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  supabase = createClient(supabaseUrl, supabaseAnonKey)
} else {
  // Mock Supabase untuk demo
  const createMockQuery = () => ({
    select: () => createMockQuery(),
    eq: () => createMockQuery(),
    order: () => createMockQuery(),
    limit: () => Promise.resolve({ data: [], error: null }),
    single: () => Promise.resolve({ data: null, error: null }),
    insert: () => Promise.resolve({ error: null }),
    update: () => createMockQuery(),
    delete: () => createMockQuery()
  })

  supabase = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: () => Promise.resolve({ data: { user: { id: 'demo-user' } } }),
      signOut: () => Promise.resolve({ error: null })
    },
    from: () => createMockQuery()
  }
}

export { supabase, DEMO_MODE }

// Database types
// Updated schema types to match new database structure
export interface ElectionSettings {
  id: number
  election_name: string | null
  start_date: string | null
  end_date: string | null
  is_active: boolean | null
  allow_voting: boolean | null
  allow_registration: boolean | null
  max_candidates: number | null
  require_photo: boolean | null
  announcement: string | null
  contact_info: string | null
  created_at: string | null
  update_at: string | null
}

export interface Candidate {
  id: number
  name: string
  class: string | null
  photo_url: string | null
  vision: string | null
  mission: string | null
  votes: number | null
  created_at: string | null
  update_at: string | null
}

export interface VoterRow {
  id: number
  name: string
  class: string
  has_voted: boolean | null
  voted_at: string | null
  voted_for: number | null
  email: string | null
  created_at: string | null
  update_at: string | null
}

// Application user type (matches `users` table rows)
export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'panitia' | 'member'
  created_at: string
}

// Minimal election type for demo/mock usage
export interface Election {
  id: string
  start_date: string
  end_date: string
  is_active: boolean
}
