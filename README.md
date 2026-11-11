# Qaza Tracker (قضاء عمرى)

A lifetime qaza (missed salah) counter and completions tracker — built strictly on the
masail of the Ahle Sunnat wal Jamaat (Hanafi), in the Maslak of Ala Hazrat Imam Ahmad
Raza Khan Barelwi (رحمہ اللہ) — *Fatawa-e-Radhwiyya*.

**Stack:** Expo (SDK 58) + React Native + TypeScript, Expo Router. Targets Android, iOS
and Web (mobile-first). Offline-first — no accounts, no cloud, nothing uploaded
(qaza is never announced; privacy is part of the adab).

## Repository layout

```
docs/shariah-basis.md      ← the rulebook: every masla with video + fatawa citations
docs/sources-verified.md   ← audit trail of web-verified written sources (S1–S13)
docs/app-architecture.md   ← engine spec, screens, data model
sources/transcripts/       ← raw transcripts of the 5 source videos (scholars)
QazaTrackerApp/            ← the Expo app
  src/data/shariah.ts      ← single source of truth: rakat tables, niyyat text,
                             takhfeef list, makruh windows, myth warnings, citations
  src/engine/QazaEngine.ts ← pure TS calculation engine (unit-tested)
  src/store/useQazaStore.ts← offline-first persisted state (localStorage / AsyncStorage)
  src/app/                 ← Expo Router screens (all under src/app per AGENTS.md)
  src/engine/__tests__/    ← vitest tests for the engine
```

## Verified core rulings implemented

- **20 rakats per missed resident day** = 17 fard + 3 witr (wajib); no qaza of sunnah/nafl
- **Travel (safar) halat:** a lapsed 4-rakat fard stays 2 rakats; a fully lapsed travel
  day = Fajr 2 + Zuhr 2 + Asr 2 + Maghrib 3 + Isha 2 + Witr 3 = **14 rakats**
- **Bulugh unknown → count from 12 (boys) / 9 (girls)** (precaution)
- **Women:** hayz + nifas days are exempt and auto-subtracted
- **Niyyat helper:** "sab se pehli …" (earliest-first) or "aakhri …" (latest-first), both valid
- **3 makruh windows** documented (sunrise, zawal, sunset — minus today's pending Asr)
- **Takhfeef mode:** the 4 sanctioned lightening rulings (Sana/Ta'awwudh skip; 3× Subhan
  Allah for 3rd/4th rakat; short durood; tasbihaat once; Qunoot → "Allahumma-ghfir li") —
  arkaan are never shortened
- **Tarteeb wajib while all 6 classes outstanding** (warns otherwise)
- Myth warnings (Jumma-tul-Wida kaffara / fidya / "one qaza per prayer forever")

## Run it

```bash
cd QazaTrackerApp
npx expo start            # dev server; press W for web, A for Android emulator
```

Production web build: `npx expo export --platform web` → serve `dist/` with an SPA
fallback (`npx serve dist -s`).

Tests & checks:

```bash
npx vitest run            # engine unit tests (12)
npx tsc --noEmit          # typecheck
npx eslint src            # lint
npx expo-doctor           # dependency check
```

## Status

- [x] Shariah research (5 videos extracted; written sources verified)
- [x] Documented masail with citations
- [x] Pure calculation engine + unit tests
- [x] Onboarding (gender / age / bulugh / history / travel / margin)
- [x] Dashboard (count, remaining, ETA, niyyat helper)
- [x] Prayer session with takhfeef mode + mark-done
- [x] History log + stats
- [x] Masail & guidance screens incl. myth warnings
- [x] Settings (niyyat style, pace, margin, reset)
- [x] Persistence across reloads (verified live)
- [ ] Prayer-time API integration for live makruh-window guard
- [ ] Per-day halat tagging on the log (travel day currently computed at aggregate level)
- [ ] Urdu UI (English first per project decision)
- [ ] Reminders/notifications; streaks; calendar heatmap
- [ ] EAS builds (`npx eas build`) for Play Store / App Store

> This app is an aid, not a mufti. For any doubt consult a mufti of the Ahle Sunnat maslak.
