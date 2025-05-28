import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function HeaderWithBack({ onPressBack }: { onPressBack?: () => void }) {
  return (
    <View style={styles.header}>
      {/* Flecha de regreso a la izquierda */}
      <TouchableOpacity
        style={styles.iconButtonLeft}
        onPress={onPressBack ? onPressBack : () => router.push('/')}
      >
        <Ionicons name="arrow-back" size={18} color="#111827" />
      </TouchableOpacity>

      <View style={{ flex: 1 }} />

      {/* Botón de configuración a la derecha */}
      <TouchableOpacity
        style={styles.iconButtonRight}
        onPress={() => router.push('../screens/settings')}
      >
        <Ionicons name="settings-outline" size={16} color="#374151" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#8C092C',
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 12,
    height: 56, // Altura fija para la barra superior
    flexDirection: 'row',
    alignItems: 'center',
    // Sombra para Android/iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  iconButtonLeft: {
    padding: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 999,
  },
  iconButtonRight: {
    padding: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 999,
  },
});


