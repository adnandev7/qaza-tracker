/**
 * ui.tsx — v3 design-system primitives (emerald & ivory, Inter, sparse gold).
 * All screens compose from here; spacing/colors come from src/theme.ts only.
 */

import {
  Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View,
  type ScrollViewInstance,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, Path, Rect } from "react-native-svg";
import { useState, type ReactNode } from "react";
import { colors, fonts, layout, radii, shadowCard, spacing, type } from "@/theme";

/* ---------------------------------- Screen --------------------------------- */

export function Screen({
  children,
  style,
  scroll = true,
  scrollRef,
  padTop = false,
}: {
  children: ReactNode;
  style?: object;
  scroll?: boolean;
  /** Lets a screen glide its scroll position (e.g. back to top after a mark). */
  scrollRef?: React.RefObject<ScrollViewInstance | null>;
  /** Header-less screens (welcome, onboarding) must clear the status bar
   *  themselves; tab screens get top clearance from their navigator header. */
  padTop?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const inner = (
    // flex: 1 bounds this View to the safe area's height so the ScrollView
    // below actually scrolls; without it the body grows to content height
    // and everything below the fold is unreachable (body overflow is hidden).
    // padTop sits OUTSIDE the ScrollView so content never slides under the
    // status bar while scrolling.
    <View style={[styles.screenBody, padTop && { paddingTop: insets.top }, style]}>
      {scroll ? (
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: layout.tabBarHeight + layout.tabBarFloat + insets.bottom + 16 },
          ]}
          persistentScrollbar
          indicatorStyle="black"
        >
          {children}
        </ScrollView>
      ) : (
        children
      )}
    </View>
  );  return (
    <SafeAreaView style={styles.safe} edges={["left", "bottom", "right"]}>
      {inner}
    </SafeAreaView>
  );
}

/* ----------------------------------- Text ---------------------------------- */

export function Eyebrow({ children, style }: { children: ReactNode; style?: object }) {
  return <Text style={[styles.eyebrow, style]}>{children}</Text>;
}

export function H1({ children, style }: { children: ReactNode; style?: object }) {
  return <Text style={[styles.h1, style]}>{children}</Text>;
}

export function H2({ children, style }: { children: ReactNode; style?: object }) {
  return <Text style={[styles.h2, style]}>{children}</Text>;
}

export function Body({ children, style }: { children: ReactNode; style?: object }) {
  return <Text style={[styles.body, style]}>{children}</Text>;
}

export function Small({ children, style }: { children: ReactNode; style?: object }) {
  return <Text style={[styles.small, style]}>{children}</Text>;
}

/** Big tabular numerals — the hero moments (99,660). */
export function Numeral({
  children,
  size = 44,
  color,
}: {
  children: ReactNode;
  size?: number;
  color?: string;
}) {
  return (
    <Text style={[type.numeral(size), color ? { color } : null]}>{children}</Text>
  );
}

/* ----------------------------------- Card ---------------------------------- */

export function Card({
  children,
  style,
}: {
  children: ReactNode;
  style?: object;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

/** Section header: eyebrow + title in one rhythm. */
export function SectionTitle({
  eyebrow,
  title,
}: {
  eyebrow?: string;
  title: ReactNode;
}) {
  return (
    <View style={{ gap: spacing.xs }}>
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <H2>{title}</H2>
    </View>
  );
}

/* ---------------------------------- Button --------------------------------- */

export function Button({
  label,
  onPress,
  variant = "primary",
  disabled,
  icon,
  style,
}: {
  label: string;
  onPress?: () => void;
  variant?: "primary" | "ghost" | "gold";
  disabled?: boolean;
  icon?: ReactNode;
  style?: object;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        variant === "ghost"
          ? styles.buttonGhost
          : variant === "gold"
            ? styles.buttonGold
            : styles.buttonPrimary,
        pressed && styles.buttonPressed,
        disabled && styles.buttonDisabled,
        style,
      ]}
    >
      {icon}
      <Text
        style={
          variant === "ghost" ? styles.buttonGhostText : styles.buttonPrimaryText
        }
      >
        {label}
      </Text>
    </Pressable>
  );
}

/* ---------------------------------- Choice --------------------------------- */

