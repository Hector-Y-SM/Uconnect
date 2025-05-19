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
    const iteEmail = /^[a-zA-Z]{2,}[a-zA-Z0-9._%+-]*@ite\.edu\.mx$/;
    const ensenadaEmail = /^[a-zA-Z]{2,}[a-zA-Z0-9._%+-]*@ensenada\.edu\.mx$/;

    if (!iteEmail.test(email) && !ensenadaEmail.test(email)) {
      Alert.alert(
        "correo invalido",
        "solo se aceptan correos con el dominio @ite.edu.mx o @ensenada.edu.mx"
      );
      return;
    }

    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      Alert.alert("Error al registrar", error.message);
      return;
    }

    Alert.alert("registro exitoso", "revisa tu correo para verificar tu cuenta");

    router.replace("/");
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Registro</Text>
        <Text style={styles.subtitle}>Ingresa tu correo y una contraseña</Text>

        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholderTextColor="#aaa"
        />

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            placeholderTextColor="#aaa"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Text style={styles.icon}>{showPassword ? "🚫" : "👁️"}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer}>
          <Button 
            title="Registrarme" 
            onPress={handleEmailSignup} 
            color="#8C092C" 
          />
        </View>

        <TouchableOpacity
          style={styles.forgotPassword}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.forgotPasswordText}>
            ¿Ya tienes una cuenta? Inicia Sesión
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    padding: 20, 
    backgroundColor: "#fff"
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 28,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    alignItems: 'center',
  },
  title: { 
    fontSize: 24, 
    fontWeight: '300',
    fontFamily: 'Montserrat-Light',
    marginBottom: 24, 
    textAlign: 'center',
    color: '#222',
  },
  subtitle: {
    fontSize: 15,
    color: '#555',
    marginBottom: 18,
    textAlign: 'center',
    fontFamily: 'Montserrat-Light',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 12,
    padding: 10,
    borderRadius: 6,
    color: '#222',
    fontFamily: 'Montserrat-Light',
    fontSize: 16,
    backgroundColor: '#fafafa',
    width: '100%',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 6,
    marginBottom: 12,
    paddingHorizontal: 10,
    borderColor: '#ccc',
    backgroundColor: '#fafafa',
    width: '100%',
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 10,
    fontFamily: 'Montserrat-Light',
    fontSize: 16,
    color: '#222',
  },
  icon: {
    fontSize: 18,
    marginLeft: 10,
  },
  buttonContainer: {
    marginTop: 18,
    width: '100%',
    overflow: 'hidden',
  },
  forgotPassword: {
    marginTop: 15,
    alignItems: "center",
  },
  forgotPasswordText: {
    color: "#2196F3",
    textDecorationLine: "underline",
    fontSize: 14,
    marginTop: 2,
    fontFamily: 'Montserrat-Light',
  },
});
