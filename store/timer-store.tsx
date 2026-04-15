import {
  getSleepFadeDuration,
  getSleepTimerDuration,
  setSleepFadeDuration,
  setSleepTimerDuration,
} from "@/services/database";
import { usePlayerStore } from "@/store/player-store";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import TrackPlayer, { Event, useTrackPlayerEvents } from "react-native-track-player";

export const END_OF_CHAPTER = -1;

export const FADE_PRESETS: { label: string; seconds: number | null }[] = [
  { label: "Not set", seconds: null },
  { label: "5 min", seconds: 300 },
  { label: "10 min", seconds: 600 },
  { label: "15 min", seconds: 900 },
];

export const TIMER_PRESETS: { label: string; seconds: number | null }[] = [
  { label: "15 min", seconds: 900 },
  { label: "30 min", seconds: 1800 },
  { label: "45 min", seconds: 2700 },
  { label: "End of chapter", seconds: END_OF_CHAPTER },
];

type TimerStore = {
  selectedDuration: number | null;
  remainingSeconds: number;
  fadeDuration: number | null;
  setDuration: (seconds: number | null) => void;
  setFadeDuration: (seconds: number | null) => void;
  cancelTimer: () => void;
};

const TimerContext = createContext<TimerStore | null>(null);

export function TimerProvider({ children }: React.PropsWithChildren) {
  const { isPlaying, pause, currentBook } = usePlayerStore();
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [fadeDuration, setFadeDurationState] = useState<number | null>(null);

  // Load persisted preferences on mount
  useEffect(() => {
    getSleepTimerDuration().then((saved) => {
      if (saved !== null) {
        setSelectedDuration(saved);
        setRemainingSeconds(saved);
      }
    });
    getSleepFadeDuration().then((saved) => {
      setFadeDurationState(saved);
    });
  }, []);

  // Refs for use inside interval callback
  const remainingRef = useRef(remainingSeconds);
  remainingRef.current = remainingSeconds;
  const selectedDurationRef = useRef(selectedDuration);
  selectedDurationRef.current = selectedDuration;
  const fadeDurationRef = useRef(fadeDuration);
  fadeDurationRef.current = fadeDuration;
  const pauseRef = useRef(pause);
  pauseRef.current = pause;

  // Reset countdown when the book changes
  const prevBookIdRef = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    const bookId = currentBook?.id ?? null;
    if (prevBookIdRef.current === undefined) {
      prevBookIdRef.current = bookId;
      return;
    }
    prevBookIdRef.current = bookId;
    if (selectedDurationRef.current !== null) {
      setRemainingSeconds(selectedDurationRef.current);
      TrackPlayer.setVolume(1).catch(() => {});
    }
  }, [currentBook?.id]);

  // Countdown tick — only runs while playing and a fixed duration is selected
  useEffect(() => {
    if (!isPlaying || selectedDuration === null || selectedDuration === END_OF_CHAPTER) return;

    const interval = setInterval(() => {
      const next = remainingRef.current - 1;
      if (next <= 0) {
        pauseRef.current();
        TrackPlayer.setVolume(1).catch(() => {});
        setRemainingSeconds(selectedDurationRef.current ?? 0);
      } else {
        setRemainingSeconds(next);
        const fade = fadeDurationRef.current;
        if (fade !== null) {
          const volume = next <= fade ? Math.max(0, (next / fade) ** 2) : 1;
          TrackPlayer.setVolume(volume).catch(() => {});
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, selectedDuration]);

  // End-of-chapter mode — pause when the active track changes (chapter ended naturally)
  useTrackPlayerEvents([Event.PlaybackActiveTrackChanged], (event) => {
    if (
      event.type === Event.PlaybackActiveTrackChanged &&
      event.lastIndex != null &&
      selectedDurationRef.current === END_OF_CHAPTER
    ) {
      pauseRef.current();
    }
  });

  const setDuration = useCallback((seconds: number | null) => {
    setSelectedDuration(seconds);
    setRemainingSeconds(seconds ?? 0);
    setSleepTimerDuration(seconds).catch(() => {});
  }, []);

  const setFadeDuration = useCallback((seconds: number | null) => {
    setFadeDurationState(seconds);
    setSleepFadeDuration(seconds).catch(() => {});
  }, []);

  const cancelTimer = useCallback(() => {
    setDuration(null);
    setFadeDuration(null);
    TrackPlayer.setVolume(1).catch(() => {});
  }, [setDuration, setFadeDuration]);

  return (
    <TimerContext.Provider
      value={{ selectedDuration, remainingSeconds, fadeDuration, setDuration, setFadeDuration, cancelTimer }}
    >
      {children}
    </TimerContext.Provider>
  );
}

export function useTimerStore(): TimerStore {
  const ctx = useContext(TimerContext);
  if (!ctx) throw new Error("useTimerStore must be used within TimerProvider");
  return ctx;
}