export function Choice({
  options,
  value,
  onChange,
  columns = 2,
}: {
  options: { label: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
  /** 2 = side-by-side pills (gender), 3 = 3×2 chip grid (margin) */
  columns?: 2 | 3;
}) {
  return (
    <View style={styles.choiceGrid}>
      {options.map((o) => {
        const active = value === o.value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            style={[
              styles.choice,
              { flexGrow: 1, flexBasis: columns === 2 ? "47%" : "30%" },
              active && styles.choiceActive,
            ]}
          >
            <Text style={active ? styles.choiceLabelActive : styles.choiceLabel}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/* --------------------------------- Stepper --------------------------------- */

export function Stepper({
  value,
  onChange,
  max = 90,
  suffix,
}: {
  value: number;
  onChange: (v: number) => void;
  max?: number;
  suffix?: string;
}) {
  const dec = () => onChange(Math.max(0, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));
  return (
    <View style={styles.stepperRow}>
      <Pressable onPress={dec} style={styles.stepBtn} hitSlop={8}>
        <Text style={styles.stepBtnText}>−</Text>
      </Pressable>
      <Text style={styles.stepValue}>
        {value}
        {suffix ? ` ${suffix}` : ""}
      </Text>
      <Pressable onPress={inc} style={styles.stepBtn} hitSlop={8}>
        <Text style={styles.stepBtnText}>+</Text>
      </Pressable>
    </View>
  );
}

export function NumInput({
  value,
  onChange,
  placeholder,
  suffix,
}: {
  value: number | undefined;
  onChange: (v: number) => void;
  placeholder?: string;
  suffix?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View
      style={[styles.numRow, focused && styles.numRowFocused]}
      testID="qaza-num-field"
    >
      <TextInput
        keyboardType="number-pad"
        value={value === undefined ? "" : String(value)}
        onChangeText={(t) => {
          const n = parseInt(t.replace(/[^0-9]/g, ""), 10);
          onChange(Number.isFinite(n) ? n : (undefined as unknown as number));
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        placeholderTextColor={colors.ink3}
        style={styles.num}
      />
      {suffix ? <Text style={styles.suffix}>{suffix}</Text> : null}
    </View>
  );
}

/** Single-line text field (name etc.) — same frame as NumInput. */
export function TextField({
  value,
  onChange,
  placeholder,
  maxLength,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[styles.numRow, focused && styles.numRowFocused]}>
      <TextInput
        value={value}
        onChangeText={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        placeholderTextColor={colors.ink3}
        maxLength={maxLength}
        autoCapitalize="words"
        autoCorrect={false}
        style={styles.num}
      />
    </View>
  );
}

export function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <Switch
      value={value}
      onValueChange={onChange}
      trackColor={{ false: colors.emeraldSoft, true: colors.emerald }}
      thumbColor="#FFFFFF"
      ios_backgroundColor={colors.emeraldSoft}
    />
  );
}

/** Labelled control group (eyebrow label + control). */
export function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={{ gap: spacing.s }}>
      <Text style={styles.rowLabel}>{label}</Text>
      {children}
    </View>
  );
}

/* ----------------------------------- Chip ---------------------------------- */

export function Chip({
  label,
  tone = "neutral",
  icon,
}: {
  label: string;
  tone?: "neutral" | "emerald" | "gold" | "warn";
  icon?: ReactNode;
}) {
  const toneStyles: Record<
    "neutral" | "emerald" | "gold" | "warn",
    { box: object; text: object }
  > = {
    neutral: { box: styles.chip_neutral, text: styles.chipText_neutral },
    emerald: { box: styles.chip_emerald, text: styles.chipText_emerald },
    gold: { box: styles.chip_gold, text: styles.chipText_gold },
    warn: { box: styles.chip_warn, text: styles.chipText_warn },
  };
  return (
    <View style={[styles.chip, toneStyles[tone].box]}>
      {icon}
      <Text style={[styles.chipText, toneStyles[tone].text]}>{label}</Text>
    </View>
  );
}

/* -------------------------------- ProgressBar ------------------------------ */

export function ProgressBar({ fraction }: { fraction: number }) {
  const pct = Math.min(100, Math.max(0, fraction * 100));
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${Math.max(pct, 1.2)}%` }]} />
    </View>
  );
}

/* ------------------------------- KhatHero ---------------------------------- */

/** The signature emerald "khat hero": mosque-skyline gradient card with a
 *  gold crescent — one per major screen. Content renders above the skyline. */
export function KhatHero({
  children,
  style,
}: {
  children: ReactNode;
  style?: object;
}) {
  return (
    <View style={[styles.heroWrap, style]}>
      <LinearGradient
        colors={[colors.emerald, colors.emeraldDeep, colors.emeraldBright]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroGradient}
      >
        <Skyline />
        <Crescent />
        <View style={styles.heroContent}>{children}</View>
      </LinearGradient>
    </View>
  );
}

/** Hand-drawn geometric mosque skyline (domes + minarets), gold at low opacity. */
function Skyline() {
  return (
    <Svg
      style={StyleSheet.absoluteFill}
      viewBox="0 0 320 120"
      preserveAspectRatio="xMaxYMax slice"
    >
      <Rect x="0" y="88" width="320" height="32" fill={colors.gold} opacity={0.16} />
      {/* central dome */}
      <Path
        d="M160 62 q-26 0 -26 26 h52 q0 -26 -26 -26 Z"
        fill={colors.gold}
        opacity={0.28}
      />
      <Rect x="154" y="52" width="12" height="4" fill={colors.gold} opacity={0.28} />
      {/* left dome */}
      <Path d="M96 74 q-18 0 -18 18 h36 q0 -18 -18 -18 Z" fill={colors.gold} opacity={0.2} />
      {/* right dome */}
      <Path d="M228 74 q-18 0 -18 18 h36 q0 -18 -18 -18 Z" fill={colors.gold} opacity={0.2} />
      {/* minarets */}
      <Rect x="66" y="44" width="6" height="48" rx="3" fill={colors.gold} opacity={0.22} />
      <Circle cx="69" cy="42" r="4" fill={colors.gold} opacity={0.22} />
      <Rect x="252" y="44" width="6" height="48" rx="3" fill={colors.gold} opacity={0.22} />
      <Circle cx="255" cy="42" r="4" fill={colors.gold} opacity={0.22} />
    </Svg>
  );
}

function Crescent() {
  return (
    <Svg width={26} height={26} style={styles.crescent}>
      <Path
        d="M20 13 a10.5 10.5 0 1 1 -10.5 -10.5 a8.5 8.5 0 1 0 10.5 10.5 Z"
        fill={colors.gold}
        opacity={0.75}
      />
    </Svg>
  );
}

/* ------------------------------- Expandable -------------------------------- */

export function Expandable({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <View>
      <Pressable
        onPress={() => setOpen(!open)}
        style={({ pressed }) => [styles.expandHeader, pressed && { opacity: 0.7 }]}
        hitSlop={4}
      >
        <Text style={styles.expandTitle}>{title}</Text>
        <Text style={styles.expandChevron}>{open ? "⌃" : "⌄"}</Text>
      </Pressable>
      {open ? <View style={styles.expandBody}>{children}</View> : null}
    </View>
  );
}

/* --------------------------------- Divider --------------------------------- */

export function Divider() {
  return <View style={styles.divider} />;
}

/* --------------------------------- Accordion --------------------------------
 * FAQ-style expandable card: semibold question, circled +/− on the right,
 * muted answer inside (design refs: minimal agency FAQ patterns). */

export function Accordion({
  question,
  children,
  defaultOpen = false,
}: {
  question: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <View style={styles.card}>
      <Pressable
        onPress={() => setOpen(!open)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        style={({ pressed }) => [styles.faqHeader, pressed && { opacity: 0.7 }]}
      >
        <Text style={styles.faqQuestion}>{question}</Text>
        <View style={styles.faqBadge}>
          <Text style={styles.faqBadgeText}>{open ? "\u2212" : "+"}</Text>
        </View>
      </Pressable>
      {open ? <View style={styles.faqBody}>{children}</View> : null}
    </View>
  );
}

/* ---------------------------------- Styles --------------------------------- */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.ivory },
  screenBody: { flex: 1, gap: layout.cardGap },
  content: {
    padding: layout.screenGutter,
    gap: layout.cardGap,
    // bottom clearance for the floating tab bar is applied inline in Screen
    // (it needs the device's safe-area inset)
    maxWidth: 560,
    width: "100%",
    alignSelf: "center",
  },

  eyebrow: { ...type.eyebrow },
  h1: { ...type.title, fontWeight: undefined },
  h2: { ...type.heading },
  body: { ...type.body },
  small: { ...type.bodyMuted },

  card: {
    backgroundColor: colors.card,
    borderRadius: radii.card,
    padding: layout.cardPadding,
    gap: spacing.m,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadowCard,
  },

  button: {
    borderRadius: radii.button,
    minHeight: layout.tapTarget,
    paddingHorizontal: spacing.l,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.s,
  },
  buttonPrimary: {
    backgroundColor: colors.emerald,
    borderWidth: 1,
    borderColor: "rgba(201, 162, 39, 0.55)", // sparse gold hairline on CTA
  },
  buttonGold: { backgroundColor: colors.gold },
  buttonGhost: {
    backgroundColor: colors.emeraldSoft,
    borderWidth: 1,
    borderColor: colors.emeraldBorder,
  },
  buttonPressed: { opacity: 0.78 },
  buttonDisabled: { opacity: 0.4 },
  buttonPrimaryText: { color: "#FFFFFF", ...type.button },
  buttonGhostText: { color: colors.emerald, ...type.button },

  choiceGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.s },
  choice: {
    minHeight: layout.tapTarget,
    paddingHorizontal: spacing.m,
    paddingVertical: 12,
    borderRadius: radii.button,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  choiceActive: {
    backgroundColor: colors.emerald,
    borderColor: colors.gold,
    borderWidth: 1.5,
  },
  choiceLabel: {
    color: colors.ink2,
    fontFamily: fonts.medium,
    fontSize: 15,
    textAlign: "center",
  },
  choiceLabelActive: {
    color: "#FFFFFF",
    fontFamily: fonts.semiBold,
    fontSize: 15,
    textAlign: "center",
  },

  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.m,
  },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: radii.input,
    backgroundColor: colors.emeraldSoft,
    borderWidth: 1,
    borderColor: colors.emeraldBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  stepBtnText: { fontSize: 22, color: colors.emerald, fontFamily: fonts.medium },
  stepValue: {
    minWidth: 72,
    textAlign: "center",
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.ink,
    fontVariant: ["tabular-nums"] as const,
  },

  numRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.s,
    backgroundColor: colors.card,
    borderRadius: radii.input,
    borderWidth: 1.5,
    borderColor: colors.border,
    minHeight: 48,
    paddingHorizontal: spacing.m,
  },
  numRowFocused: { borderColor: colors.emerald },
  num: {
    flex: 1,
    // lets the input shrink on narrow screens instead of pushing the suffix
    // past the field border (browsers give <input> an intrinsic min width)
    minWidth: 0,
    fontSize: 17,
    paddingVertical: 12,
    color: colors.ink,
    fontFamily: fonts.medium,
    fontVariant: ["tabular-nums"] as const,
  },
  suffix: {
    color: colors.ink3,
    fontSize: 13,
    fontFamily: fonts.regular,
    flexShrink: 1,
  },

  chip: {
    height: layout.chipHeight,
    paddingHorizontal: spacing.m,
    borderRadius: radii.chip,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.xs,
    alignSelf: "flex-start",
  },
  chip_neutral: { backgroundColor: colors.ivory, borderWidth: 1, borderColor: colors.border },
  chip_emerald: { backgroundColor: colors.emeraldSoft, borderWidth: 1, borderColor: colors.emeraldBorder },
  chip_gold: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.gold },
  chip_warn: { backgroundColor: colors.terracottaSoft, borderWidth: 1, borderColor: colors.terracotta },
  chipText: { fontFamily: fonts.medium, fontSize: 12.5 },
  chipText_neutral: { color: colors.ink2 },
  rowLabel: { ...type.eyebrow },
  chipText_emerald: { color: colors.emerald, fontFamily: fonts.semiBold },
  chipText_gold: { color: colors.emerald, fontFamily: fonts.semiBold },
  chipText_warn: { color: colors.terracotta, fontFamily: fonts.semiBold },

  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.22)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: colors.gold,
  },

  heroWrap: {
    borderRadius: radii.card,
    overflow: "hidden",
    ...shadowCard,
  },
  heroGradient: {
    paddingHorizontal: layout.cardPadding + 2,
    paddingVertical: layout.cardPadding + 4,
  },
  heroContent: { gap: spacing.s },
  crescent: { position: "absolute", top: 14, right: 14 },

  expandHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: layout.chipHeight,
    paddingVertical: spacing.xs,
  },
  expandTitle: { color: colors.emerald, fontFamily: fonts.semiBold, fontSize: 13.5 },
  expandChevron: { color: colors.emerald, fontFamily: fonts.regular, fontSize: 15 },
  expandBody: { gap: spacing.m, paddingTop: spacing.xs },

  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.m,
    minHeight: layout.chipHeight,
  },
  faqQuestion: {
    flex: 1,
    color: colors.ink,
    fontFamily: fonts.semiBold,
    fontSize: 15.5,
    lineHeight: 21,
  },
  faqBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.emerald,
    alignItems: "center",
    justifyContent: "center",
  },
  faqBadgeText: {
    color: colors.emerald,
    fontFamily: fonts.semiBold,
    fontSize: 15,
    lineHeight: 17,
    marginTop: -1,
  },
  faqBody: { gap: spacing.s },

  divider: { height: 1, backgroundColor: colors.border },
});

export { StyleSheet };
