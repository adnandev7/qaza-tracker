/**
 * Welcome — the first-launch page, shown only while there is no profile.
 * Why qaza matters, in two authentic references, then straight into
 * onboarding. Once a profile exists the app opens on Home and this page
 * never nags again. The same references live on in the Masail tab.
 */

import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import {
  Body, Button, Card, Eyebrow, H1, KhatHero, Screen, SectionTitle, Small,
} from "@/components/ui";
import { WHY_QAZA } from "@/data/shariah";
import { colors, fonts, spacing } from "@/theme";

export default function Welcome() {
  return (
    <Screen padTop>
      <KhatHero>
        <Eyebrow style={{ color: colors.onHeroMuted }}>Qaza Tracker</Eyebrow>
        <H1 style={{ color: colors.onHero }}>As-salamu alaykum</H1>
        <Body style={{ color: colors.onHeroMuted }}>
          Your lifetime qaza (missed salah made up later), counted fairly and
          completed step by step, inshaAllah.
        </Body>
      </KhatHero>

      <Card>
        <SectionTitle eyebrow="Why it matters" title="A debt is repaid, not wished away" />
        <Small>
          A missed salah is a debt owed to Allah. Debts are not wished away;
          they are repaid, as soon as a person is able. That is what qaza is
          for. Two references carry the whole point:
        </Small>
        {WHY_QAZA.map((r) => (
          <View key={r.id} style={{ gap: spacing.xs }}>
            <Text style={styles.arabic}>{r.arabic}</Text>
            <Small>{r.text}</Small>
            <Small style={styles.source}>{r.source}</Small>
            {"note" in r && r.note ? <Small>{r.note}</Small> : null}
          </View>
        ))}
        <Small>
          Counted honestly and repaid steadily, the debt shrinks qaza by
          qaza. That is the whole work of this app.
        </Small>
      </Card>

      <Card>
        <SectionTitle eyebrow="How this app helps" title="Made for the long road" />
        <View style={{ gap: spacing.s }}>
          <Small>
            An honest count, worked out with the masail (rulings) of the
            Ahle Sunnat ulama, with a safety margin so you never under-count.
          </Small>
          <Small>
            Takhfeef (sanctioned lightening) keeps a big backlog prayable.
          </Small>
          <Small>
            A daily pace you choose, logged in one tap a day.
          </Small>
          <Small>
            Tarteeb (order) guidance while all six classes remain.
          </Small>
        </View>
        <Small style={styles.private}>Nothing leaves this device. No account, no cloud.</Small>
      </Card>

      <Button label="Begin" onPress={() => router.replace("/onboarding")} />
      <Small style={{ textAlign: "center" }}>
        It asks only a few questions, and your name so it can greet you.
      </Small>
    </Screen>
  );
}

const styles = StyleSheet.create({
  arabic: {
    fontFamily: fonts.arabic,
    fontSize: 20,
    lineHeight: 32,
    color: colors.ink,
    textAlign: "right",
    writingDirection: "rtl",
  },
  source: {
    fontFamily: fonts.semiBold,
    color: colors.emerald,
  },
  private: {
    fontFamily: fonts.semiBold,
    color: colors.emerald,
  },
});
