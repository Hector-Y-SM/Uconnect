import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator
} from "react-native";
import { Comment } from "@/interfaces/interfaces_tables";
import { supabase } from "@/lib/supabase";

interface CommentModalProps {
    visible: boolean;
    onClose: () => void;
    postId: string;
    postAuthor: string;
  }

//para poder obtener el nombre de usuario y foto del comentario original
  interface CommentWithUserInfo extends Comment {
    user_icon?: string;
    user_name?: string;
  }

  const CommentModal = ({
    visible,
    onClose,
    postId,
    postAuthor,
  }: CommentModalProps) => {
    const [comments, setComments] = useState<CommentWithUserInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState("");
    const [userUUID, setUserUUID] = useState<string | null>(null);
    const [currentUserIcon, setCurrentUserIcon] = useState<string | null>(null);
    const [isEdit, setIsEdit] = useState(false);
    const [editingCommentUUID, setEditingCommentUUID] = useState<string | null>(null);


    const fetchComments = async () => {
        setIsEdit(false)
        setLoading(true);
        
        const { data, error } = await supabase
          .from("comments")
          .select(`
            *,
            info_user:user_uuid (
              icon_url,
              username
            )
          `)
          .eq("post_uuid", postId)
          .order("comment_date", { ascending: false });
    
        if (error) {
          console.error("Error fetching comments:", error.message);
        } else {
          const processedComments = data?.map(comment => ({
            ...comment,
            user_icon: comment.info_user?.icon_url || "https://via.placeholder.com/40",
            user_name: comment.info_user?.username || "Usuario"
          })) || [];
          
          setComments(processedComments);
        }
        setLoading(false);
    };
    
    const fetchUserSessionAndIcon = async () => {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
    
        if (sessionError) {
          console.error(sessionError.message);
          return;
        }
    
        const uuid = session?.user?.id;
        if (!uuid) return;
    
        setUserUUID(uuid);
    
        const { data, error: iconError } = await supabase
          .from("info_user")
          .select("icon_url")
          .eq("user_uuid", uuid)
          .single();
    
        if (iconError) {
          console.error(iconError.message);
          return;
        }
    
        setCurrentUserIcon(data?.icon_url || null);
    };

    const handleAddComment = async () => {
        if (!commentText.trim() || !userUUID) return;
      
        if (isEdit && editingCommentUUID) {
          const { error } = await supabase
            .from("comments")
            .update({ content: commentText.trim(), comment_date: new Date().toISOString() })
            .eq("comment_uuid", editingCommentUUID);
      
          if (error) {
            console.error(error.message);
            return;
          }
      
          setIsEdit(false);
          setEditingCommentUUID(null);
        } else {
          const newComment = {
            post_uuid: postId,
            user_uuid: userUUID,
            content: commentText.trim(),
            comment_date: new Date().toISOString(),
          };
      
          const { error } = await supabase.from("comments").insert(newComment);
      
          if (error) {
            console.error(error.message);
            return;
          }
        }
      
        setCommentText("");
        fetchComments();
      };
      

    useEffect(() => {
        if (visible) {
          fetchUserSessionAndIcon();
          fetchComments();
        }
    }, [visible]);
    

    const editComment = async (comment_uuid: string) => {
        const { data, error } = await supabase
          .from("comments")
          .select("content")
          .eq("comment_uuid", comment_uuid);
      
        if (error) throw error;
      
        if (data && data.length > 0) {
          setCommentText(data[0].content);
          setIsEdit(true);
          setEditingCommentUUID(comment_uuid);
        } else {
          setIsEdit(false);
          setEditingCommentUUID(null);
          console.error("no hay comentarios con esta uuid");
        }
      };
      
    const deleteComment = async (comment_uuid: string) => {
        const { error } = await supabase
          .from("comments")
          .delete()
          .eq("comment_uuid", comment_uuid);
    
        if (error) {
          console.error("Error eliminando comentario:", error.message);
          return;
        }
    
        fetchComments();
    };

    const renderCommentItem = ({ item }: { item: CommentWithUserInfo }) => (
        <View className="flex-row p-4 border-b border-gray-100">
          <Image
            source={{
              uri: item.user_icon || "https://via.placeholder.com/40",
            }}
            className="w-10 h-10 rounded-full mr-3"
          />
          <View className="flex-1 flex-col">
            <Text className="font-bold text-sm">{'@' + item.user_name}</Text>
            <Text className="text-sm mt-1">{item.content}</Text>
            <Text className="text-gray-500 text-xs mt-1">
              {new Date(item.comment_date).toLocaleTimeString()}
            </Text>
          </View>
          {
            item.user_uuid === userUUID ?
            <View className="flex-row">
                <TouchableOpacity 
                    onPress={() => editComment(item.comment_uuid)}
                    className="mr-3 p-1"
                    >
                    <Text className="text-blue-500">Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    onPress={() => deleteComment(item.comment_uuid)}
                    className="p-1"
                    >
                    <Text className="text-red-500">Eliminar</Text>
                </TouchableOpacity>
            </View>
            :
            null
          }
        </View>
      );
      

      return (
        <Modal
          animationType="slide"
          transparent={true}
          visible={visible}
          onRequestClose={onClose}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1 justify-end"
          >
            <TouchableOpacity
              activeOpacity={1}
              className="absolute inset-0 bg-black/40"
              onPress={onClose}
            />
    
            <View className="bg-white rounded-t-2xl max-h-[60%] h-[90%]">
              <View className="items-center py-2">
                <View className="w-12 h-1.5 bg-gray-300 rounded-full" />
              </View>
    
              <View className="flex-row justify-center py-2 border-b border-gray-100">
                <Text className="font-semibold text-base text-gray-800">
                  Comentarios
                </Text>
              </View>
    
              {loading ? (
                <View className="flex-1 justify-center items-center py-10">
                  <ActivityIndicator size="small" />
                  <Text className="mt-2 text-gray-500 text-sm">Cargando...</Text>
                </View>
              ) : (
                <FlatList
                  data={comments}
                  keyExtractor={(item) => item.comment_uuid}
                  renderItem={renderCommentItem}
                  className="flex-1"
                  ListHeaderComponent={
                    <View className="px-4 py-3 border-b border-gray-100">
                      <Text className="text-sm text-gray-600">
                        Publicación de @{postAuthor}
                      </Text>
                    </View>
                  }
                  ListEmptyComponent={
                    <View className="flex-1 justify-center items-center py-10">
                      <Text className="text-gray-500 text-sm">No hay comentarios aún</Text>
                    </View>
                  }
                />
              )}
    
              <View className="flex-row items-center px-4 py-3 border-t border-gray-100">
                <Image
                  source={{ uri: currentUserIcon || "https://via.placeholder.com/40" }}
                  className="w-8 h-8 rounded-full mr-3"
                />
                <TextInput
                  className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm"
                  placeholder="Añade un comentario..."
                  value={commentText}
                  onChangeText={setCommentText}
                  multiline
                />
                <TouchableOpacity
                  onPress={handleAddComment}
                  disabled={!commentText.trim() || !userUUID}
                  className="ml-2"
                >
                  <Text
                    className={`font-semibold ${
                      !commentText.trim() ? "text-blue-300" : "text-blue-500"
                    }`}
                  >
                    {isEdit ? 'Editar' : 'Publicar'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      );
    };
    
export default CommentModal;