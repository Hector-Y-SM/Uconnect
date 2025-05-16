import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import HeaderWithSearch from "../components/HeaderWithSearch";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome } from "@expo/vector-icons";
import { Post } from "@/interfaces/interfaces_tables";

export default function HomeScreen() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fetchPosts = async () => {
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
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const renderPost = ({ item }: { item: Post }) => (
    <View className="bg-white m-4 p-4 rounded-xl shadow">
      {item.image_url ? (
        <TouchableOpacity
          onPress={() => {
            setSelectedImage(item.image_url);
            setModalVisible(true);
          }}
        >
          <Image
            source={{ uri: item.image_url }}
            className="w-full h-48 rounded-md mb-2"
            resizeMode="cover"
          />
        </TouchableOpacity>
      ) : null}

      <Text className="font-bold text-lg mb-1">
        @{item.info_user?.username || "Desconocido"}
      </Text>

      <Text className="text-sm text-gray-500 mb-1">
        Cursos:{" "}
        {item.courses.length > 0
          ? item.courses.map((c) => c.name_course).join(", ")
          : "No especificado"}
      </Text>

      <Text className="text-sm text-gray-500 mb-2">
        Tipo: {item.category?.category_name || "No especificado"}
      </Text>

      <Text className="text-gray-700 mb-2">{item.description}</Text>

      <View className="flex-row justify-between mt-2">
        <TouchableOpacity
          onPress={() => console.log("Comentar", item.post_uuid)}
        >
          <FontAwesome name="comment-o" size={24} color="gray" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => console.log("Guardar", item.post_uuid)}
        >
          <FontAwesome name="bookmark-o" size={24} color="gray" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <HeaderWithSearch />
      <FlatList
        data={posts}
        keyExtractor={(item) => item.post_uuid}
        renderItem={renderPost}
        ListEmptyComponent={
          <Text className="text-gray-400 text-center mt-10">
            No hay publicaciones aún.
          </Text>
        }
      />

      {modalVisible && selectedImage && (
        <Modal visible={modalVisible} transparent={true} animationType="fade">
          <View className="flex-1 bg-black bg-opacity-90 justify-center items-center">
            <Image
              source={{ uri: selectedImage }}
              className="w-full h-[80%] rounded-md"
              resizeMode="contain"
            />
            <TouchableOpacity
              onPress={() => {
                setModalVisible(false);
                setSelectedImage(null);
              }}
              className="absolute top-10 right-5 bg-white p-2 rounded-full"
            >
              <FontAwesome name="close" size={24} color="black" />
            </TouchableOpacity>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}
