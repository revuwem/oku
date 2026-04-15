import { Box } from "@/components/ui/box";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import {
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
} from "@/components/ui/slider";
import { Text } from "@/components/ui/text";
import { usePlayerStore } from "@/store/player-store";
import { formatTime } from "@/utils/formatTime";
import { ChevronsLeft, ChevronsRight, Pause, Play } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";

export function Controls() {
  const { position, duration, isPlaying, play, pause, seekTo, seekBy } =
    usePlayerStore();

  const [dragging, setDragging] = useState(false);
  const [dragValue, setDragValue] = useState(0);
  const seekTarget = useRef<number | null>(null);

  // Clear seekTarget once the player position has caught up
  useEffect(() => {
    if (seekTarget.current !== null && Math.abs(position - seekTarget.current) < 1) {
      seekTarget.current = null;
    }
  }, [position]);

  const displayPosition = dragging
    ? dragValue
    : seekTarget.current !== null
      ? seekTarget.current
      : position;
  const maxValue = duration > 0 ? duration : 1;

  return (
    <Box className="w-screen px-6">
      <Box className="h-5">
        <Slider
          value={displayPosition}
          minValue={0}
          maxValue={maxValue}
          size="md"
          orientation="horizontal"
          onChange={(val) => {
            setDragging(true);
            setDragValue(val);
          }}
          onChangeEnd={(val) => {
            seekTarget.current = val;
            setDragging(false);
            seekTo(val);
          }}
        >
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb />
        </Slider>
      </Box>
      <Box className="flex-row justify-between -mt-2">
        <Text className="text-primary-800">{formatTime(displayPosition)}</Text>
        <Text>{formatTime(duration)}</Text>
      </Box>
      <Box className="flex-row justify-center items-center gap-4 mt-8">
        <Button
          className="w-24 h-24 rounded-full relative flex-col gap-1"
          variant="link"
          action="secondary"
          size="xl"
          onPress={() => seekBy(-30)}
        >
          <ButtonIcon as={ChevronsLeft} className="w-10 h-10" />
          <ButtonText className="text-sm">30s</ButtonText>
        </Button>
        <Button
          className="w-24 h-24 rounded-full"
          onPress={isPlaying ? pause : play}
        >
          <ButtonIcon as={isPlaying ? Pause : Play} className="w-10 h-10" />
        </Button>
        <Button
          className="w-24 h-24 rounded-full relative flex-col gap-1"
          variant="link"
          action="secondary"
          onPress={() => seekBy(30)}
        >
          <ButtonIcon as={ChevronsRight} className="w-10 h-10" />
          <ButtonText className="text-xs">30s</ButtonText>
        </Button>
      </Box>
    </Box>
  );
}
