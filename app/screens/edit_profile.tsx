import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <HeaderWithBack onPressBack={() => router.replace("./settings")} />
      <View style={styles.container}>
        <Text style={styles.title}>
          Editar {fieldLabels[field]}
        </Text>

        <Text style={styles.label}>Valor actual</Text>
        <View style={styles.valueBox}>
          <Text style={styles.valueText}>{currentValue || "Sin información"}</Text>
        </View>

        <Text style={styles.label}>Nuevo {fieldLabels[field]}</Text>
        <TextInput
          style={styles.input}
          placeholder={`Nuevo ${fieldLabels[field]}`}
          value={newValue}
          onChangeText={setNewValue}
          multiline={field === "bio"}
          numberOfLines={field === "bio" ? 5 : 1}
          textAlignVertical={field === "bio" ? "top" : "center"}
        />

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleUpdate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Guardar</Text>
          )}
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
  valueBox: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  valueText: {
    color: "#374151",
    fontSize: 13,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#fff",
    marginBottom: 24,
    fontSize: 13,
    minHeight: 48,
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
