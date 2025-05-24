import React, { useEffect, useState } from "react";
import { View, Text, Alert, Modal, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView } from "react-native";
import { supabase } from "@/lib/supabase";
import { Post, UserInfo } from "@/interfaces/interfaces_tables";
import Header from "../components/Header";
import ProfileInfo from "../components/profileInfo";
import UserPosts from "../components/userPost";
import { useFocusEffect, useNavigation, useRouter } from "expo-router";

export default function ProfileScreen() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const navigation = useNavigation()

  // Obtener el ID del usuario y configurar las suscripciones
  useEffect(() => {
    const setupUserAndSubscriptions = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
  
      if (!session) {
        router.replace('../screens/NotFoundScreen');
        return;
      }
  
      const currentUserId = session.user.id;
      setUserId(currentUserId);
      

      const channel = supabase
        .channel('realtime-all-posts-profile')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'posts',
          },
          (payload) => {
            console.log("Cambio detectado en la tabla posts:", payload.eventType);
            
            if (
              payload.eventType === 'DELETE' || 
              (payload.new && payload.new.user_uuid === currentUserId)
            ) {
              console.log("actualizando post del usuario");
              fetchUserPosts(currentUserId);
            }
          }
        )
        .subscribe();

      // Cargar datos iniciales
      fetchUserInfo(currentUserId);
  
      return () => {
        supabase.removeChannel(channel);
      };
    };
  
    setupUserAndSubscriptions();
  }, []);

  const fetchUserPosts = async (userId: string) => {
    if (!userId) return;
    
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

  const fetchUserInfo = async (newUrlOrUserId?: string, fieldToUpdate?: "portada_url" | "icon_url") => {    
    let currentUserId = userId;
    let newUrl: string | undefined;
    
    if (newUrlOrUserId) {
      if (newUrlOrUserId.startsWith('http')) {
        newUrl = newUrlOrUserId;
      } else {
        currentUserId = newUrlOrUserId;
      }
    }
    
    if (!currentUserId) return;

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
      .eq("user_uuid", currentUserId)
      .single();

    const { data, error: errorUserData } = await supabase
      .from("info_user")
      .select('bio')
      .eq("user_uuid", currentUserId)
      .single();

    if (error || errorUserData) {
      console.error("Error fetching user info with courses:", error?.message || "Unknown error");
      return;
    }

    if (!infoWithCourses || !data) {
      Alert.alert("Error", "No user info found.");
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) { 
      router.replace('../screens/NotFoundScreen')
      return;
    }

    const coursesArray =
      infoWithCourses.user_courses?.map(
        (uc: { courses: { name_course: string } }) => uc.courses.name_course
      ) || [];

    const coursesString = coursesArray.join(", ") || "No especificado";

    const userInfoFormatted: UserInfo = {
      bio: data.bio,
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
    
    // Obtener los posts del usuario
    fetchUserPosts(currentUserId);
  };


   useEffect(() => {
     const unsubscribe = navigation.addListener('focus', () => {
       if (userId) {
        console.log('profileScreen recibió foco - refrescando datos');
         fetchUserPosts(userId);
       }
     });
     return unsubscribe;
   }, [navigation, userId]);

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
        <ProfileInfo 
          userInfo={userInfo} 
          refreshUserInfo={(newUrl, fieldToUpdate) => fetchUserInfo(newUrl, fieldToUpdate)} 
        />
        
        <UserPosts 
          userPosts={userPosts} 
          setSelectedImage={setSelectedImage} 
          setModalVisible={setModalVisible} 
          refreshUserPosts={() => userId && fetchUserPosts(userId)}
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