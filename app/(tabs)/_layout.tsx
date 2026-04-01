import { Tabs } from "expo-router";
import { BookOpen, CirclePlay, House, Settings } from "lucide-react-native";

import { TabBar } from "@/components/tab-bar";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <TabBar {...props} />}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color }) => (
            <House size={22} strokeWidth={1.8} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          tabBarIcon: ({ color }) => (
            <BookOpen size={22} strokeWidth={1.8} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="now-playing"
        options={{
          tabBarIcon: ({ color }) => (
            <CirclePlay size={22} strokeWidth={1.8} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ color }) => (
            <Settings size={22} strokeWidth={1.8} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
