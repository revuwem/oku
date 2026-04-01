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
import { initDatabase } from "@/services/database";
import { LibraryProvider } from "@/store/library-store";
import "@/global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    NotoSerifJP: NotoSerifJP_400Regular,
    SourceSerif4: SourceSerif4_400Regular,
    "SourceSerif4-Italic": SourceSerif4_400Regular_Italic,
  });

  useEffect(() => {
    if (loaded) initDatabase().then(() => SplashScreen.hideAsync());
  }, [loaded]);

  if (!loaded) return null;

  return (
    <GluestackUIProvider mode="dark">
      <LibraryProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="import" options={{ presentation: "modal", headerShown: false }} />
      </Stack>
      </LibraryProvider>
    </GluestackUIProvider>
  );
}
