import {
  View,
  FlatList,
  ActivityIndicator,
  Modal,
  Image,
  TouchableOpacity,
  Text,
} from "react-native";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import PostCard from "../components/PostCard";
import { SafeAreaView } from "react-native-safe-area-context";
import HeaderWithBack from "../components/HeaderWithBack";
import { router } from "expo-router";

const PostSaved = () => {
  const [savedPosts, setSavedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchSavedPosts = async () => {
    setLoading(true);

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      router.replace("./NotFoundScreen");
      return;
    }

    const userUUID = session.user.id;

    const { data, error } = await supabase
      .from("my_saved")
      .select(
        `
        saved_uuid,
        created_at,
        posts:post_uuid (
          post_uuid,
          description,
          image_url,
          info_user:info_user (
            username
          ),
          category:category_post (
            category_name
          ),
          post_courses (
            course_uuid (
              name_course
            )
          )
        )
      `
      )
      .eq("user_uuid", userUUID)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error al cargar posts guardados:", error.message);
    } else {
      const formattedPosts = data.map((item: any) => {
        const post = item.posts;
        return {
          ...post,
          courses: post.post_courses.map((pc: any) => pc.course_uuid),
        };
      });
      setSavedPosts(formattedPosts);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchSavedPosts();
  }, []);

  const handlePostUpdated = () => {
    fetchSavedPosts();
  };

  const handleDeleteSavedPost = async (postUUID: string) => {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      console.error("Error de sesión:", sessionError?.message);
      return;
    }

    const userUUID = session.user.id;

    const { error } = await supabase
      .from("my_saved")
      .delete()
      .eq("post_uuid", postUUID)
      .eq("user_uuid", userUUID);

    if (error) {
      console.error("Error eliminando post guardado:", error.message);
    } else {
      setSavedPosts((prevPosts) =>
        prevPosts.filter((post) => post.post_uuid !== postUUID)
      );
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <HeaderWithBack onPressBack={() => router.push("./settings")} />

      <View className="px-6 mt-6">
        <Text className="text-xl font-bold mb-6">Posts Guardados</Text>
      </View>
      <FlatList
        data={savedPosts}
        keyExtractor={(item) => item.post_uuid}
        renderItem={({ item }) => (
          <PostCard
            item={item}
            setSelectedImage={setSelectedImage}
            setModalVisible={setModalVisible}
            onPostUpdated={handlePostUpdated}
            onDeleteSavedPost={handleDeleteSavedPost}
          />
        )}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center mt-10">
            <Text className="text-gray-500 text-lg">
              No hay posts guardados
            </Text>
          </View>
        }
      />

      <Modal visible={modalVisible} transparent animationType="fade">
        <TouchableOpacity
          className="flex-1 bg-black/90 justify-center items-center"
          onPress={() => setModalVisible(false)}
        >
          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              className="w-11/12 h-3/4 rounded-lg"
              resizeMode="contain"
            />
          )}
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

export default PostSaved;
