import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { supabase } from "@/lib/supabase";
import { UserInfo } from "@/interfaces/interfaces_tables";
import { FontAwesome } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { getMimeType } from "../helpers/mimeType";

interface ProfileInfoProps {
  userInfo: UserInfo;
  refreshUserInfo: (newUrl?: string, fieldToUpdate?: "portada_url" | "icon_url") => Promise<void>;
  isOnboarding?: boolean; 
}

export default function ProfileInfo({ userInfo, refreshUserInfo, isOnboarding = false }: ProfileInfoProps) {
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async ({
    bucket,
    filePrefix,
    columnToUpdate,
    onSuccess,
  }: {
    bucket: "portadas" | "icons";
    filePrefix: string;
    columnToUpdate: "portada_url" | "icon_url";
    onSuccess?: (url: string) => void; 
  }) => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert("Permiso denegado", "Necesitas permitir acceso a tus fotos.");
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (pickerResult.canceled || !pickerResult.assets) return;

    const file = pickerResult.assets[0];
    const mimeType = getMimeType(file.uri);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) throw new Error("No session found.");

    const userId = session.user.id;
    const timestamp = Date.now();
    const fileExt = file.uri.split(".").pop() || "jpg";
    const filePath = `${filePrefix}-${userId}-${timestamp}.${fileExt}`;

    // Leer y convertir archivo
    const base64 = await FileSystem.readAsStringAsync(file.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    // Subir archivo
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, bytes, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    const publicUrl = data?.publicUrl + `?v=${Date.now()}`;
    if (!publicUrl) throw new Error("No se pudo obtener la URL pública.");

    const { error: updateError } = await supabase
      .from("info_user")
      .update({ [columnToUpdate]: publicUrl })
      .eq("user_uuid", userId);

    if (updateError) throw updateError;

    // Llamar a onSuccess con la URL
    onSuccess?.(publicUrl);
  };

  const handleSelectCoverImage = async () => {
    try {
      setUploading(true);
      await handleImageUpload({
        bucket: "portadas",
        filePrefix: "portada",
        columnToUpdate: "portada_url",
        onSuccess: (url) => {
          refreshUserInfo(url, "portada_url"); 
          Alert.alert("Éxito", "La imagen de portada se ha actualizado.");
        },
      });
    } catch (err) {
      if (err instanceof Error) {
        console.error("Error al subir portada:", err.message);
        Alert.alert("Error", err.message);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleSelectAvatarImage = async () => {
    try {
      setUploading(true);
      await handleImageUpload({
        bucket: "icons",
        filePrefix: "avatar",
        columnToUpdate: "icon_url",
        onSuccess: (url) => {
          refreshUserInfo(url, "icon_url"); 
          Alert.alert("Éxito", "La imagen de perfil se ha actualizado.");
        },
      });
    } catch (err) {
      if (err instanceof Error) {
        console.error("Error al subir avatar:", err.message);
        Alert.alert("Error", err.message);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      {/* Portada */}
      <TouchableOpacity onPress={handleSelectCoverImage}>
        {uploading ? (
          <View className="h-40 bg-gray-100 justify-center items-center">
            <ActivityIndicator size="large" color="#000" />
          </View>
        ) : userInfo.portada_url ? (
          <Image
            source={{ uri: userInfo.portada_url }}
            className="w-full h-40"
            resizeMode="cover"
          />
        ) : (
          <View className="h-40 bg-gray-300 justify-center items-center">
            <FontAwesome name="plus" size={30} color="white" />
            <Text className="text-white mt-2">Agregar portada</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Avatar */}
      <View className="items-center -mt-20 px-4">
        <TouchableOpacity onPress={handleSelectAvatarImage}>
          {userInfo.icon_url ? (
            <Image
              source={{ uri: userInfo.icon_url }}
              className="w-28 h-28 rounded-full border-4 border-white bg-gray-100"
            />
          ) : (
            <View className="w-28 h-28 rounded-full border-4 border-white bg-gray-300 justify-center items-center">
              <FontAwesome name="user" size={40} color="white" />
              <Text className="text-white text-xs">Agregar avatar</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View className="items-center mt-2">
        <Text className="text-2xl font-semibold">
          {userInfo.first_name} {userInfo.last_name}
        </Text>
        <Text className="text-gray-500">@{userInfo.username}</Text>
      </View>

      {/* Biografía */}
      <View className="p-4 border-b border-gray-200">
        <Text className="text-lg font-bold mt-4 mb-2">
          {isOnboarding ? "Tus datos" : "Biografia"}
        </Text>
        <Text className="text-sm text-gray-600">Email: {userInfo.email}</Text>
        <Text className="text-sm text-gray-600">
          Teléfono: {userInfo.phone_number || "No disponible"}
        </Text>
        <Text className="text-sm text-gray-600">
          Universidad: {userInfo.university || "No disponible"}
        </Text>
        <Text className="text-sm text-gray-600">
          Curso: {userInfo.course || "No especificado"}
        </Text>
      </View>
    </>
  );
}