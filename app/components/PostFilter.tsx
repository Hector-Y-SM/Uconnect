import React from "react";
import { Modal, View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  visible: boolean;
  onClose: () => void;
  onToggleCourse: (course: string) => void;
  onClearCourses: () => void;
  availableCourses: string[];
  selectedCourses: string[];

  orderBy: "recent" | "oldest";            
  onChangeOrder: (order: "recent" | "oldest") => void; 
};

export default function PostFilter({
  visible,
  onClose,
  onToggleCourse,
  onClearCourses,
  availableCourses,
  selectedCourses,
  orderBy,
  onChangeOrder,
}: Props) {
  const isSelected = (course: string) => selectedCourses.includes(course);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white p-4 rounded-t-2xl max-h-[70%]">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold">Filtrar por carrera</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-outline" size={28} color="black" />
            </TouchableOpacity>
          </View>

          <View className="mb-4">
            <Text className="font-semibold mb-2">Ordenar por fecha</Text>
            <View className="flex-row space-x-4">
              <TouchableOpacity
                className={`p-2 rounded border ${
                  orderBy === "recent"
                    ? "bg-blue-100 border-blue-400"
                    : "bg-gray-100 border-gray-300"
                }`}
                onPress={() => onChangeOrder("recent")}
              >
                <Text>Más recientes</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`p-2 rounded border ${
                  orderBy === "oldest"
                    ? "bg-blue-100 border-blue-400"
                    : "bg-gray-100 border-gray-300"
                }`}
                onPress={() => onChangeOrder("oldest")}
              >
                <Text>Más antiguos</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView>
            <TouchableOpacity
              className="p-2 rounded bg-red-100 mb-2"
              onPress={() => {
                onClearCourses();
                onChangeOrder("recent");
                onClose();
              }}
            >
              <Text className="text-center font-semibold">Limpiar filtros</Text>
            </TouchableOpacity>

            {availableCourses.map((course, index) => (
              <TouchableOpacity
                key={index}
                className={`flex-row items-center justify-between p-3 rounded mb-2 border ${
                  isSelected(course)
                    ? "bg-blue-100 border-blue-400"
                    : "bg-gray-100 border-gray-300"
                }`}
                onPress={() => onToggleCourse(course)}
              >
                <Text className="text-base">{course}</Text>
                {isSelected(course) && (
                  <Ionicons name="checkmark-circle" size={20} color="blue" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
