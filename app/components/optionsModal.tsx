import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import CustomModal from "./customModal";


interface OptionsModalProps {
  visible: boolean;
  onClose: () => void;
  postId: string;
  onPostDeleted?: () => void;
}

const OptionsModal = ({ visible, onClose, postId, onPostDeleted }: OptionsModalProps) => {
  const handleDeletePost = async () => {
    Alert.alert(
      "Eliminar publicación",
      "¿Estás seguro de que quieres eliminar esta publicación? Esta acción no se puede deshacer.",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const { error: postError } = await supabase
                .from("posts")
                .delete()
                .eq("post_uuid", postId);

              if (postError) {
                Alert.alert("Error", "No se pudo eliminar la publicación.");
                return;
              }

              onClose();
              
              if (onPostDeleted) {
                console.log("actualizaaaaaa");
                onPostDeleted();
              }

              Alert.alert("Éxito", "La publicación ha sido eliminada correctamente.");
            } catch (error) {
              console.error("Error inesperado:", error);
              Alert.alert("Error", "Ocurrió un error inesperado al eliminar la publicación.");
            }
          },
        },
      ]
    );
  };

  const handleEditPost = () => {
    
    onClose();
  
    console.log("Editar post:", postId);
  };

  return (
    <CustomModal
      visible={visible}
      onClose={onClose}
      title="Opciones de publicación"
      heightPercentage={30} 
    >
      <View className="p-4">
        <TouchableOpacity
          onPress={handleEditPost}
          className="flex-row items-center py-4 border-b border-gray-100"
        >
          <FontAwesome name="pencil" size={20} color="#2563eb" />
          <Text className="ml-4 text-base">Editar publicación</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleDeletePost}
          className="flex-row items-center py-4"
        >
          <FontAwesome name="trash" size={20} color="#ef4444" />
          <Text className="ml-4 text-base text-red-500">Eliminar publicación</Text>
        </TouchableOpacity>
      </View>
    </CustomModal>
  );
};

export default OptionsModal;