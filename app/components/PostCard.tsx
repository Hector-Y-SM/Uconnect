import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image, Alert } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { Post } from "@/interfaces/interfaces_tables";
import CommentModal from "./commentModal";
import { supabase } from "@/lib/supabase";
import OptionsModal from "./optionsModal";
import { useRouter } from "expo-router";

type PostCardProps = {
  item: Post;
  setSelectedImage: (url: string) => void;
  setModalVisible: (visible: boolean) => void;
  onPostUpdated: () => void;
  onDeleteSavedPost?: (postUUID: string) => void;
  showSaveButton?: boolean;
};

const PostCard = ({
  item,
  setSelectedImage,
  setModalVisible,
  onPostUpdated,
  onDeleteSavedPost,
  showSaveButton = true, // Valor por defecto true para mostrar botón
}: PostCardProps) => {
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [commentLength, setCommentLength] = useState(0);
  const [isAuthor, setIsAuthor] = useState(false);
  const [currentUserUUID, setCurrentUserUUID] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkCurrentUser = async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("Error al obtener la sesión:", sessionError.message);
        return;
      }

      if (!session?.user) {
        console.log("No hay sesión de usuario activa");
        return;
      }

      const userUUID = session.user.id;
      setCurrentUserUUID(userUUID);

      const { data: userData, error: userError } = await supabase
        .from("info_user")
        .select("*")
        .eq("user_uuid", userUUID)
        .single();

      if (userError) {
        console.error(
          "Error al obtener información del usuario:",
          userError.message
        );
        return;
      }

      if (
        userData &&
        item.info_user &&
        userData.username === item.info_user.username
      ) {
        setIsAuthor(true);
      }
    };

    checkCurrentUser();
  }, [item.info_user?.username]);

  const fetchCommentCount = async (postId: string): Promise<number> => {
    const { count, error } = await supabase
      .from("comments")
      .select("*", { count: "exact", head: true })
      .eq("post_uuid", postId);

    if (error) {
      console.error("Error fetching comment count:", error.message);
      return 0;
    }

    return count ?? 0;
  };

  useEffect(() => {
    const loadCommentCount = async () => {
      const count = await fetchCommentCount(item.post_uuid);
      setCommentLength(count);
    };

    loadCommentCount();
  }, [item.post_uuid]);

  useEffect(() => {
    const channel = supabase
      .channel(`post-comments-${item.post_uuid}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
          filter: `post_uuid=eq.${item.post_uuid}`,
        },
        async () => {
          const newCount = await fetchCommentCount(item.post_uuid);
          setCommentLength(newCount);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [item.post_uuid]);

  const handleCloseCommentModal = async () => {
    setCommentModalVisible(false);
    const newCount = await fetchCommentCount(item.post_uuid);
    setCommentLength(newCount);
  };

  const handleSavePost = async () => {
    if (!currentUserUUID) {
      console.error("Usuario no autenticado");
      return;
    }

    const { data: existing, error: fetchError } = await supabase
      .from("my_saved")
      .select("saved_uuid")
      .eq("post_uuid", item.post_uuid)
      .eq("user_uuid", currentUserUUID)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error(
        "Error al verificar si ya se guardó el post:",
        fetchError.message
      );
      return;
    }

    if (existing) {
      Alert.alert(
        "Post ya guardado",
        "Este post ya está guardado en tus posts guardados.",
        [{ text: "OK" }]
      );
      return;
    }

    const { data, error } = await supabase.from("my_saved").insert([
      {
        post_uuid: item.post_uuid,
        user_uuid: currentUserUUID,
      },
    ]);

    if (error) {
      console.error("Error al guardar el post:", error.message);
    } else {
      console.log("Post guardado exitosamente", data);
    }
  };

  return (
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
      {item.created_at && (
        <Text className="text-gray-400 text-xs mb-1">
          Publicado el{" "}
          {new Date(item.created_at).toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </Text>
      )}

      <TouchableOpacity
        onPress={async () => {
          const { data, error } = await supabase
            .from("info_user")
            .select("user_uuid")
            .eq("username", item.info_user?.username)
            .single();

          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (session?.user.id == data?.user_uuid) {
            router.push({ pathname: "../(tabs)/profileScreen" });
            return;
          }

          router.push({
            pathname: "../screens/userProfileScreen",
            params: { userUuid: data?.user_uuid },
          });
        }}
      >
        <Text className="font-bold text-lg mb-1">
          @{item.info_user?.username || "Desconocido"}
        </Text>
      </TouchableOpacity>

      {isAuthor && (
        <TouchableOpacity
          onPress={() => setOptionsModalVisible(true)}
          className="flex-row items-center"
        >
          <FontAwesome name="ellipsis-h" size={24} color="gray" />
          <Text className="text-gray-500 ml-2 text-sm">Opciones</Text>
        </TouchableOpacity>
      )}

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
        {showSaveButton && (
          <TouchableOpacity
            onPress={handleSavePost}
            className="flex-row items-center"
          >
            <FontAwesome name="bookmark" size={24} color="gray" />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => setCommentModalVisible(true)}
          className="flex-row items-center"
        >
          <FontAwesome name="comments" size={24} color="gray" />
          <Text className="text-gray-500 ml-2 text-sm">{commentLength}</Text>
        </TouchableOpacity>

        {onDeleteSavedPost && (
          <TouchableOpacity
            onPress={() => onDeleteSavedPost(item.post_uuid)}
            className="flex-row items-center mt-2"
          >
            <FontAwesome name="trash" size={25} color="red" />
          </TouchableOpacity>
        )}
      </View>

      <CommentModal
        visible={commentModalVisible}
        onClose={handleCloseCommentModal}
        postId={item.post_uuid}
        postAuthor={item.info_user?.username || "Desconocido"}
      />

      <OptionsModal
        visible={optionsModalVisible}
        onClose={() => setOptionsModalVisible(false)}
        postId={item.post_uuid}
        onPostDeleted={() => {
          setOptionsModalVisible(false);
          onPostUpdated();
        }}
      />
    </View>
  );
};

export default PostCard;
