# CLAUDE.md — Oku Project Instructions

## Project overview

Oku (奥) is an audiobook player for iOS built with React Native + TypeScript. It is designed specifically for bedtime listening. The app prioritizes a calm, warm, dark-first aesthetic with zero-friction nightly sessions.

Read `docs/product-spec.md` for the full V1 feature specification.

## Tech stack

- **Framework**: React Native (TypeScript)
- **Audio**: `react-native-track-player` for playback, background audio, and lock screen controls
- **File handling**: `react-native-zip-archive` for ZIP, native module for RAR extraction
- **Storage**: SQLite (`expo-sqlite`) for library data
- **UI Components**: `gluestack-ui` — copy-paste component library built on NativeWind. Components are local in `@/components/ui/`. Use gluestack primitives (`Box`, `Text`, `HStack`, `VStack`, `Pressable`, `Button`, etc.) instead of raw React Native imports
- **Styling**: TailwindCSS via `nativewind` — gluestack-ui uses NativeWind under the hood. All custom styling via Tailwind utility classes on `className`
- **Font**: Source Serif 4 (serif, regular, italic, 400) for body, Noto Sans JP (serif, regular, 400) for heading
- **Icons**: `lucide-react-native` for all UI icons (navigation, controls, system). The only custom SVG icon is the PagePulseIcon (app branded logo)

## Project structure

```
components/
  ├── ui/               # gluestack-ui components (copy-pasted, customized)
  │   ├── box/
  │   ├── text/
  │   ├── heading/
  │   ├── button/
  │   ├── hstack/
  │   ├── vstack/
  │   ├── pressable/
  │   ├── progress/
  │   ├── slider/
  │   ├── actionsheet/
  │   ├── divider/
  │   └── gluestack-ui-provider/
  ├── PagePulseIcon.tsx    # App branded icon (only custom SVG)
  ├── CoverPlaceholder.tsx # Book cover with PagePulseIcon inside
  ├── TabBar.tsx
  └── SleepBookmarkBanner.tsx
├── app/          # App screens
│   ├── _layout.tsx
│   ├── (tabs).tsx
|   |    ├── _layout.tsx
|   |    └── index.tsx
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

### Colors

Colors are defined in `gluestack.config.ts` as custom theme values. Use semantic classes:

- `bg-primary-50` — app background
- `bg-primary-100` — cards, surfaces, tab bar
- `text-typography-0` — primary text
- `text-typography-100` — secondary text
- `text-typography-200` — tertiary text, hints
- `text-primary-500` / `bg-primary-200` — accent, CTAs, active states

For opacity variants, use Tailwind's opacity modifier: `bg-ash/25`, `text-amber/80`.

### Spacing

- Screen horizontal padding: `px-6` (24px)
- Card padding: `p-4` (16px)
- Gap between cards: `gap-3` (12px)
- Section gaps: `gap-6` (24px)

### Icons

**Lucide Icons** (`lucide-react-native`) are used for ALL UI icons. Never create custom SVGs for standard UI elements.

```typescript
import { CirclePlus, House, Settings, CirclePlay } from 'lucide-react-native';

// Standard usage
<IconBook />

// Active state
<IconBook />
```

Key rules:

- Default size: 20px for navigation and inline icons
- Stroke width: always `1.8` (medium weight — matches brand feel)
- Always paired with text labels in navigation
- Color follows state: amber for active, ash/stone for inactive

**The only custom icon is PagePulseIcon** — the branded app logo (7 vertical bars). This is a hand-built SVG component, NOT from Lucide. Use it exclusively for:

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

For implementation patterns, check ADR in @/docs

## Git

- Use [Conventional Commits](https://www.conventionalcommits.org/) format for all commit messages: `type(scope): description` — e.g. `feat(tab-bar): add haptic feedback on press`, `fix(player): resume after interruption`, `refactor(tab-bar): move icon config to layout`

## Code style

- Component files use kebab-case folders with `index.tsx` entry points (e.g. `components/tab-bar/index.tsx`, `components/screen-layout/index.tsx`) — not PascalCase flat files
- TypeScript strict mode
- Functional components with hooks
- Avoid `any` types — define interfaces in `types/index.ts`
- Use named exports for components
- Keep components under 200 lines; extract sub-components when larger
- Always use gluestack-ui components (`Box`, `Text`, `HStack`, `VStack`, `Pressable`, `Button`, etc.) — never raw React Native `View`, `Text`, or `TouchableOpacity`
- Use gluestack component props (`size`, `variant`, `space`) first, `className` for custom overrides
- Use Tailwind classes via `className` for custom styling beyond what component props offer
- Only use `StyleSheet.create()` for truly dynamic values that Tailwind can't express
- Never hardcode colors — use semantic theme classes (`text-typography-0`, `bg-background-0`, etc.)
- All UI icons come from `lucide-react-native`
- Reusable components must not own consumer-specific configuration — pass it in via props or standard framework options (e.g. React Navigation's `tabBarIcon`) so the component stays generic and the caller owns its own data

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
