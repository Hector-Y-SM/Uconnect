import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import HeaderWithBack from "../components/HeaderWithBack";

export default function Settings() {
  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("./NotFoundScreen");
        return;
      }
    };

    getSession();
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      "Cerrar sesión",
      "¿Estás seguro de que quieres cerrar sesión?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Cerrar sesión",
          style: "destructive",
          onPress: async () => {
            const { error } = await supabase.auth.signOut();
            if (error) {
              Alert.alert("Error al cerrar sesión", error.message);
              return;
            }
            router.replace("../(auth)/login");
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <HeaderWithBack onPressBack={() => router.push("../(tabs)")} />

      <View className="px-6 mt-6">
        <Text className="text-lg font-semibold text-gray-800 mb-4">
          Configuración de cuenta
        </Text>

        <TouchableOpacity
          className="bg-white py-3 px-4 rounded-xl mb-3 shadow-sm"
          onPress={() => router.push("./edit_profile?field=first_name")}
        >
          <Text className="text-gray-700">Cambiar nombre</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-white py-3 px-4 rounded-xl mb-3 shadow-sm"
          onPress={() => router.push("./edit_profile?field=last_name")}
        >
          <Text className="text-gray-700">Cambiar apellido</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-white py-3 px-4 rounded-xl mb-3 shadow-sm"
          onPress={() => router.push("./edit_profile?field=username")}
        >
          <Text className="text-gray-700">Cambiar nombre de usuario</Text>
        </TouchableOpacity>

        {/* Nuevo botón para editar biografía */}
        <TouchableOpacity
          className="bg-white py-3 px-4 rounded-xl mb-3 shadow-sm"
          onPress={() => router.push("./edit_profile?field=bio")}
        >
          <Text className="text-gray-700">Editar biografía</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-white py-3 px-4 rounded-xl mb-3 shadow-sm"
          onPress={() => router.push("./change_password")}
        >
          <Text className="text-gray-700">Cambiar contraseña</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-white py-3 px-4 rounded-xl mb-6 shadow-sm"
          onPress={() => router.replace("./post_saved")}
        >
          <Text className="text-gray-700">Ver Posts Guardados</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-red-500 py-3 px-4 rounded-xl"
          onPress={handleLogout}
        >
          <Text className="text-white font-semibold text-center">
            Cerrar sesión
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
