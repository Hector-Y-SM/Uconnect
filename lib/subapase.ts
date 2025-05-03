import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const url = "https://wzxokoqpbpaaaxuqocgr.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6eG9rb3FwYnBhYWF4dXFvY2dyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5NjU5MjIsImV4cCI6MjA2MTU0MTkyMn0.JlPF2ebfirfRL_TN__fjSX3WsoDsv-AUerKTqkOG1jc";

export const supabase = createClient (url, key, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
    }
})