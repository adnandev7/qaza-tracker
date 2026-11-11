/**
 * Masail & Guidance — the fiqh reference tab, presented as an FAQ:
 * grouped questions, one card per question, collapsed by default
 * (tap to open). Rulings worded universally (per app-wide copy rule);
 * full scholar citations stay in the internal docs (docs/shariah-basis.md),
 * not in user-facing screens.
 */

import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import type { ReactNode } from "react";
import {
  Accordion, Body, Card, Chip, Divider, Expandable, Eyebrow, Screen,
  SectionTitle, Small,
} from "@/components/ui";
import {
  CITATIONS,
  MAKRUH_WINDOWS,
  MYTH_WARNINGS,
  SOURCE_VIDEOS,
  TAKHFEEF,
  WHY_QAZA,
} from "@/data/shariah";
import { colors, fonts, spacing } from "@/theme";

/** FAQ groups. Each answer keeps the audited fiqh copy; titles are phrased
 *  the way a person would actually ask. */
const BASICS: { q: string; a: string }[] = [
  {
    q: "What exactly has to be made up?",
    a: "Qaza is of the fard (obligatory) rakats of the 5 salahs plus the witr (wajib, required). Fajr 2, Zuhr 4, Asr 4, Maghrib 3, Isha 4 fard, plus Isha's 3 witr. Total per missed resident day: 20 rakats. No qaza of sunnah or nafl.",
  },
  {
    q: "I do not remember when salah became fard on me. From when do I count?",
    a: "If you do not remember when salah became fard (obligatory) on you, count from age 12 (boys) / 9 (girls) as a precaution. These ages follow the lunar calendar; the app counts plain calendar years, and the safety margin covers the difference. For women, hayz (menstruation) and nifas (post-childbirth bleeding) days are subtracted.",
  },
  {
    q: "What if a salah was missed on purpose?",
    a: "If a salah was skipped knowingly, the qaza is owed, and tauba (repentance) is required. Salah missed because of sleep or forgetfulness is only a qaza, with no sin attached. Qaza itself is the only kaffara (expiation) the Shariah gave (Bukhari 1/84, Muslim 1/241).",
  },
  {
    q: "How quickly must the qaza be prayed?",
    a: "Delaying the qaza without excuse is itself a sin. Begin today, step by step; if death comes before completion, the niyyat and the effort are with Allah.",
  },
  {
    q: "Do Eid, Tarawih or Jumma have a qaza?",
    a: "Eid and Tarawih have no qaza once their waqt (prescribed time) passes (skipping Eid deliberately is a sin and needs tauba). If Jumma was missed, its qaza is not owed. But if the Zuhr of that day was also missed, the qaza of that Zuhr is owed. Fajr's sunnah (the 2 rakats before Fajr) has no wajib qaza; praying it after sunrise until zawal (the sun's zenith) is mustahab (recommended).",
  },
  {
    q: "I accepted Islam as an adult. From when does my count begin?",
    a: "Salah became fard only from bulugh. For an adult revert, the count begins from the day of Islam, not before.",
  },
];

const TRAVEL: { q: string; a: string }[] = [
  {
    q: "I missed salah while travelling. How is it counted?",
    a: "A salah that lapsed while you were a musafir (a traveler under shariah rules) is a 2-rakat qaza (for the 4-rakat fard salahs) even if you pray it while resident. A salah that lapsed while resident is a 4-rakat qaza even if prayed on the road. A fully lapsed travel day = 14 rakats (Fajr 2 + Zuhr 2 + Asr 2 + Maghrib 3 + Isha 2 + Witr 3). This app counts every day at full resident rakats (20), which is the safe side.",
  },
];

const WOMEN: { q: string; a: string }[] = [
  {
    q: "Are prayers missed during hayz or nifas owed?",
    a: "Prayers missed during hayz and nifas are not owed and not counted (the sahih (authentic) hadith: fasts are made up, prayers are not). If a woman owes one qaza and hayz comes, she should pray the qaza first after becoming pak (ritually clean), then her waqti salah (the salah due at that time).",
  },
];

const MANNER: { q: string; a: string }[] = [
  {
    q: "Must qazas be prayed in order?",
    a: "While all six classes of qaza (Fajr→Zuhr→Asr→Maghrib→Isha→Witr) are outstanding, they must be prayed in order. Once fewer than six remain, order is no longer binding.",
  },
  {
    q: "Can qaza be prayed in the masjid or in front of others?",
    a: "In the windows where nafl (voluntary prayer) is makruh (disliked), after Asr's 4 fard and after Fajr, do not pray qaza in the masjid or in public view. Pray at home, hidden. Never announce your qaza: telling someone 'my salah lapsed, I'm praying its qaza' is izhar (openly declaring a sin) and is itself wrong.",
  },
  {
    q: "I am ill. Must the qaza be prayed standing?",
    a: "The ability at the moment of praying decides: an able person must stand; a person with uzr (an excusing illness) prays sitting and does not repeat it (i'ada) after recovery.",
  },
];

/** Question titles for the myth cards. MYTH_WARNINGS stays the single source
 *  of the answers (the old standalone fidya entry is merged into it). */
