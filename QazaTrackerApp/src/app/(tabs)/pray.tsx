/**
 * Pray — the core companion screen, kept minimal:
 * pick salah → read niyyat → (takhfeef collapsed by default) → mark done.
 * Every mark answers two questions at once: what is left of this salah, and
 * what is left of the whole journey. The celebration card (gold star, gold
 * progress hairline) slides in and the page glides back to the top, so
 * picking the next qaza is one glance away. A one-tap "daily set" logs a
 * full day (Fajr → Witr) in order for when tapping six times feels heavy.
 * The makruh windows and myth warnings live in the Masail tab.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated, Easing, StyleSheet, Text, View,
  type ScrollViewInstance,
} from "react-native";
import {
  Body, Button, Card, Chip, Divider, Expandable, KhatHero, Screen,
  SectionTitle, Small, Toggle,
} from "@/components/ui";
import {
  FARD_RAKATS,
  NIYYAT,
  PRAYERS_IN_ORDER,
  PRAYER_SHORT,
  RESIDENT_DAY_RAKATS,
  TAKHFEEF,
  WITR_RAKATS,
  niyyatArabic,
  type Prayers,
} from "@/data/shariah";
import { markQazaDone, markSetDone, useBacklog, useQaza } from "@/store/useQazaStore";
import { TermInfo } from "@/components/TermInfo";
import { colors, fonts, radii, spacing } from "@/theme";

const residentRakats: Record<Prayers, number> = {
  ...FARD_RAKATS,
  witr: WITR_RAKATS,
};

const fmt = (n: number) => n.toLocaleString("en-US");

/** The celebration shown after a mark. `progress` (0..1) drives the gold
 *  hairline; `warn` is a tarteeb note in a second box (the mark itself
 *  still succeeded); `warnOnly` switches to the warning palette (nothing
 *  was logged). */
type Celebrate = {
  title: string;
  lines: string[];
  progress?: number;
  warn?: string;
  warnOnly?: boolean;
};

/** Celebration card: fades and floats in, star and all. Remounts on every
 *  mark (keyed by the parent), so the entrance always plays. */
function CelebrateCard({ c }: { c: Celebrate }) {
  const anim = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 320,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [anim]);

  return (
    <Animated.View
      style={[
        styles.toast,
        c.warnOnly && styles.toastWarn,
        {
          opacity: anim,
          transform: [
            { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) },
          ],
        },
      ]}
      accessibilityLiveRegion="polite"
    >
      <View style={styles.toastHead}>
        {!c.warnOnly && <Text style={styles.toastStar}>✦</Text>}
        <Text style={[styles.toastTitle, c.warnOnly && styles.toastTitleWarn]}>
          {c.title}
        </Text>
      </View>
      {typeof c.progress === "number" && !c.warnOnly && (
        <View style={styles.toastTrack}>
          <View style={[styles.toastFill, { width: `${Math.round(c.progress * 100)}%` }]} />
        </View>
      )}
      {c.lines.map((line, i) => (
        <Text key={i} style={styles.toastLine}>
          {line}
        </Text>
      ))}
      {c.warn ? (
        <View style={styles.toastWarnBox}>
          <Text style={styles.toastLine}>{c.warn}</Text>
        </View>
      ) : null}
    </Animated.View>
  );
}

