import * as Crypto from "expo-crypto";
import * as FileSystem from "expo-file-system/legacy";
import { unzip, subscribe as subscribeToZipProgress } from "react-native-zip-archive";
import { parseBuffer } from "music-metadata";
import naturalCompare from "natural-compare";
import { insertBookWithChapters } from "@/services/database";
import type {
  BookRecord,
  ChapterRecord,
  ImportError,
  ImportProgress,
} from "@/types";

// ─── Types ───────────────────────────────────────────────────────────────────

type RawMetadata = {
  title: string | undefined;
  author: string | undefined;
  coverData: Uint8Array | null;
  coverMime: string | null;
};

type ResolvedMetadata = {
  title: string;
  author: string | null;
  coverData: Uint8Array | null;
  coverMime: string | null;
};

export type ProgressCallback = (progress: ImportProgress) => void;

// ─── Public orchestrator ─────────────────────────────────────────────────────

export async function importAudiobook(
  sourceUri: string,
  zipFilename: string,
  onProgress: ProgressCallback
): Promise<BookRecord> {
  const bookId = Crypto.randomUUID();
  const tempPaths: string[] = [];
  let bookDirCreated = false;

  try {
    onProgress({ stage: "copying" });
    const cachedZip = await copyToCache(sourceUri);
    tempPaths.push(cachedZip);

    const extractDir = `${FileSystem.cacheDirectory}extract-${Date.now()}/`;
    tempPaths.push(extractDir);
    await extractArchive(cachedZip, extractDir, onProgress);

    onProgress({ stage: "processing" });
    const mp3Files = await scanAndValidate(extractDir);
    const sorted = await sortFiles(mp3Files);
    const raw = await readRawMetadata(sorted);
    const resolved = resolveMetadata(raw, zipFilename);

    const { bookDir, coverPath } = await persistFiles(
      sorted,
      bookId,
      resolved.coverData,
      resolved.coverMime
    );
    bookDirCreated = true;

    const book = buildBookRecord(bookId, resolved, coverPath);
    const chapters = buildChapterRecords(bookId, sorted, bookDir);
    await insertBookWithChapters(book, chapters);

    return book;
  } catch (err) {
    if (bookDirCreated) {
      await cleanup([`${FileSystem.documentDirectory}books/${bookId}/`]);
    }
    if (isImportError(err)) throw err;
    throw {
      code: "extractionFailed",
      message: "Something went wrong while importing the audiobook.",
    } satisfies ImportError;
  } finally {
    await cleanup(tempPaths);
  }
}

// ─── Stage 1: Copy to cache ──────────────────────────────────────────────────

async function copyToCache(sourceUri: string): Promise<string> {
  const cachedZipPath = `${FileSystem.cacheDirectory}import-${Date.now()}.zip`;
  await FileSystem.copyAsync({ from: sourceUri, to: cachedZipPath });
  return cachedZipPath;
}

// ─── Stage 2: Extract archive ────────────────────────────────────────────────

async function extractArchive(
  cachedZipPath: string,
  extractDir: string,
  onProgress: ProgressCallback
): Promise<void> {
  const progressSubscription = subscribeToZipProgress(({ progress }) => {
    onProgress({ stage: "extracting", extractionProgress: progress });
  });

  try {
    await unzip(cachedZipPath, extractDir);
  } catch (err) {
    const message = err instanceof Error ? err.message.toLowerCase() : "";
    if (message.includes("password") || message.includes("encrypt")) {
      throw {
        code: "passwordProtected",
        message: "This archive is password-protected and can't be imported.",
      } satisfies ImportError;
    }
    throw {
      code: "extractionFailed",
      message: "This archive couldn't be opened. The file may be corrupted.",
    } satisfies ImportError;
  } finally {
    progressSubscription.remove();
  }
}

// ─── Stage 3: Scan & validate ────────────────────────────────────────────────

async function scanAndValidate(extractDir: string): Promise<string[]> {
  const allFiles = await walkDirectory(extractDir);
  const mp3Files: string[] = [];

  for (const filePath of allFiles) {
    const filename = basename(filePath);
    if (isJunkFile(filePath)) continue;
    if (filename.toLowerCase().endsWith(".mp3")) {
      mp3Files.push(filePath);
    } else {
      throw {
        code: "unsupportedFormat",
        message: `This archive contains unsupported files (${filename}). Only MP3 files are supported.`,
        offendingFile: filename,
      } satisfies ImportError;
    }
  }

  if (mp3Files.length === 0) {
    throw {
      code: "noAudioFiles",
      message: "No MP3 files were found in this archive.",
    } satisfies ImportError;
  }

  return mp3Files;
}

async function walkDirectory(dir: string): Promise<string[]> {
  const entries = await FileSystem.readDirectoryAsync(dir);
  const results: string[] = [];

  for (const entry of entries) {
    const fullPath = `${dir}${entry}`;
    const info = await FileSystem.getInfoAsync(fullPath);
    if (info.isDirectory) {
      const nested = await walkDirectory(`${fullPath}/`);
      results.push(...nested);
    } else {
      results.push(fullPath);
    }
  }

  return results;
}

function isJunkFile(filePath: string): boolean {
  const filename = basename(filePath).toLowerCase();
  return (
    filename.startsWith(".") ||
    filename === "thumbs.db" ||
    filename === "desktop.ini" ||
    filePath.includes("__MACOSX")
  );
}

