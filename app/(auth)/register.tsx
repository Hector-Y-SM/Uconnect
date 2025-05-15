import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";

export default function SignUpScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleEmailSignup = async () => {
    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      Alert.alert("Error al registrar", error.message);
      return;
    }

    Alert.alert("revisa tu correo para verificar tu cuenta");

    router.replace("/");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registro</Text>
      <Text>Ingresa tu correo y una contraseña</Text>

      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Text style={styles.icon}>{showPassword ? "🚫" : "👁️"}</Text>
        </TouchableOpacity>
      </View>

      <Button title="registrarme" onPress={handleEmailSignup} />

      <TouchableOpacity
        style={styles.forgotPassword}
        onPress={() => router.push("/login")}
      >
        <Text style={styles.forgotPasswordText}>
          ¿Ya tienes una cuenta? Inicia Sesion
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, flex: 1, justifyContent: "center" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  input: { borderWidth: 1, padding: 10, marginBottom: 12, borderRadius: 6 },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 6,
    marginBottom: 12,
    paddingHorizontal: 10,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 10,
  },
  icon: {
    fontSize: 18,
    marginLeft: 10,
  },
  forgotPassword: {
    marginTop: 15,
    alignItems: "center",
  },
  forgotPasswordText: {
    color: "#2196F3",
    textDecorationLine: "underline",
  },
});
