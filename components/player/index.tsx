import { Cover } from "@/components/cover";
import { Chapters } from "@/components/player/chapters";
import { Controls } from "@/components/player/controls";
import { SleepTimer } from "@/components/player/sleep-timer";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { usePlayerStore } from "@/store/player-store";
import { ScrollView } from "react-native-gesture-handler";

export function Player() {
  const { currentBook, activeTrackTitle } = usePlayerStore();

  return (
    <Box>
      <ScrollView
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        <Box className="items-center gap-6">
          <Cover coverPath={currentBook?.coverPath ?? null} size="xl" />

          <Box className="items-center gap-6 w-full">
            <Text highlight size="xl">
              {activeTrackTitle ?? ""}
            </Text>
            <Controls />
            <SleepTimer />
            <Chapters />
          </Box>
        </Box>
      </ScrollView>
    </Box>
  );
}
