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
  ActivityIndicator,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { Comment } from "@/interfaces/interfaces_tables";
import { supabase } from "@/lib/supabase";

// Definir la interfaz para los comentarios


interface CommentModalProps {
    visible: boolean;
    onClose: () => void;
    postId: string;
    postAuthor: string;
  }

  const CommentModal = ({
    visible,
    onClose,
    postId,
    postAuthor,
  }: CommentModalProps) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState("");
    const [userUUID, setUserUUID] = useState<string | null>(null);
    const [currentUserIcon, setCurrentUserIcon] = useState<string | null>(null);
    const [username, setUsername] = useState('');

    const fetchComments = async () => {
        setLoading(true);
        const { data, error } = await supabase
          .from("comments")
          .select("*")
          .eq("post_uuid", postId)
          .order("comment_date", { ascending: false });
    
        if (error) {
          console.error("Error fetching comments:", error.message);
        } else {
          setComments(data || []);
        }
        setLoading(false);
    };
    
    const fetchUserSessionAndIcon = async () => {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
    
        if (sessionError) {
          console.error("Error fetching session:", sessionError.message);
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
          console.error("Error fetching user icon:", iconError.message);
          return;
        }
    
        setCurrentUserIcon(data?.icon_url || null);

        const { data: userData, error } = await supabase
        .from("info_user")
        .select("username")
        .eq("user_uuid", uuid)
        .single();
  
      if (error) {
        console.error("Error fetching user icon:", error.message);
        return;
      }
  
      setUsername(userData.username);
    };

    const handleAddComment = async () => {
        if (!commentText.trim() || !userUUID) return;
    
        const newComment = {
          post_uuid: postId,
          user_uuid: userUUID,
          content: commentText.trim(),
          comment_date: new Date().toISOString(),
        };
    
        const { error } = await supabase.from("comments").insert(newComment);
    
        if (error) {
          console.error("Error posting comment:", error.message);
          return;
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
    

    const renderCommentItem = ({ item }: { item: Comment }) => (
        <View className="flex-row p-4 border-b border-gray-100">
          <Image
            source={{
              uri: currentUserIcon || "https://via.placeholder.com/40",
            }}
            className="w-10 h-10 rounded-full mr-3"
          />
          <View className="flex-1 flex-col">
            <Text className="font-bold text-sm">{'@' + username}</Text>
            <Text className="text-sm mt-1">{item.content}</Text>
            <Text className="text-gray-500 text-xs mt-1">
              {new Date(item.comment_date).toLocaleTimeString()}
            </Text>
          </View>
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
                    Publicar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      );
    };
    
export default CommentModal;