
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  Modal,
  Alert,
  RefreshControl
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import HeaderWithSearch from "../components/HeaderWithSearch";
import { SafeAreaView } from "react-native-safe-area-context";
import { Post } from "@/interfaces/interfaces_tables";
import PostCard from "../components/PostCard";

export default function HomeScreen() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        Alert.alert("Error", "No session found.");
        router.replace('../(auth)/login');
        return;
      }

      const { data, error } = await supabase
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
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error al obtener posts:", error.message);
      } else {
        const formattedPosts: Post[] = data.map((post) => ({
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

        setPosts(formattedPosts);
      }
    } catch (error) {
      console.error("Error inesperado:", error);
    } finally {
      setRefreshing(false);
    }
  };

  
  useEffect(() => {
    fetchPosts();
  }, []);

  // Configuración de suscripción en tiempo real a cambios en posts
  useEffect(() => {
    // Canal para todos los cambios en la tabla posts
    const channel = supabase
      .channel('posts-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Escuchar inserts, updates y deletes
          schema: 'public',
          table: 'posts'
        },
        (payload) => {
          console.log('Cambio detectado en posts:', payload.eventType, payload);
          // Refrescar todos los posts cuando haya cualquier cambio
          fetchPosts();
        }
      )
      .subscribe();

    console.log('Suscripción a cambios en posts activada');

    // Limpiar la suscripción cuando el componente se desmonte
    return () => {
      console.log('Eliminando suscripción a cambios en posts');
      supabase.removeChannel(channel);
    };
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  const renderPost = ({ item }: { item: Post }) => (
    <PostCard
      item={item}
      setSelectedImage={setSelectedImage}
      setModalVisible={setModalVisible}
      onPostUpdated={() => {
        setRefreshing(true);
        fetchPosts();
      }}
    />
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <HeaderWithSearch />
      <FlatList
        data={posts}
        keyExtractor={(item) => item.post_uuid}
        renderItem={renderPost}
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
        ListEmptyComponent={
          <Text className="text-gray-400 text-center mt-10">
            No hay publicaciones aún.
          </Text>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#2563eb" 
          />
        }
      />

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
    </SafeAreaView>
  );
}