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
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Text style={{ fontSize: 18, fontWeight: "bold", marginHorizontal: 16, marginTop: 16, marginBottom: 8, color: "#22223b" }}>
        Publicaciones
      </Text>
      <FlatList
        data={userPosts}
        scrollEnabled={false}
        keyExtractor={(item) => item.post_uuid}
        renderItem={renderPost}
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", color: "#b0b0b0", marginTop: 24, fontSize: 14 }}>
            No has creado publicaciones aún.
          </Text>
        }
      />
    </View>
  );
}