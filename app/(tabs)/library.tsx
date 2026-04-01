import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import React from "react";

import { ScreenLayout } from "@/components/screen-layout";
import { Box } from "@/components/ui/box";
import { CirclePlus } from "lucide-react-native";

export default function LibraryScreen() {
  return (
    <ScreenLayout>
      <Box className="flex flex-row justify-between">
        <ScreenLayout.Heading>Library</ScreenLayout.Heading>
        <Button action="primary" variant="solid" size="sm" className="mt-0.5">
          <ButtonText>Add</ButtonText>
          <ButtonIcon as={CirclePlus} />
        </Button>
      </Box>
    </ScreenLayout>
  );
}
