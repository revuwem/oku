import { Button, ButtonText } from "@/components/ui/button";
import React from "react";

import { ScreenLayout } from "@/components/screen-layout";
import { Text } from "@/components/ui/text";

export default function NowPlayingScreen() {
  return (
    <ScreenLayout>
      <Text>Add book</Text>
      <Button action="primary" variant="solid" size="sm">
        <ButtonText>Hello World</ButtonText>
      </Button>
    </ScreenLayout>
  );
}
