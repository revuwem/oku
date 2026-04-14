import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { usePlayerStore } from "@/store/player-store";
import { ScrollView } from "react-native";

export function Chapters() {
  const { chapters, activeChapterIndex, skipToChapter, position, duration } =
    usePlayerStore();
  const progress = duration > 0 ? Math.min(position / duration, 1) : 0;

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {chapters.map((chapter, i) => {
        const isActive = i === activeChapterIndex;
        return (
          <Pressable
            key={chapter.id}
            onPress={() => skipToChapter(chapter.index)}
          >
            <HStack
              space="md"
              className={`py-4 px-6 items-center border-b border-background-100`}
            >
              <Text
                size="sm"
                className={`w-6 text-center ${isActive ? "text-primary-500" : "text-typography-400"}`}
              >
                {i + 1}
              </Text>
              <Box className="flex-1">
                <Text
                  className={`font-medium ${isActive ? "text-primary-500" : "text-typography-0"}`}
                >
                  {chapter.title}
                </Text>
                {isActive && (
                  <Box className="h-1 bg-background-300 mt-2 rounded-full overflow-hidden">
                    <Box
                      className="h-full bg-primary-500 rounded-full"
                      style={{ width: `${progress * 100}%`, minWidth: 2 }}
                    />
                  </Box>
                )}
              </Box>
            </HStack>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
