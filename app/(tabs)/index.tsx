import React from 'react';
import { View, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import HeaderWithSearch from '../components/HeaderWithSearch';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Error al cerrar sesión', error.message);
      return;
    }
    router.replace('(auth)/login');
  };

  return (
    <SafeAreaView className="flex-1">
      {/* Header reutilizable */}
      <HeaderWithSearch />

      {/* Cuerpo: sección de posts */}
      <View className="flex-1">
        <Text className="text-gray-400 text-center mt-10">No hay publicaciones aún.</Text>
      </View>
    </SafeAreaView>
  );
}
