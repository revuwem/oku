# CLAUDE.md — Oku Project Instructions

## Project overview

Oku (奥) is an audiobook player for iOS built with React Native + TypeScript. It is designed specifically for bedtime listening. The app prioritizes a calm, warm, dark-first aesthetic with zero-friction nightly sessions.

Read `docs/product-spec.md` for the full V1 feature specification.

## Tech stack

- **Framework**: React Native (TypeScript)
- **Audio**: `react-native-track-player` for playback, background audio, and lock screen controls
- **File handling**: `react-native-zip-archive` for ZIP, native module for RAR extraction
- **Storage**: SQLite (`expo-sqlite` or `WatermelonDB`) for library data; `react-native-mmkv` for preferences
- **UI Components**: `gluestack-ui` — copy-paste component library built on NativeWind. Components are local in `@/components/ui/`. Use gluestack primitives (`Box`, `Text`, `HStack`, `VStack`, `Pressable`, `Button`, etc.) instead of raw React Native imports
- **Styling**: TailwindCSS via `nativewind` — gluestack-ui uses NativeWind under the hood. All custom styling via Tailwind utility classes on `className`
- **Font**: Source Serif 4 (serif, medium weight, 400–600)
- **Icons**: `@tabler/icons-react-native` for all UI icons (navigation, controls, system). The only custom SVG icon is the PagePulseIcon (app branded logo)

## Project structure

```
src/
├── components/
│   ├── ui/               # gluestack-ui components (copy-pasted, customized)
│   │   ├── box/
│   │   ├── text/
│   │   ├── heading/
│   │   ├── button/
│   │   ├── hstack/
│   │   ├── vstack/
│   │   ├── pressable/
│   │   ├── progress/
│   │   ├── slider/
│   │   ├── actionsheet/
│   │   ├── divider/
│   │   └── gluestack-ui-provider/
│   ├── PagePulseIcon.tsx    # App branded icon (only custom SVG)
│   ├── CoverPlaceholder.tsx # Book cover with PagePulseIcon inside
│   ├── TabBar.tsx
│   └── SleepBookmarkBanner.tsx
├── screens/          # App screens
│   ├── LibraryScreen.tsx
│   ├── NowPlayingScreen.tsx
│   ├── SleepModeScreen.tsx
│   ├── ChapterListScreen.tsx
│   ├── TimerSettingsScreen.tsx
│   └── ImportScreen.tsx
├── theme/            # Design system
│   └── tokens.ts     # Colors, typography, spacing, radius, sizes
├── services/         # Business logic
│   ├── audioPlayer.ts
│   ├── sleepTimer.ts
│   ├── archiveImporter.ts
│   └── metadataReader.ts
├── store/            # State management
│   ├── libraryStore.ts
│   ├── playerStore.ts
│   └── timerStore.ts
├── hooks/            # Custom hooks
│   ├── useSleepTimer.ts
│   ├── useVolumeFade.ts
│   └── useDoubleTap.ts
├── types/            # TypeScript types
│   └── index.ts
└── utils/
    └── formatTime.ts
```

## Design system rules

### gluestack-ui component patterns

Oku uses gluestack-ui as the component foundation. Components are copy-pasted into `@/components/ui/` and customized to match the Oku brand. Always use gluestack primitives instead of raw React Native imports.

```typescript
// ✅ Correct — gluestack-ui components with Tailwind classes
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Pressable } from '@/components/ui/pressable';
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';

<Box className="bg-midnight px-6 py-4 rounded-card">
  <Heading size="xl" className="text-parchment font-serif">Title</Heading>
  <Text size="sm" className="text-stone font-serif">Subtitle</Text>
</Box>

// ❌ Wrong — raw React Native imports
import { View, Text, TouchableOpacity } from 'react-native';
<View style={{ backgroundColor: '#1A1714', padding: 16 }}>
```

**Key gluestack-ui rules:**

1. **Use component props first, `className` second.** If a gluestack component has a built-in prop (like `size`, `variant`, `space`), use the prop. Use `className` for custom overrides.

```typescript
// ✅ Correct — use props for component API, className for custom styling
<VStack space="lg" className="px-6">
  <Button variant="solid" size="lg" className="bg-amber rounded-button">
    <ButtonText className="text-midnight font-serif font-semibold">Import</ButtonText>
  </Button>
</VStack>

// ❌ Wrong — using className for things props already handle
<VStack className="gap-4">
  <Button className="bg-amber px-8 py-3">
    <ButtonText>Import</ButtonText>
  </Button>
</VStack>
```

2. **Use `space` prop on `HStack`/`VStack`**, not `gap` className. Values: `xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`, `4xl`.

3. **Use `size` prop on `Text`, `Heading`, `Button`**, not font-size classNames. Values: `2xs`, `xs`, `sm`, `md`, `lg`, `xl`, `2xl`, etc.

4. **Compound components** — many gluestack components use slot patterns:

