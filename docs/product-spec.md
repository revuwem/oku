# Oku (奥) — Product Specification V1

> Audiobook player for iOS designed for bedtime listening.
> Name means _depth_ in Japanese — the profound interior.

## Design principles

- **Dark-first**: Primary UI is dark mode with warm amber accents. Light mode secondary.
- **Set once, use forever**: Sleep timer persists across sessions. No nightly reconfiguration.
- **Minimal interaction in the dark**: Large touch targets, lock screen widget, tap-to-extend.
- **Graceful transitions**: Volume fades out, bookmarks drop automatically, no jarring moments.

## Tech stack

- React Native + TypeScript
- TailwindCSS via nativewind for styling
- react-native-track-player for audio (includes lock screen controls on iOS and Android)
- react-native-zip-archive for file extraction
- SQLite (expo-sqlite or WatermelonDB) for metadata/bookmarks/positions
- react-native-mmkv for preferences
- lucide-icons for UI icons
- Font: Source Serif 4 (serif, medium weight)

## Target user

Adult who listens to audiobooks at bedtime. Falls asleep during sessions regularly. Needs to find where they drifted off next morning.

## Nightly session flow

1. Open Oku or tap play from lock screen audio controls → resume book
2. Audio plays with pre-configured sleep timer (default: 30 min)
3. Volume fades over 10 minutes before timer ends
4. Still awake? Double-tap anywhere to restart timer cycle
5. Fall asleep → timer ends → sleep bookmark dropped at fade start point
6. Next morning → open app → see "fell asleep here" banner → tap to jump back

---

## V1 Features (10 total, 4 signature)

### Stage 1: Getting started

**Archive import** (Core)

- Import ZIP and RAR archives via share sheet, Files app, or AirDrop
- Auto-extract and scan for M4B, MP3, M4A files
- M4B: chapters from embedded markers. MP3/M4A: each file = one chapter, alphabetical sort
- One archive = one book entry
- Edge cases: flatten nested folders, support mixed formats, error on password-protected or empty archives

**Auto cover & metadata** (Core)

- Read embedded ID3/iTunes tags for title, author, cover art
- No cover → show Oku Page Pulse app logo as placeholder
- No title → use archive filename. No author → show nothing
- No manual editing in V1, no online lookup

### Stage 2: Playing

**Core playback** (Core)

- Play / Pause, skip 30s forward/back, scrubber bar
- Background audio, lock screen and Control Center controls
- Audio managed via react-native-track-player with background mode
- AirPods integration moved to V2

**Chapter navigation** (Core)

- Chapter list from now-playing (swipe up or tap chapter title)
- Each chapter: number, title, duration. Current chapter has progress bar + "Now playing" label
- Chapter numbers shown for all items (no checkmarks for completed)
- Tap to jump to chapter start

**Sleep mode UI** (Core)

- Auto-activates when sleep timer is running
- Ultra-dim screen, warm amber tint, non-essential controls hidden
- Visible: play/pause (extra-large center), timer countdown, chapter title
- Skip buttons available but smaller, at screen edges
- Scrubber hidden to prevent accidental seeks
- "Exit sleep" control to return to normal now-playing
- Double-tap anywhere hint displayed

### Stage 3: Falling asleep

**Persistent sleep timer** (SIGNATURE)

- Set once, active every session until reset
- Default: 30 min. Starts automatically on playback
- Presets: 15, 30, 45, 60 min + end of chapter
- Custom: 1–60 min number input
- Countdown visible, turns amber during fade window

**Gentle volume fade** (SIGNATURE)

- Linear fade from current to zero over configured duration
- Default: 10 min. Presets: 2, 5, 10, 15 min
- Persists across sessions
- Clamped to timer duration if longer
- Applied at player level, not system volume

**Tap to extend** (SIGNATURE)

- Double-tap anywhere → restart timer cycle, volume back to 100%
- Works during sleep mode, on lock screen, face-down
- 300ms window distinguishes single from double tap
- Creates indefinite loop: listen → fade → extend → listen → fade → sleep

### Stage 4: Waking up

**Persistent position** (Core)

- Save exact position (chapter + timestamp) on pause, timer end, background
- Resume from saved position on next launch
- Per-book independent positions
- Stored in SQLite

**Sleep bookmark** (SIGNATURE)

- Auto-bookmark at fade start timestamp when timer reaches zero
- Labeled "Fell asleep here" with date/time
- Shown as banner at top of Now Playing screen: "Fell asleep here" + "Jump back" button
- Only most recent shown prominently
- Rationale: fade start ≈ when user stopped paying attention

---

## Sleep interaction model

| Phase    | Timer state                   | Volume           | User action            |
| -------- | ----------------------------- | ---------------- | ---------------------- |
| Playing  | Counting down (30:00 → 10:00) | 100%             | Listen normally        |
| Fading   | Counting down (10:00 → 0:00)  | 100% → 0% linear | Double-tap to extend   |
| Stopped  | Timer at 0:00                 | 0% (paused)      | Sleep bookmark dropped |
| Extended | Reset to full duration        | Jumps to 100%    | New cycle begins       |

### Gestures

| Gesture               | Action                | When              |
| --------------------- | --------------------- | ----------------- |
| Single tap (center)   | Play / Pause          | Always            |
| Double-tap (anywhere) | Restart timer cycle   | During sleep mode |
| Tap skip buttons      | Skip 30s forward/back | Always            |

---

## V2 roadmap (after V1 stable)

- Lock screen widget (native WidgetKit on iOS, AppWidgetProvider on Android — one-tap resume)
- Playback speed (0.5x–3.0x, per-book memory)
- Volume boost / audio normalization
- Reading stats (listening time, books finished, streaks)
- Online metadata lookup
- Manual metadata editing
- AirPods integration (single/double/triple press)

## V3 roadmap (App Store ready)

- Bookmarks & highlights (manual, with notes)
- Library organization (collections, tags, search)
- CarPlay support
- iCloud sync

---

## Brand identity

- **Name**: Oku (奥) — depth
- **Icon**: Page Pulse — 7 vertical rounded bars, symmetrical, center tallest + amber
- **Wordmark**: Noto Serif JP, weight 300, lowercase, tracking 0.1em
- **UI Font**: Source Serif 4, weights 400–600
- **Dark palette**: Midnight #1A1714, Charcoal #2A2520, Ash #5C554A, Stone #7A7168, Amber #D4A574, Parchment #E8DFD3
- **Light palette**: Cream #FAF8F5, Parchment #E8DFD3, Sand #C8A882, Walnut #A67C42, Espresso #946830
