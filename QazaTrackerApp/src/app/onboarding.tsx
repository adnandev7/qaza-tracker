/**
 * Onboarding — asked ONCE, saved forever on-device (nothing uploaded).
 * Adaptive: males get a 4-step flow with no hayz content anywhere; females
 * get one extra step (hayz estimate). Every step shows progress dots
 * and a one-line "why we ask".
 *
 * Counting note: every day is counted at full resident rakats (20/day).
 * The old travel-years question was removed on purpose: most people cannot
 * honestly reconstruct which years they missed in safar, and full rakats is
 * the precautionary side (better an over-count than an under-count). The
 * safar ruling itself stays documented in the Masail tab.
 */

import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { computeBacklog, type QazaProfile } from "@/engine/QazaEngine";
import { setState } from "@/store/useQazaStore";
import { TermInfo } from "@/components/TermInfo";
import {
  Body, Button, Card, Chip, Choice, Eyebrow, H1, KhatHero, NumInput, Numeral,
  Screen, SectionTitle, Small, Stepper, TextField, Toggle,
} from "@/components/ui";
import { colors, spacing } from "@/theme";

type Draft = {
  name: string;
  gender: "male" | "female";
  age: number;
  bulughKnown: boolean;
  bulughAge?: number;
  yearsPrayedFully: number;
  hayzDaysPerMonth?: number;
  marginPercent: number;
};

const emptyDraft: Draft = {
  name: "",
  gender: "male",
  age: 25,
  bulughKnown: false,
  bulughAge: undefined,
  yearsPrayedFully: 0,
  hayzDaysPerMonth: 6,
  marginPercent: 5,
};

const bulughFallback = (g: "male" | "female") => (g === "male" ? 12 : 9);

type StepKey = "welcome" | "bulugh" | "hayz" | "history" | "result";

