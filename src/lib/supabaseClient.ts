import { createClient } from '@supabase/supabase-js'

// Read from Vite client env; fall back to existing values for local dev
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wdhzleaklbenmowphscl.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkaHpsZWFrbGJlbm1vd3Boc2NsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNzkyMjMsImV4cCI6MjA3Nzc1NTIyM30.HW8Kjh9k7hnR571zA5Pi2HO8OYFmdxYaNv2hv6z-q7s'

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be provided in VITE_ env vars');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
