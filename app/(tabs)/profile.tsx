import {
  View,
  Text,
  Image,
  FlatList,
  Alert,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import { Post, UserInfo } from "@/interfaces/interfaces_tables";
import { FontAwesome } from "@expo/vector-icons";
import PostCard from "../components/PostCard";
import * as ImagePicker from "expo-image-picker";
import { ActivityIndicator } from "react-native";
import { getMimeType } from "../helpers/mimeType";
import * as FileSystem from "expo-file-system";

export default function ProfileScreen() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchUserInfo = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      Alert.alert("Error", "No session found.");
      return;
    }

    const userId = session.user.id;

    const { data: infoWithCourses, error } = await supabase
      .from("info_user")
      .select(
        `
        *,
        user_courses (
          courses (
            name_course
          )
        )
      `
      )
      .eq("user_uuid", userId)
      .single();

    if (error) {
      console.error("Error fetching user info with courses:", error.message);
      return;
    }

    if (!infoWithCourses) {
      Alert.alert("Error", "No user info found.");
      return;
    }

    const coursesArray =
      infoWithCourses.user_courses?.map(
        (uc: { courses: { name_course: string } }) => uc.courses.name_course
      ) || [];

    const coursesString = coursesArray.join(", ") || "No especificado";

    const userInfoFormatted: UserInfo = {
      first_name: infoWithCourses.first_name,
      last_name: infoWithCourses.last_name,
      username: infoWithCourses.username,
      email: session.user.email ?? "",
      phone_number: infoWithCourses.phone_number,
      university: infoWithCourses.university,
      course: coursesString,
      portada_url: infoWithCourses.portada_url || null,
      icon_url: infoWithCourses.icon_url || null,
    };

    setUserInfo(userInfoFormatted);

    const { data: posts, error: postsError } = await supabase
      .from("posts")
      .select(
        `
        post_uuid,
        description,
        image_url,
        created_at,
        user_uuid,
        info_user:info_user (
          username
        ),
        category:category_post (
          category_name
        ),
        post_courses (
          courses (
            name_course
          )
        )
      `
      )
      .eq("user_uuid", userId)
      .order("created_at", { ascending: false });

    if (postsError) {
      console.error("Error fetching posts:", postsError.message);
    } else if (posts) {
      const formattedPosts: Post[] = posts.map((post) => ({
        post_uuid: post.post_uuid,
        description: post.description,
        image_url: post.image_url,
        created_at: post.created_at,
        user_uuid: post.user_uuid,
        info_user: Array.isArray(post.info_user)
          ? post.info_user[0]
          : post.info_user,
        category: Array.isArray(post.category)
          ? post.category[0]
          : post.category,
        courses: post.post_courses?.flatMap((pc) => pc.courses) || [],
      }));

      setUserPosts(formattedPosts);
    }
  };

  const handleImageUpload = async ({
    bucket,
    filePrefix,
    columnToUpdate,
    onSuccess,
  }: {
    bucket: "portadas" | "icons";
    filePrefix: string;
    columnToUpdate: "portada_url" | "icon_url";
    onSuccess?: () => void;
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

    onSuccess?.();
  };

  const handleSelectCoverImage = async () => {
    try {
      setUploading(true);
      await handleImageUpload({
        bucket: "portadas",
        filePrefix: "portada",
        columnToUpdate: "portada_url",
        onSuccess: () => {
          fetchUserInfo();
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
        onSuccess: () => {
          fetchUserInfo();
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

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const renderPost = ({ item }: { item: Post }) => (
    <PostCard
      item={item}
      setSelectedImage={setSelectedImage}
      setModalVisible={setModalVisible}
    />
  );

  if (!userInfo) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <Text className="text-lg text-gray-600">Cargando perfil...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header />
      <ScrollView
        className="px-4"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
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
          <Text className="text-lg font-bold mt-4 mb-2">Biografia</Text>
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

        {/* Publicaciones */}
        <View className="flex-1 bg-gray-100">
          <Text className="text-lg font-bold mx-4 mt-4 mb-2">
            Tus publicaciones
          </Text>
          <FlatList
            data={userPosts}
            scrollEnabled={false}
            keyExtractor={(item) => item.post_uuid}
            renderItem={renderPost}
            contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
            ListEmptyComponent={
              <Text className="text-center text-gray-400 mt-6">
                No has creado publicaciones aún.
              </Text>
            }
          />
        </View>

        {/* Modal para mostrar imagen en grande */}
        <Modal visible={modalVisible} transparent animationType="fade">
          <TouchableOpacity
            style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.7)" }}
            onPress={() => setModalVisible(false)}
          >
            {selectedImage && (
              <Image
                source={{ uri: selectedImage }}
                style={{ flex: 1, resizeMode: "contain" }}
              />
            )}
          </TouchableOpacity>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}