export default function Onboarding() {
  const router = useRouter();
  const [d, setD] = useState<Draft>(emptyDraft);

  const set = (patch: Partial<Draft>) => setD((p) => ({ ...p, ...patch }));
  const fallbackAge = bulughFallback(d.gender);

  // adaptive flow: the hayz step exists only for females
  const steps = useMemo<StepKey[]>(
    () =>
      (["welcome", "bulugh", d.gender === "female" ? "hayz" : null, "history", "result"].filter(
        Boolean
      ) as StepKey[]),
    [d.gender]
  );
  const [index, setIndex] = useState(0);
  const step = steps[index];
  const go = (dir: 1 | -1) => setIndex((i) => Math.min(steps.length - 1, Math.max(0, i + dir)));

  const profile: QazaProfile = {
    name: d.name.trim() || undefined,
    gender: d.gender,
    age: Math.max(0, d.age),
    bulughKnown: d.bulughKnown,
    bulughAge: d.bulughAge,
    yearsPrayedFully: Math.max(0, d.yearsPrayedFully),
    // no travel question anymore: full rakats every day (precautionary side)
    travelFraction: 0,
    hayzDaysPerMonth: d.gender === "female" ? d.hayzDaysPerMonth : undefined,
  };

  const preview = computeBacklog(profile, d.marginPercent);
  const fmt = (n: number) => n.toLocaleString("en-US");

  const header = (
    <View style={{ gap: spacing.s }}>
      <ProgressDots total={steps.length} current={index} onDot={setIndex} />
      <Eyebrow>Step {index + 1} of {steps.length}</Eyebrow>
    </View>
  );

  const back = index > 0 ? <Button label="Back" variant="ghost" onPress={() => go(-1)} /> : null;

  switch (step) {
    case "welcome":
      return (
        <Screen>
          {header}
          <KhatHero>
            <Eyebrow style={{ color: colors.onHeroMuted }}>Qaza Tracker</Eyebrow>
            <H1 style={{ color: colors.onHero }}>As-salamu alaykum</H1>
            <Body style={{ color: colors.onHeroMuted }}>
              Count your lifetime qaza (missed salah) and complete it, with
              the masail (rulings) of the Ahle Sunnat ulama.
            </Body>
          </KhatHero>

          <Card>
            <SectionTitle eyebrow="Your name" title="What should we call you?" />
            <TextField
              value={d.name}
              onChange={(v) => set({ name: v })}
              placeholder="Your name"
              maxLength={30}
            />
            <Small>
              Optional. It only lets the app greet you personally; nothing
              leaves this device.
            </Small>
          </Card>

          <Card>
            <SectionTitle eyebrow="Your gender" title="Which applies to you?" />
            <Choice
              value={d.gender}
              onChange={(v) => set({ gender: v as "male" | "female" })}
              options={[
                { label: "Male", value: "male" },
                { label: "Female", value: "female" },
              ]}
            />
            {d.gender === "female" && (
              <>
                <Small>
                  Hayz (menstruation) days are subtracted from your count.
                </Small>
                <TermInfo term="hayz" />
              </>
            )}
            <Small>We ask because a few counting rules depend on it.</Small>
          </Card>

          <Card>
            <SectionTitle eyebrow="Your age" title="How old are you?" />
            <NumInput value={d.age} onChange={(v) => set({ age: v })} suffix="years" />
            <Small>We count only from the age salah became fard on you.</Small>
          </Card>

          <Button label="Begin" onPress={() => go(1)} />
          <Small style={{ textAlign: "center" }}>
            Saved on your device forever. Nothing is uploaded.
          </Small>
        </Screen>
      );

    case "bulugh":
      return (
        <Screen>
          {header}
          <Card>
            <SectionTitle
              eyebrow="When it began"
              title="When did salah become fard on you?"
            />
            <Body>
              {d.gender === "male"
                ? "Boys typically reach bulugh (puberty) between 12 and 15 years."
                : "A girl reaches bulugh (puberty) at 9 years."}
            </Body>
            <TermInfo term="bulugh" />
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.m }}>
              <Toggle
                value={d.bulughKnown}
                onChange={(v) => set({ bulughKnown: v, bulughAge: v ? fallbackAge : undefined })}
              />
              <Small style={{ flex: 1 }}>I remember the age of bulugh</Small>
            </View>
            {d.bulughKnown ? (
              <NumInput
                value={d.bulughAge}
                onChange={(v) => set({ bulughAge: v })}
                suffix="years"
              />
            ) : (
              <Small>
                Not sure? Count from {fallbackAge}, the safe fallback for{" "}
                {d.gender === "male" ? "boys" : "girls"}. Better an over-count
                than an under-count.
              </Small>
            )}
          </Card>
          {back}
          <Button label="Next" onPress={() => go(1)} />
        </Screen>
      );

    case "hayz":
      return (
        <Screen>
          {header}
          <Chip label="Female · from step 1" tone="emerald" />
          <Card>
            <SectionTitle
              eyebrow="Hayz estimate"
              title="Your usual hayz days per month"
            />
            <Stepper
              value={d.hayzDaysPerMonth ?? 6}
              onChange={(v) => set({ hayzDaysPerMonth: v })}
              max={15}
              suffix="days"
            />
            <Small>
              Prayers missed during hayz are not owed, so we subtract them.
            </Small>
            <Small>
              Nifas (post-childbirth bleeding) is also exempt. If you had
              deliveries in these years, set the monthly estimate a little
              higher.
            </Small>
            <TermInfo term="nifas" />
          </Card>
          <Card>
            <Small>
              Estimates are fine. You can adjust this later in Settings.
            </Small>
          </Card>
          {back}
          <Button label="Next" onPress={() => go(1)} />
        </Screen>
      );

    case "history":
      return (
        <Screen>
          {header}
          <Card>
            <SectionTitle
              eyebrow="Your salah history"
              title="How many years did you pray regularly?"
            />
            <Stepper
              value={d.yearsPrayedFully}
              onChange={(v) => set({ yearsPrayedFully: v })}
              max={80}
              suffix="years"
            />
            <Small>
              Count only years in which you prayed all 5 salahs, every day.
              Not sure? Enter fewer; that keeps the count on the safe side.
            </Small>
            <TermInfo
              term="yearsPrayedFully"
              label="What does years prayed fully mean?"
            />
          </Card>
          <Card>
            <SectionTitle eyebrow="Safety margin" title="Add a little headroom?" />
            <Choice
              columns={2}
              value={String(d.marginPercent)}
              onChange={(v) => set({ marginPercent: parseInt(v, 10) })}
              options={[
                { label: "Exact (0%)", value: "0" },
                { label: "+5%", value: "5" },
                { label: "+10%", value: "10" },
                { label: "+20%", value: "20" },
              ]}
            />
            <Small>Better an over-count than an under-count.</Small>
          </Card>
          {back}
          <Button label="Recount" onPress={() => go(1)} />
        </Screen>
      );

    case "result":
      return (
        <Screen>
          {header}
          <Eyebrow>Alhamdulillah, no more questions</Eyebrow>
          <KhatHero>
            <Eyebrow style={{ color: colors.onHeroMuted }}>Your qaza count</Eyebrow>
            <View style={{ flexDirection: "row", alignItems: "baseline", gap: spacing.s }}>
              <Numeral size={44}>{fmt(preview.backlogDays)}</Numeral>
              <Body style={{ color: colors.onHero }}>days owed</Body>
            </View>
            <View style={{ flexDirection: "row", alignItems: "baseline", gap: spacing.s }}>
              <Numeral size={44}>{fmt(preview.breakdown.totalRakats)}</Numeral>
              <Body style={{ color: colors.onHero }}>rakats</Body>
            </View>
          </KhatHero>
          <Card>
            <Body>
              {preview.marginDays > 0
                ? `${fmt(preview.marginDays)} days added as your safety margin.`
                : "Counted exactly, no margin added."}
            </Body>
            <Small>
              Every day counts 20 rakats: 17 fard (obligatory) + 3 witr.
            </Small>
            <Small>“Better an over-count than an under-count.”</Small>
          </Card>
          {back}
          <Button
            label="Begin"
            onPress={() => {
              setState({ profile, marginPercent: d.marginPercent });
              router.replace("/(tabs)/home");
            }}
          />
        </Screen>
      );
  }
}

function ProgressDots({
  total,
  current,
  onDot,
}: {
  total: number;
  current: number;
  onDot: (i: number) => void;
}) {
  return (
    <View style={styles.dots}>
      {Array.from({ length: total }, (_, i) => (
        <Pressable
          key={i}
          disabled={i >= current}
          onPress={() => onDot(i)}
          style={[styles.dot, i === current && styles.dotCurrent, i < current && styles.dotDone]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  dots: { flexDirection: "row", gap: 8, paddingTop: spacing.xs },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  dotCurrent: { backgroundColor: colors.emerald, width: 20 },
  dotDone: { backgroundColor: colors.emeraldSoft },
});
