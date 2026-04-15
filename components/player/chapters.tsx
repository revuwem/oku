import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Pressable } from "@/components/ui/pressable";
import { VStack } from "@/components/ui/vstack";
import { usePlayerStore } from "@/store/player-store";
import { ScrollView } from "react-native";

export function Chapters() {
  const { chapters, activeChapterIndex, skipToChapter, position, duration } =
    usePlayerStore();
  const progress = duration > 0 ? Math.min(position / duration, 1) : 0;

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <VStack space="md">
        {chapters.map((chapter, i) => {
          const isActive = i === activeChapterIndex;
          return (
            <Pressable
              key={chapter.id}
              onPress={() => skipToChapter(chapter.index)}
            >
              <HStack
                className={`p-4 pl-5 mx-3 rounded-md items-center gap-3 ${isActive ? "bg-background-100" : ""}`}
              >
                <Box className="flex-1">
                  <Heading
                    size="sm"
                    className={
                      isActive ? "text-primary-500" : "text-typography-0"
                    }
                  >
                    {chapter.title}
                  </Heading>
                  {isActive && (
                    <Box className="h-1.5 bg-background-300 mt-3 rounded-full overflow-hidden">
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
      </VStack>
    </ScrollView>
  );
}
