# ADR: Audiobook ZIP Import & Parsing

**Status:** Accepted  
**Platform:** React Native (iOS & Android)  
**Scope:** File import only — playback architecture is a separate concern

---

## Context

The app needs to import audiobooks from the device filesystem. Books are distributed as ZIP archives containing MP3 files, one file per chapter. The import must work on both iOS and Android via the native Files app, with no network calls and no manual metadata editing.

---

## Decisions

### 1. Supported Format: MP3 Only

Only `.mp3` files are supported. No M4A, M4B, AAC, FLAC, or any other format.

**Rationale:** MP3 is the dominant format for personal audiobook collections and the format recommended by ACX (Amazon's audiobook production platform). Supporting additional formats adds native bridge complexity (particularly M4B chapter markers, which require separate implementations via `AVAsset` on iOS and `MP4Parser` on Android) with negligible real-world benefit for the target use case.

### 2. Archive Format: ZIP Only

Only `.zip` archives are supported. RAR is explicitly out of scope for v1.

**Rationale:** There is no well-maintained React Native library for RAR extraction. Bundling a native `unrar` binary adds significant app size and complicates App Store review. ZIP covers the vast majority of user-distributed audiobooks.

### 3. One Archive = One Book

Each ZIP import creates exactly one book entry in the library. Multi-book archives are not supported.

### 4. Duplicate Entries Are Allowed

Importing the same ZIP twice creates two separate library entries. No fingerprinting or hash comparison is performed. This keeps the import pipeline stateless with respect to the existing library.

### 5. Chapter Ordering: Natural Sort on Filename

Files are sorted using **natural sort** (also called alphanumeric sort), not pure lexicographic sort.

**Why this matters:** Pure alphabetical sorting causes `Chapter 10.mp3` to sort before `Chapter 2.mp3` because `"1"` < `"2"` character-by-character. Natural sort treats embedded numbers numerically, producing the correct order.

**Secondary sort key:** ID3 `track` tag number, used as a tiebreaker when filenames produce ambiguous ordering.

**Library:** `natural-compare` (pure JS, ~1KB, no native bridge).

### 6. Metadata: Read from First MP3, No Online Lookup

All book metadata is read from the ID3 tags of the first MP3 in sorted order. No network calls are made at any point during import.

| Field | Source | Fallback |
|---|---|---|
| Title | ID3 `title` tag | ZIP filename (stripped of `.zip`) |
| Author | ID3 `artist` tag | Show nothing — do not display the field |
| Cover art | ID3 embedded image | Placeholder image in app assets |

**No manual editing of metadata is supported.**

### 7. Storage: Private App Documents Directory

Extracted MP3 files are stored in the app's private documents directory, not exposed to the system Files app. This matches the convention of established audiobook and podcast apps (Audible, Overcast, etc.) and prevents the user from deleting files out from under the app.

**Directory structure:**
```
<app-documents>/
  books/
    <bookId>/
      cover.jpg          ← extracted cover art (if present)
      01_chapter.mp3
      02_chapter.mp3
      ...
```

**On book deletion:** the app removes the entire `books/<bookId>/` directory and the corresponding database record. Nothing is left behind.

### 8. Mixed Format Rule: Error on Any Unsupported File

If a ZIP contains any file that is not `.mp3` and not a known system junk file, import is aborted with an explicit error message.

**Known junk files to silently ignore:**
- `__MACOSX/` directory and its contents (added by macOS archiver)
- `.DS_Store`
- `Thumbs.db`
- `desktop.ini`
- Any file beginning with `.` (hidden files)

**Error message shown to user:**  
*"This archive contains unsupported files ([filename].[ext]). Only MP3 files are supported."*

Name the specific offending file in the message so the user knows what to fix.

**Rationale for strictness:** There is no established convention of audiobook archives containing chapters duplicated across multiple formats. A ZIP with mixed formats most likely indicates a wrong archive or a malformed export, not a valid audiobook. Skipping files silently would result in a book with missing chapters, which is worse than a clear error.

### 9. Import Entry Point: Files App Only

Import is triggered by the user selecting a `.zip` file from the native Files app via `react-native-document-picker`. AirDrop and Share Sheet are out of scope for v1.

---

## Import Pipeline

The full sequence from user tap to book appearing in library:

```
User taps "Import Book"
        │
        ▼
react-native-document-picker
Opens native Files app picker, filtered to .zip
Returns a URI
  iOS  → file:// URI with temporary security scope
  Android → content:// URI managed by ContentResolver
        │
        ▼
[Stage 1] COPY TO CACHE
react-native-fs copies the file to app's cache directory
Produces a stable file:// path usable by the extractor

Why this step is mandatory:
  iOS  → temporary security scope on the source URI can expire
  Android → content:// URIs cannot be passed directly to native libs;
             must be streamed via ContentResolver first
        │
        ▼
[Stage 2] EXTRACT
react-native-zip-archive extracts to a temp subdirectory in cache
  ├── On encrypted ZIP → throw ImportError.passwordProtected
  │     "This archive is password-protected and can't be imported."
  └── On corrupt/invalid ZIP → throw ImportError.extractionFailed
        │
        ▼
[Stage 3] SCAN & VALIDATE
Walk the full extracted directory tree recursively
Flatten all nested folders — directory structure is ignored

For each file found:
  ├── Known junk? → silently skip
  ├── Ends in .mp3 (case-insensitive)? → add to audio file list
  └── Anything else? → throw ImportError.unsupportedFormat(filename)

Post-scan checks:
  └── Audio file list empty? → throw ImportError.noAudioFiles
        "No MP3 files were found in this archive."
        │
        ▼
[Stage 4] SORT
Apply natural sort to audio file list by filename
Secondary sort by ID3 track number where available
        │
        ▼
[Stage 5] READ METADATA
Read ID3 tags from the first file in sorted order using music-metadata
Extract: title, artist, embedded cover image
If cover image present → write to temp file as cover.jpg
        │
        ▼
[Stage 6] RESOLVE METADATA
Pure logic, no I/O:
  title  = ID3 title  ?? zip filename (strip .zip extension)
  author = ID3 artist ?? undefined
  cover  = temp cover path ?? null (UI uses placeholder)
        │
        ▼
[Stage 7] PERSIST TO STORAGE
Generate bookId (UUID)
Create directory: <app-documents>/books/<bookId>/
Move MP3 files from temp extraction dir → books/<bookId>/
Move cover.jpg (if present) → books/<bookId>/cover.jpg
        │
        ▼
[Stage 8] SAVE TO DATABASE
Write BookRecord to SQLite:
  { id, title, author, coverPath, importedAt }
Write ChapterRecord per file:
  { bookId, index, title (filename without ext), filePath }
        │
        ▼
[Stage 9] CLEANUP
Delete temp extraction directory
Delete cached copy of original ZIP
        │
        ▼
Book appears in library
```

---

## Error Handling

All errors must clean up temp files before surfacing to the UI. No partial state should remain after a failed import.

| Error | Cause | User message |
|---|---|---|
| `passwordProtected` | ZIP extraction threw on encrypted archive | "This archive is password-protected and can't be imported." |
| `extractionFailed` | Corrupt or invalid ZIP | "This archive couldn't be opened. The file may be corrupted." |
| `unsupportedFormat` | Non-MP3, non-junk file found | "This archive contains unsupported files ([ext]). Only MP3 files are supported." |
| `noAudioFiles` | No MP3 files after scan | "No MP3 files were found in this archive." |
| `diskFull` | Write failure during move/copy | "Not enough storage space to import this book." |

---

## Import UI Flow

Three sequential stages, each shown with a distinct animated indicator and label. No unified progress bar — each stage is discrete and has different duration characteristics.

| Stage | What's shown | Notes |
|---|---|---|
| Copying | Animated indicator + "Copying…" | Fast for most files; no granular progress available from `react-native-fs` |
| Extracting | Animated indicator + "Extracting…" | Longest stage; `react-native-zip-archive` emits progress events — can optionally show percentage |
| Processing | Animated indicator + "Processing…" | Near-instant; metadata read + DB write |

On any error: dismiss the stage UI, show an error modal with the specific message. Offer a single "OK" action — no retry from the error state (user re-triggers import manually).

---

## Dependencies

| Package | Purpose | Notes |
|---|---|---|
| `react-native-document-picker` | Native file picker, handles URI types per platform | Well-maintained; handles iOS security scope and Android ContentResolver |
| `react-native-fs` | File copy, directory creation, recursive walk, cleanup | Standard RN filesystem library |
| `react-native-zip-archive` | ZIP extraction with progress events | Only solid maintained RN option for ZIP |
| `music-metadata` | ID3 tag reading (title, artist, cover, track number) | Pure JS; works in RN via `react-native-blob-util` for stream access |
| `natural-compare` | Natural sort algorithm | ~1KB, pure JS, no native bridge |
| `expo-sqlite` | Local database for book and chapter records | Simpler than WatermelonDB; sufficient for this data model |

---

## Data Models

```typescript
type BookRecord = {
  id: string;           // UUID
  title: string;        // Resolved title
  author: string | null;
  coverPath: string | null; // Absolute path to cover.jpg, or null
  importedAt: number;   // Unix timestamp
};

type ChapterRecord = {
  id: string;           // UUID
  bookId: string;
  index: number;        // 0-based sort order
  title: string;        // Filename without extension
  filePath: string;     // Absolute path to MP3
};
```

---

## Explicitly Out of Scope (v1)

- RAR archive support
- M4B, M4A, AAC, FLAC, or any non-MP3 format
- AirDrop import
- Share Sheet import
- Manual metadata editing
- Online metadata lookup (MusicBrainz, etc.)
- Background import (app must be in foreground)
- Multi-book archives
- Duplicate detection
- Exposing book files to the system Files app
