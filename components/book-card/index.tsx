import { Cover } from "@/components/cover";
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
      <HStack
        space="md"
        className="bg-background-100 rounded-2xl p-4 items-center"
      >
        <Cover coverPath={book.coverPath} />
        <VStack space="xs" className="flex-1">
          <Text
            size="md"
            numberOfLines={2}
            className="text-typography-0 font-medium"
          >
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