export default function Pray() {
  const { backlog, rows, warningNext } = useBacklog();
  const { profile, niyyatStyle, rakatsPerDayPace } = useQaza();
  const [selected, setSelected] = useState<Prayers>("fajr");
  const [takhfeef, setTakhfeef] = useState(true);
  const [celebrate, setCelebrate] = useState<Celebrate | null>(null);
  const scrollRef = useRef<ScrollViewInstance | null>(null);
  // remounts the celebration card so its entrance animation replays
  const [celebrateKey, setCelebrateKey] = useState(0);

  const helper =
    niyyatStyle === "latestFirst" ? NIYYAT.latestFirst : NIYYAT.earliestFirst;
  const row = rows.find((r) => r.prayer === selected);
  const name = profile?.name?.trim();
  const withName = name ? `, ${name}` : "";

  /** one full day-set per tap, rounded from the daily pace */
  const sets = Math.max(1, Math.round(rakatsPerDayPace / RESIDENT_DAY_RAKATS));

  const showAndGlideUp = (c: Celebrate) => {
    setCelebrate(c);
    setCelebrateKey((k) => k + 1);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const onMarkDone = () => {
    if (!backlog || !row || row.remaining <= 0) {
      showAndGlideUp({
        title: "Nothing logged",
        lines: [
          row
            ? `All ${PRAYER_SHORT[selected]} qazas are already discharged.`
            : "Set up your profile first; the count starts on Home.",
        ],
        warnOnly: true,
      });
      return;
    }
    const rakats = residentRakats[selected];
    // captured before the mark so the numbers describe this exact qaza
    const doneRakatsBefore = rows.reduce(
      (sum, r) => sum + r.done * r.rakatsResident,
      0
    );
    const warning = markQazaDone(selected, rakats);
    const total = backlog.breakdown.totalRakats;
    showAndGlideUp({
      title: `Alhamdulillah, ${rakats} rakats logged${withName}.`,
      progress: Math.min(1, (doneRakatsBefore + rakats) / total),
      lines: [
        `${PRAYER_SHORT[selected]} qazas left: ${fmt(Math.max(0, row.remaining - 1))}`,
        `Total remaining: ${fmt(Math.max(0, total - (doneRakatsBefore + rakats)))} rakats.`,
        "Every qaza prayed is one less. InshaAllah, keep going.",
      ],
      warn: warning ?? undefined,
    });
  };

  const onMarkSet = () => {
    const result = markSetDone(sets);
    if (!result || result.logged === 0 || !backlog) {
      showAndGlideUp({
        title: "Nothing logged",
        lines: ["No qazas are owed right now."],
        warnOnly: true,
      });
      return;
    }
    const total = backlog.breakdown.totalRakats;
    showAndGlideUp({
      title: `Alhamdulillah, ${result.rakats} rakats logged${withName}.`,
      progress: Math.min(1, (total - result.remainingRakats) / total),
      lines: [
        `${fmt(result.logged)} qazas logged (${sets} full day${sets > 1 ? "s" : ""} in order)`,
        `Total remaining: ${fmt(result.remainingRakats)} rakats.`,
        "Every qaza prayed is one less. InshaAllah, keep going.",
      ],
    });
  };

  return (
    <Screen scrollRef={scrollRef}>
      <KhatHero>
        <SectionTitle
          eyebrow="Qaza session"
          title={
            <Text style={{ color: colors.onHero }}>
              {PRAYER_SHORT[selected]} · qaza {fmt((row?.done ?? 0) + 1)}
            </Text>
          }
        />
        {row && (
          <Small style={{ color: colors.onHeroMuted }}>
            {row.rakatsResident} rakats
          </Small>
        )}
      </KhatHero>

      {celebrate && <CelebrateCard key={celebrateKey} c={celebrate} />}

      <Card>
        <SectionTitle eyebrow="Which salah?" title="Pick what you are praying" />
        <View style={styles.grid}>
          {PRAYERS_IN_ORDER.map((p) => {
            const active = selected === p;
            return (
              <Button
                key={p}
                label={`${PRAYER_SHORT[p]} ${residentRakats[p]}`}
                variant={active ? "primary" : "ghost"}
                onPress={() => setSelected(p)}
                style={{ flexBasis: "30%" }}
              />
            );
          })}
        </View>
        {row && <Small>{fmt(row.remaining)} qazas outstanding</Small>}
      </Card>

      <Card>
        <SectionTitle eyebrow="Niyyat · say it from the heart" title="Your intention" />
        <Text style={styles.arabic}>
          {niyyatArabic(selected, niyyatStyle)}
        </Text>
        {row && <Body>{helper.qazaSpecific(PRAYER_SHORT[selected])}</Body>}
        <Small>Saying it aloud is mustahab (recommended), not required.</Small>
      </Card>

      <Card>
        <View style={styles.takhfeefRow}>
          <Chip label="Takhfeef · easier prayer" tone="emerald" />
          <Toggle value={takhfeef} onChange={setTakhfeef} />
        </View>
        <Small>
          Sanctioned lightening for a big qaza. It is not rushing: the
          stillness of ruku (bowing), sujud (prostration) and jalsa (the
          sitting between) stays wajib (required).
        </Small>
        <TermInfo term="takhfeef" />
        {takhfeef && (
          <Expandable title="Learn more: the 5 rulings">
            {TAKHFEEF.map((t) => (
              <View key={t.id} style={{ gap: spacing.xs }}>
                <Body style={{ fontFamily: fonts.semiBold }}>{t.title}</Body>
                <Small>{t.detail}</Small>
              </View>
            ))}
            <Divider />
            <Small>
              Arkaan (essential acts) are never shortened: ruku, sujud and
              jalsa stillness stay wajib.
            </Small>
          </Expandable>
        )}
      </Card>

      <Button label={`Mark ${PRAYER_SHORT[selected]} done`} onPress={onMarkDone} />
      <Button
        label={`Mark daily set done · ${sets * RESIDENT_DAY_RAKATS} rakats`}
        variant="ghost"
        onPress={onMarkSet}
      />
      <Small style={{ textAlign: "center" }}>
        One tap logs {sets} full day{sets > 1 ? "s" : ""} in order: Fajr →
        Zuhr → Asr → Maghrib → Isha → Witr.
      </Small>
      {warningNext && <Small>{warningNext}</Small>}
      <Small style={{ textAlign: "center" }}>
        Keep the order Fajr → Zuhr → Asr → Maghrib → Isha → Witr while six
        qazas are outstanding.
      </Small>
      <TermInfo term="tarteeb" align="center" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.s,
    justifyContent: "space-between",
  },
  arabic: {
    fontFamily: fonts.arabic,
    fontSize: 24,
    // Nastaleeq carries its own tall metrics; no explicit lineHeight
    color: colors.ink,
    textAlign: "right",
    writingDirection: "rtl",
  },
  takhfeefRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toast: {
    backgroundColor: colors.emeraldSoft,
    borderWidth: 1,
    borderColor: colors.emeraldBorder,
    borderRadius: radii.card,
    padding: spacing.l,
    gap: spacing.s,
  },
  toastWarn: {
    backgroundColor: colors.terracottaSoft,
    borderColor: colors.terracotta,
  },
  toastHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.s,
  },
  toastStar: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.gold,
  },
  toastTitle: {
    flex: 1,
    fontFamily: fonts.semiBold,
    fontSize: 16,
    lineHeight: 23,
    color: colors.emerald,
  },
  toastTitleWarn: {
    color: colors.terracotta,
  },
  toastTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: colors.emeraldBorder,
    overflow: "hidden",
  },
  toastFill: {
    height: 6,
    borderRadius: 999,
    backgroundColor: colors.gold,
  },
  toastLine: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    color: colors.ink2,
  },
  toastWarnBox: {
    backgroundColor: colors.terracottaSoft,
    borderWidth: 1,
    borderColor: colors.terracotta,
    borderRadius: radii.input,
    padding: spacing.s,
  },
});
