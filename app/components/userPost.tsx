import React from "react";
import { View, Text, FlatList } from "react-native";
import { Post } from "@/interfaces/interfaces_tables";
import PostCard from "./PostCard";

interface UserPostsProps {
  userPosts: Post[];
  setSelectedImage: (uri: string | null) => void;
  setModalVisible: (visible: boolean) => void;
  refreshUserPosts?: () => void; 
}

export default function UserPosts({ 
  userPosts, 
  setSelectedImage, 
  setModalVisible,
  refreshUserPosts 
}: UserPostsProps) {
  
  const renderPost = ({ item }: { item: Post }) => (
    <PostCard
      item={item}
      setSelectedImage={setSelectedImage}
      setModalVisible={setModalVisible}
      onPostUpdated={() => {
        console.log("Actualizando lista de posts del usuario después de modificar un post");
        if (refreshUserPosts) {
          refreshUserPosts();
        }
      }}
    />
  );

  return (
    <View className="flex-1 bg-gray-100">
      <Text className="text-lg font-bold mx-4 mt-4 mb-2">
        Publicaciones
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
  );
}