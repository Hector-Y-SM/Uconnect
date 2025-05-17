// app/(auth)/profile-step1.tsx
import React, { useState } from "react";
import { View, TextInput, Text, Button, Alert, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";

export default function ProfileStep1() {
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const router = useRouter();

  const handleNext = async () => {
    if (!username || !firstName || !lastName) {
      Alert.alert('datos invalidos','por favor completa todos los campos');
      return;
    }

    const { data } = await supabase
      .from("info_user")
      .select("username")
      .eq("username", username);

    if (data && data.length > 0) {
      Alert.alert("El nombre de usuario ya está en uso");
      return;
    }

    router.push({
      pathname: "/(auth)/complete-profile-step2",
      params: { username, firstName, lastName },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Paso 1/4 - completemos tu perfil con tus datos</Text>

      <Text>Nombre de usuario</Text>
      <TextInput style={styles.input} value={username} onChangeText={setUsername} />

      <Text>Nombre</Text>
      <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} />

      <Text>Apellido</Text>
      <TextInput style={styles.input} value={lastName} onChangeText={setLastName} />

      <Button title="Siguiente" onPress={handleNext} />
      <Button title="volver" onPress={() => router.replace('./login')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 24, marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 12,
    padding: 10,
    borderRadius: 6,
  },
});
