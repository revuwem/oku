import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { END_OF_CHAPTER, FADE_PRESETS, useTimerStore } from "@/store/timer-store";
import { formatTime } from "@/utils/formatTime";
import * as Haptics from "expo-haptics";
import { MoonStar } from "lucide-react-native";
import { Pressable } from "react-native";

type Props = {
  onPress: () => void;
};

export function SleepTimer({ onPress }: Props) {
  const { selectedDuration, remainingSeconds, fadeDuration } = useTimerStore();
  const fadeLabel = FADE_PRESETS.find((p) => p.seconds === fadeDuration && p.seconds !== null)?.label;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable onPress={handlePress} className="w-full">
      <Box className="flex-row items-center gap-5 w-full bg-background-100 px-6 pt-4 pb-3 rounded-lg">
        <Box className="w-6 h-6">
          <MoonStar color={"rgb(220 186 143)"} />
        </Box>
        <Box>
          <Heading size="md">Sleep Timer</Heading>
          <Text className="text-typography-400" size="sm">
            Tap to edit
          </Text>
        </Box>
        <Box className="ml-auto items-end">
          {selectedDuration === null && (
            <Text size="lg" bold>
              Not set
            </Text>
          )}
          {selectedDuration === END_OF_CHAPTER && (
            <Text size="lg" bold className="text-primary-500">
              End of chp.
            </Text>
          )}
          {selectedDuration !== null && selectedDuration !== END_OF_CHAPTER && (
            <Text size="lg" bold className="text-primary-500">
              {formatTime(remainingSeconds)}
            </Text>
          )}
          {fadeLabel && (
            <Text className="text-typography-400" size="sm">
              {fadeLabel} to unwind
            </Text>
          )}
        </Box>
      </Box>
    </Pressable>
  );
}
