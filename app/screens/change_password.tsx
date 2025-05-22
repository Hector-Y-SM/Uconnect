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

export default function CambiarContrasena() {
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");

  const [mostrarActual, setMostrarActual] = useState(false);
  const [mostrarNueva, setMostrarNueva] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);

  const router = useRouter();

    useEffect(()=> {
      const getSession = async () => {
        const {
            data: { session },
          } = await supabase.auth.getSession();
      
          if (!session) {
            router.replace('./NotFoundScreen');
            return;
          }
      }
  
      getSession();
    }, [])

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

    const { data: loginData, error: loginError } =
      await supabase.auth.signInWithPassword({
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
    <SafeAreaView className="flex-1 bg-white p-4">
      <View>
        <TouchableOpacity onPress={() => router.replace("./settings")}>
          <Ionicons name="arrow-back" size={28} color="black" />
        </TouchableOpacity>
      </View>

      <Text className="text-xl font-bold mb-4">Cambiar Contraseña</Text>

      <Text>Contraseña actual</Text>
      <View style={styles.passwordContainer}>
        <TextInput
          secureTextEntry={!mostrarActual}
          value={actual}
          onChangeText={setActual}
          style={styles.passwordInput}
        />
        <TouchableOpacity onPress={() => setMostrarActual(!mostrarActual)}>
          <Ionicons
            name={mostrarActual ? "eye-off-outline" : "eye-outline"}
            size={24}
          />
        </TouchableOpacity>
      </View>

      <Text>Nueva contraseña</Text>
      <View style={styles.passwordContainer}>
        <TextInput
          secureTextEntry={!mostrarNueva}
          value={nueva}
          onChangeText={setNueva}
          style={styles.passwordInput}
        />
        <TouchableOpacity onPress={() => setMostrarNueva(!mostrarNueva)}>
          <Ionicons
            name={mostrarNueva ? "eye-off-outline" : "eye-outline"}
            size={24}
          />
        </TouchableOpacity>
      </View>

      <Text>Confirmar contraseña</Text>
      <View style={styles.passwordContainer}>
        <TextInput
          secureTextEntry={!mostrarConfirmar}
          value={confirmar}
          onChangeText={setConfirmar}
          style={styles.passwordInput}
        />
        <TouchableOpacity
          onPress={() => setMostrarConfirmar(!mostrarConfirmar)}
        >
          <Ionicons
            name={mostrarConfirmar ? "eye-off-outline" : "eye-outline"}
            size={24}
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
        <Text style={styles.buttonText}>Guardar</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
  },
  button: {
    backgroundColor: "#3498db",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});