import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('VITE_SUPABASE_URL:', supabaseUrl || 'MISSING');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'SET' : 'MISSING');
  console.error('\n📋 To fix this in Vercel:');
  console.error('1. Go to Project Settings → Environment Variables');
  console.error('2. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  console.error('3. Enable for Production, Preview, and Development');
  console.error('4. Click SAVE');
  console.error('5. Redeploy your project (without cache)\n');

  throw new Error('Missing Supabase environment variables. Please check the console for instructions.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
