import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        router.replace('/(tabs)/');
      } else {
        router.replace('/(auth)/login');
      }
    };

    checkSession();
  }, []);

  return null;
}