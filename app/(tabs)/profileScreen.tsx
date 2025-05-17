import React, { useEffect, useState } from "react";
import { View, Text, Alert, Modal, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView } from "react-native";
import { supabase } from "@/lib/supabase";
import { Post, UserInfo } from "@/interfaces/interfaces_tables";
import Header from "../components/Header";
import ProfileInfo from "../components/profileInfo";
import UserPosts from "../components/userPost";
import { useRouter } from "expo-router";

export default function ProfileScreen() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const router = useRouter();

  const fetchUserInfo = async (newUrl?: string, fieldToUpdate?: "portada_url" | "icon_url") => {    
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      Alert.alert("Error", "No session found.");
      router.replace('../(auth)/login')
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

  useEffect(() => {
    fetchUserInfo();
  }, []);

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
        <ProfileInfo userInfo={userInfo} refreshUserInfo={fetchUserInfo} />
        
        <UserPosts 
          userPosts={userPosts} 
          setSelectedImage={setSelectedImage} 
          setModalVisible={setModalVisible} 
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