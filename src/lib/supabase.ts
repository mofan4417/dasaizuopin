import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://ufuckvrunbrlliunsflb.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmdWNrdnJ1bmJybGxpdW5zZmxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NDYwNzksImV4cCI6MjA5MDAyMjA3OX0.4fsWu-NH5Sc0Kj4eKwzsDSAht3yZp0jInz_jq-eYkzc';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);
