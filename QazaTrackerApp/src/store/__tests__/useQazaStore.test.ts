import { beforeEach, describe, expect, it } from "vitest";
import {
  getState,
  markManyDone,
  markSetDone,
  setState,
  undoLastMark,
} from "../useQazaStore";
import type { QazaProfile } from "../../engine/QazaEngine";

const profile: QazaProfile = {
  gender: "male",
  age: 30,
  bulughKnown: false,
  yearsPrayedFully: 0,
  travelFraction: 0,
};

const zeroDone = () => ({
  fajr: 0, zuhr: 0, asr: 0, maghrib: 0, isha: 0, witr: 0,
});

beforeEach(() => {
  setState({
    profile,
    marginPercent: 0,
    done: zeroDone(),
    log: [],
  });
});

describe("markManyDone — any amount of one salah in one tap", () => {
  it("logs the requested count, each qaza as its own entry", () => {
    const r = markManyDone("fajr", 3);
    expect(r?.logged).toBe(3);
    expect(r?.rakats).toBe(6); // fajr is 2 rakats per qaza
    expect(getState().done.fajr).toBe(3);
    expect(getState().log).toHaveLength(3);
    expect(getState().log.every((e) => e.prayer === "fajr" && e.rakats === 2)).toBe(true);
  });

  it("caps honestly at what is still owed", () => {
    const r = markManyDone("fajr", 99999);
    expect(r?.logged).toBe(18 * 365); // male, no bulugh date, 30y old: 6570 fajr qazas
    expect(r?.rakats).toBe(2 * 18 * 365);
    const again = markManyDone("fajr", 1);
    expect(again?.logged).toBe(0);
    expect(getState().done.fajr).toBe(18 * 365);
  });

  it("returns null without a profile", () => {
    setState({ profile: null });
    expect(markManyDone("fajr", 1)).toBeNull();
  });
});

describe("undoLastMark — accidental taps cost nothing", () => {
  it("reverts a multi-qaza mark completely (done counts and log)", () => {
    markManyDone("zuhr", 5);
    expect(getState().done.zuhr).toBe(5);
    expect(undoLastMark()).toBe(true);
    expect(getState().done.zuhr).toBe(0);
    expect(getState().log).toHaveLength(0);
    expect(undoLastMark()).toBe(false);
  });

  it("reverts a daily set mark", () => {
    const r = markSetDone(2);
    expect(r?.logged).toBe(12); // 2 sets × 6 prayers
    expect(undoLastMark()).toBe(true);
    expect(getState().done).toEqual(zeroDone());
    expect(getState().log).toHaveLength(0);
  });

  it("only the most recent mark is undoable", () => {
    markManyDone("fajr", 2);
    markManyDone("zuhr", 1);
    expect(undoLastMark()).toBe(true);
    // zuhr mark reverted, the earlier fajr mark stays
    expect(getState().done.fajr).toBe(2);
    expect(getState().done.zuhr).toBe(0);
  });
});
