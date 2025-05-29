import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  Text,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SearchBar from "./SearchBar";
import { router } from "expo-router";
import UserCard from "./UserCard";

type Props = {
  onPressFilter?: () => void;
  backgroundColor?: string;
};

export default function HeaderWithSearch({ onPressFilter, backgroundColor = "#fff" }: Props) {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  // Mostrar el modal si hay resultados
  const handleSearchResults = (results: any[]) => {
    setSearchResults(results);
    setModalVisible(results.length > 0);
  };

  return (
    <View style={[styles.header, { backgroundColor }]}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Image
          source={{ uri: "https://via.placeholder.com/32" }}
          style={{ width: 32, height: 32, borderRadius: 16, marginRight: 8 }}
        />

        <View style={{ flex: 1, marginRight: 8 }}>
          <SearchBar
            placeHolder="Buscar usuarios..."
            onSearchResults={handleSearchResults}
          />
        </View>

        <TouchableOpacity
          className="p-2 bg-gray-100 rounded-full mr-2"
          onPress={onPressFilter}
        >
          <Ionicons name="funnel-outline" size={20} color="#374151" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: "#ffe4e6" }]}
          onPress={() => router.push("../screens/createEditPost")}
        >
          <Ionicons name="add-circle-outline" size={15} color="#f43f5e" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => router.push("../screens/settings")}
        >
          <Ionicons name="settings-outline" size={15} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Modal para mostrar resultados de búsqueda */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                {searchResults.length > 0 ? (
                  searchResults.map((user) => (
                    <UserCard key={user.user_uuid} user={user} />
                  ))
                ) : (
                  <Text style={{ textAlign: "center", color: "#888" }}>
                    No hay resultados
                  </Text>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 12,
    height: 56,
    justifyContent: "center",
  },
  iconButton: {
    padding: 8,
    backgroundColor: "#f3f4f6",
    borderRadius: 999,
    marginLeft: 6,
    marginRight: 0,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 70, // Espacio para que el modal salga debajo del header
  },
  modalContent: {
    width: "90%",
    maxHeight: 350,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
});
