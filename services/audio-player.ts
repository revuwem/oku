import TrackPlayer, { Capability } from "react-native-track-player";

import type { BookRecord, ChapterRecord } from "@/types";

let isSetUp = false;

export async function setupPlayer(): Promise<void> {
  if (isSetUp) return;
  try {
    await TrackPlayer.setupPlayer({ autoHandleInterruptions: true });
    await TrackPlayer.updateOptions({
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.Stop,
        Capability.SeekTo,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.JumpForward,
        Capability.JumpBackward,
      ],
      compactCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
      ],
      progressUpdateEventInterval: 1,
      jumpInterval: 30,
    });
    isSetUp = true;
  } catch {
    // setupPlayer throws if called twice (e.g. Fast Refresh) — treat as already set up
    isSetUp = true;
  }
}

export async function loadBook(
  book: BookRecord,
  chapters: ChapterRecord[],
  startIndex = 0,
  startPosition = 0
): Promise<void> {
  await TrackPlayer.reset();

  const tracks = chapters.map((chapter) => ({
    id: chapter.id,
    url: chapter.filePath,
    title: chapter.title,
    artist: book.author ?? undefined,
    artwork: book.coverPath ?? undefined,
    album: book.title,
  }));

  await TrackPlayer.add(tracks);

  if (startIndex > 0) {
    await TrackPlayer.skip(startIndex);
  }
  if (startPosition > 0) {
    await TrackPlayer.seekTo(startPosition);
  }
}
