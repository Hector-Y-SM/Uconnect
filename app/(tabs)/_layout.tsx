import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { View, Text } from "react-native";
import '@/app/global.css'

export default function TabsLayout() {
  const TabBarIcon = ({
    title,
    iconName,
    focused,
  }: {
    title: string;
    iconName: any;
    focused: boolean;
  }) => {
    if (!focused) {
      return (
        <View className="flex flex-1 min-w-[112px] min-h-16 mt-4 justify-center items-center rounded-full overflow-hidden">
          <Ionicons name={iconName} size={20} color="#9ca3af" />
          <Text className="text-[#9ca3af]">{title}</Text>
        </View>
      );
    }

    return (
      <View className="flex flex-row min-w-[112px] justify-center items-center bg-[#1d1d1d] mt-4 min-h-16 rounded-full overflow-hidden">
        <Ionicons name={iconName} size={20} color="#ffffff" />
        <Text className="text-white">{title}</Text>
      </View>
    );
  };

  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarItemStyle: {
          width: "100%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        },
        tabBarStyle: {
          backgroundColor: "#121212",
          borderRadius: 50,
          marginHorizontal: 20,
          marginBottom: 36,
          height: 52,
          position: "absolute",
          overflow: "hidden",
          borderWidth: 1,
          borderColor: "#1d1d1d",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              title="feed"
              iconName="newspaper-outline"
              focused={focused}
            />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              title="Profile"
              iconName="person-outline"
              focused={focused}
            />
          ),
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
