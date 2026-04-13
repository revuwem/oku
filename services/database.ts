import * as SQLite from "expo-sqlite";

import type { BookRecord, ChapterRecord } from "@/types";

let db: SQLite.SQLiteDatabase;

function getDb(): SQLite.SQLiteDatabase {
  if (!db) db = SQLite.openDatabaseSync("oku.db");
  return db;
}

export async function initDatabase(): Promise<void> {
  const database = getDb();
  await database.execAsync("PRAGMA foreign_keys = ON;");
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      author TEXT,
      cover_path TEXT,
      imported_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS chapters (
      id TEXT PRIMARY KEY,
      book_id TEXT NOT NULL,
      idx INTEGER NOT NULL,
      title TEXT NOT NULL,
      file_path TEXT NOT NULL,
      FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS positions (
      book_id TEXT PRIMARY KEY,
      chapter_id TEXT NOT NULL,
      position_seconds REAL NOT NULL,
      FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
    );
  `);
}

export async function insertBook(book: BookRecord): Promise<void> {
  const database = getDb();
  await database.withTransactionAsync(async () => {
    await database.runAsync(
      "INSERT INTO books (id, title, author, cover_path, imported_at) VALUES (?, ?, ?, ?, ?);",
      [book.id, book.title, book.author, book.coverPath, book.importedAt]
    );
  });
}

export async function insertChapters(chapters: ChapterRecord[]): Promise<void> {
  const database = getDb();
  await database.withTransactionAsync(async () => {
    for (const chapter of chapters) {
      await database.runAsync(
        "INSERT INTO chapters (id, book_id, idx, title, file_path) VALUES (?, ?, ?, ?, ?);",
        [chapter.id, chapter.bookId, chapter.index, chapter.title, chapter.filePath]
      );
    }
  });
}

export async function insertBookWithChapters(
  book: BookRecord,
  chapters: ChapterRecord[]
): Promise<void> {
  const database = getDb();
  await database.withTransactionAsync(async () => {
    await database.runAsync(
      "INSERT INTO books (id, title, author, cover_path, imported_at) VALUES (?, ?, ?, ?, ?);",
      [book.id, book.title, book.author, book.coverPath, book.importedAt]
    );
    for (const chapter of chapters) {
      await database.runAsync(
        "INSERT INTO chapters (id, book_id, idx, title, file_path) VALUES (?, ?, ?, ?, ?);",
        [chapter.id, chapter.bookId, chapter.index, chapter.title, chapter.filePath]
      );
    }
  });
}

export async function getAllBooks(): Promise<BookRecord[]> {
  const database = getDb();
  const rows = await database.getAllAsync<{
    id: string;
    title: string;
    author: string | null;
    cover_path: string | null;
    imported_at: number;
  }>("SELECT * FROM books ORDER BY imported_at DESC;");

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    author: row.author,
    coverPath: row.cover_path,
    importedAt: row.imported_at,
  }));
}

export async function deleteBook(bookId: string): Promise<void> {
  const database = getDb();
  await database.runAsync("DELETE FROM books WHERE id = ?;", [bookId]);
}

export async function savePosition(
  bookId: string,
  chapterId: string,
  positionSeconds: number
): Promise<void> {
  const database = getDb();
  await database.runAsync(
    `INSERT INTO positions (book_id, chapter_id, position_seconds)
     VALUES (?, ?, ?)
     ON CONFLICT(book_id) DO UPDATE SET chapter_id = excluded.chapter_id, position_seconds = excluded.position_seconds;`,
    [bookId, chapterId, positionSeconds]
  );
}

export async function loadPosition(
  bookId: string
): Promise<{ chapterId: string; positionSeconds: number } | null> {
  const database = getDb();
  const row = await database.getFirstAsync<{
    chapter_id: string;
    position_seconds: number;
  }>("SELECT chapter_id, position_seconds FROM positions WHERE book_id = ?;", [
    bookId,
  ]);
  if (!row) return null;
  return { chapterId: row.chapter_id, positionSeconds: row.position_seconds };
}

export async function getChaptersByBook(bookId: string): Promise<ChapterRecord[]> {
  const database = getDb();
  const rows = await database.getAllAsync<{
    id: string;
    book_id: string;
    idx: number;
    title: string;
    file_path: string;
  }>("SELECT * FROM chapters WHERE book_id = ? ORDER BY idx ASC;", [bookId]);

  return rows.map((row) => ({
    id: row.id,
    bookId: row.book_id,
    index: row.idx,
    title: row.title,
    filePath: row.file_path,
  }));
}
