import { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import React from 'react';

export default function EntryChecker() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUserProfile = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession(); 

      if (error || !session) {
        router.replace('/'); 
        return;
      }

      const userId = session.user.id;

      const { data: profile, error: profileError } = await supabase
        .from('info_user')
        .select('is_first_time')
        .eq('user_uuid', userId)
        .single();

      if (profileError || !profile) {
        router.replace('/complete-profile-step1'); 
      } else if (profile.is_first_time) {
        router.replace('/complete-profile-step1');
      } else {
        router.replace('/(tabs)');
      }

      setLoading(false);
    };

    checkUserProfile();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text>Cargando...</Text>
      </View>
    );
  }

  return null;
}