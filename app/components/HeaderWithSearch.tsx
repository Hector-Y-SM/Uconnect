import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SearchBar from './SearchBar';
import { router } from 'expo-router';

export default function HeaderWithSearch() {
  return (
    <View className="mb-4 px-4 bg-gray-800 pb-4">
      {/* Fila superior: Icono + Botón de configuración */}
      <View className="flex-row items-center justify-between mb-2">
        <Image
          source={{ uri: 'https://via.placeholder.com/36' }} // Reemplaza con tu logo
          style={{ width: 36, height: 36, borderRadius: 18 }}
        />
        <TouchableOpacity className="p-2 bg-gray-100 rounded-full" onPress={() => router.push('../screens/settings')}>
          <Ionicons name="settings-outline" size={22} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Fila inferior: SearchBar + Botones */}
      <View className="flex-row items-center">
        <View className="flex-1 mr-2">
          <SearchBar placeHolder="Buscar..." />
        </View>

        <TouchableOpacity className="p-2 bg-gray-100 rounded-full mr-2">
          <Ionicons name="funnel-outline" size={20} color="#374151" />
        </TouchableOpacity>

        <TouchableOpacity className="p-2 bg-rose-100 rounded-full" onPress={() => router.push('./screens/createPost')}>
          <Ionicons name="add-circle-outline" size={20} color="#f43f5e" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
