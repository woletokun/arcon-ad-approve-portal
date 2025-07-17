// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

// ✅ Use static initialization — NOT inside a function
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = (() => {
  let client: ReturnType<typeof createClient> | null = null;

  if (!client) {
    client = createClient(...);
  }

  return client;
})();
