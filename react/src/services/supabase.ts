import { createClient } from '@supabase/supabase-js';

// Fallback to hardcoded values if env vars fail locally
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ypyogighzmdgzxpwlmof.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlweW9naWdoem1kZ3p4cHdsbW9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5MTIyODYsImV4cCI6MjA4MTQ4ODI4Nn0.yqMO2Ly_TVdBfMAsVn2d9VMJPofwqFPcKUTxKM1rcy0';

if (!import.meta.env.VITE_SUPABASE_URL) {
  console.warn('⚠️ using Hardcoded Fallback Credentials for Supabase');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

console.log('Initialize Supabase Client');
console.log('URL:', supabaseUrl ? supabaseUrl : 'MISSING');

supabase.auth.onAuthStateChange((event) => {
  console.log('Supabase Auth Event:', event);
});
