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
import { Ionicons } from "@expo/vector-icons";

const fieldLabels = {
  first_name: "Nombre",
  last_name: "Apellido",
  username: "Nombre de usuario",
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
        Alert.alert("Error", "No hay sesión activa.");
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
    <SafeAreaView className="flex-1 bg-white p-4">
      <View>
        <TouchableOpacity onPress={() => router.replace("./settings")}>
          <Ionicons name="arrow-back" size={28} color="black" />
        </TouchableOpacity>
      </View>

      <Text className="text-xl font-bold mb-4">
        Editar {fieldLabels[field]}
      </Text>
      <Text className="mb-2">Valor actual: {currentValue}</Text>
      <TextInput
        className="border border-gray-300 p-3 rounded-md mb-4"
        placeholder={`Nuevo ${fieldLabels[field]}`}
        value={newValue}
        onChangeText={setNewValue}
      />
      <TouchableOpacity
        className="bg-blue-500 p-4 rounded-md items-center"
        onPress={handleUpdate}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-bold">Guardar</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}