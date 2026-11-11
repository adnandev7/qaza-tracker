/**
 * QazaEngine.ts — pure TypeScript calculation engine (no UI/storage imports).
 * Implements the rulings documented in docs/shariah-basis.md (citations there,
 * and in src/data/shariah.ts). All math is days-and-rakats integer logic.
 */

import {
  FARD_RAKATS,
  PRAYERS_IN_ORDER,
  PRAYER_LABELS,
  Prayers,
  RESIDENT_DAY_RAKATS,
  SAFAR_FARD_RAKATS,
  WITR_RAKATS,
} from "../data/shariah";

export type Gender = "male" | "female";

export interface QazaProfile {
  /** display name for personal greetings (optional, device-only, never uploaded) */
  name?: string;
  gender: Gender;
  /** current age in whole years */
  age: number;
  /** was the age of bulugh (reaching salah-obligation) known? */
  bulughKnown: boolean;
  /** age at which salah became fard; required when bulughKnown */
  bulughAge?: number;
  /** years (after bulugh) in which salah was kept regularly — user estimate */
  yearsPrayedFully: number;
  /** fraction (0–1) of the missed days spent in safar (travel) halat */
  travelFraction: number; // 0..1
  /** Female users only: average hayz days per month over the counted period */
  hayzDaysPerMonth?: number;
  /** Female users only: total nifas days known/estimated (childbirths × ~40) */
  totalNifasDays?: number;
}

export const DAYS_PER_YEAR = 365;
const DAYS_PER_MONTH_AVG = 30.44;

/** Precautionary fallback (S2): boy 12, girl 9. */
function resolveBulughAge(profile: QazaProfile): number {
  if (profile.bulughKnown && profile.bulughAge != null) {
    // never allow a bulugh age that yields negative or > current age
    return Math.min(Math.max(profile.bulughAge, 9), Math.max(profile.age, 9));
  }
  return profile.gender === "male" ? 12 : 9;
}

/** Days lived after bulugh (approximation — whole-year resolution by design;
 *  the margin setting covers the imprecision per S12). */
function daysSinceBulugh(profile: QazaProfile): number {
  const bulugh = resolveBulughAge(profile);
  const years = Math.max(0, profile.age - bulugh);
  return years * DAYS_PER_YEAR;
}

/** Hayz + nifas exemption days (S1, S2): female users subtract these. */
function exemptDays(profile: QazaProfile): number {
  if (profile.gender !== "female") return 0;
  const months = daysSinceBulugh(profile) / DAYS_PER_MONTH_AVG;
  const hayz = (profile.hayzDaysPerMonth ?? 0) * months;
  const nifas = profile.totalNifasDays ?? 0;
  // floor the exemption: rounding DOWN the exempt days is the safe side (S12)
  return Math.floor(Math.min(hayz + nifas, daysSinceBulugh(profile)));
}

export interface QazaBreakdown {
  residentDays: number;
  travelDays: number;
  /** rakats owed, by prayer type (count of days owing that prayer) */
  prayersOwed: Record<Prayers, number>;
  /** rakats owed: resident days×20 + travel days×14 (with margin) */
  totalRakats: number;
}

export interface QazaBacklog {
  daysSinceBulugh: number;
  exemptDays: number;
  prayedDays: number;
  missedDays: number;
  /** extra days added by the safety margin (rounding up) */
  marginDays: number;
  /** owed = missed + margin */
  backlogDays: number;
  breakdown: QazaBreakdown;
}

/** Core computation (S3, S2, S12; §1, §2, §7.8 of shariah-basis). */
export function computeBacklog(
  profile: QazaProfile,
  marginPercent = 0
): QazaBacklog {
  const allowedMargin = Math.max(0, marginPercent);
  const lived = daysSinceBulugh(profile);
  const exempted = exemptDays(profile);
  const prayed = Math.min(
    Math.max(0, profile.yearsPrayedFully) * DAYS_PER_YEAR,
    Math.max(0, lived - exempted)
  );
  const missedRaw = Math.max(0, lived - exempted - prayed);
  const marginDays = Math.ceil((missedRaw * allowedMargin) / 100);
  const backlogDays = missedRaw + marginDays;

  const travelDays = Math.round(backlogDays * clamp01(profile.travelFraction));
  const residentDays = backlogDays - travelDays;

  // Every owed day owes each of the 6 prayers once (fard fards + witr wajib).
  const prayersOwed = {
    fajr: backlogDays,
    zuhr: backlogDays,
    asr: backlogDays,
    maghrib: backlogDays,
    isha: backlogDays,
    witr: backlogDays,
  } as Record<Prayers, number>;

  const totalRakats =
    residentDays * RESIDENT_DAY_RAKATS + travelDays * travelDayRakats();

  return {
    daysSinceBulugh: lived,
    exemptDays: exempted,
    prayedDays: prayed,
    missedDays: missedRaw,
    marginDays,
    backlogDays,
    breakdown: { residentDays, travelDays, prayersOwed, totalRakats },
  };
}

