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
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import { supabase } from "@/lib/supabase";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import * as FileSystem from "expo-file-system";
import { getMimeType } from "../helpers/mimeType";
import { Category, Course } from "@/interfaces/interfaces_tables";
import { FontAwesome } from "@expo/vector-icons";
import HeaderWithBack from "../components/HeaderWithBack";
import { useNavigation } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function CreateEditPost() {
  const navigation = useNavigation();
  const router = useRouter();
  const { postId } = useLocalSearchParams();
  
  // Estado para determinar si estamos en modo edición o creación
  const [isEditMode, setIsEditMode] = useState(false);
  
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null); // Para almacenar la URL de la imagen ya existente
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

      if (!session) { 
        router.replace('./NotFoundScreen');
        return;
      }

      const id = session!.user.id;
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
    
    // Si tenemos un postId, cargar los datos del post para editar
    if (postId) {
      setIsEditMode(true);
      fetchPostData();
    }
  }, [postId]);

  // Función para cargar los datos del post a editar
  const fetchPostData = async () => {
    setLoading(true);
    
    try {
      // Obtener datos del post
      const { data: postData, error: postError } = await supabase
        .from("posts")
        .select("*")
        .eq("post_uuid", postId)
        .single();
        
      if (postError) {
        throw postError;
      }
      
      // Cargar los datos en el estado
      setDescription(postData.description || "");
      setSelectedCategory(postData.uuid_category || "");
      setImageUrl(postData.image_url);
      
      if (postData.image_url) {
        setImage(postData.image_url);
      }
      
      // Obtener cursos relacionados al post
      const { data: coursesData, error: coursesError } = await supabase
        .from("post_courses")
        .select("course_uuid")
        .eq("post_uuid", postId);
        
      if (coursesError) {
        throw coursesError;
      }
      
      // Establecer los cursos seleccionados
      if (coursesData) {
        setSelectedCourses(coursesData.map(item => item.course_uuid));
      }
    } catch (error) {
      console.error("Error al cargar datos del post:", error);
      Alert.alert("Error", "No se pudieron cargar los datos de la publicación");
    } finally {
      setLoading(false);
    }
  };

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
      setImageUrl(null); // Resetear la URL de la imagen anterior si estamos cambiando la imagen
    }
  };

  const uploadImage = async (uri: string): Promise<string | null> => {
    try {
      const fileExt = uri.split(".").pop() || "jpg";
      const fileName = `${uuidv4()}.${fileExt}`;
      const mimeType = getMimeType(uri);

      // Si la URI comienza con http/https, es una imagen ya subida
      if (uri.startsWith("http")) {
        return uri;
      }

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

    try {
      let finalImageUrl = imageUrl;
      
      // Solo subir imagen si hay una nueva
      if (image && !image.startsWith("http")) {
        finalImageUrl = await uploadImage(image);
      }
      
      if (isEditMode) {
        // Actualizar post existente
        const { error } = await supabase
          .from("posts")
          .update({
            user_uuid: userId,
            description,
            image_url: finalImageUrl,
            uuid_category: selectedCategory,
          })
          .eq("post_uuid", postId);
  
        if (error) {
          throw error;
        }
  
        // Eliminar relaciones de cursos existentes
        const { error: deleteError } = await supabase
          .from("post_courses")
          .delete()
          .eq("post_uuid", postId);
  
        if (deleteError) {
          throw deleteError;
        }
  
        // Crear nuevas relaciones de cursos
        const courseRelations = selectedCourses.map((course_uuid) => ({
          post_uuid: postId,
          course_uuid,
        }));
  
        const { error: relationError } = await supabase
          .from("post_courses")
          .insert(courseRelations);
  
        if (relationError) {
          throw relationError;
        }
  
        Alert.alert("Éxito", "Post actualizado correctamente.");
      } else {
        // Crear nuevo post
        const { data, error } = await supabase
          .from("posts")
          .insert({
            user_uuid: userId,
            description,
            image_url: finalImageUrl,
            uuid_category: selectedCategory,
          })
          .select("post_uuid")
          .single();
  
        if (error || !data) {
          throw error || new Error("No se pudo crear el post");
        }
  
        const postUuid = data.post_uuid;
        const courseRelations = selectedCourses.map((course_uuid) => ({
          post_uuid: postUuid,
          course_uuid,
        }));
  
        const { error: relationError } = await supabase
          .from("post_courses")
          .insert(courseRelations);
  
        if (relationError) {
          throw relationError;
        }
  
        Alert.alert("Éxito", "Post creado correctamente.");
      }
      
      // Limpiar estados y volver a la pantalla anterior
      setDescription("");
      setImage(null);
      setSelectedCategory("");
      setSelectedCourses([]);
      navigation.goBack();
      
    } catch (error: any) {
      console.error("Error al procesar el post:", error);
      Alert.alert("Error", isEditMode 
        ? "No se pudo actualizar la publicación."
        : "No se pudo crear el post.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f3f4f6" }}>
      <HeaderWithBack />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <Text style={styles.title}>
            {isEditMode ? "Editar publicación" : "Crear publicación"}
          </Text>
          <Text style={styles.subtitle}>
            Publicando como: {username}
          </Text>

          {/* Picker de Categoría */}
          <Text style={styles.label}>Tipo de publicación</Text>
          <View style={styles.pickerBox}>
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
          <Text style={styles.label}>Dirigido a (selección múltiple):</Text>
          <View style={styles.coursesBox}>
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
                style={[
                  styles.courseButton,
                  selectedCourses.includes(course.course_uuid)
                    ? styles.courseButtonSelected
                    : {},
                ]}
              >
                <Text
                  style={{
                    color: selectedCourses.includes(course.course_uuid)
                      ? "#8C092C"
                      : "#22223b",
                  }}
                >
                  {course.name_course}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.textArea}
            placeholder="¿Qué estás pensando?"
            multiline
            value={description}
            onChangeText={setDescription}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={styles.imageButton}
            onPress={pickImage}
          >
            <Text style={styles.imageButtonText}>
              {image ? "Cambiar imagen" : "Agregar imagen"}
            </Text>
          </TouchableOpacity>

          {image && (
            <View style={styles.imagePreviewBox}>
              <Image
                source={{ uri: image }}
                style={styles.imagePreview}
                resizeMode="contain"
              />

              <TouchableOpacity
                onPress={() => {
                  setImage(null);
                  setImageUrl(null);
                }}
                style={styles.closeImageButton}
              >
                <FontAwesome name="close" size={20} color="red" />
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={styles.publishButton}
            onPress={handlePost}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.publishButtonText}>
                {isEditMode ? "Actualizar" : "Publicar"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#22223b",
    marginBottom: 8,
    alignSelf: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#374151",
    marginBottom: 20,
    alignSelf: "center",
  },
  label: {
    fontSize: 15,
    color: "#374151",
    marginBottom: 4,
    marginLeft: 2,
  },
  pickerBox: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    backgroundColor: "#fff",
    marginBottom: 16,
    overflow: "hidden",
  },
  coursesBox: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 8,
    marginBottom: 16,
  },
  courseButton: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  courseButtonSelected: {
    backgroundColor: "#fbe9ef",
    borderColor: "#8C092C",
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    backgroundColor: "#fff",
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    marginBottom: 16,
  },
  imageButton: {
    marginTop: 4,
    paddingVertical: 12,
    backgroundColor: "#fbe9ef",
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 8,
  },
  imageButtonText: {
    color: "#8C092C",
    fontWeight: "bold",
    fontSize: 15,
  },
  imagePreviewBox: {
    marginTop: 16,
    marginBottom: 8,
    position: "relative",
    alignItems: "center",
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 10,
  },
  closeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#fff",
    padding: 4,
    borderRadius: 999,
    elevation: 2,
  },
  publishButton: {
    marginTop: 24,
    backgroundColor: "#8C092C",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#8C092C",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  publishButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 1,
  },
});