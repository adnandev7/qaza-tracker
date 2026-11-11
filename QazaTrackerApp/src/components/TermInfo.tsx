/**
 * TermInfo — a quiet "what does this mean?" affordance that expands a short
 * inline note about a fiqh term. v3 system styling: Inter only (no italics),
 * soft emerald fill, 12pt radius, upright "i" badge that fills when open.
 * Copy lives in TERMS (shariah.ts) so rulings stay centralized; the ui.tsx
 * primitives stay data-free.
 */

import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { TERMS, type TermKey } from "@/data/shariah";
import { colors, fonts, radii, spacing } from "@/theme";

export function TermInfo({
  term,
  align = "start",
  label,
}: {
  term: TermKey;
  align?: "start" | "center";
  /** Overrides the default "What does <term> mean?" trigger text. */
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ gap: spacing.s }}>
      <Pressable
        onPress={() => setOpen(!open)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        hitSlop={6}
        style={({ pressed }) => [
          styles.row,
          align === "center" && styles.rowCenter,
          pressed && { opacity: 0.65 },
        ]}
      >
        <View style={[styles.badge, open && styles.badgeOpen]}>
          <Text style={[styles.badgeText, open && styles.badgeTextOpen]}>
            i
          </Text>
        </View>
        <Text style={styles.label}>
          {open ? "Hide" : label ?? `What does ${term} mean?`}
        </Text>
      </Pressable>
      {open ? (
        <View style={styles.panel}>
          <Text style={styles.panelText}>{TERMS[term].text}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.s,
    alignSelf: "flex-start",
  },
  rowCenter: { alignSelf: "center" },
  badge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.emeraldSoft,
    borderWidth: 1,
    borderColor: colors.emeraldBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeOpen: {
    backgroundColor: colors.emerald,
    borderColor: colors.emerald,
  },
  badgeText: {
    color: colors.emerald,
    fontFamily: fonts.semiBold,
    fontSize: 11,
    lineHeight: 12,
    textAlign: "center",
  },
  badgeTextOpen: { color: "#FFFFFF" },
  label: {
    color: colors.emerald,
    fontFamily: fonts.semiBold,
    fontSize: 13,
    lineHeight: 18,
  },
  panel: {
    backgroundColor: colors.emeraldSoft,
    borderWidth: 1,
    borderColor: colors.emeraldBorder,
    borderRadius: radii.input,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.m,
  },
  panelText: {
    color: colors.ink2,
    fontFamily: fonts.regular,
    fontSize: 13.5,
    lineHeight: 21,
  },
});
