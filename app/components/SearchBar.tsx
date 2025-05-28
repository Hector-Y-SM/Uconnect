import React, { useEffect, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { TextInput, View, ActivityIndicator } from "react-native";
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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
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
      setLoading(false);
    }, 700); // Menor tiempo para mejor UX

    return () => {
      clearTimeout(debounceTimer);
      setLoading(false);
    };
  }, [searchTerm]);

  const handleTextChange = (text: string) => {
    setSearchTerm(text);
    onChangeText?.(text);
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f3f4f6',
        borderRadius: 8,
        paddingHorizontal: 10,
        height: 32,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
        flex: 1,
      }}
    >
      <Ionicons name="search-outline" size={18} color="#6B7280" />
      <TextInput
        placeholder={placeHolder}
        placeholderTextColor="#9CA3AF"
        value={searchTerm}
        onChangeText={handleTextChange}
        style={{
          fontSize: 13, // Fuente más chica
          marginLeft: 8,
          color: '#222',
          flex: 1,
          paddingVertical: 0,
          height: 32,
        }}
      />
      {loading && (
        <ActivityIndicator size="small" color="#8C092C" style={{ marginLeft: 8 }} />
      )}
    </View>
  );
}
