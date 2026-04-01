import { useEffect } from "react";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import {
  NotoSerifJP_400Regular,
} from "@expo-google-fonts/noto-serif-jp";
import {
  SourceSerif4_400Regular,
  SourceSerif4_400Regular_Italic,
} from "@expo-google-fonts/source-serif-4";
import * as SplashScreen from "expo-splash-screen";

import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    NotoSerifJP: NotoSerifJP_400Regular,
    SourceSerif4: SourceSerif4_400Regular,
    "SourceSerif4-Italic": SourceSerif4_400Regular_Italic,
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
