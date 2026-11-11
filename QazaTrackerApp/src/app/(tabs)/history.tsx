import { View } from "react-native";
import { Card, Chip, Screen, SectionTitle, Small, H2 } from "@/components/ui";
import { PRAYERS_IN_ORDER, PRAYER_LABELS, PRAYER_SHORT } from "@/data/shariah";
import { useQaza, type QazaLogEntry } from "@/store/useQazaStore";
import { spacing } from "@/theme";

const fmt = (n: number) => n.toLocaleString("en-US");

export default function History() {
  const { log, done, profile } = useQaza();
  const totalQazas = Object.values(done).reduce((a, b) => a + b, 0);
  const name = profile?.name?.trim();

  return (
    <Screen>
      <Card>
        <SectionTitle eyebrow="Your progress" title="Qazas discharged" />
        <H2>{fmt(totalQazas)}</H2>
        <Small>
          {name ? `${name}, every qaza prayed is one less. InshaAllah, keep going.` : "Every qaza prayed is one less. InshaAllah, keep going."}
        </Small>
      </Card>

      <Card>
        <SectionTitle eyebrow="By salah" title="Where you stand" />
        <View style={styles.chipRow}>
          {PRAYERS_IN_ORDER.map((p) => (
            <Chip
              key={p}
              tone={(done[p] ?? 0) > 0 ? "emerald" : "neutral"}
              label={`${PRAYER_SHORT[p]} · ${fmt(done[p] ?? 0)} done`}
            />
          ))}
        </View>
      </Card>

      <Card>
        <SectionTitle eyebrow="Recent log" title="Your last prayers" />
        {log.length === 0 ? (
          <Small>Nothing yet. Your first qaza will appear here.</Small>
        ) : (
          log.slice(0, 50).map((e, i) => (
            <Small key={`${e.ts}-${i}`}>
              {fmtEntry(e)} · {PRAYER_LABELS[e.prayer]} · {e.rakats} rakats
            </Small>
          ))
        )}
      </Card>

      <Small style={{ textAlign: "center" }}>
        Your log lives only on this device and is never shared.
      </Small>
    </Screen>
  );
}

function fmtEntry(e: QazaLogEntry): string {
  const d = new Date(e.ts);
  return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const styles = { chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.s } as const };
