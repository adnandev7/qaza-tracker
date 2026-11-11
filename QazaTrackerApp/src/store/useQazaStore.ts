/**
 * useQazaStore — tiny offline-first global store (useSyncExternalStore)
 * persisted to storage. No accounts, no cloud: privacy by design
 * (qaza is never "announced" — see docs/shariah-basis.md §7.12).
 */

import { useSyncExternalStore } from "react";
import {
  FARD_RAKATS,
  PRAYERS_IN_ORDER,
  type Prayers,
  WITR_RAKATS,
} from "@/data/shariah";
import {
  computeBacklog,
  rakatsPerPrayerRemaining,
  tarteebWarning,
  type QazaBacklog,
  type QazaProfile,
} from "@/engine/QazaEngine";

/** storage adapter — localStorage on web, AsyncStorage on native */
let nativeStorage: {
  getItem: (k: string) => Promise<string | null>;
  setItem: (k: string, v: string) => Promise<void>;
  removeItem: (k: string) => Promise<void>;
} | null = null;
try {
  // native-only module; guarded require so web bundling never evaluates it
  if (typeof window === "undefined" || !window.localStorage) {
    nativeStorage = require("@react-native-async-storage/async-storage").default;
  }
} catch {
  nativeStorage = null;
}

const storage = {
  async getItem(k: string): Promise<string | null> {
    if (nativeStorage) return nativeStorage.getItem(k);
    try {
      return window.localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  async setItem(k: string, v: string): Promise<void> {
    if (nativeStorage) {
      await nativeStorage.setItem(k, v);
      return;
    }
    try {
      window.localStorage.setItem(k, v);
    } catch {}
  },
  async removeItem(k: string): Promise<void> {
    if (nativeStorage) {
      await nativeStorage.removeItem(k);
      return;
    }
    try {
      window.localStorage.removeItem(k);
    } catch {}
  },
};

export interface QazaLogEntry {
  ts: number;
  prayer: Prayers;
  rakats: number;
}

export interface QazaState {
  version: 1;
  /** true once persisted state has been loaded (hydration complete) */
  ready: boolean;
  profile: QazaProfile | null;
  marginPercent: number;
  /** discharged qaza count per prayer class */
  done: Record<Prayers, number>;
  log: QazaLogEntry[];
  niyyatStyle: "earliestFirst" | "latestFirst";
  rakatsPerDayPace: number;
}

const KEY = "qaza-tracker-v1";

const initialState: QazaState = {
  version: 1,
  ready: false,
  profile: null,
  marginPercent: 0,
  done: { fajr: 0, zuhr: 0, asr: 0, maghrib: 0, isha: 0, witr: 0 },
  log: [],
  niyyatStyle: "earliestFirst",
  rakatsPerDayPace: 20,
};

let state = { ...initialState, ready: false } as QazaState;
let hydrated = false;

const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export function setState(patch: Partial<QazaState>) {
  state = { ...state, ...patch };
  emit();
  void storage.setItem(KEY, JSON.stringify(state)).catch(() => {});
}

export function getState(): QazaState {
  return state;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

/** Init: load persisted state once at app start (call in _layout).
 *  Always flips `ready` so route gates don't act before hydration. */
export async function hydrate() {
  if (hydrated) return;
  try {
    const raw = await storage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as QazaState;
      if (parsed && parsed.version === 1) {
        state = { ...initialState, ...parsed, ready: true };
        emit();
        hydrated = true;
        return;
      }
    }
  } catch {
    // corrupted store → start fresh (offline, best-effort)
  }
  state = { ...state, ready: true };
  emit();
  hydrated = true;
}

export function useQaza(): QazaState {
  return useSyncExternalStore(subscribe, getState, getState);
}

/** Recomputed backlog snapshot for the current profile + margin. */
export function useBacklog(): {
  backlog: QazaBacklog | null;
  rows: ReturnType<typeof rakatsPerPrayerRemaining>;
  warningNext: string | null;
} {
  const { profile, marginPercent, done } = useQaza();
  if (!profile) return { backlog: null, rows: [], warningNext: null };
  const backlog = computeBacklog(profile, marginPercent);
  const rows = rakatsPerPrayerRemaining(backlog, done);
  const remaining = {} as Record<Prayers, number>;
  for (const r of rows) remaining[r.prayer] = r.remaining;
  const warningNext = tarteebWarning(remaining, PRAYERS_IN_ORDER[0]);
  return { backlog, rows, warningNext };
}

/** Mark one qaza of a prayer done. Returns a tarteeb warning (or null). */
export function markQazaDone(prayer: Prayers, rakats: number): string | null {
  const { done, log } = state;
  const remaining = {} as Record<Prayers, number>;
  const backlog = state.profile
    ? computeBacklog(state.profile, state.marginPercent)
    : null;
  if (!backlog) return null;
  for (const r of rakatsPerPrayerRemaining(backlog, done)) {
    remaining[r.prayer] = r.remaining;
  }
  const warned = tarteebWarning(remaining, prayer);
  if (remaining[prayer] <= 0) return "That qaza does not appear to be owed.";
  const newDone = { ...done, [prayer]: (done[prayer] ?? 0) + 1 };
  const entry: QazaLogEntry = { ts: Date.now(), prayer, rakats };
  setState({ done: newDone, log: [entry, ...log].slice(0, 2000) });
  return warned;
}

/** Mark whole day-sets done in one tap (Fajr → Witr, one qaza of each per
 *  set). In-order marking satisfies tarteeb by construction. Only qazas
 *  actually owed are logged. Returns what was logged and the total rakats
 *  still remaining afterwards (null when there is no profile). */
export function markSetDone(
  sets: number
): { logged: number; rakats: number; remainingRakats: number } | null {
  const { profile, done, log } = state;
  if (!profile) return null;
  const backlog = computeBacklog(profile, state.marginPercent);
  const remaining = {} as Record<Prayers, number>;
  for (const r of rakatsPerPrayerRemaining(backlog, done)) {
    remaining[r.prayer] = r.remaining;
  }
  const residentRakats: Record<Prayers, number> = { ...FARD_RAKATS, witr: WITR_RAKATS };
  const newDone = { ...done };
  const newLog = [...log];
  let logged = 0;
  let rakats = 0;
  for (let i = 0; i < Math.max(1, sets); i++) {
    for (const p of PRAYERS_IN_ORDER) {
      if ((remaining[p] ?? 0) > 0) {
        remaining[p] -= 1;
        newDone[p] = (newDone[p] ?? 0) + 1;
        logged += 1;
        rakats += residentRakats[p];
        newLog.unshift({ ts: Date.now(), prayer: p, rakats: residentRakats[p] });
      }
    }
  }
  if (logged === 0) {
    return { logged: 0, rakats: 0, remainingRakats: 0 };
  }
  const doneRakats = PRAYERS_IN_ORDER.reduce(
    (sum, p) => sum + (newDone[p] ?? 0) * residentRakats[p],
    0
  );
  setState({ done: newDone, log: newLog.slice(0, 2000) });
  return {
    logged,
    rakats,
    remainingRakats: Math.max(0, backlog.breakdown.totalRakats - doneRakats),
  };
}

export async function resetAll() {
  state = { ...initialState, ready: true };
  emit();
  try {
    await storage.removeItem(KEY);
  } catch {}
}