```typescript
<Button variant="outline" size="md" className="border-amber">
  <ButtonText className="text-amber font-serif">Sleep Timer</ButtonText>
  <ButtonIcon as={IconMoon} className="text-amber" />
</Button>

<Slider value={30} minValue={1} maxValue={60}>
  <SliderTrack className="bg-ash/25">
    <SliderFilledTrack className="bg-amber" />
  </SliderTrack>
  <SliderThumb className="bg-amber" />
</Slider>
```

5. **Wrap the app** in `GluestackUIProvider` for theming:

```typescript
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';

export default function App() {
  return (
    <GluestackUIProvider mode="dark">
      <Navigation />
    </GluestackUIProvider>
  );
}
```

### Gluestack component mapping for Oku

| Oku UI element | gluestack component | Notes |
|----------------|---------------------|-------|
| Screen wrapper | `Box` | `className="flex-1 bg-midnight"` |
| Card | `Box` | `className="bg-charcoal rounded-card p-4"` |
| Horizontal layout | `HStack` | Use `space` prop for gaps |
| Vertical layout | `VStack` | Use `space` prop for gaps |
| Screen title | `Heading` | `size="2xl" className="text-parchment font-serif"` |
| Body text | `Text` | `size="sm" className="text-stone font-serif"` |
| Primary button | `Button` + `ButtonText` | `className="bg-amber rounded-button"` |
| Ghost button | `Button` variant="link" + `ButtonText` | `className="text-amber"` |
| Pressable area | `Pressable` | Book cards, chapter rows |
| Progress bar | `Progress` + `ProgressFilledTrack` | `className="bg-ash/25"` track, `className="bg-amber"` fill |
| Timer input slider | `Slider` compound | Custom track/thumb with amber accent |
| Modal / bottom sheet | `Actionsheet` | Timer settings, chapter list |
| Divider | `Divider` | `className="bg-ash/15"` |

### Tailwind theme configuration

Configure custom theme in `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        midnight: '#1A1714',
        charcoal: '#2A2520',
        ash: '#5C554A',
        stone: '#7A7168',
        amber: '#D4A574',
        parchment: '#E8DFD3',
        cream: '#FAF8F5',
        walnut: '#A67C42',
        espresso: '#946830',
        'deep-amber': '#3D2E1E',
      },
      fontFamily: {
        serif: ['SourceSerif4'],
        'serif-italic': ['SourceSerif4-Italic'],
        brand: ['NotoSerifJP'],
      },
      borderRadius: {
        'card': '16px',
        'button': '12px',
        'cover-sm': '10px',
        'cover-lg': '20px',
      },
    },
  },
};
```

### Colors
Colors are defined in `tailwind.config.js` as custom theme values. Use Tailwind classes:
- `bg-midnight` — app background
- `bg-charcoal` — cards, surfaces, tab bar
- `text-parchment` — primary text
- `text-stone` — secondary text
- `text-ash` — tertiary text, hints
- `text-amber` / `bg-amber` — accent, CTAs, active states
- `bg-deep-amber` — sleep bookmark banner

For opacity variants, use Tailwind's opacity modifier: `bg-ash/25`, `text-amber/80`.

### Dark mode palette (primary)
| Tailwind class | Hex | Usage |
|-------|-----|-------|
| midnight | #1A1714 | App background |
| charcoal | #2A2520 | Cards, surfaces, tab bar |
| ash | #5C554A | Tertiary text, dividers, inactive icons |
| stone | #7A7168 | Secondary text |
| amber | #D4A574 | Accent, progress, CTAs |
| parchment | #E8DFD3 | Primary text, headings |

### Typography
- All text uses Source Serif 4 via `font-serif` class
- Weights: `font-normal` (400), `font-medium` (500), `font-semibold` (600), `font-bold` (700)
- Never use Inter, system font, or sans-serif fonts in UI
- Screen titles: `text-[22px] font-semibold`
- Card titles: `text-base font-semibold` (16px)
- Body: `text-[13px]` to `text-[15px] font-normal`
- Labels/hints: `text-[11px]` to `text-xs font-normal`

### Spacing
- Screen horizontal padding: `px-6` (24px)
- Card padding: `p-4` (16px)
- Gap between cards: `gap-3` (12px)
- Section gaps: `gap-6` (24px)

### Icons

**Tabler Icons** (`@tabler/icons-react-native`) are used for ALL UI icons. Never create custom SVGs for standard UI elements.

```typescript
import { IconBook, IconPlayerPlay, IconSettings, IconMoon } from '@tabler/icons-react-native';

// Standard usage
<IconBook size={20} color={colors.stone} stroke={1.8} />

// Active state
<IconBook size={20} color={colors.amber} stroke={1.8} />
```

Key rules:
- Default size: 20px for navigation and inline icons
- Stroke width: always `1.8` (medium weight — matches brand feel)
- Always paired with text labels in navigation
- Color follows state: amber for active, ash/stone for inactive

