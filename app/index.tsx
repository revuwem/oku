import { Oku } from "@/components/icons/oku";
import { Player } from "@/components/player";
import { ScreenLayout } from "@/components/screen-layout";
import { Box } from "@/components/ui/box";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useLibraryStore } from "@/store/library-store";
import { usePlayerStore } from "@/store/player-store";
import { useRouter } from "expo-router";
import { Library, Settings } from "lucide-react-native";
import { useEffect } from "react";

export default function IndexScreen() {
  const router = useRouter();
  const { currentBook, resumeLastBook } = usePlayerStore();
  const { books, isLoading, loadBooks } = useLibraryStore();

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  useEffect(() => {
    if (!isLoading && books.length > 0 && !currentBook) {
      resumeLastBook(books);
    }
  }, [isLoading, books, currentBook, resumeLastBook]);

  if (!isLoading && books.length === 0 && !currentBook) {
    return (
      <ScreenLayout>
        <Box className="flex-1 items-center justify-center gap-6">
          <Box className="w-32 h-32">
            <Oku />
          </Box>
          <VStack space="sm" className="items-center">
            <Heading size="2xl" className="text-center w-96 tracking-tight">
              Your library is empty
            </Heading>
            <Text className="text-typography-200 text-center px-8">
              Every great library begins with a single book
            </Text>
          </VStack>
          <Button
            onPress={() => router.push("/import")}
            variant="solid"
            action="primary"
          >
            <ButtonText className="text-typography-0 font-serif font-semibold">
              Add book
            </ButtonText>
          </Button>
        </Box>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout>
      <Box className="flex-row justify-between">
        <Button
          onPress={() => router.push("/library")}
          action="secondary"
          variant="link"
          size="xl"
        >
          <ButtonIcon as={Library} />
        </Button>
        <Box className="w-48 overflow-hidden items-center">
          <Heading isTruncated>{currentBook?.title ?? "Unknown title"}</Heading>
          <Text>{currentBook?.author ?? "Unknown artist"}</Text>
        </Box>
        <Button
          onPress={() => router.push("/settings")}
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
