import { createClient } from '@supabase/supabase-js';

// این متغیرها از فایل .env خوانده می‌شوند
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// بررسی برای جلوگیری از خطاهای احتمالی
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL or Anon Key is missing! Check your .env file.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);