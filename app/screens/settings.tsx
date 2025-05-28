import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, Alert, StyleSheet } from "react-native";
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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f3f4f6" }}>
      <HeaderWithBack onPressBack={() => router.push("../(tabs)")} />

      <View style={styles.container}>
        <Text style={styles.title}>Configuración de cuenta</Text>

        <View style={styles.optionsBox}>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => router.push("./edit_profile?field=first_name")}
          >
            <Text style={styles.optionText}>Cambiar nombre</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => router.push("./edit_profile?field=last_name")}
          >
            <Text style={styles.optionText}>Cambiar apellido</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => router.push("./edit_profile?field=username")}
          >
            <Text style={styles.optionText}>Cambiar nombre de usuario</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => router.push("./edit_profile?field=bio")}
          >
            <Text style={styles.optionText}>Editar biografía</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => router.push("./change_password")}
          >
            <Text style={styles.optionText}>Cambiar contraseña</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => router.replace("./post_saved")}
          >
            <Text style={styles.optionText}>Ver Posts Guardados</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#22223b",
    marginBottom: 24,
    alignSelf: "center",
  },
  optionsBox: {
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 32,
    // Sombra
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  optionButton: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  optionText: {
    fontSize: 16,
    color: "#374151",
  },
  logoutButton: {
    backgroundColor: "#8C092C",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#8C092C",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 1,
  },
});
