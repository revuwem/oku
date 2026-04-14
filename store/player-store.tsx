import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import TrackPlayer, {
  State,
  useActiveTrack,
  usePlaybackState,
  useProgress,
} from "react-native-track-player";

import { loadBook } from "@/services/audio-player";
import {
  getChaptersByBook,
  loadPosition,
  savePosition,
} from "@/services/database";
import type { BookRecord, ChapterRecord } from "@/types";

type PlayerStore = {
  currentBook: BookRecord | null;
  chapters: ChapterRecord[];
  position: number;
  duration: number;
  isPlaying: boolean;
  activeTrackTitle: string | undefined;
  activeChapterIndex: number;
  openBook: (book: BookRecord) => Promise<void>;
  closeBook: () => Promise<void>;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  seekTo: (position: number) => Promise<void>;
  seekBy: (offset: number) => Promise<void>;
  skipToChapter: (index: number) => Promise<void>;
};

const PlayerContext = createContext<PlayerStore | null>(null);

export function PlayerProvider({ children }: React.PropsWithChildren) {
  const [currentBook, setCurrentBook] = useState<BookRecord | null>(null);
  const [chapters, setChapters] = useState<ChapterRecord[]>([]);

  const { position, duration } = useProgress(1000);
  const playbackState = usePlaybackState();
  const activeTrack = useActiveTrack();

  const isPlaying = playbackState.state === State.Playing;
  const activeChapterIndex = chapters.findIndex(
    (c) => c.id === activeTrack?.id
  );

  // Keep a ref to the latest position so the save effect doesn't run every second
  const currentBookRef = useRef(currentBook);
  currentBookRef.current = currentBook;
  const positionRef = useRef(position);
  positionRef.current = position;
  const activeTrackRef = useRef(activeTrack);
  activeTrackRef.current = activeTrack;

  useEffect(() => {
    const state = playbackState.state;
    if (state !== State.Paused && state !== State.Stopped) return;
    const book = currentBookRef.current;
    const track = activeTrackRef.current;
    if (!book || !track) return;

    const chapterId = track.id as string | undefined;
    if (!chapterId) return;

    savePosition(book.id, chapterId, positionRef.current).catch(() => {});
  }, [playbackState.state]); // eslint-disable-line react-hooks/exhaustive-deps

  const openBook = useCallback(async (book: BookRecord) => {
    const bookChapters = await getChaptersByBook(book.id);
    const saved = await loadPosition(book.id);

    let startIndex = 0;
    let startPosition = 0;

    if (saved) {
      const idx = bookChapters.findIndex((c) => c.id === saved.chapterId);
      if (idx >= 0) {
        startIndex = idx;
        startPosition = saved.positionSeconds;
      }
    }

    setCurrentBook(book);
    setChapters(bookChapters);

    await loadBook(book, bookChapters, startIndex, startPosition);
    await TrackPlayer.play();
  }, []);

  const closeBook = useCallback(async () => {
    await TrackPlayer.reset();
    setCurrentBook(null);
    setChapters([]);
  }, []);

  const play = useCallback(() => TrackPlayer.play(), []);
  const pause = useCallback(() => TrackPlayer.pause(), []);
  const seekTo = useCallback(
    (pos: number) => TrackPlayer.seekTo(pos),
    []
  );
  const seekBy = useCallback(
    (offset: number) => TrackPlayer.seekBy(offset),
    []
  );
  const skipToChapter = useCallback(async (index: number) => {
    await TrackPlayer.skip(index);
    await TrackPlayer.play();
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        currentBook,
        chapters,
        position,
        duration,
        isPlaying,
        activeTrackTitle: activeTrack?.title,
        activeChapterIndex,
        openBook,
        closeBook,
        play,
        pause,
        seekTo,
        seekBy,
        skipToChapter,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayerStore(): PlayerStore {
  const ctx = useContext(PlayerContext);
  if (!ctx)
    throw new Error("usePlayerStore must be used within PlayerProvider");
  return ctx;
}
