import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import Header from '../components/Header';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';

const profile = () => {

   const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Error al cerrar sesión', error.message);
      return;
    }
    router.replace('(auth)/login');
  };
  
  return (
    <SafeAreaView>
      <Header />

      <TouchableOpacity onPress={handleLogout}>
        <Text>Cerrar sesion</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )

}

export default profile

const styles = StyleSheet.create({})