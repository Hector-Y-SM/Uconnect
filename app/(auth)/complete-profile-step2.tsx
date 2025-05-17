// app/(auth)/profile-step1.tsx
import React, { useState } from "react";
import { View, TextInput, Text, Button, Alert, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";

export default function ProfileStep2() {
  const { username, firstName, lastName } = useLocalSearchParams();
  const [phone, setPhone] = useState('');
  const router = useRouter();

  const handleNext = async () => {
    if (!phone) {
      Alert.alert('datos invalidos','por favor ingresa un numero de telefono');
      return;
    }

    const { data } = await supabase
      .from("info_user")
      .select("phone_number")
      .eq("phone_number", phone);

    if (data && data.length > 0) {
      Alert.alert("Este numero de telefono ya esta vinculado a otra cuenta");
      return;
    }

    router.push({
      pathname: "/(auth)/complete-profile-step3",
      params: { username, firstName, lastName, phone },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Paso 2/4 - Hola {'@' + username} cual es tu numero? </Text>

      <Text>Numero de celular</Text>
      <TextInput style={styles.input} value={phone} onChangeText={setPhone} />

      <Button title="Siguiente" onPress={handleNext} />
      <Button title="volver" onPress={() => router.back()}/>
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
