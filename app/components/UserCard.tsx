import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';

interface UserCardProps {
  user: {
    username: string;
    full_name?: string;
    icon_url?: string;
    user_uuid: string;
  };
}

export default function UserCard({ user }: UserCardProps) {
  const handleUserPress = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user.id === user.user_uuid) {
      router.push({ pathname: "../(tabs)/profileScreen" });
      return;
    }

    router.push({
      pathname: "../screens/userProfileScreen",
      params: { userUuid: user.user_uuid },
    });
  };

  return (
    <TouchableOpacity 
      onPress={handleUserPress}
      className="flex-row items-center bg-gray-100 p-4 rounded-b-xl shadow-sm mb-2 w-full}"
    >
      <Image
        source={{ 
          uri: user.icon_url || 'https://via.placeholder.com/40'
        }}
        className="w-10 h-10 rounded-full"
      />
      <View className="ml-4">
        <Text className="font-bold text-gray-800">@{user.username}</Text>
        {user.full_name && (
          <Text className="text-gray-600 text-sm">{user.full_name}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}