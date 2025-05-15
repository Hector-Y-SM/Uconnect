import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Header (){
  return (
    <View className="mb-4 px-4 bg-gray-800 pb-4">
      {/* Fila superior: Icono + Botón de configuración */}
      <View className="flex-row items-center justify-between mb-2">
        <Image
          source={{ uri: 'https://via.placeholder.com/36' }} // Reemplaza con tu logo
          style={{ width: 36, height: 36, borderRadius: 18 }}
        />
        <TouchableOpacity className="p-2 bg-gray-100 rounded-full">
          <Ionicons name="settings-outline" size={22} color="#374151" />
        </TouchableOpacity>
      </View>
      </View>
  )
}

