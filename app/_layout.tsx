import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native";

export default function Layout() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#121212' }}>
      <StatusBar style="light" backgroundColor="#121212" />
      <Slot />
    </SafeAreaView>
  );
}