const MYTH_QUESTIONS: Record<number, string> = {
  1: "Can 4 rakats on a special night wipe out years of qaza?",
  2: "Can fidya (money or food) replace the missed salah?",
  3: "Can I just commit to a lifetime quota instead of counting?",
};

function FaqGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={{ gap: spacing.m }}>
      <Eyebrow>{title}</Eyebrow>
      {children}
    </View>
  );
}

function faqItems(items: { q: string; a: string }[]) {
  return items.map((it) => (
    <Accordion key={it.q} question={it.q}>
      <Small>{it.a}</Small>
    </Accordion>
  ));
}

export default function Masail() {
  return (
    <Screen>
      <Card>
        <SectionTitle eyebrow="Guidance" title="Masail & rulings" />
        <Small>
          Every rule this app applies is written out plainly below. Tap any
          question to open it. This app is an aid, not a mufti; for any
          doubt, ask a mufti.
        </Small>
      </Card>

      <Card>
        <SectionTitle eyebrow="Why it matters" title="Why qaza?" />
        <Small>
          A missed salah is a debt owed to Allah. Debts are not wished away;
          they are repaid, as soon as a person is able. That is what qaza
          (missed salah made up later) is for. Two references carry the
          whole point:
        </Small>
        {WHY_QAZA.map((r) => (
          <View key={r.id} style={{ gap: spacing.xs }}>
            <Text style={styles.arabic}>{r.arabic}</Text>
            <Small>{r.text}</Small>
            <Small style={styles.source}>{r.source}</Small>
            {"note" in r && r.note ? <Small>{r.note}</Small> : null}
            <Divider />
          </View>
        ))}
        <Small>
          Counted honestly and repaid steadily, the debt shrinks qaza by
          qaza. That is the whole work of this app.
        </Small>
      </Card>

      <FaqGroup title="The basics">{faqItems(BASICS)}</FaqGroup>
      <FaqGroup title="Travel">{faqItems(TRAVEL)}</FaqGroup>
      <FaqGroup title="For women">{faqItems(WOMEN)}</FaqGroup>
      <FaqGroup title="Order and manner of praying">{faqItems(MANNER)}</FaqGroup>

      <FaqGroup title="Baseless shortcuts">
        {MYTH_WARNINGS.map((m) => (
          <Accordion key={m.id} question={MYTH_QUESTIONS[m.id] ?? "A baseless claim"}>
            <Small>{m.text}</Small>
          </Accordion>
        ))}
      </FaqGroup>

      <Card>
        <SectionTitle eyebrow="Sanctioned lightening" title="Takhfeef: the 5 easings" />
        <Small>
          Given by the ulama (scholars) so a person with decades of qaza is
          not disheartened. It is not rushing: the arkaan (essential acts)
          are wajib (required) and never shortened; ruku (bowing), sujud
          (prostration) and jalsa (the sitting between) stay complete, and
          every word comes from its makharij (correct pronunciation point).
        </Small>
        {TAKHFEEF.map((t) => (
          <Expandable key={t.id} title={t.title}>
            <Small>{t.detail}</Small>
          </Expandable>
        ))}
      </Card>

      <Card>
        <SectionTitle eyebrow="When not to pray" title="The 3 makruh windows" />
        {Object.entries(MAKRUH_WINDOWS).map(([k, v]) => (
          <View key={k} style={{ gap: spacing.xs }}>
            <Body>{v.label}</Body>
            <Small>{v.detail}</Small>
            <Divider />
          </View>
        ))}
        <Small>
          Outside these three windows, the qaza of any salah may be prayed at
          any waqt; there is no rule tying a qaza to its matching waqt.
        </Small>
      </Card>

      <Card>
        <SectionTitle eyebrow="Sources" title="Hadith & lectures" />
        <Small>{CITATIONS.hadith}</Small>
        <Divider />
        <Small>
          The masail above follow these five Urdu lectures. Tap a title to
          watch it on YouTube.
        </Small>
        {SOURCE_VIDEOS.map((v) => (
          <Pressable
            key={v.id}
            accessibilityRole="link"
            accessibilityLabel={`Watch on YouTube: ${v.title}`}
            onPress={() => {
              void Linking.openURL(v.url).catch(() => {});
            }}
            style={({ pressed }) => [styles.videoRow, pressed && { opacity: 0.65 }]}
          >
            <View style={styles.videoMeta}>
              <Body style={styles.videoTitle}>{v.title}</Body>
              {v.speaker ? <Small>{v.speaker}</Small> : null}
            </View>
            <Chip label="Watch" tone="neutral" />
          </Pressable>
        ))}
        <Small>Full scholarly citations are kept in the project documentation.</Small>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  arabic: {
    fontFamily: fonts.arabic,
    fontSize: 20,
    // Nastaleeq carries its own tall metrics; no explicit lineHeight
    color: colors.ink,
    textAlign: "right",
    writingDirection: "rtl",
  },
  source: {
    fontFamily: fonts.semiBold,
    color: colors.emerald,
  },
  videoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.m,
    minHeight: 44,
  },
  videoMeta: { flex: 1, gap: 2 },
  videoTitle: { fontFamily: fonts.semiBold, fontSize: 14, lineHeight: 20 },
});
