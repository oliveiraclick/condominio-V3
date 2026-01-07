
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Mock client to prevent "Cannot read properties of null" crashes
const mockClient = {
  auth: {
    getSession: async () => ({ data: { session: null } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
    signInWithPassword: async () => ({ error: { message: "Supabase not configured (Mock Mode)" } }),
    signUp: async () => ({ error: { message: "Supabase not configured (Mock Mode)" } }),
    signOut: async () => ({}),
    getUser: async () => ({ data: { user: null }, error: null }),
  },
  from: () => ({
    select: () => ({
      eq: () => ({ maybeSingle: async () => ({ data: null }), single: async () => ({ data: null }) }),
      order: () => Promise.resolve({ data: [] }),
      upsert: async () => ({ error: null }),
      insert: async () => ({ error: null }),
      update: async () => ({ eq: async () => ({ error: null }) })
    }),
    upsert: async () => ({ error: null }),
    insert: async () => ({ error: null }),
    update: async () => ({ eq: async () => ({ error: null }) })
  })
} as any;

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : mockClient;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials missing. App running in SAFE MOCK MODE.');
}
