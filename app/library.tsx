import { useEffect, useCallback, useState, useRef } from "react";
import { Alert, FlatList } from "react-native";
import type { SwipeableMethods } from "react-native-gesture-handler/ReanimatedSwipeable";
import { router } from "expo-router";
import { CirclePlus, BookOpen } from "lucide-react-native";

import { Box } from "@/components/ui/box";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { ScreenLayout } from "@/components/screen-layout";
import { BookCard } from "@/components/book-card";
import { useLibraryStore } from "@/store/library-store";
import { usePlayerStore } from "@/store/player-store";
import type { BookRecord } from "@/types";

export default function LibraryScreen() {
  const { books, loadBooks, removeBook } = useLibraryStore();
  const { openBook, closeBook, currentBook } = usePlayerStore();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const openSwipeableRef = useRef<SwipeableMethods | null>(null);

  const handleSwipeOpen = useCallback((methods: SwipeableMethods) => {
    if (openSwipeableRef.current !== methods) {
      openSwipeableRef.current?.close();
    }
    openSwipeableRef.current = methods;
  }, []);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  const handleBookPress = useCallback(
    async (book: BookRecord) => {
      await openBook(book);
      router.back();
    },
    [openBook]
  );

  const handleDelete = useCallback(
    (book: BookRecord) => {
      setDeletingId(book.id);
      Alert.alert(
        "Remove Book",
        `Remove "${book.title}" from your library? This cannot be undone.`,
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => setDeletingId(null),
          },
          {
            text: "Remove",
            style: "destructive",
            onPress: async () => {
              try {
                if (currentBook?.id === book.id) {
                  await closeBook();
                }
                await removeBook(book.id);
              } finally {
                setDeletingId(null);
              }
            },
          },
        ]
      );
    },
    [currentBook, closeBook, removeBook]
  );

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
          renderItem={({ item }) => (
            <BookCard
              book={item}
              onPress={() => handleBookPress(item)}
              onDelete={() => handleDelete(item)}
              onSwipeOpen={handleSwipeOpen}
              isDeleting={deletingId === item.id}
            />
          )}
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
