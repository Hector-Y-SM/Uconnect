import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function Settings() {
  const handleLogout = async () => {

    Alert.alert(
      "Cerrar sesión",
      "¿Estás seguro de que quieres cerrar sesión?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("../(tabs)/profileScreen")}>
          <Ionicons name="arrow-back" size={28} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Configuración</Text>
      </View>

      <View style={styles.optionsContainer}>
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
          onPress={() => router.push("./change_password")}
        >
          <Text style={styles.optionText}>Cambiar contraseña</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => router.replace("./createPost")}
        >
          <Text style={styles.optionText}>Ver Posts Guardados</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingTop: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  optionsContainer: {
    flex: 1,
    justifyContent: "center",
    gap: 20,
  },
  optionButton: {
    paddingVertical: 15,
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
    alignItems: "center",
  },
  optionText: {
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: "#ff5252",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  logoutText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});