import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import HeaderWithBack from "../components/HeaderWithBack";


const settings = () => {
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Error al cerrar sesión", error.message);
      return;
    }
    router.replace("./(auth)/login");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <HeaderWithBack />

      <TouchableOpacity onPress={handleLogout}>
        <Text>Cerrar sesion</Text>
      </TouchableOpacity>
      <Text>settings</Text>
    </SafeAreaView>
  );
};

export default settings;

const styles = StyleSheet.create({});
