import { Cover } from "@/components/cover";
import { ChaptersDrawer } from "@/components/player/chapters-drawer";
import { Controls } from "@/components/player/controls";
import { SleepTimer } from "@/components/player/sleep-timer";
import { SleepTimerDrawer } from "@/components/player/sleep-timer-drawer";
import { Box } from "@/components/ui/box";
import { Button, ButtonIcon } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { usePlayerStore } from "@/store/player-store";
import { AlignJustify } from "lucide-react-native";
import { useState } from "react";

export function Player() {
  const { currentBook, activeTrackTitle } = usePlayerStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [timerDrawerOpen, setTimerDrawerOpen] = useState(false);

  return (
    <>
      <Box className="items-center gap-6">
        <Cover coverPath={currentBook?.coverPath ?? null} size="xl" />

        <Box className="items-center gap-4 w-full">
          <Text highlight size="xl">
            {activeTrackTitle ?? ""}
          </Text>
          <Controls />
          <Box className="w-full items-end px-6">
            <Button
              variant="link"
              action="secondary"
              onPress={() => setDrawerOpen(true)}
            >
              <ButtonIcon as={AlignJustify} />
            </Button>
          </Box>
          <SleepTimer onPress={() => setTimerDrawerOpen(true)} />
        </Box>
      </Box>

      <ChaptersDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
      <SleepTimerDrawer
        isOpen={timerDrawerOpen}
        onClose={() => setTimerDrawerOpen(false)}
      />
    </>
  );
}
