/**
 * Oku Design Tokens
 *
 * Usage: import { colors, typography, spacing } from '@/theme/tokens';
 */

// ============================================================
// COLORS
// ============================================================

export const colors = {
  // Dark mode palette (primary)
  dark: {
    midnight: "#1A1714", // App background
    charcoal: "#2A2520", // Cards, surfaces, tab bar
    ash: "#5C554A", // Tertiary text, dividers, inactive icons
    stone: "#7A7168", // Secondary text, subtitles
    amber: "#D4A574", // Accent, active states, progress bars, CTAs
    parchment: "#E8DFD3", // Primary text, headings
    deepAmber: "#3D2E1E", // Sleep bookmark banner background
  },

  // Light mode palette (secondary)
  light: {
    cream: "#FAF8F5", // App background
    parchment: "#E8DFD3", // Surfaces
    sand: "#C8A882", // Tertiary / muted elements
    walnut: "#A67C42", // Accent, active states
    espresso: "#946830", // Strong accent, CTAs
  },

  // Semantic colors
  semantic: {
    background: "#1A1714",
    surface: "#2A2520",
    textPrimary: "#E8DFD3",
    textSecondary: "#7A7168",
    textTertiary: "#5C554A",
    accent: "#D4A574",
    accentMuted: "rgba(212, 165, 116, 0.15)",
    accentSubtle: "rgba(212, 165, 116, 0.08)",
    divider: "rgba(92, 85, 74, 0.25)",
    progressTrack: "rgba(92, 85, 74, 0.25)",
    progressFill: "rgba(212, 165, 116, 0.8)",
  },

  // Sleep mode (ultra-dim)
  sleep: {
    background: "#0D0B09",
    overlay: "rgba(212, 165, 116, 0.02)",
    textDim: "rgba(122, 113, 104, 0.7)",
  },
} as const;

// ============================================================
// TYPOGRAPHY
// ============================================================

export const typography = {
  // Font families
  fontFamily: {
    serif: "SourceSerif4", // Display, headings, body
    serifItalic: "SourceSerif4-Italic",
    // Wordmark / brand
    brand: "NotoSerifJP",
  },

  // Font weights (Source Serif 4 available weights)
  fontWeight: {
    regular: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
  },

  // Type scale
  size: {
    xs: 11, // Labels, badges
    sm: 12, // Timestamps, hints
    body: 13, // Secondary body text
    md: 14, // Body, subtitles
    lg: 15, // List items, buttons
    xl: 16, // Card titles
    "2xl": 18, // Timer display (small)
    "3xl": 22, // Screen titles
    "4xl": 28, // App title
    "5xl": 56, // Sleep mode timer
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },

  // Letter spacing
  letterSpacing: {
    tight: -0.3,
    normal: 0,
    wide: 0.5,
    timer: 2, // Sleep mode countdown
    brand: 1.5, // "Oku" wordmark
  },
} as const;

// ============================================================
// SPACING
// ============================================================

export const spacing = {
  /** 4px */ xs: 4,
  /** 6px */ sm: 6,
  /** 8px */ md: 8,
  /** 12px */ lg: 12,
  /** 16px */ xl: 16,
  /** 20px */ "2xl": 20,
  /** 24px */ "3xl": 24, // Standard horizontal padding
  /** 28px */ "4xl": 28,
  /** 32px */ "5xl": 32,
  /** 48px */ "6xl": 48,

  // Named spacing
  screenPadding: 24,
  cardPadding: 16,
  cardGap: 12,
  sectionGap: 24,
  controlGap: 32,
} as const;

// ============================================================
// BORDER RADIUS
// ============================================================

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 9999,
  // Specific
  card: 16,
  button: 12,
  cover: {
    sm: 10, // 72px cover
    md: 15, // 260px cover
    lg: 20, // Full-width cover
  },
  tabBar: 0,
  phoneFrame: 44,
} as const;

// ============================================================
// ICON SIZES
// ============================================================

export const iconSize = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
  control: 18, // Skip buttons
  playPause: 28, // Main play button icon
  sleepPlay: 40, // Sleep mode play/pause icon
} as const;

// ============================================================
// COMPONENT SIZES
// ============================================================

export const componentSize = {
  // Cover placeholders
  coverSmall: 72,
  coverLarge: 260,

  // Playback controls
  skipButton: 56,
  playButton: 72,
  sleepPlayButton: 120,
  sleepSkipButton: 48,

  // Tab bar
  tabBarHeight: 80,
  tabIconSize: 20,

  // Status bar
  statusBarHeight: 54,

  // Progress bars
  progressHeight: 4,
  progressHeightSleep: 3,
  scrubberDot: 14,

  // Home indicator
  homeIndicatorWidth: 134,
  homeIndicatorHeight: 5,
} as const;

// ============================================================
// SHADOWS
// ============================================================

export const shadows = {
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  phoneFrame: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 60,
    elevation: 24,
  },
} as const;

// ============================================================
// ANIMATION
// ============================================================

export const animation = {
  // Durations (ms)
  duration: {
    fast: 150,
    normal: 250,
    slow: 400,
    volumeFade: 600000, // 10 min default (in ms)
  },
  // Easing
  easing: {
    default: "ease-in-out",
    spring: { damping: 15, stiffness: 150 },
  },
} as const;

// ============================================================
// APP ICON BAR RATIOS (Page Pulse)
// Used by the PagePulseIcon component
// ============================================================

export const pagePulse = {
  bars: [
    { heightRatio: 0.22, opacity: 0.35 },
    { heightRatio: 0.4, opacity: 0.45 },
    { heightRatio: 0.58, opacity: 0.6 },
    { heightRatio: 0.72, opacity: 0.85 }, // Center bar
    { heightRatio: 0.58, opacity: 0.6 },
    { heightRatio: 0.4, opacity: 0.45 },
    { heightRatio: 0.22, opacity: 0.35 },
  ],
  barWidthRatio: 0.075,
  gapRatio: 0.12,
} as const;
