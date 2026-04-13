import { Box } from "@/components/ui/box";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import {
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
} from "@/components/ui/slider";

import { Text } from "@/components/ui/text";
import { ChevronsLeft, ChevronsRight, Play } from "lucide-react-native";

export function Controls() {
  return (
    <Box className="w-screen px-6">
      <Box className="h-5">
        <Slider
          defaultValue={30}
          size="md"
          orientation="horizontal"
          isDisabled={false}
          isReversed={false}
        >
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb />
        </Slider>
      </Box>
      <Box className="flex-row justify-between -mt-2">
        <Text className="text-primary-800">13:37</Text>
        <Text>41:14</Text>
      </Box>
      <Box className="flex-row justify-center items-center gap-4 my-8">
        <Button
          className="w-24 h-24 rounded-full relative flex-col gap-1"
          variant="link"
          action="secondary"
          size="xl"
        >
          <ButtonIcon as={ChevronsLeft} className="w-10 h-10" />
          <ButtonText className="text-sm">30s</ButtonText>
        </Button>
        <Button className="w-24 h-24 rounded-full">
          <ButtonIcon as={Play} className="w-10 h-10" />
        </Button>
        <Button
          className="w-24 h-24 rounded-full relative flex-col gap-1"
          variant="link"
          action="secondary"
        >
          <ButtonIcon as={ChevronsRight} className="w-10 h-10" />
          <ButtonText className="text-xs">30s</ButtonText>
        </Button>
      </Box>
    </Box>
  );
}
