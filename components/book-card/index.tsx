import { useEffect, useRef } from "react";
import ReanimatedSwipeable, {
  type SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Reanimated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
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
  const isSwipeOpen = useRef(false);
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (prevIsDeleting.current && !isDeleting) {
      swipeableRef.current?.close();
    }
    prevIsDeleting.current = isDeleting;
  }, [isDeleting]);

  const tapGesture = Gesture.Tap()
    .runOnJS(true)
    .enabled(!isDeleting)
    .onBegin(() => {
      opacity.value = withTiming(0.7, { duration: 80 });
    })
    .onFinalize((_e, success) => {
      opacity.value = withTiming(1, { duration: 150 });
      if (!success) return;
      if (isSwipeOpen.current) {
        swipeableRef.current?.close();
      } else {
        onPress();
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: isDeleting ? 0.4 : opacity.value,
  }));

  return (
    <ReanimatedSwipeable
      ref={swipeableRef}
      friction={2}
      rightThreshold={DELETE_WIDTH / 2}
      onSwipeableWillOpen={() => onSwipeOpen?.(swipeableRef.current!)}
      onSwipeableOpen={() => { isSwipeOpen.current = true; }}
      onSwipeableClose={() => { isSwipeOpen.current = false; }}
      renderRightActions={(_prog, dragX) => (
        <DeleteAction dragX={dragX} onDelete={onDelete} isDeleting={isDeleting} />
      )}
      enabled={!isDeleting}
    >
      <GestureDetector gesture={tapGesture}>
        <Reanimated.View style={animatedStyle}>
          <HStack
            space="md"
            className="bg-background-200 rounded-2xl p-4 items-center"
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
        </Reanimated.View>
      </GestureDetector>
    </ReanimatedSwipeable>
  );
}
