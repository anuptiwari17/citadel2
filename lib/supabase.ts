// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// Client-side Supabase (for use in React components)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);