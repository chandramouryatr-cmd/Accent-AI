// AccentAI mobile theme — mirrors the clean minimal white aesthetic of the web app.

export const colors = {
  background: "#ffffff",
  surface: "#f8f8f8",
  surfaceAlt: "#f1f1f4",
  border: "#e4e4e7",
  foreground: "#0a0a0a",
  muted: "#71717a",
  subtle: "#a1a1aa",

  primary: "#10b981",      // emerald — accent / progress
  primarySoft: "#d1fae5",
  primaryDark: "#059669",

  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  info: "#3b82f6",

  // Phase gradient colors (matched to web app)
  phase: [
    "#6366f1", "#8b5cf6", "#d946ef", "#ec4899",
    "#f43f5e", "#f97316", "#10b981", "#22d3ee",
  ],
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

export const typography = {
  hero: { fontSize: 32, fontWeight: "800" as const, lineHeight: 38 },
  h1: { fontSize: 24, fontWeight: "700" as const, lineHeight: 30 },
  h2: { fontSize: 20, fontWeight: "700" as const, lineHeight: 26 },
  h3: { fontSize: 17, fontWeight: "600" as const, lineHeight: 23 },
  body: { fontSize: 15, fontWeight: "400" as const, lineHeight: 22 },
  bodySmall: { fontSize: 13, fontWeight: "400" as const, lineHeight: 18 },
  caption: { fontSize: 12, fontWeight: "500" as const, lineHeight: 16 },
  ipa: { fontSize: 22, fontWeight: "500" as const, lineHeight: 28 },
} as const;
