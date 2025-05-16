import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import Header from "../components/Header";
import { supabase } from "@/lib/supabase";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import * as FileSystem from "expo-file-system";
import { getMimeType } from "../helpers/mimeType";
import { Category, Course } from "@/interfaces/interfaces_tables";
import { FontAwesome } from "@expo/vector-icons";

export default function CreatePost() {
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      const id = session.user.id;
      setUserId(id);

      const { data, error } = await supabase
        .from("info_user")
        .select("username")
        .eq("user_uuid", id)
        .single();

      if (!error && data) setUsername(data.username);
    };

    const fetchCategories = async () => {
      const { data, error } = await supabase.from("category_post").select("*");
      if (!error && data) setCategories(data);
    };

    const fetchCourses = async () => {
      const { data, error } = await supabase.from("courses").select("*");
      if (!error && data) setCourses(data);
    };

    fetchUserData();
    fetchCategories();
    fetchCourses();
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permiso requerido",
        "Necesitas permitir acceso a tu galería."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string): Promise<string | null> => {
    try {
      const fileExt = uri.split(".").pop() || "jpg";
      const fileName = `${uuidv4()}.${fileExt}`;
      const mimeType = getMimeType(uri);

      // read img base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      //base64 convert binary file how Uint8array
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      const { data, error } = await supabase.storage
        .from("posts")
        .upload(fileName, bytes, {
          contentType: mimeType,
          upsert: false,
        });

      if (error || !data) {
        console.error("Error al subir imagen a Supabase:", error);
        return null;
      }

      const { data: publicUrlData } = supabase.storage
        .from("posts")
        .getPublicUrl(data.path);

      return publicUrlData?.publicUrl ?? null;
    } catch (error) {
      console.error(
        "(NOBRIDGE) ERROR  Error inesperado en uploadImage:",
        error
      );
      return null;
    }
  };

  const handlePost = async () => {
    if (!description.trim()) {
      Alert.alert("Error", "La descripción no puede estar vacía.");
      return;
    }

    if (!selectedCategory || selectedCourses.length === 0) {
      Alert.alert(
        "Error",
        "Debes seleccionar una categoría y al menos un curso."
      );
      return;
    }

    setLoading(true);

    let imageUrl = null;
    if (image) {
      imageUrl = await uploadImage(image);
    }

    // Insertar post
    const { data, error } = await supabase
      .from("posts")
      .insert({
        user_uuid: userId,
        description,
        image_url: imageUrl,
        uuid_category: selectedCategory,
      })
      .select("post_uuid")
      .single(); // Obtener el UUID del nuevo post

    if (error || !data) {
      setLoading(false);
      console.error("Error al crear el post:", error);
      Alert.alert("Error", "No se pudo crear el post.");
      return;
    }

    const postUuid = data.post_uuid;
    const courseRelations = selectedCourses.map((course_uuid) => ({
      post_uuid: postUuid,
      course_uuid,
    }));

    const { error: relationError } = await supabase
      .from("post_courses")
      .insert(courseRelations);

    setLoading(false);

    if (relationError) {
      console.error("Error al relacionar cursos:", relationError);
      Alert.alert(
        "Error",
        "Post creado pero no se pudieron relacionar los cursos."
      );
    } else {
      Alert.alert("Éxito", "Post creado correctamente.");
      setDescription("");
      setImage(null);
      setSelectedCategory("");
      setSelectedCourses([]);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header />
      <ScrollView
        className="px-4"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="mt-4 px-4">
          <Text className="text-lg font-semibold mb-2">Crear publicación</Text>
          <Text className="text-sm text-gray-600 mb-4">
            Publicando como: {username}
          </Text>

          {/* Picker de Categoría */}
          <Text className="mb-1">Tipo de publicación</Text>
          <View className="border border-gray-300 rounded-md mb-4">
            <Picker
              selectedValue={selectedCategory}
              onValueChange={(value) => setSelectedCategory(value)}
            >
              <Picker.Item label="Selecciona una categoría" value="" />
              {categories.map((cat) => (
                <Picker.Item
                  key={cat.uuid_category_pk}
                  label={cat.category_name}
                  value={cat.uuid_category_pk}
                />
              ))}
            </Picker>
          </View>

          {/* Picker de Curso */}
          <Text className="mb-1">Dirigido a:</Text>
          <View className="border border-gray-300 rounded-md mb-4">
            <Text className="mb-1">Dirigido a (selección múltiple):</Text>
            {courses.map((course) => (
              <TouchableOpacity
                key={course.course_uuid}
                onPress={() => {
                  if (selectedCourses.includes(course.course_uuid)) {
                    setSelectedCourses(
                      selectedCourses.filter((c) => c !== course.course_uuid)
                    );
                  } else {
                    setSelectedCourses([
                      ...selectedCourses,
                      course.course_uuid,
                    ]);
                  }
                }}
                className={`border p-2 rounded-md mb-2 ${
                  selectedCourses.includes(course.course_uuid)
                    ? "bg-indigo-200"
                    : "bg-white"
                }`}
              >
                <Text>{course.name_course}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            className="border border-gray-300 rounded-md p-3 h-32 text-base"
            placeholder="¿Qué estás pensando?"
            multiline
            value={description}
            style={{ textAlignVertical: "top" }}
            onChangeText={setDescription}
          />

          <TouchableOpacity
            className="mt-3 p-3 bg-indigo-100 rounded-md items-center"
            onPress={pickImage}
          >
            <Text className="text-indigo-600">Agregar imagen</Text>
          </TouchableOpacity>

          {image && (
            <View className="mt-4 relative">
              <Image
                source={{ uri: image }}
                className="w-full h-64 rounded-md"
                resizeMode="contain" // muestra la imagen completa
              />

              <TouchableOpacity
                onPress={() => setImage(null)}
                className="absolute top-2 right-2 bg-white p-1 rounded-full shadow"
              >
                <FontAwesome name="close" size={20} color="red" />
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            className="mt-6 bg-indigo-600 py-3 rounded-md items-center"
            onPress={handlePost}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold">Publicar</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
