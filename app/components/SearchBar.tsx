import React, { useEffect, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { TextInput, View } from "react-native";
import { supabase } from "@/lib/supabase";
import '@/app/global.css'

interface Props {
  placeHolder: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onSearchResults?: (users: any[]) => void;
}

export default function SearchBar({ placeHolder, value, onChangeText, onSearchResults }: Props) {
  const [searchTerm, setSearchTerm] = useState(value || '');
  
  useEffect(() => {
    const debounceTimer = setTimeout(async () => {
      if (searchTerm.trim()) {
        try {
          const { data, error } = await supabase
            .from('info_user')
            .select('username, icon_url, user_uuid')
            .ilike('username', `%${searchTerm}%`)
            .limit(10);

          if (error) throw error;
          
          onSearchResults?.(data || []);
        } catch (error) {
          console.error('Error searching users:', error);
          onSearchResults?.([]);
        }
      } else {
        onSearchResults?.([]);
      }
    }, 2000);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleTextChange = (text: string) => {
    setSearchTerm(text);
    onChangeText?.(text);
  };

  return (
    <View className="flex-row items-center bg-gray-100 rounded-t-3xl px-5 py-2 shadow-sm shadow-gray-300">
      <Ionicons name="search-outline" size={18} color="#6B7280" />
      <TextInput
        placeholder={placeHolder}
        placeholderTextColor="#9CA3AF"
        value={searchTerm}
        onChangeText={handleTextChange}
        style={{ fontSize: 16 }}
        className="flex-1 ml-2 text-gray-800"
      />
    </View>
  );
}
