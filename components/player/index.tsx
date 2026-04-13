import { Cover } from "@/components/cover";
import { Box } from "@/components/ui/box";

import { Text } from "@/components/ui/text";

export function Player() {
  return (
    <Box className="items-center gap-3">
      <Cover coverPath={null} size="xl" />
      <Text highlight size="lg">
        Chapter 7
      </Text>
    </Box>
  );
}
