import { useEffect } from "react";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";

import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SourceSerif4: require("../assets/fonts/SourceSerif4-Regular.ttf"),
    "SourceSerif4-Italic": require("../assets/fonts/SourceSerif4-Italic.ttf"),
    NotoSerifJP: require("../assets/fonts/NotoSerifJP-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <GluestackUIProvider mode="dark">
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </GluestackUIProvider>
  );
}
