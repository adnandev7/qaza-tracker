/**
 * Settings — profile summary with an "Edit details" expandable. Editing works
 * on a local draft: nothing changes until you tap Save (Discard throws the
 * edits away), and editing never touches the completed log. Erasing is the
 * only way to wipe data, and says so honestly.
 */

import { useState } from "react";
import { Alert, Platform, View } from "react-native";
import { useRouter } from "expo-router";
import {
  Body, Button, Card, Choice, Expandable, NumInput, Row, Screen, SectionTitle,
  Small, Stepper, TextField, Toggle,
} from "@/components/ui";
import { TermInfo } from "@/components/TermInfo";
import { resetAll, setState, useQaza } from "@/store/useQazaStore";
import { FALLBACK_BULUGH_AGE_BOYS, FALLBACK_BULUGH_AGE_GIRLS } from "@/data/shariah";
import type { QazaProfile } from "@/engine/QazaEngine";
import { spacing } from "@/theme";

/** The editable form. Mounts fresh each time the expandable opens, so the
 *  draft always starts from the saved profile. */
function ProfileEditor({ profile }: { profile: QazaProfile }) {
  const [draft, setDraft] = useState<QazaProfile>(profile);
  const [saved, setSaved] = useState(false);

  const patch = (p: Partial<QazaProfile>) => {
    setSaved(false);
    setDraft((d) => ({ ...d, ...p }));
  };
  const dirty = JSON.stringify(draft) !== JSON.stringify(profile);

  const fallbackAge =
    draft.gender === "male" ? FALLBACK_BULUGH_AGE_BOYS : FALLBACK_BULUGH_AGE_GIRLS;

  return (
    <View style={{ gap: spacing.m }}>
      <Row label="Name">
        <TextField
          value={draft.name ?? ""}
          onChange={(v) => patch({ name: v })}
          placeholder="Your name"
          maxLength={30}
        />
      </Row>
      <Row label="Gender">
        <Choice
          value={draft.gender}
          onChange={(v) =>
            patch({
              gender: v as "male" | "female",
              hayzDaysPerMonth:
                v === "female" ? (draft.hayzDaysPerMonth ?? 6) : undefined,
            })
          }
          options={[
            { label: "Male", value: "male" },
            { label: "Female", value: "female" },
          ]}
        />
      </Row>
      <Row label="Age">
        <NumInput
          value={draft.age}
          onChange={(v) => patch({ age: v })}
          suffix="years"
        />
      </Row>
      <Row label="When salah began">
        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.m }}>
          <Toggle
            value={draft.bulughKnown}
            onChange={(v) =>
              patch({
                bulughKnown: v,
                bulughAge: v ? (draft.bulughAge ?? fallbackAge) : undefined,
              })
            }
          />
          <Small style={{ flex: 1 }}>
            I remember the age of bulugh (puberty)
          </Small>
        </View>
        {draft.bulughKnown ? (
          <NumInput
            value={draft.bulughAge}
            onChange={(v) => patch({ bulughAge: v })}
            suffix="years"
          />
        ) : null}
        <TermInfo term="bulugh" />
      </Row>
      <Row label="Years prayed fully">
        <Stepper
          value={draft.yearsPrayedFully}
          onChange={(v) => patch({ yearsPrayedFully: v })}
          max={80}
          suffix="years"
        />
        <TermInfo
          term="yearsPrayedFully"
          label="What does years prayed fully mean?"
        />
      </Row>
      {draft.gender === "female" && (
        <Row label="Hayz days per month">
          <Stepper
            value={draft.hayzDaysPerMonth ?? 6}
            onChange={(v) => patch({ hayzDaysPerMonth: v })}
            max={15}
            suffix="days"
          />
          <TermInfo term="hayz" />
        </Row>
      )}
      <Button
        label="Save changes"
        onPress={() => {
          setState({ profile: draft });
          setSaved(true);
        }}
        disabled={!dirty}
      />
      <Button
        label="Discard"
        variant="ghost"
        onPress={() => {
          setDraft(profile);
          setSaved(false);
        }}
        disabled={!dirty}
      />
      {saved ? <Small>Saved. Your count is updated.</Small> : null}
    </View>
  );
}

export default function Settings() {
  const router = useRouter();
  const { profile, niyyatStyle, rakatsPerDayPace, marginPercent } = useQaza();

  if (!profile) {
    return (
      <Screen>
        <SectionTitle title="Settings" />
        <Body>No profile yet. Finish onboarding first.</Body>
      </Screen>
    );
  }

  const fallbackAge =
    profile.gender === "male" ? FALLBACK_BULUGH_AGE_BOYS : FALLBACK_BULUGH_AGE_GIRLS;
  const bulughShown = profile.bulughKnown ? profile.bulughAge : fallbackAge;
  const displayName = profile.name?.trim();

  return (
    <Screen>
      <Card>
        <SectionTitle eyebrow="Your profile" title="Asked once, editable always" />
        <Body>
          {displayName ? `${displayName} · ` : ""}
          {profile.gender === "male" ? "Male" : "Female"}, age {profile.age},
          counting from age {bulughShown}
          {profile.gender === "female"
            ? ` · hayz about ${profile.hayzDaysPerMonth ?? 0} days/month subtracted`
            : ""}
          .
        </Body>
        <Expandable title="Edit details">
          <ProfileEditor profile={profile} />
        </Expandable>
        <Small>Nothing leaves this device.</Small>
      </Card>

      <Card>
        <Row label="Niyyat style">
          <Choice
            value={niyyatStyle}
            onChange={(v) =>
              setState({ niyyatStyle: v as "earliestFirst" | "latestFirst" })
            }
            options={[
              { label: "Earliest-first", value: "earliestFirst" },
              { label: "Latest-first", value: "latestFirst" },
            ]}
          />
        </Row>
        <Row label="Daily pace (rakats per day)">
          <NumInput
            value={rakatsPerDayPace}
            onChange={(v) => setState({ rakatsPerDayPace: Math.max(1, v) })}
            suffix="rakats/day"
          />
        </Row>
        <Row label="Safety margin (over-count is safer)">
          <Choice
            columns={2}
            value={String(marginPercent)}
            onChange={(v) => setState({ marginPercent: parseInt(v, 10) })}
            options={[
              { label: "0%", value: "0" },
              { label: "+5%", value: "5" },
              { label: "+10%", value: "10" },
              { label: "+20%", value: "20" },
            ]}
          />
        </Row>
      </Card>

      <Card>
        <Small>
          Erasing removes your profile, your count and your whole completed
          qaza log from this device. It cannot be undone.
        </Small>
        <Button
          label="Erase everything"
          variant="ghost"
          onPress={async () => {
            const msg =
              "This removes your profile and your whole qaza log from this device. It cannot be undone.";
            if (Platform.OS === "web") {
              if (window.confirm(msg)) {
                await resetAll();
                router.replace("/welcome");
              }
              return;
            }
            Alert.alert("Erase everything?", msg, [
              { text: "Cancel", style: "cancel" },
              {
                text: "Erase",
                style: "destructive",
                onPress: () => {
                  void resetAll().then(() => router.replace("/welcome"));
                },
              },
            ]);
          }}
        />
      </Card>

      <Card>
        <SectionTitle eyebrow="Privacy" title="Everything stays on this device" />
        <Small>
          Qaza Tracker has no account, no server and no analytics. Your profile,
          your count and your completed log live only on this device. Nothing is
          uploaded and nothing is shared. The erase button above removes it all
          permanently.
        </Small>
      </Card>
    </Screen>
  );
}
