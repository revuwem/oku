import React, { createContext, useCallback, useContext, useState } from "react";
import * as FileSystem from "expo-file-system/legacy";

import { getAllBooks, deleteBook } from "@/services/database";
import type { BookRecord } from "@/types";

type LibraryStore = {
  books: BookRecord[];
  isLoading: boolean;
  loadBooks: () => Promise<void>;
  addBook: (book: BookRecord) => void;
  removeBook: (bookId: string) => Promise<void>;
};

const LibraryContext = createContext<LibraryStore | null>(null);

export function LibraryProvider({ children }: React.PropsWithChildren) {
  const [books, setBooks] = useState<BookRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadBooks = useCallback(async () => {
    setIsLoading(true);
    try {
      const loaded = await getAllBooks();
      setBooks(loaded);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addBook = useCallback((book: BookRecord) => {
    setBooks((prev) => [book, ...prev]);
  }, []);

  const removeBook = useCallback(async (bookId: string) => {
    await deleteBook(bookId);
    const bookDir = `${FileSystem.documentDirectory}books/${bookId}/`;
    await FileSystem.deleteAsync(bookDir, { idempotent: true });
    setBooks((prev) => prev.filter((b) => b.id !== bookId));
  }, []);

  return (
    <LibraryContext.Provider value={{ books, isLoading, loadBooks, addBook, removeBook }}>
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibraryStore(): LibraryStore {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error("useLibraryStore must be used within LibraryProvider");
  return ctx;
}
