import React from "react";
import {
  Modal,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  View,
  Text,
  Dimensions,
  ViewStyle,
} from "react-native";

interface CustomModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  heightPercentage?: number; 
}

export default function CustomModal({
  visible,
  onClose,
  title,
  children,
  heightPercentage = 60, //tamaño del modal
}: CustomModalProps) {
  const screenHeight = Dimensions.get("window").height;

  const containerStyle: ViewStyle = {
    height: (screenHeight * heightPercentage) / 100,
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-end"
      >
        <TouchableOpacity
          activeOpacity={1}
          className="absolute inset-0 bg-black/40"
          onPress={onClose}
        />
        <View className="bg-white rounded-t-2xl" style={containerStyle}>
          <View className="items-center py-2">
            <View className="w-12 h-1.5 bg-gray-300 rounded-full" />
          </View>

          {title && (
            <View className="flex-row justify-center py-2 border-b border-gray-100">
              <Text className="font-semibold text-base text-gray-800">{title}</Text>
            </View>
          )}

          <View className="flex-1">
            {children}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}