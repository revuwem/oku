import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import * as Haptics from "expo-haptics";
import { MoonStar } from "lucide-react-native";
import { Pressable } from "react-native";

export function SleepTimer() {
  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
      className="w-full"
    >
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
        {/* <Box className="ml-auto items-end">
          <Text size="lg" bold className="text-primary-500">
            30:00
          </Text>
          <Text className="text-typography-400" size="sm">
            10 mins to unwind
          </Text>
        </Box> */}
        <Box className="ml-auto">
          <Text size="lg" bold>
            Not set
          </Text>
        </Box>
      </Box>
    </Pressable>
  );
}
