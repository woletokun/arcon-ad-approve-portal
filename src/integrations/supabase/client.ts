// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://jzjmtsuqeqsefhbftxoc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6am10c3VxZXFzZWZoYmZ0eG9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNzA0MzcsImV4cCI6MjA2Nzk0NjQzN30.7yILnmwofOBI6rrg3yWQHQqz6QQusxW8uGRWkwMTfxo";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});