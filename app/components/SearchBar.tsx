import Ionicons from "@expo/vector-icons/Ionicons";
import { TextInput, View } from "react-native";
import '@/app/global.css'

interface Props {
  placeHolder: string;
  value?: string;
  onChangeText?: (text: string) => void;
}

export default function SearchBar({ placeHolder, value, onChangeText }: Props) {
  return (
    <View className="flex-row items-center bg-gray-100 rounded-full px-5 py-2 shadow-sm shadow-gray-300">
      <Ionicons name="search-outline" size={18} color="#6B7280" />
      <TextInput
        placeholder={placeHolder}
        placeholderTextColor="#9CA3AF"
        value={value}
        onChangeText={onChangeText}
        style={{ fontSize: 16 }}
        className="flex-1 ml-2 text-gray-800"
      />
    </View>
  );
}
