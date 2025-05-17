// components/PostCard.tsx

import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { Post } from "@/interfaces/interfaces_tables";

type PostCardProps = {
  item: Post;
  setSelectedImage: (url: string) => void;
  setModalVisible: (visible: boolean) => void;
};

const PostCard = ({ item, setSelectedImage, setModalVisible }: PostCardProps) => (
  <View className="bg-white m-4 p-4 rounded-xl shadow">
    {item.image_url ? (
      <TouchableOpacity
        onPress={() => {
          setSelectedImage(item.image_url!);
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
      <TouchableOpacity onPress={() => console.log("Comentar", item.post_uuid)}>
        <FontAwesome name="comment-o" size={24} color="gray" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => console.log("Guardar", item.post_uuid)}>
        <FontAwesome name="bookmark-o" size={24} color="gray" />
      </TouchableOpacity>
    </View>
  </View>
);

export default PostCard;
