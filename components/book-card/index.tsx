import { Image } from "expo-image";
import { BookOpen } from "lucide-react-native";

import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import type { BookRecord } from "@/types";

type BookCardProps = {
  book: BookRecord;
  onPress: () => void;
};

export function BookCard({ book, onPress }: BookCardProps) {
  return (
    <Pressable onPress={onPress}>
      <HStack space="md" className="bg-background-100 rounded-2xl p-4 items-center">
        <CoverArt coverPath={book.coverPath} />
        <VStack space="xs" className="flex-1">
          <Text size="md" numberOfLines={2} className="text-typography-0 font-medium">
            {book.title}
          </Text>
          {book.author !== null && (
            <Text size="sm" className="text-typography-500">
              {book.author}
            </Text>
          )}
        </VStack>
      </HStack>
    </Pressable>
  );
}

function CoverArt({ coverPath }: { coverPath: string | null }) {
  if (coverPath) {
    return (
      <Image
        source={{ uri: coverPath }}
        style={{ width: 80, height: 80, borderRadius: 10 }}
        contentFit="cover"
      />
    );
  }

  return (
    <Box className="w-20 h-20 rounded-cover-sm bg-background-200 items-center justify-center">
      <BookOpen size={28} strokeWidth={1.8} color="rgb(138 128 118)" />
    </Box>
  );
}
