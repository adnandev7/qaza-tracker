/**
 * theme.ts — Qaza Tracker design system v3 (approved mockup system).
 * Emerald & ivory, Inter everywhere (no italics), sparse gold #C9A227.
 * Spacing scale is 4/8-based; every screen pulls from here — no ad-hoc values.
 */

import { Platform } from "react-native";

export const colors = {
  /** app background (inside screens) */
  ivory: "#F7F5EE",
  /** card surface */
  card: "#FFFFFF",
  /** page-level deep emerald (used sparingly behind heroes / tab bar) */
  deepEmerald: "#123B31",

  /** ink scale */
  ink: "#12251E",
  ink2: "#51635B",
  ink3: "#5E6E66", // AA on ivory (≈4.9:1)

  /** primary emerald */
  emerald: "#0E5F4B",
  emeraldBright: "#1D7A61",
  emeraldDeep: "#14654F",
  emeraldSoft: "#E7F0EC", // selected chip / soft fill
  emeraldBorder: "#CFE0D8",

  /** sparse gold accent — ONLY: CTA hairline, progress fill, selected chip
   *  border, streak star, active tab indicator. Nothing else. */
  gold: "#C9A227",

  /** warning (makruh chip) — used rarely */
  terracotta: "#B4533A",
  terracottaSoft: "#F6EAE4",

  border: "#E4E9E4",
  onHero: "#F4F1E6", // ivory text on emerald heroes
  onHeroMuted: "rgba(244, 241, 230, 0.78)",
} as const;

/** hero gradient — deep emerald mosque-garden card */
export const heroGradient = [colors.emerald, colors.emeraldDeep, colors.emeraldBright] as const;

/** 4/8-based spacing scale */
export const spacing = {
  xs: 4,
  s: 8,
  m: 12,
  l: 16,
  xl: 24,
  xxl: 32,
} as const;

/** one shared card padding / screen gutter / card gap */
export const layout = {
  screenGutter: 16,
  cardPadding: 16,
  cardGap: 12,
  cardRadius: 20,
  buttonRadius: 14,
  chipHeight: 32,
  tapTarget: 44,
  tabHeight: 56,
  /** floating tab bar (see (tabs)/_layout.tsx) */
  tabBarHeight: 64,
  tabBarFloat: 14,
} as const;

export const radii = {
  card: layout.cardRadius,
  button: layout.buttonRadius,
  chip: 999,
  input: 12,
} as const;

/** Font family names as registered by useFonts in app/_layout.tsx */
export const fonts = {
  /** Inter — the ONE Latin family (weights 300–700). */
  light: "Inter_300Light",
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semiBold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
  /** Scheherazade New — Arabic lines ONLY (Quran, hadith, niyyat).
   *  Traditional Indo-Pak mushaf style, the script Indian users know. */
  arabic: "ScheherazadeNew_400Regular",
} as const;

/** On web, react-native-web resolves the @expo-google-fonts families the same
 *  way; keep a single fallback chain so nothing silently falls to serif. */
const stack = (f: string) =>
  Platform.OS === "web" ? `${f.replace(/_/g, " ")}, -apple-system, "Segoe UI", Roboto, sans-serif` : f;

export const type = {
  /** eyebrow labels: 11px caps, wide tracking */
  eyebrow: {
    fontFamily: stack(fonts.semiBold),
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: "uppercase" as const,
    color: colors.ink3,
  },
  title: { fontFamily: stack(fonts.semiBold), fontSize: 22, color: colors.ink },
  heading: { fontFamily: stack(fonts.semiBold), fontSize: 17, color: colors.ink },
  body: {
    fontFamily: stack(fonts.regular),
    fontSize: 15,
    lineHeight: 23,
    color: colors.ink,
  },
  bodyMuted: {
    fontFamily: stack(fonts.regular),
    fontSize: 13.5,
    lineHeight: 20,
    color: colors.ink3,
  },
  button: { fontFamily: stack(fonts.semiBold), fontSize: 15 },
  /** big numerals — the hero moments */
  numeral: (size: number) => ({
    fontFamily: stack(fonts.bold),
    fontSize: size,
    color: colors.onHero,
    fontVariant: ["tabular-nums"] as const,
  }),
} as const;

/** shadows — green-tinted, very soft */
export const shadowCard = Platform.select({
  ios: {
    shadowColor: "#123B31",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
  },
  android: { elevation: 1 },
  web: {
    boxShadow: "0 4px 16px rgba(18, 59, 49, 0.08)",
  },
}) as object;
