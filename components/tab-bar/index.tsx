import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import { Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Box } from "@/components/ui/box";

const ICON_COLOR_ACTIVE = "rgb(212 165 116)";
const ICON_COLOR_INACTIVE = "rgb(138 128 118)";

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <Box
      className="bg-background-100 border-t border-outline-100 flex-row"
      style={{ paddingBottom: insets.bottom }}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const color = isFocused ? ICON_COLOR_ACTIVE : ICON_COLOR_INACTIVE;

        const onPress = () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={onPress}
            onLongPress={onLongPress}
            style={{ flex: 1 }}
          >
            <Box className="items-center py-4">
              {options.tabBarIcon?.({ focused: isFocused, color, size: 22 })}
            </Box>
          </Pressable>
        );
      })}
    </Box>
  );
}
