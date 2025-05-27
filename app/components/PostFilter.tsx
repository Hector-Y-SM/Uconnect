import React from "react";
import { Modal, View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelectCourse: (course: string | null) => void;
  availableCourses: string[];
  selectedCourse: string | null;
};

export default function PostFilter({
  visible,
  onClose,
  onSelectCourse,
  availableCourses,
  selectedCourse,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white p-4 rounded-t-2xl max-h-[60%]">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold">Filtrar por carrera</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-outline" size={28} color="black" />
            </TouchableOpacity>
          </View>

          <ScrollView>
            <TouchableOpacity
              className="p-2 rounded bg-gray-100 mb-2"
              onPress={() => {
                onSelectCourse(null);
                onClose();
              }}
            >
              <Text className="text-center">Todas las carreras</Text>
            </TouchableOpacity>

            {availableCourses.map((course, index) => (
              <TouchableOpacity
                key={index}
                className={`p-2 rounded mb-2 ${
                  selectedCourse === course ? "bg-blue-100" : "bg-gray-100"
                }`}
                onPress={() => {
                  onSelectCourse(course);
                  onClose();
                }}
              >
                <Text className="text-center">{course}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
