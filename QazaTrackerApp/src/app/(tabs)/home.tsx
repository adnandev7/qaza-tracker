import { View } from "react-native";
import {
  Body, Card, Chip, Eyebrow, KhatHero, Numeral, ProgressBar, Screen,
  SectionTitle, Small, H2,
} from "@/components/ui";
import {
  NIYYAT,
  PRAYERS_IN_ORDER,
  PRAYER_LABELS,
  type Prayers,
} from "@/data/shariah";
import { estimateCompletionDays } from "@/engine/QazaEngine";
import { useBacklog, useQaza } from "@/store/useQazaStore";
import { colors, spacing } from "@/theme";

const fmt = (n: number) => n.toLocaleString("en-US");

export default function Home() {
  const { backlog, rows } = useBacklog();
  const { rakatsPerDayPace, profile, niyyatStyle } = useQaza();

  if (!backlog || !profile) {
    return (
      <Screen>
        <H2>Qaza Tracker</H2>
        <Body>No profile yet. Complete the onboarding first.</Body>
      </Screen>
    );
  }

  const doneRakats = rows.reduce((sum, r) => sum + r.done * r.rakatsResident, 0);
  const remainingRakats = Math.max(0, backlog.breakdown.totalRakats - doneRakats);
  const etaDays = estimateCompletionDays(remainingRakats, rakatsPerDayPace);
  const helper =
    niyyatStyle === "latestFirst" ? NIYYAT.latestFirst : NIYYAT.earliestFirst;

  const firstOutstanding = PRAYERS_IN_ORDER.find(
    (p) => (rows.find((r) => r.prayer === p)?.remaining ?? 0) > 0
  ) as Prayers | undefined;
  const firstRow = firstOutstanding
    ? rows.find((r) => r.prayer === firstOutstanding)
    : undefined;

  return (
    <Screen>
      <KhatHero>
        <Eyebrow style={{ color: colors.onHeroMuted }}>
          {profile.name?.trim()
            ? `Assalamu alaikum, ${profile.name.trim()}`
            : "Your qaza balance"}
        </Eyebrow>
        <View style={{ flexDirection: "row", alignItems: "baseline", gap: spacing.s }}>
          <Numeral size={46}>{fmt(remainingRakats)}</Numeral>
          <Body style={{ color: colors.onHero }}>rakats remaining</Body>
        </View>
        <ProgressBar fraction={backlog.breakdown.totalRakats ? doneRakats / backlog.breakdown.totalRakats : 0} />
        <Small style={{ color: colors.onHeroMuted }}>
          {fmt(doneRakats)} of {fmt(backlog.breakdown.totalRakats)} rakats completed
        </Small>
      </KhatHero>

      <Card>
        <SectionTitle eyebrow="Today's plan" title={`${rakatsPerDayPace} rakats a day`} />
        <Body>
          At this pace your qaza finishes in about {(etaDays / 365).toFixed(1)} years.
          InshaAllah, step by step.
        </Body>
        {firstOutstanding && (
          <Chip
            tone="emerald"
            label={`${PRAYER_LABELS[firstOutstanding]} · ${fmt(firstRow?.remaining ?? 0)} qazas left`}
          />
        )}
      </Card>

      {firstOutstanding && firstRow && (
        <Card>
          <SectionTitle eyebrow="Niyyat" title={`Your ${PRAYER_LABELS[firstOutstanding]} niyyat`} />
          <Body>{helper.qazaSpecific(PRAYER_LABELS[firstOutstanding])}</Body>
          <Small>
            {helper === NIYYAT.latestFirst
              ? "Newest-first mode."
              : "Earliest-first: each prayed qaza makes the next one the “first”."}
          </Small>
        </Card>
      )}
      <Small style={{ textAlign: "center" }}>
        This app is an aid, not a mufti. For doubts, ask a mufti.
      </Small>
    </Screen>
  );
}
