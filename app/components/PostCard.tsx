
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
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
};

const PostCard = ({ item, setSelectedImage, setModalVisible, onPostUpdated }: PostCardProps) => {
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [commentLength, setCommentLength] = useState(0);
  const [isAuthor, setIsAuthor] = useState(false);
  const [currentUserUUID, setCurrentUserUUID] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkCurrentUser = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Error al obtener la sesión:', sessionError.message);
        return;
      }
      
      if (!session?.user) {
        console.log('No hay sesión de usuario activa');
        return;
      }
      
      const userUUID = session.user.id;
      setCurrentUserUUID(userUUID);

      const { data: userData, error: userError } = await supabase
        .from('info_user')
        .select('*')
        .eq('user_uuid', userUUID)
        .single();
      
      if (userError) {
        console.error('Error al obtener información del usuario:', userError.message);
        return;
      }
      
      console.log(item.info_user)
      if (userData && item.info_user && userData.username === item.info_user.username) {
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

  //acatualizar en cuanto se muestra la pantalla
  useEffect(() => {
    const loadCommentCount = async () => {
      const count = await fetchCommentCount(item.post_uuid);
      setCommentLength(count);
    };

    loadCommentCount();
  }, [item.post_uuid]);

  //actualizar en tiempo real x el amigo
  useEffect(() => {
    // Crear un canal para escuchar cambios en los comentarios de este post específico
    const channel = supabase
      .channel(`post-comments-${item.post_uuid}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Escuchar inserts, updates y deletes
          schema: 'public',
          table: 'comments',
          filter: `post_uuid=eq.${item.post_uuid}` // Solo para este post
        },
        async () => {
          // Cuando ocurra cualquier cambio, actualizar el contador
          const newCount = await fetchCommentCount(item.post_uuid);
          setCommentLength(newCount);
        }
      )
      .subscribe();

    // Limpiar la suscripción cuando el componente se desmonte
    return () => {
      supabase.removeChannel(channel);
    };
  }, [item.post_uuid]);

  const handleCloseCommentModal = async () => {
    setCommentModalVisible(false);
    const newCount = await fetchCommentCount(item.post_uuid);
    setCommentLength(newCount);
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

      <TouchableOpacity
        onPress={
          async () => {
            const {data, error} = await supabase
                .from('info_user')
                .select('user_uuid')
                .eq('username', item.info_user?.username)
                .single()


            router.push({
              pathname: '../screens/userProfileScreen',
              params: { userUuid: data?.user_uuid } 
            })
          }
        }
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
        <TouchableOpacity 
          onPress={() => console.log("Guardar", item.post_uuid)}
          className="flex-row items-center"
        >
          <FontAwesome name="bookmark-o" size={24} color="gray" />
          <Text className="text-gray-500 ml-2 text-sm">Guardar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => setCommentModalVisible(true)}
          className="flex-row items-center"
        >
          <FontAwesome name="comment-o" size={24} color="gray" />
          <Text className="text-gray-500 ml-2 text-sm">{commentLength}</Text>
        </TouchableOpacity>
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