import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image, Alert, StyleSheet } from "react-native";
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
  showSaveButton = true,
}: PostCardProps) => {
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [commentLength, setCommentLength] = useState(0);
  const [isAuthor, setIsAuthor] = useState(false);
  const [currentUserUUID, setCurrentUserUUID] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const router = useRouter();

  // Función para obtener la URL pública del avatar de Supabase Storage
  const getAvatarUrl = () => {
    const url = item.info_user?.icon_url;
    console.log("ICON_URL:", url); // <-- Esto te mostrará en consola el valor real
    if (!url || url === "" || url === null) {
      return "https://cdn-icons-png.flaticon.com/512/149/149071.png";
    }
    if (url.startsWith("http")) {
      return url;
    }
    // Limpia cualquier 'icons/' o '/' al inicio
    const cleanUrl = url.replace(/^icons\//, "").replace(/^\//, "");
    return `https://gofbqtsnjixwtoqqvjlv.supabase.co/storage/v1/object/public/icons/${cleanUrl}`;
  };

  useEffect(() => {
    const checkCurrentUser = async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) return;
      if (!session?.user) return;

      const userUUID = session.user.id;
      setCurrentUserUUID(userUUID);

      // Check if post is saved
      const { data: saved } = await supabase
        .from("my_saved")
        .select("saved_uuid")
        .eq("post_uuid", item.post_uuid)
        .eq("user_uuid", userUUID)
        .single();
      setIsSaved(!!saved);

      // Check author
      const { data: userData } = await supabase
        .from("info_user")
        .select("*")
        .eq("user_uuid", userUUID)
        .single();

      if (
        userData &&
        item.info_user &&
        userData.username === item.info_user.username
      ) {
        setIsAuthor(true);
      }
    };

    checkCurrentUser();
  }, [item.info_user?.username, item.post_uuid]);

  const fetchCommentCount = async (postId: string): Promise<number> => {
    const { count } = await supabase
      .from("comments")
      .select("*", { count: "exact", head: true })
      .eq("post_uuid", postId);
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
    if (!currentUserUUID) return;

    const { data: existing, error: fetchError } = await supabase
      .from("my_saved")
      .select("saved_uuid")
      .eq("post_uuid", item.post_uuid)
      .eq("user_uuid", currentUserUUID)
      .single();

    if (existing) {
      Alert.alert(
        "Post ya guardado",
        "Este post ya está guardado en tus posts guardados.",
        [{ text: "OK" }]
      );
      return;
    }

    const { error } = await supabase.from("my_saved").insert([
      {
        post_uuid: item.post_uuid,
        user_uuid: currentUserUUID,
      },
    ]);
    if (!error) setIsSaved(true);
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={async () => {
            const { data } = await supabase
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
          style={styles.userRow}
        >
          <Text style={styles.username}>@{item.info_user?.username || "Desconocido"}</Text>
        </TouchableOpacity>
        {isAuthor && (
          <TouchableOpacity
            onPress={() => setOptionsModalVisible(true)}
            style={styles.optionsBtn}
          >
            <FontAwesome name="ellipsis-h" size={20} color="gray" />
          </TouchableOpacity>
        )}
      </View>

      {item.created_at && (
        <Text style={styles.date}>
          Publicado el{" "}
          {new Date(item.created_at).toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </Text>
      )}

      <Text style={styles.courses}>
        <Text style={{ fontWeight: 'bold' }}>Cursos:</Text>{" "}
        {item.courses.length > 0
          ? item.courses.map((c) => c.name_course).join(", ")
          : "No especificado"}
      </Text>

      <Text style={styles.category}>
        <Text style={{ fontWeight: 'bold' }}>Tipo:</Text>{" "}
        {item.category?.category_name || "No especificado"}
      </Text>

      <Text style={styles.description} numberOfLines={4}>
        {item.description}
      </Text>

      {/* Imagen SOLO debajo de la descripción */}
      {item.image_url ? (
        <TouchableOpacity
          onPress={() => {
            setSelectedImage(item.image_url!);
            setModalVisible(true);
          }}
        >
          <Image
            source={{ uri: item.image_url }}
            style={styles.image}
            resizeMode="cover"
          />
        </TouchableOpacity>
      ) : null}

      <View style={styles.actionsRow}>
        {showSaveButton && (
          <TouchableOpacity
            onPress={handleSavePost}
            style={styles.actionBtn}
          >
            <FontAwesome
              name="bookmark"
              size={22}
              color={isSaved ? "#8C092C" : "gray"}
            />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => setCommentModalVisible(true)}
          style={styles.actionBtn}
        >
          <FontAwesome name="comments" size={22} color="#8C092C" />
          <Text style={styles.commentCount}>{commentLength}</Text>
        </TouchableOpacity>

        {onDeleteSavedPost && (
          <TouchableOpacity
            onPress={() => onDeleteSavedPost(item.post_uuid)}
            style={styles.actionBtn}
          >
            <FontAwesome name="trash" size={22} color="red" />
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

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 12,
    marginVertical: 8,
    padding: 14,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  image: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: "#eee",
  },
  username: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#222",
  },
  optionsBtn: {
    padding: 4,
  },
  date: {
    color: "#888",
    fontSize: 12,
    marginBottom: 2,
  },
  courses: {
    fontSize: 13,
    color: "#555",
    marginBottom: 1,
  },
  category: {
    fontSize: 13,
    color: "#8C092C",
    marginBottom: 4,
  },
  description: {
    fontSize: 15,
    color: "#222",
    marginBottom: 8,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 18,
    marginTop: 4,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 6,
  },
  commentCount: {
    marginLeft: 4,
    color: "#8C092C",
    fontWeight: "bold",
    fontSize: 14,
  },
});

export default PostCard;
