import { useRouter } from 'expo-router';
import React from 'react';
import { Button, Text, View, Alert } from 'react-native';
import { supabase } from '@/lib/subapase';

export default function HomeScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Error al cerrar sesión', error.message);
      return;
    }

    router.replace('/'); 
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Home Screen</Text>
      <Button title="cerrar sesion" onPress={handleLogout} />
    </View>
  );
}