// ─── Stage 4: Sort files ─────────────────────────────────────────────────────

async function sortFiles(files: string[]): Promise<string[]> {
  return [...files].sort((a, b) =>
    naturalCompare(
      basename(a).toLowerCase(),
      basename(b).toLowerCase()
    )
  );
}

// ─── Stage 5: Read raw metadata ───────────────────────────────────────────────

// ID3 tags live at the start of the file. Reading 1 MB is enough for any
// embedded cover art; we never need to load the full audio stream.
const ID3_READ_LIMIT = 1024 * 1024;

async function readRawMetadata(sortedFiles: string[]): Promise<RawMetadata> {
  // Read title/author from the first file only (album tag = book title).
  // For cover art, scan up to 5 files in case the first has no embedded art.
  // Each read is capped at 1 MB so large chapters don't slow things down.
  let bookTitle: string | undefined;
  let author: string | undefined;
  let coverData: Uint8Array | null = null;
  let coverMime: string | null = null;

  const limit = Math.min(sortedFiles.length, 5);

  for (let i = 0; i < limit; i++) {
    try {
      const bytes = await readFileHeader(sortedFiles[i]);
      const metadata = await parseBuffer(bytes, { mimeType: "audio/mpeg" });

      if (i === 0) {
        bookTitle = metadata.common.album ?? metadata.common.title;
        author = metadata.common.artist ?? metadata.common.albumartist;
      }

      if (!coverData) {
        const picture = metadata.common.picture?.[0] ?? null;
        if (picture) {
          coverData = picture.data;
          coverMime = picture.format;
        }
      }

      if (coverData) break;
    } catch {
      // Skip unreadable files — don't abort the whole import.
    }
  }

  return { title: bookTitle, author, coverData, coverMime };
}

async function readFileHeader(filePath: string): Promise<Uint8Array> {
  const base64 = await FileSystem.readAsStringAsync(filePath, {
    encoding: FileSystem.EncodingType.Base64,
    position: 0,
    length: ID3_READ_LIMIT,
  });
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// ─── Stage 6: Resolve metadata ───────────────────────────────────────────────

function resolveMetadata(raw: RawMetadata, zipFilename: string): ResolvedMetadata {
  return {
    title: raw.title ?? zipFilename.replace(/\.zip$/i, ""),
    author: raw.author ?? null,
    coverData: raw.coverData,
    coverMime: raw.coverMime,
  };
}

// ─── Stage 7: Persist files ──────────────────────────────────────────────────

async function persistFiles(
  sortedFiles: string[],
  bookId: string,
  coverData: Uint8Array | null,
  coverMime: string | null
): Promise<{ bookDir: string; coverPath: string | null }> {
  const bookDir = `${FileSystem.documentDirectory}books/${bookId}/`;

  try {
    await FileSystem.makeDirectoryAsync(bookDir, { intermediates: true });

    for (const src of sortedFiles) {
      const dest = `${bookDir}${basename(src)}`;
      await FileSystem.moveAsync({ from: src, to: dest });
    }

    const coverPath = coverData
      ? await writeCover(bookDir, coverData, coverMime)
      : null;

    return { bookDir, coverPath };
  } catch (err) {
    const message = err instanceof Error ? err.message.toLowerCase() : "";
    if (message.includes("nospace") || message.includes("no space")) {
      throw {
        code: "diskFull",
        message: "Not enough storage space to import this book.",
      } satisfies ImportError;
    }
    throw err;
  }
}

async function writeCover(
  bookDir: string,
  coverData: Uint8Array,
  mime: string | null
): Promise<string> {
  const ext = mime?.includes("png") ? "png" : "jpg";
  const coverPath = `${bookDir}cover.${ext}`;
  const base64 = uint8ArrayToBase64(coverData);
  await FileSystem.writeAsStringAsync(coverPath, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return coverPath;
}

// ─── Stage 8: Build records ──────────────────────────────────────────────────

function buildBookRecord(
  bookId: string,
  resolved: ResolvedMetadata,
  coverPath: string | null
): BookRecord {
  return {
    id: bookId,
    title: resolved.title,
    author: resolved.author,
    coverPath,
    importedAt: Date.now(),
  };
}

function buildChapterRecords(
  bookId: string,
  sortedFiles: string[],
  bookDir: string
): ChapterRecord[] {
  return sortedFiles.map((filePath, index) => ({
    id: Crypto.randomUUID(),
    bookId,
    index,
    title: basenameWithoutExt(filePath),
    filePath: `${bookDir}${basename(filePath)}`,
  }));
}

// ─── Stage 9: Cleanup ────────────────────────────────────────────────────────

async function cleanup(paths: string[]): Promise<void> {
  await Promise.allSettled(
    paths.map((p) => FileSystem.deleteAsync(p, { idempotent: true }))
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function basename(filePath: string): string {
  return filePath.split("/").pop() ?? filePath;
}

function basenameWithoutExt(filePath: string): string {
  const name = basename(filePath);
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(0, dot) : name;
}

function uint8ArrayToBase64(data: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < data.length; i++) {
    binary += String.fromCharCode(data[i]);
  }
  return btoa(binary);
}

function isImportError(err: unknown): err is ImportError {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    "message" in err
  );
}
