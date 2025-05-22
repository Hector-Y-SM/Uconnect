import React, { useEffect, useState } from "react";
import { View, Text, Alert, Modal, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { Post, UserInfo } from "@/interfaces/interfaces_tables";
import Header from "../components/Header";
import ProfileInfo from "../components/profileInfo";
import UserPosts from "../components/userPost";
import HeaderWithBack from "../components/HeaderWithBack";

export default function UserProfileScreen() {
  const { userUuid } = useLocalSearchParams<{ userUuid: string }>();
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Configurar suscripciones en tiempo real para este usuario específico
  useEffect(() => {
    console.log("userUuid recibido:", userUuid);
    
    if (!userUuid) {
      setError("User UUID is required");
      setLoading(false);
      return;
    }

    const setupSubscriptions = () => {
      // Canal para cambios en los posts de este usuario específico
      const postsChannel = supabase
        .channel(`realtime-posts-${userUuid}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'posts',
            filter: `user_uuid=eq.${userUuid}`
          },
          (payload) => {
            console.log(`Cambio detectado en posts del usuario ${userUuid}:`, payload.eventType);
            fetchUserPosts();
          }
        )
        .subscribe();

      // Canal para cambios en la información del usuario
      const userInfoChannel = supabase
        .channel(`realtime-user-info-${userUuid}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'info_user',
            filter: `user_uuid=eq.${userUuid}`
          },
          (payload) => {
            console.log(`Cambio detectado en info del usuario ${userUuid}:`, payload.eventType);
            fetchUserInfo();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(postsChannel);
        supabase.removeChannel(userInfoChannel);
      };
    };

    // Cargar datos iniciales
    const loadInitialData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        await Promise.all([
          fetchUserInfo(),
          fetchUserPosts()
        ]);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error loading user data';
        setError(errorMessage);
        console.error("Error loading initial data:", errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
    const cleanup = setupSubscriptions();

    return cleanup;
  }, [userUuid]);

  const fetchUserPosts = async () => {
    if (!userUuid) return;
    
    try {
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
        .eq("user_uuid", userUuid)
        .order("created_at", { ascending: false });

      if (postsError) {
        throw new Error(`Error fetching posts: ${postsError.message}`);
      }

      if (posts) {
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
    } catch (err) {
      console.error("Error in fetchUserPosts:", err);
      const errorMessage = err instanceof Error ? err.message : 'Error fetching user posts';
      setError(errorMessage);
    }
  };

  const fetchUserInfo = async () => {
    if (!userUuid) return;

    try {
      // Obtener información del usuario con cursos
      const { data: infoWithCourses, error: infoError } = await supabase
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
        .eq("user_uuid", userUuid)
        .single();

      if (infoError) {
        throw new Error(`Error fetching user info: ${infoError.message}`);
      }

      if (!infoWithCourses) {
        throw new Error("No user info found for the provided UUID");
      }

      // Obtener email del usuario autenticado (si es necesario)
      let userEmail = "";
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user.id === userUuid) {
          userEmail = session.user.email ?? "";
        }
      } catch (emailError) {
        console.log("Could not fetch user email, continuing without it");
      }

      const coursesArray =
        infoWithCourses.user_courses?.map(
          (uc: { courses: { name_course: string } }) => uc.courses.name_course
        ) || [];

      const coursesString = coursesArray.join(", ") || "No especificado";

      const userInfoFormatted: UserInfo = {
        bio: infoWithCourses.bio,
        first_name: infoWithCourses.first_name,
        last_name: infoWithCourses.last_name,
        username: infoWithCourses.username,
        email: userEmail,
        phone_number: infoWithCourses.phone_number,
        university: infoWithCourses.university,
        course: coursesString,
        portada_url: infoWithCourses.portada_url || null,
        icon_url: infoWithCourses.icon_url || null,
      };

      setUserInfo(userInfoFormatted);
    } catch (err) {
      console.error("Error in fetchUserInfo:", err);
      const errorMessage = err instanceof Error ? err.message : 'Error fetching user info';
      setError(errorMessage);
    }
  };

  // Función para refrescar información del usuario (solo lectura)
  const refreshUserInfo = async () => {
    await fetchUserInfo();
  };

  // Función para refrescar posts del usuario (para UserPosts)
  const refreshUserPosts = () => {
    fetchUserPosts();
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <Text className="text-lg text-gray-600">Cargando perfil...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <Text className="text-lg text-red-600">Error: {error}</Text>
        <TouchableOpacity
          onPress={() => {
            setError(null);
            setLoading(true);
            Promise.all([fetchUserInfo(), fetchUserPosts()]).finally(() => setLoading(false));
          }}
          className="mt-4 bg-blue-500 px-4 py-2 rounded"
        >
          <Text className="text-white">Reintentar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!userInfo) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <Text className="text-lg text-gray-600">No se encontró información del usuario</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <HeaderWithBack/>
      <ScrollView
        className="px-4"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <ProfileInfo 
          userInfo={userInfo} 
          refreshUserInfo={refreshUserInfo}
          canEditImages={false}
        />
        
        <UserPosts 
          userPosts={userPosts} 
          setSelectedImage={setSelectedImage} 
          setModalVisible={setModalVisible} 
          refreshUserPosts={refreshUserPosts}
        />

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