import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

type HeaderWithBackProps = {
  onPressBack?: () => void;
};

export default function HeaderWithBack({ onPressBack }: HeaderWithBackProps) {
  return (
    <View className="mb-4 px-4 bg-gray-800 pb-4">
      {/* Fila: Flecha atrás + Logo + Configuración */}
      <View className="flex-row items-center justify-between">
        
        {/* Flecha de regreso */}
        <TouchableOpacity
          className="p-2"
          onPress={onPressBack || (() => router.push('/'))}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        {/* Logo */}
        <Image
          source={{ uri: 'https://via.placeholder.com/36' }} // Reemplaza con tu logo real
          style={{ width: 36, height: 36, borderRadius: 18 }}
        />

        {/* Botón de configuración */}
        <TouchableOpacity
          className="p-2 bg-gray-100 rounded-full"
          onPress={() => router.push('../screens/settings')}
        >
          <Ionicons name="settings-outline" size={22} color="#374151" />
        </TouchableOpacity>
      </View>
    </View>
  );
}


