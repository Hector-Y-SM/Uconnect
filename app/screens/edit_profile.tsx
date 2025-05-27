import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { supabase } from "@/lib/supabase";
import HeaderWithBack from "../components/HeaderWithBack";

const fieldLabels = {
  first_name: "Nombre",
  last_name: "Apellido",
  username: "Nombre de usuario",
  bio: "Biografía",
};

type EditableField = keyof typeof fieldLabels;

export default function EditProfile() {
  const { field } = useLocalSearchParams<{ field: EditableField }>();
  const [currentValue, setCurrentValue] = useState("");
  const [newValue, setNewValue] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCurrentValue = async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (!session || sessionError) {
        router.replace("./NotFoundScreen");
        return;
      }

      const { data, error } = await supabase
        .from("info_user")
        .select(field)
        .eq("user_uuid", session.user.id)
        .single<Partial<Record<EditableField, string>>>();

      if (error) {
        Alert.alert("Error", "No se pudo obtener la información.");
      } else if (data && field in data) {
        setCurrentValue(data[field] ?? "");
      }
    };

    fetchCurrentValue();
  }, [field]);

  const handleUpdate = async () => {
    if (!newValue.trim()) {
      Alert.alert("Error", "El nuevo valor no puede estar vacío.");
      return;
    }

    setLoading(true);
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (!session || sessionError) {
      Alert.alert("Error", "No hay sesión activa.");
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("info_user")
      .update({ [field]: newValue })
      .eq("user_uuid", session.user.id);

    setLoading(false);

    if (error) {
      Alert.alert("Error", "No se pudo actualizar.");
    } else {
      Alert.alert("Éxito", "Información actualizada.");
      router.back();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <HeaderWithBack onPressBack={() => router.replace("./settings")} />
      <View className="px-6 mt-6">
        <Text className="text-xl font-bold mb-6">
          Editar {fieldLabels[field]}
        </Text>

        <Text className="mb-1">Valor actual</Text>
        <View className="border border-gray-300 rounded-lg px-3 py-3 mb-4 bg-white">
          <Text>{currentValue || "Sin información"}</Text>
        </View>

        <Text className="mb-1">Nuevo {fieldLabels[field]}</Text>
        <TextInput
          className="border border-gray-300 p-3 rounded-lg bg-white mb-6"
          placeholder={`Nuevo ${fieldLabels[field]}`}
          value={newValue}
          onChangeText={setNewValue}
          multiline={field === "bio"}
          numberOfLines={field === "bio" ? 5 : 1}
          textAlignVertical={field === "bio" ? "top" : "center"}
        />

        <TouchableOpacity
          className="bg-blue-500 p-4 rounded-lg items-center"
          onPress={handleUpdate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-base">Guardar</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
