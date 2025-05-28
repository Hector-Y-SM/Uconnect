import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import HeaderWithBack from "../components/HeaderWithBack";

export default function CambiarContrasena() {
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");

  const [mostrarActual, setMostrarActual] = useState(false);
  const [mostrarNueva, setMostrarNueva] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);

  const router = useRouter();

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

  const handleChangePassword = async () => {
    if (nueva !== confirmar) {
      Alert.alert("Error", "Las contraseñas nuevas no coinciden.");
      return;
    }

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      Alert.alert(
        "Error",
        sessionError?.message || "No hay una sesión activa."
      );
      return;
    }

    const email = session.user.email;
    if (!email) {
      Alert.alert("Error", "No se encontró el correo del usuario.");
      return;
    }

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password: actual,
    });

    if (loginError) {
      Alert.alert(
        "Error",
        loginError.message || "Contraseña actual incorrecta."
      );
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: nueva });

    if (error) {
      Alert.alert(
        "Error",
        error.message || "No se pudo cambiar la contraseña."
      );
    } else {
      Alert.alert("Éxito", "Contraseña actualizada correctamente.", [
        {
          text: "OK",
          onPress: () => router.replace("./settings"),
        },
      ]);
      setActual("");
      setNueva("");
      setConfirmar("");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <HeaderWithBack onPressBack={() => router.push("./settings")} />
      <View style={styles.container}>
        <Text style={styles.title}>Cambiar Contraseña</Text>

        {/* Campo: Contraseña actual */}
        <Text style={styles.label}>Contraseña actual</Text>
        <View style={styles.inputBox}>
          <TextInput
            style={styles.input}
            secureTextEntry={!mostrarActual}
            value={actual}
            onChangeText={setActual}
            placeholder="Ingresa tu contraseña actual"
            placeholderTextColor="#b0b0b0"
          />
          <TouchableOpacity onPress={() => setMostrarActual(!mostrarActual)}>
            <Ionicons
              name={mostrarActual ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#8C092C"
            />
          </TouchableOpacity>
        </View>

        {/* Campo: Nueva contraseña */}
        <Text style={styles.label}>Nueva contraseña</Text>
        <View style={styles.inputBox}>
          <TextInput
            style={styles.input}
            secureTextEntry={!mostrarNueva}
            value={nueva}
            onChangeText={setNueva}
            placeholder="Nueva contraseña"
            placeholderTextColor="#b0b0b0"
          />
          <TouchableOpacity onPress={() => setMostrarNueva(!mostrarNueva)}>
            <Ionicons
              name={mostrarNueva ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#8C092C"
            />
          </TouchableOpacity>
        </View>

        {/* Campo: Confirmar contraseña */}
        <Text style={styles.label}>Confirmar contraseña</Text>
        <View style={styles.inputBox}>
          <TextInput
            style={styles.input}
            secureTextEntry={!mostrarConfirmar}
            value={confirmar}
            onChangeText={setConfirmar}
            placeholder="Repite la nueva contraseña"
            placeholderTextColor="#b0b0b0"
          />
          <TouchableOpacity
            onPress={() => setMostrarConfirmar(!mostrarConfirmar)}
          >
            <Ionicons
              name={mostrarConfirmar ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#8C092C"
            />
          </TouchableOpacity>
        </View>

        {/* Botón de guardar */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleChangePassword}
        >
          <Text style={styles.saveButtonText}>Guardar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 32,
    flex: 1,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#22223b",
    marginBottom: 24,
    alignSelf: "center",
  },
  label: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 4,
    marginLeft: 2,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 13,
    color: "#22223b",
  },
  saveButton: {
    backgroundColor: "#8C092C",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#8C092C",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
    letterSpacing: 1,
  },
});
