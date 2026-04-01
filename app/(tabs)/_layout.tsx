import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="now-playing" options={{ title: "Now Playing" }} />
      <Tabs.Screen name="import" options={{ title: "Add book" }} />
    </Tabs>
  );
}
