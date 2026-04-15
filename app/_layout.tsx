import { NotoSerifJP_400Regular } from "@expo-google-fonts/noto-serif-jp";
import {
  SourceSerif4_400Regular,
  SourceSerif4_400Regular_Italic,
} from "@expo-google-fonts/source-serif-4";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import TrackPlayer from "react-native-track-player";

import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";
import { setupPlayer } from "@/services/audio-player";
import { initDatabase } from "@/services/database";
import { LibraryProvider } from "@/store/library-store";
import { PlayerProvider } from "@/store/player-store";
import { TimerProvider } from "@/store/timer-store";
import { PlaybackService } from "@/service";
import { GestureHandlerRootView } from "react-native-gesture-handler";

TrackPlayer.registerPlaybackService(() => PlaybackService);

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    NotoSerifJP: NotoSerifJP_400Regular,
    SourceSerif4: SourceSerif4_400Regular,
    "SourceSerif4-Italic": SourceSerif4_400Regular_Italic,
  });

  useEffect(() => {
    if (loaded) {
      Promise.all([initDatabase(), setupPlayer()]).then(() =>
        SplashScreen.hideAsync()
      );
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <GluestackUIProvider mode="dark">
      <LibraryProvider>
        <PlayerProvider>
          <TimerProvider>
            <GestureHandlerRootView>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="import" options={{ presentation: "modal" }} />
              </Stack>
            </GestureHandlerRootView>
          </TimerProvider>
        </PlayerProvider>
      </LibraryProvider>
    </GluestackUIProvider>
  );
}
