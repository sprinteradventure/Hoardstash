import { createClient } from '@supabase/supabase-js'

// Client-side Supabase client for browser operations
let supabaseClient: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables')
    }
    
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
      },
    })
  }
  return supabaseClient
}

// Hook for getting current user
export async function getCurrentUser() {
  const { data: { user } } = await getSupabaseClient().auth.getUser()
  return user
}

// Hook for getting current session
export async function getCurrentSession() {
  const { data: { session } } = await getSupabaseClient().auth.getSession()
  return session
}
