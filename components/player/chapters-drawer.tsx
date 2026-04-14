import { Chapters } from "@/components/player/chapters";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { usePlayerStore } from "@/store/player-store";
import { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, useWindowDimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const CLOSE_THRESHOLD = 80;

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function ChaptersDrawer({ isOpen, onClose }: Props) {
  const { height } = useWindowDimensions();
  const drawerHeight = height * 0.65;
  const { currentBook } = usePlayerStore();
  const translateY = useSharedValue(drawerHeight);
  const [isVisible, setIsVisible] = useState(false);

  const springConfig = { damping: 50, stiffness: 300, overshootClamping: true };

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      translateY.value = withSpring(0, springConfig);
    } else {
      translateY.value = withSpring(
        drawerHeight,
        springConfig,
        () => runOnJS(setIsVisible)(false)
      );
    }
  }, [isOpen, translateY]);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY > 0) {
        translateY.value = e.translationY;
      }
    })
    .onEnd((e) => {
      if (e.translationY > CLOSE_THRESHOLD || e.velocityY > 800) {
        translateY.value = withSpring(drawerHeight, springConfig);
        runOnJS(onClose)();
      } else {
        translateY.value = withSpring(0, springConfig);
      }
    });

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View style={[StyleSheet.absoluteFillObject, styles.overlay]}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
        <Animated.View style={[styles.drawer, { height: drawerHeight }, drawerStyle]}>
          <GestureDetector gesture={panGesture}>
            <Animated.View style={styles.handle}>
              <Animated.View style={styles.handleBar} />
            </Animated.View>
          </GestureDetector>

          <Heading size="2xl" bold className="px-6 pt-2 pb-1">
            Chapters
          </Heading>
          {currentBook && (
            <Text size="sm" className="text-typography-200 px-6 pb-3">
              {currentBook.title}
            </Text>
          )}

          <Chapters />
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    justifyContent: "flex-end",
    zIndex: 100,
  },
  drawer: {
    backgroundColor: "#1A1714",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handle: {
    alignItems: "center",
    paddingVertical: 12,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#4A4540",
  },
});