Commonly used Tabler icons in Oku:
| Context | Icon | Tabler name |
|---------|------|-------------|
| Library tab | Book | `IconBook` |
| Now Playing tab | Play circle | `IconPlayerPlay` |
| Settings tab | Settings gear | `IconSettings` |
| Back navigation | Chevron left | `IconChevronLeft` |
| Skip back 30s | Rewind | `IconRewindBackward30` or `IconPlayerSkipBack` |
| Skip forward 30s | Fast forward | `IconRewindForward30` or `IconPlayerSkipForward` |
| Play button | Play | `IconPlayerPlayFilled` |
| Pause button | Pause | `IconPlayerPauseFilled` |
| Sleep timer / moon | Moon | `IconMoon` |
| Import | Download | `IconDownload` |
| Archive file | Archive | `IconArchive` |
| Close / dismiss | X | `IconX` |
| Exit sleep mode | Sun | `IconSun` |
| Chapters expand | Chevron down | `IconChevronDown` |

**The only custom icon is PagePulseIcon** — the branded app logo (7 vertical bars). This is a hand-built SVG component, NOT from Tabler. Use it exclusively for:
- Cover art placeholder when no embedded cover exists
- Splash screen element
- Empty state indicator

### Border radius
- Cards: `rounded-card` (16px) or `rounded-2xl`
- Buttons: `rounded-button` (12px) or `rounded-xl`
- Cover (small): `rounded-cover-sm` (10px)
- Cover (large): `rounded-cover-lg` (20px)
- Pills/badges: `rounded-full`

### The Page Pulse icon
The app icon (7 vertical bars) is a reusable component. Use it as:
- Cover art placeholder when no embedded cover exists
- Splash screen element
- Empty state indicator

Import: `import { PagePulseIcon } from '@/components/PagePulseIcon'`
Bar ratios defined in `tokens.ts` under `pagePulse`.

## Key implementation patterns

### Sleep timer
- Timer preference persists in MMKV storage
- Timer starts automatically with playback — no user action needed
- Default: 30 min duration, 10 min volume fade
- Volume fade is linear, applied at the track player level (not system volume)
- When timer ends: save sleep bookmark at fade start timestamp, pause playback

### Double-tap to extend
- Use a custom `useDoubleTap` hook with 300ms threshold
- On double-tap during sleep mode: reset timer to full duration, volume to 100%
- Must work on lock screen — handled via notification actions

### Sleep bookmark
- Stored in SQLite with chapter, timestamp, and date
- Displayed as a banner at top of Now Playing screen
- Only most recent bookmark shown; older ones in chapter list
- Banner has: moon icon, "Fell asleep here" text, "Jump back" button

### Archive import
- Priority: ZIP and RAR archives
- Extract → scan for M4B/MP3/M4A → group as book → read metadata
- M4B chapters from embedded markers
- MP3/M4A: one file = one chapter, sorted alphabetically
- Cover art: embedded tags first, then Page Pulse icon placeholder

## Code style

- TypeScript strict mode
- Functional components with hooks
- Avoid `any` types — define interfaces in `types/index.ts`
- Use named exports for components
- Keep components under 200 lines; extract sub-components when larger
- Always use gluestack-ui components (`Box`, `Text`, `HStack`, `VStack`, `Pressable`, `Button`, etc.) — never raw React Native `View`, `Text`, or `TouchableOpacity`
- Use gluestack component props (`size`, `variant`, `space`) first, `className` for custom overrides
- Use Tailwind classes via `className` for custom styling beyond what component props offer
- Only use `StyleSheet.create()` for truly dynamic values that Tailwind can't express
- Never hardcode colors — use Tailwind theme classes (`text-amber`, `bg-charcoal`, etc.)
- All UI icons come from `@tabler/icons-react-native` with `stroke={1.8}`
- The only custom SVG is `PagePulseIcon` — the branded app logo
- Wrap the root app in `<GluestackUIProvider mode="dark">`

## What NOT to build in V1

- No lock screen widget (V2 — requires native WidgetKit on iOS + AppWidgetProvider on Android; lock screen audio controls from react-native-track-player are sufficient for V1)
- No AirPods custom gesture handling (V2)
- No playback speed controls (V2)
- No volume boost/normalization (V2)
- No online metadata lookup (V2)
- No manual metadata editing (V2)
- No bookmarks with notes (V3)
- No library organization/search (V3)
- No CarPlay (V3)
- No iCloud sync (V3)
- No light mode UI implementation (design exists but dark mode is the only V1 target)

## Reference files

- `docs/product-spec.md` — Full product specification
- `theme/tokens.ts` — Design tokens (colors, typography, spacing, sizes)
- Figma wireframes: https://www.figma.com/design/boQsb2hbHtfkZgCg4BuDye (v1), https://www.figma.com/design/yL3A9NzoOJZJEoJvzNnbsY (v2)
