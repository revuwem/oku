import { Player } from "@/components/player";
import { ScreenLayout } from "@/components/screen-layout";
import { Box } from "@/components/ui/box";
import { Button, ButtonIcon } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { useRouter } from "expo-router";
import { Library, Settings } from "lucide-react-native";

export default function IndexScreen() {
  const router = useRouter();

  return (
    <ScreenLayout>
      <Box className="flex-row justify-between">
        <Button
          onPress={() => router.navigate("/library")}
          action="secondary"
          variant="link"
          size="xl"
        >
          <ButtonIcon as={Library} />
        </Button>
        <Box className="w-48 overflow-hidden items-center">
          <Heading isTruncated>Project Hail Mary</Heading>
          <Text>Andy Weir</Text>
        </Box>
        <Button
          onPress={() => router.navigate("/settings")}
          action="secondary"
          variant="link"
          size="xl"
        >
          <ButtonIcon as={Settings} />
        </Button>
      </Box>

      <Box className="py-3">
        <Player />
      </Box>
    </ScreenLayout>
  );
}
