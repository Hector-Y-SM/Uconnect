import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { View } from "react-native";
import React from "react";

export default function TabsLayout() {
  const TabBarIcon = ({
    iconName,
    focused,
  }: {
    iconName: any;
    focused: boolean;
  }) => {
    if (focused) {
      return (
        <View style={{
          backgroundColor: '#8C092C',
          borderRadius: 24,
          padding: 8,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Ionicons name={iconName} size={22} color="#fff" />
        </View>
      );
    }
    return (
      <Ionicons name={iconName} size={22} color="#9ca3af" />
    );
  };

  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "#fff",
          borderRadius: 0,
          marginHorizontal: 0,
          marginBottom: 0,
          height: 56,
          position: "absolute",
          borderWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              iconName="newspaper" // Cambiado a newspaper (icono de periódico)
              focused={focused}
            />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="profileScreen"
        options={{
          title: "Perfil",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
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