/** Rakats for a day whose 6 prayers all lapsed during safar-halat:
 *  Fajr 2 + Zuhr 2 + Asr 2 + Maghrib 3 + Isha 2 + Witr 3 = 14 (S6). */
export function travelDayRakats(): number {
  return (
    SAFAR_FARD_RAKATS.fajr +
    SAFAR_FARD_RAKATS.zuhr +
    SAFAR_FARD_RAKATS.asr +
    SAFAR_FARD_RAKATS.maghrib +
    SAFAR_FARD_RAKATS.isha +
    WITR_RAKATS
  );
}

/** Remaining qazas per prayer, given days already discharged.
 *  Exposes the rakat weight of ONE qaza in each halat (S6):
 *  resident qaza of zuhr = 4 rakats; travel-lapsed qaza = 2 rakats, etc. */
export function rakatsPerPrayerRemaining(
  backlog: QazaBacklog,
  done: Record<Prayers, number>
): {
  prayer: Prayers;
  owedDays: number;
  done: number;
  remaining: number;
  rakatsResident: number;
  rakatsTravel: number;
}[] {
  return PRAYERS_IN_ORDER.map((p) => {
    const doneCount = Math.min(done[p] ?? 0, backlog.backlogDays);
    return {
      prayer: p,
      owedDays: backlog.backlogDays,
      done: doneCount,
      remaining: Math.max(0, backlog.backlogDays - doneCount),
      rakatsResident: FARD_RAKATS[p] + (p === "witr" ? WITR_RAKATS : 0),
      rakatsTravel:
        SAFAR_FARD_RAKATS[p] + (p === "witr" ? WITR_RAKATS : 0),
    };
  });
}

/** Tarteeb guidance (S9):
 *  While ≥ 6 prayers are outstanding globally, order is wajib across all six.
 *  Implementation note: at day granularity, with N days owed, the engine's
 *  recommendation is always the oldest incomplete prayer slot; the UI uses
 *  canPrayPrayer() to warn if the user marks something out of this order. */
export function outstandingCount(daysRemaining: Record<Prayers, number>): number {
  return PRAYERS_IN_ORDER.filter(
    (p) => (daysRemaining[p] ?? 0) > 0
  ).length;
}

/** Warn-logic for tarteeb (S9):
 *  Tarteeb binds only while ALL SIX qaza classes are outstanding. If fewer
 *  than six classes remain, order is no longer required.
 *  @param remaining outstanding qaza count per prayer class
 *  @param attempted  the prayer the user is about to discharge
 *  Returns a warning string when order would be violated, else null. */
export function tarteebWarning(
  remaining: Record<Prayers, number>,
  attempted: Prayers
): string | null {
  const kinds = PRAYERS_IN_ORDER.filter((p) => (remaining[p] ?? 0) > 0).length;
  if (kinds < 6) return null; // tarteeb dropped (S9)
  const idx = PRAYERS_IN_ORDER.indexOf(attempted);
  const earlierOutstanding = PRAYERS_IN_ORDER.slice(
    0,
    Math.max(0, idx)
  ).some((p) => (remaining[p] ?? 0) > 0);
  return earlierOutstanding
    ? `While six qazas are outstanding, tarteeb (order) is wajib (required): the ${PRAYER_LABELS[attempted]} qaza should not come before the outstanding earlier prayers (Fajr → Zuhr → Asr → Maghrib → Isha → Witr).`
    : null;
}

/** Estimated completion (days) at a given pace of qaza rakats/day. */
export function estimateCompletionDays(
  totalRakats: number,
  rakatsPerDay: number
): number {
  const pace = Math.max(1, rakatsPerDay);
  return Math.ceil(totalRakats / pace);
}

function clamp01(x: number): number {
  if (Number.isFinite(x)) return Math.min(1, Math.max(0, x));
  return 0;
}
