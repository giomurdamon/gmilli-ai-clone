import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key'
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gmillibot.com'

// Check if Supabase is properly configured
const isSupabaseConfigured =
  supabaseUrl !== 'https://placeholder.supabase.co' &&
  supabaseAnonKey !== 'placeholder-key' &&
  supabaseAnonKey.length > 20

// Client-side Supabase client (only create if properly configured)
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      },
      global: {
        headers: {
          'x-site-url': siteUrl
        }
      }
    })
  : null

// Client component client (with fallback)
export const createSupabaseClient = () => {
  if (!isSupabaseConfigured) {
    return null
  }
  return createClientComponentClient()
}

// Admin client with service role (for user management)
export const supabaseAdmin = isSupabaseConfigured && supabaseServiceKey !== 'placeholder-service-key'
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        headers: {
          'x-site-url': siteUrl
        }
      }
    })
  : null

// Export configuration status
export const isAuthEnabled = isSupabaseConfigured
export const getSiteUrl = () => siteUrl

// Database types
export interface UserProfile {
  id: string
  email: string
  status: 'active' | 'suspended' | 'terminated'
  subscription_status: 'trial' | 'paid' | 'expired'
  subscription_end_date?: string
  created_at: string
  last_login?: string
  total_trades: number
  is_admin: boolean
  approval_status: 'pending' | 'approved' | 'rejected'
  approved_at?: string
  rejected_at?: string
  rejection_reason?: string
}

export interface UserActivity {
  id: string
  user_id: string
  action: string
  details?: any
  created_at: string
}
