import { useEffect, useRef } from "react";
import ReanimatedSwipeable, {
  type SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";
import Reanimated, { useAnimatedStyle } from "react-native-reanimated";
import type { SharedValue } from "react-native-reanimated";
import { Trash2 } from "lucide-react-native";

import { Cover } from "@/components/cover";
import { HStack } from "@/components/ui/hstack";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import type { BookRecord } from "@/types";

const DELETE_WIDTH = 72;

type BookCardProps = {
  book: BookRecord;
  onPress: () => void;
  onDelete: () => void;
  onSwipeOpen?: (methods: SwipeableMethods) => void;
  isDeleting?: boolean;
};

function DeleteAction({
  dragX,
  onDelete,
  isDeleting,
}: {
  dragX: SharedValue<number>;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: dragX.value + DELETE_WIDTH }],
  }));

  return (
    <Reanimated.View style={[{ width: DELETE_WIDTH }, animStyle]}>
      <Pressable
        onPress={onDelete}
        disabled={isDeleting}
        className="flex-1 ml-2 bg-error-500 rounded-2xl items-center justify-center"
      >
        <Trash2 size={20} strokeWidth={1.8} color="white" />
      </Pressable>
    </Reanimated.View>
  );
}

export function BookCard({ book, onPress, onDelete, onSwipeOpen, isDeleting = false }: BookCardProps) {
  const swipeableRef = useRef<SwipeableMethods>(null);
  const prevIsDeleting = useRef(false);

  useEffect(() => {
    if (prevIsDeleting.current && !isDeleting) {
      swipeableRef.current?.close();
    }
    prevIsDeleting.current = isDeleting;
  }, [isDeleting]);

  return (
    <ReanimatedSwipeable
      ref={swipeableRef}
      friction={2}
      rightThreshold={DELETE_WIDTH / 2}
      onSwipeableWillOpen={() => onSwipeOpen?.(swipeableRef.current!)}
      renderRightActions={(_prog, dragX) => (
        <DeleteAction dragX={dragX} onDelete={onDelete} isDeleting={isDeleting} />
      )}
      enabled={!isDeleting}
    >
      <Pressable onPress={onPress} disabled={isDeleting}>
        <HStack
          space="md"
          className={`bg-background-200 rounded-2xl p-4 items-center${isDeleting ? " opacity-40" : ""}`}
        >
          <Cover coverPath={book.coverPath} size="md" />
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
    </ReanimatedSwipeable>
  );
}
