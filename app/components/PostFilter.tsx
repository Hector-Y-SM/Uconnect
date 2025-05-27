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

  availableCategories: string[];
  selectedCategories: string[];
  onToggleCategory: (category: string) => void;
  onClearCategories: () => void;

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
  availableCategories,
  selectedCategories,
  onToggleCategory,
  onClearCategories,
  orderBy,
  onChangeOrder,
}: Props) {
  const isSelected = (course: string) => selectedCourses.includes(course);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white p-4 rounded-t-2xl max-h-[70%]">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold">Filtros</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-outline" size={28} color="black" />
            </TouchableOpacity>
          </View>

          {/* Ordenar por fecha */}
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

          {/* Filtrar por categoría */}
          <View className="mb-2">
            <Text className="text-lg font-bold">Filtrar por categoría</Text>
          </View>

          <ScrollView horizontal className="mb-4 space-x-2">
            {availableCategories.map((category, index) => (
              <TouchableOpacity
                key={index}
                className={`px-3 py-2 rounded border ${
                  selectedCategories.includes(category)
                    ? "bg-green-100 border-green-400"
                    : "bg-gray-100 border-gray-300"
                }`}
                onPress={() => onToggleCategory(category)}
              >
                <Text className="text-sm">{category}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Filtrar por carrera */}
          <View className="mb-2">
            <Text className="text-lg font-bold">Filtrar por carrera</Text>
          </View>

          <ScrollView className="mb-4">
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

          {/* Botón de limpiar */}
          <TouchableOpacity
            className="p-2 rounded bg-red-100"
            onPress={() => {
              onClearCourses();
              onClearCategories();
              onChangeOrder("recent");
              onClose();
            }}
          >
            <Text className="text-center font-semibold">Limpiar filtros</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
