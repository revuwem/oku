import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import {
  FADE_PRESETS,
  TIMER_PRESETS,
  useTimerStore,
} from "@/store/timer-store";
import { Check } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
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

export function SleepTimerDrawer({ isOpen, onClose }: Props) {
  const { height } = useWindowDimensions();
  const {
    selectedDuration,
    fadeDuration,
    setDuration,
    setFadeDuration,
    cancelTimer,
  } = useTimerStore();
  const drawerHeight = height * 0.6;
  const translateY = useSharedValue(drawerHeight);
  const [isVisible, setIsVisible] = useState(false);

  const springConfig = { damping: 50, stiffness: 300, overshootClamping: true };

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      translateY.value = withSpring(0, springConfig);
    } else {
      translateY.value = withSpring(drawerHeight, springConfig, () =>
        runOnJS(setIsVisible)(false),
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
        <Animated.View
          style={[styles.drawer, { height: drawerHeight }, drawerStyle]}
        >
          <GestureDetector gesture={panGesture}>
            <Animated.View style={styles.handle}>
              <Animated.View style={styles.handleBar} />
            </Animated.View>
          </GestureDetector>

          <Heading size="2xl" bold className="px-6 pt-2 pb-4 mb-2">
            Sleep Timer
          </Heading>

          <ScrollView>
            <Box className="mb-6">
              <Heading className="px-6 pt-2 pb-2">Duration</Heading>
              {TIMER_PRESETS.map((preset) => {
                const isSelected = selectedDuration === preset.seconds;
                return (
                  <Pressable
                    key={String(preset.seconds)}
                    onPress={() => {
                      setDuration(preset.seconds);
                    }}
                    style={styles.option}
                  >
                    <Text
                      size="lg"
                      highlight={isSelected}
                      className={
                        isSelected ? "text-primary-500" : "text-typography-300"
                      }
                    >
                      {preset.label}
                    </Text>
                    {isSelected && (
                      <Check
                        size={18}
                        color="rgb(220 186 143)"
                        strokeWidth={2}
                      />
                    )}
                  </Pressable>
                );
              })}
            </Box>

            <Box className="mb-4">
              <Heading className="px-6 pt-2 pb-2">Unwind</Heading>
              {FADE_PRESETS.map((preset) => {
                const isSelected = fadeDuration === preset.seconds;
                return (
                  <Pressable
                    key={String(preset.seconds)}
                    onPress={() => setFadeDuration(preset.seconds)}
                    style={styles.option}
                  >
                    <Text
                      size="lg"
                      highlight={isSelected}
                      className={
                        isSelected ? "text-primary-500" : "text-typography-300"
                      }
                    >
                      {preset.label}
                    </Text>
                    {isSelected && (
                      <Check
                        size={18}
                        color="rgb(220 186 143)"
                        strokeWidth={2}
                      />
                    )}
                  </Pressable>
                );
              })}
            </Box>

            <Box className="mb-12">
              <Button
                onPress={() => {
                  cancelTimer();
                  onClose();
                }}
                action="negative"
                variant="link"
                disabled={!selectedDuration}
              >
                <ButtonText
                  className={
                    !selectedDuration
                      ? "text-error-800/40 data-[active=true]:text-error-700"
                      : ""
                  }
                >
                  Cancel timer
                </ButtonText>
              </Button>
            </Box>
          </ScrollView>
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
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
});
