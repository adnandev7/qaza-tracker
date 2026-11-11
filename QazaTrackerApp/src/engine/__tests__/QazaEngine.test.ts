import { describe, expect, it } from "vitest";
import {
  computeBacklog,
  estimateCompletionDays,
  rakatsPerPrayerRemaining,
  tarteebWarning,
  travelDayRakats,
  type QazaProfile,
} from "../QazaEngine";

const maleProfile = (over: Partial<QazaProfile> = {}): QazaProfile => ({
  gender: "male",
  age: 30,
  bulughKnown: false,
  yearsPrayedFully: 0,
  travelFraction: 0,
  ...over,
});

const femaleProfile = (over: Partial<QazaProfile> = {}): QazaProfile => ({
  gender: "female",
  age: 30,
  bulughKnown: false,
  yearsPrayedFully: 0,
  travelFraction: 0,
  hayzDaysPerMonth: 6,
  totalNifasDays: 0,
  ...over,
});

describe("computeBacklog — core engine (S3, S2, S12)", () => {
  it("male, no bulugh date → counts from 12, 30 yrs old ⇒ 18 yrs missed = 6570 days = 20 rakats/day", () => {
    const b = computeBacklog(maleProfile());
    expect(b.daysSinceBulugh).toBe(18 * 365);
    expect(b.missedDays).toBe(18 * 365);
    expect(b.marginDays).toBe(0);
    expect(b.backlogDays).toBe(18 * 365);
    expect(b.breakdown.totalRakats).toBe(18 * 365 * 20);
  });

  it("female, no bulugh date → counts from 9 AND subtracts hayz/nifas (S1, S2)", () => {
    const lived = (30 - 9) * 365;
    const b0 = computeBacklog(femaleProfile({ hayzDaysPerMonth: 0 }));
    expect(b0.missedDays).toBe(lived);

    // 6 hayz days/month ≈ 6/30.44 of all months (≈ 12.3% of days) exempt
    const b = computeBacklog(femaleProfile());
    const expectedExempt = Math.floor((lived / 30.44) * 6);
    expect(b.exemptDays).toBe(Math.max(expectedExempt, 0) + 0);
    expect(b.missedDays).toBe(lived - b.exemptDays);
  });

  it("known bulugh age is respected when valid", () => {
    const b = computeBacklog(maleProfile({ bulughKnown: true, bulughAge: 15 }));
    expect(b.daysSinceBulugh).toBe(15 * 365);
  });

  it("safety margin (S12) rounds up", () => {
    const b = computeBacklog(maleProfile({ yearsPrayedFully: 3 }), 10);
    const missed = (30 - 12 - 3) * 365;
    expect(b.missedDays).toBe(missed);
    expect(b.marginDays).toBe(Math.ceil(missed * 0.1));
    expect(b.backlogDays).toBe(missed + Math.ceil(missed * 0.1));
  });

  it("travel-fraction switches days to the 14-rakat safar set (S6)", () => {
    const b = computeBacklog(
      maleProfile({ travelFraction: 0.5 }),
      0
    );
    const days = 18 * 365;
    expect(b.breakdown.travelDays).toBe(Math.round(days * 0.5));
    expect(b.breakdown.residentDays).toBe(days - Math.round(days * 0.5));
    expect(b.breakdown.totalRakats).toBe(
      b.breakdown.residentDays * 20 + b.breakdown.travelDays * 14
    );
  });

  it("paragraph: every owed day owes each of the 6 prayers once", () => {
    const b = computeBacklog(maleProfile({ yearsPrayedFully: 2 }));
    const owed = b.backlogDays;
    for (const p of ["fajr", "zuhr", "asr", "maghrib", "isha", "witr"] as const) {
      expect(b.breakdown.prayersOwed[p]).toBe(owed);
    }
  });
});

describe("travelDayRakats — 2+2+3+2+3 (fard) + witr 3 = 14", () => {
  it("equals 14", () => {
    expect(travelDayRakats()).toBe(14);
  });
});

describe("tarteeb warnings (S9)", () => {
  const full: Record<string, number> = {
    fajr: 1, zuhr: 1, asr: 1, maghrib: 1, isha: 1, witr: 1,
  };
  it("warns when a later prayer is attempted while all 6 classes are outstanding", () => {
    expect(tarteebWarning(full as any, "zuhr")).toMatch(/tarteeb/);
    expect(tarteebWarning(full as any, "witr")).toMatch(/tarteeb/);
  });
  it("no warning when the earliest outstanding class is attempted", () => {
    expect(tarteebWarning(full as any, "fajr")).toBeNull();
  });
  it("no warning when < 6 classes remain (tarteeb drops)", () => {
    const state = { fajr: 0, zuhr: 0, asr: 0, maghrib: 0, isha: 1, witr: 1 };
    expect(tarteebWarning(state as any, "witr")).toBeNull();
  });
});

describe("rakatsPerPrayerRemaining", () => {
  it("separates resident vs travel rakats per qaza", () => {
    const backlog = computeBacklog(maleProfile({ travelFraction: 0.2 }));
    const done = { fajr: 1, zuhr: 0, asr: 0, maghrib: 0, isha: 0, witr: 0 };
    const rows = rakatsPerPrayerRemaining(backlog, done);
    const fajr = rows.find((r) => r.prayer === "fajr")!;
    const zuhr = rows.find((r) => r.prayer === "zuhr")!;
    expect(fajr.rakatsResident).toBe(2);
    expect(zuhr.rakatsResident).toBe(4);
    expect(zuhr.rakatsTravel).toBe(2);
    // fajr discharged once; zuhr untouched
    expect(fajr.remaining).toBe(backlog.backlogDays - 1);
    expect(zuhr.remaining).toBe(backlog.backlogDays);
  });
});

describe("estimateCompletionDays", () => {
  it("ceil-divides rakats by pace", () => {
    expect(estimateCompletionDays(20 * 30, 20)).toBe(30);
    expect(estimateCompletionDays(41, 20)).toBe(3);
  });
});
