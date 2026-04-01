import { useEffect } from "react";
import { FlatList } from "react-native";
import { router } from "expo-router";
import { CirclePlus, BookOpen } from "lucide-react-native";

import { Box } from "@/components/ui/box";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { ScreenLayout } from "@/components/screen-layout";
import { BookCard } from "@/components/book-card";
import { useLibraryStore } from "@/store/library-store";
import type { BookRecord } from "@/types";

export default function LibraryScreen() {
  const { books, loadBooks } = useLibraryStore();

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  return (
    <ScreenLayout>
      <Box className="flex-row justify-between items-center mb-6">
        <ScreenLayout.Heading>Library</ScreenLayout.Heading>
        <Button
          action="primary"
          variant="solid"
          size="sm"
          onPress={() => router.push("/import")}
        >
          <ButtonText>Add</ButtonText>
          <ButtonIcon as={CirclePlus} />
        </Button>
      </Box>

      {books.length === 0 ? (
        <EmptyLibrary />
      ) : (
        <FlatList
          data={books}
          keyExtractor={(item: BookRecord) => item.id}
          renderItem={({ item }) => <BookCard book={item} onPress={() => {}} />}
          contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ScreenLayout>
  );
}

function EmptyLibrary() {
  return (
    <Box className="flex-1 items-center justify-center gap-3">
      <BookOpen size={48} strokeWidth={1.2} color="rgb(138 128 118)" />
      <Text size="md" className="text-typography-0">
        No books yet
      </Text>
      <Text size="sm" className="text-typography-500 text-center">
        Tap Add to import your first audiobook
      </Text>
    </Box>
  );
}
