import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
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
    <SafeAreaView className="flex-1 bg-gray-100">
      <HeaderWithBack onPressBack={() => router.push("./settings")} />
      <View className="px-6 mt-6">
      <Text className="text-xl font-bold mb-6">Cambiar Contraseña</Text>

      {/* Campo: Contraseña actual */}
      <Text className="mb-1">Contraseña actual</Text>
      <View className="flex-row items-center border border-gray-300 rounded-lg px-3 mb-4">
        <TextInput
          className="flex-1 py-3"
          secureTextEntry={!mostrarActual}
          value={actual}
          onChangeText={setActual}
        />
        <TouchableOpacity onPress={() => setMostrarActual(!mostrarActual)}>
          <Ionicons
            name={mostrarActual ? "eye-off-outline" : "eye-outline"}
            size={24}
          />
        </TouchableOpacity>
      </View>

      {/* Campo: Nueva contraseña */}
      <Text className="mb-1">Nueva contraseña</Text>
      <View className="flex-row items-center border border-gray-300 rounded-lg px-3 mb-4">
        <TextInput
          className="flex-1 py-3"
          secureTextEntry={!mostrarNueva}
          value={nueva}
          onChangeText={setNueva}
        />
        <TouchableOpacity onPress={() => setMostrarNueva(!mostrarNueva)}>
          <Ionicons
            name={mostrarNueva ? "eye-off-outline" : "eye-outline"}
            size={24}
          />
        </TouchableOpacity>
      </View>

      {/* Campo: Confirmar contraseña */}
      <Text className="mb-1">Confirmar contraseña</Text>
      <View className="flex-row items-center border border-gray-300 rounded-lg px-3 mb-6">
        <TextInput
          className="flex-1 py-3"
          secureTextEntry={!mostrarConfirmar}
          value={confirmar}
          onChangeText={setConfirmar}
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

      {/* Botón de guardar */}
      <TouchableOpacity
        className="bg-blue-500 rounded-lg py-4 items-center"
        onPress={handleChangePassword}
      >
        <Text className="text-white font-bold text-base">Guardar</Text>
      </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
