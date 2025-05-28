import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tlhejbmdwowbhcyviydm.supabase.co'; // Replace with your Supabase URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsaGVqYm1kd293YmhjeXZpeWRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0MzU0OTIsImV4cCI6MjA2NDAxMTQ5Mn0.oFzM4dpp_r0qO6Yd5oaqnSSbH34Qv9-cI4SGnnrR0hs'; // Replace with your Supabase anon key

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);