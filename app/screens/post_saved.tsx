import {
  View,
  FlatList,
  ActivityIndicator,
  Modal,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8C092C" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <HeaderWithBack onPressBack={() => router.push("./settings")} />

      <View style={styles.headerBox}>
        <Text style={styles.title}>Posts Guardados</Text>
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
            showSaveButton={false}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>
              No hay posts guardados
            </Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      />

      <Modal visible={modalVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              style={styles.modalImage}
              resizeMode="contain"
            />
          )}
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  headerBox: {
    paddingHorizontal: 24,
    marginTop: 24,
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#22223b",
    marginBottom: 8,
  },
  emptyBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  emptyText: {
    textAlign: "center",
    color: "#b0b0b0",
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalImage: {
    width: "92%",
    height: "75%",
    borderRadius: 12,
  },
});

export default PostSaved;
