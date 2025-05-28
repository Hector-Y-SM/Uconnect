import React, { useState } from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SearchBar from './SearchBar';
import { router } from 'expo-router';
import UserCard from './UserCard';

export default function HeaderWithSearch({ backgroundColor = '#fff' }) {
  const [searchResults, setSearchResults] = useState<any[]>([]);

  return (
    <View style={[styles.header, { backgroundColor }]}>
      <View className="flex-row items-center">
        <Image
          source={{ uri: 'https://via.placeholder.com/32' }}
          style={{ width: 10, height: 24, borderRadius: 12, marginRight: 8 }}
        />

        <View className="flex-1 mr-2">
          <SearchBar 
            placeHolder="Buscar usuarios..."
            onSearchResults={(users) => {
              setSearchResults(users);
            }}
          />
          {searchResults.length > 0 && (
            <View className="absolute top-16 left-0 right-0 z-50 max-h-64 overflow-hidden bg-transparent rounded-b-xl">
              {searchResults.map((user) => (
                <UserCard key={user.user_uuid} user={user} />
              ))}
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="funnel-outline" size={15} color="#374151" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: '#ffe4e6' }]}
          onPress={() => router.push('../screens/createEditPost')}
        >
          <Ionicons name="add-circle-outline" size={15} color="#f43f5e" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => router.push('../screens/settings')}
        >
          <Ionicons name="settings-outline" size={15} color="#374151" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 12,
    height: 56, // Altura fija para la barra superior
    justifyContent: 'center',
  },
  iconButton: {
    padding: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 999,
    marginLeft: 6,
    marginRight: 0,
  },
});
