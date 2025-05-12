import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gofbqtsnjixwtoqqvjlv.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvZmJxdHNuaml4d3RvcXF2amx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2NTg5MzgsImV4cCI6MjA2MjIzNDkzOH0.oULatkIWGW87tO_opGQUYXgDqfimFC1Bc_OmXjU1O3U'


export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})