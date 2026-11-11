# Qaza Tracker — App Architecture (English UI)

Stack: **React Native + Expo (TypeScript)** — targets Android, iOS, Web; mobile-first.
Offline-first: all data local (ex AsyncStorage/sqlite). No account system; no cloud unless requested.

## 1. Core concept — two numbers, one queue

The heart of the app = an **ordered queue of pending qaza prayers**.

- **Onboarding** determines the starting size of the backlog in *days* (and rakats).
- Every entry in the queue slots = one **specific day's** salah set: `Fajr(2f), Zuhr(4f), Asr(4f), Maghrib(3f), Isha(4f), Witr(3w)` = 20 rakats.
- The engine organizes the queue chronologically; **tarteeb rule** keeps ordering inline: while ≥6 days outstanding, strict order matters; when <6 days remain, any-order is allowed (S9).

## 2. Calculation engine — formulas

```
backlog_days = max(0, days_since_bulugh_start − days_prayed − exempt_days)
```

Where (for a female user):
```
exempt_days = hayz_days_per_month × months_of_reproductive_life_present + nifas_days
backlog_days_f = max(0, raw − hayz/nifas subtractions)
```

- `days_prayed`: estimated days the salah was actually offered (user-supplied approximate slider per life-phase; supports "none", "some", "most").
- Uncertainty: user picks a **safety margin** (0 / +5% / +10% / custom), per S12 — better over-count.
- Result displayed as: **total pending rakats**, **pending days**, and **estimated completion time** at the user's chosen daily pace (rakaat-per-day plan / days-per-day plan).
- **Safar-adjusted**: if the user marks "I was travelling those years/that gap" or tags specific lapses as travel-halat, those slots compute Zuhr/Asr/Isha at 2 rakats instead of 4 (S6). A day with travel-halat lapse = 2+4? (faq's exact figure needed per-prayer: Fajr 2f, Zuhr 2f, Asr 2f? No — Asr fard is 4 always; travel qasr only on 4-rakat Fard: Zuhr (4→2), Asr (4→2), Isha (4→2), Maghrib 3 unchanged, Fajr 2 unchanged, Witr 3w unchanged.) **Day with all-in-safar lapse = 2+2+2+3+2+3 = 14 rakats?** — no wait, travel day's 3-witr: witr is wajib even in safar per Hanafi → stays 3. **Correct travel-day set: Fajr2f + Zuhr2f + Asr2f + Maghrib3f + Isha2f + Witr3w = 14 rakats.**

- The engine exports/dehydrates this data to a JSON plan; UI reads it.

## 3. Niyyat guide (in-app helper, per S4)

The engine tracks chronology; the niyyat helper shows — when the user is about to pray:
- "…the first [Fajr/Zuhr] qaza owed…" phrase in English transliteration: *"Ya Allah, the first Fajr qaza owed to me that I have not yet prayed — I am praying it now."* (auto-updates "first → counts down")
- Toggle to swap between **earliest-first** vs **latest-first**.

## 4. In-app prayer/session features

- **Mark done**: tick a prayer — queue头部 improves; counters & streak update;Wenn strict tarteeb (>6 days) → warn if praying out-of-order.
- **Makruh window guard**: computes sunrise / zawal / sunset from the device or shows a static rough-deadline banner if location denied (S5). Small "waqt now + what qaza is OK" widget.
- **Takhfeef mode toggle** (per S8 / videos 3,4,5): shows the 4 sanctioned shortcuts before prayer; user decides each session whether to use them; arkaan never abbreviated.
- **Hayz tracking** for female users: mark period start/end; engine auto-subtracts those days (S1/S2/S10) and prioritizes "qaza before waqti" guidance when only one prayer was owed at haiz onset (S10).

## 5. App structure (screens)

1. **Onboarding** — gender; birth year; girls only → hayz count estimate; bulugh known? → year; if unknown → 12/9 rule; prayer-history phase sliders (0% prayed … 100%); travel-years tagging; result = starting backlog + margin.
2. **Home / Dashboard** — pending days & rakats; "X rakats today" plan; progress bar; projected finish date; makruh-window banner; "next qaza to pray" with niyyat text.
3. **Prayer session** — step-by-step sequence with the выбран prāya-rakāt; takhfeef toggle; mark-done.
4. **Guidance / Masail** — dos-and-don'ts (from shariah-basis.md) plus myth warnings (S11); static content offline.
5. **History / Stats** — daily completion log, calendar heat-map, "promise → streak" pages.
6. **Settings** — pace (rakats/day), margins, language (EN first; Urdu planned), notifications time, reset/re-edit onboarding (mufti to confirm reset policy).

## 6. Technical layout

```
QazaTrackerApp/
  app.json  —expo config— expo-router or a light tab-Navigator structure
  src/
    engine/           — pure TS logic (QazaEngine.ts) — NO UI imports (unit-testable)
    data/shariah.ts   — rakat tables, niyyat text, citations per rule (S1–S13)
    screens/…Home, Prayer, Onboarding, Masail, History, Settings
    store/            — zustand + AsyncStorage persistence (offline-first)
    components/…      — shadcn-like RN primitives
  docs/…shariah-basis.md, app-architecture.md, sources-verified.md
  sources/transcripts/…video .txt/.vtt
```

Engine (pure TS) can ship to web/mobile untouched; tests in `engine/__tests__/`.

## 7. Shariah-privacy & adab considerations

- No social feed; no sharing achievement ("no izhar of qaza" — S-static). Keep the app private by design — no export-to-social features.
- The "masjid/public" warning (§4 of shariah-basis) surfaces in guidance only.
- "This app's math is an aid, not a fatwa sponsor" — a disclaimer + "consult a mufti of Ahle Sunnat maslak for a messail" link on relevant screens.
