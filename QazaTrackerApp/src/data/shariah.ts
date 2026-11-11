/**
 * shariah.ts — single source of truth for all rulings the app implements.
 * Every constant here carries its citation (see docs/sources-verified.md S1–S13
 * and docs/shariah-basis.md which cites the 5 source videos).
 */

export type Prayers = "fajr" | "zuhr" | "asr" | "maghrib" | "isha" | "witr";

export const PRAYERS_IN_ORDER: Prayers[] = [
  "fajr",
  "zuhr",
  "asr",
  "maghrib",
  "isha",
  "witr",
];

export const PRAYER_LABELS: Record<Prayers, string> = {
  fajr: "Fajr",
  zuhr: "Zuhr",
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Isha",
  witr: "Witr (Wajib)",
};

/** Fard rakats per prayer. Witr = 0 fard (wajib tracked separately).
 *  Basis: videos 1,4,5 + S3 (docs/sources-verified.md) */
export const FARD_RAKATS: Record<Prayers, number> = {
  fajr: 2,
  zuhr: 4,
  asr: 4,
  maghrib: 3,
  isha: 4,
  witr: 0,
};

/** Witr wajib rakats. Basis: Hanafi fiqh, videos 1,4,5, S3. */
export const WITR_RAKATS = 3;

/** Safar (travel) halat rakats for the QASR-eligible prayers only.
 *  Qasr applies to the 4-rakat fard prayers: zuhr, asr, isha → pray 2.
 *  Fajr (2), Maghrib (3) fard never qasr. Witr stays 3 wajib in safar.
 *  Basis: S6 (Alamgiri) — "a prayer missed in the halat of safar is qaza'd as in safar". */
export const SAFAR_FARD_RAKATS: Record<Prayers, number> = {
  ...FARD_RAKATS,
  zuhr: 2,
  asr: 2,
  isha: 2,
};

/** One missed day = rakats owed. Resident day = 20; day where ALL 6 lapsed in
 *  safar-halat = 2+2+3+3(witr? no: fajr2+zuhr2+asr2+maghrib3+isha2+witr3) = 14.
 *  Basis: §1 + §7.8 of docs/shariah-basis.md, S3, S6. */
export const RESIDENT_DAY_RAKATS = 17 + WITR_RAKATS; // 20

/** Uncertain bulugh fallback ages (precautionary start).
 *  Basis: S2 + videos 1 & 5 (boys 12–15 → take 12; girls → 9). */
export const FALLBACK_BULUGH_AGE_BOYS = 12;
export const FALLBACK_BULUGH_AGE_GIRLS = 9;

/** Niyyat sentences (English). Basis: S4, videos 2/4/5. */
export const NIYYAT = {
  earliestFirst: {
    qazaSpecific: (prayer: string) =>
      `Ya Allah, the first ${prayer} qaza that became owed to me and which I have not yet prayed. I intend to pray it now for You.`,
  },
  latestFirst: {
    qazaSpecific: (prayer: string) =>
      `Ya Allah, the last ${prayer} qaza I left unpaid and have not yet prayed. I intend to pray it now for You.`,
  },
  note:
    "Niyyat of the heart is what matters; spoken words are mustahab, not required.",
};

/** Short labels for compact chips (witr without the fiqh qualifier). */
export const PRAYER_SHORT: Record<Prayers, string> = {
  fajr: "Fajr",
  zuhr: "Zuhr",
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Isha",
  witr: "Witr",
};

/** Arabic prayer names (niyyat display only — IndoPak Nastaleeq font, RTL). */
export const PRAYER_ARABIC: Record<Prayers, string> = {
  fajr: "الْفَجْرِ",
  zuhr: "الظُّهْرِ",
  asr: "الْعَصْرِ",
  maghrib: "الْمَغْرِبِ",
  isha: "الْعِشَاءِ",
  witr: "الْوِتْرِ",
};

/** Arabic niyyat line, matching the English helpers (awwali = earliest-first,
 *  aakhiri = latest-first). Displayed in IndoPak Nastaleeq, RTL. */
export function niyyatArabic(
  prayer: Prayers,
  style: "earliestFirst" | "latestFirst"
): string {
  return style === "earliestFirst"
    ? `نَوَيْتُ أَنْ أُصَلِّيَ قَضَاءَ أَوَّلِ ${PRAYER_ARABIC[prayer]}`
    : `نَوَيْتُ أَنْ أُصَلِّيَ قَضَاءَ آخِرِ ${PRAYER_ARABIC[prayer]}`;
}

/** Takhfeef (lightening) shortcuts — sanctioned per S8 (Fatawa-e-Radhwiyya),
 *  video 4 (5 zaroori masail) and video 5. Arkaan are NEVER shortened. */
export const TAKHFEEF = [
  {
    id: 1,
    title: "Start straight from Surah Fatiha",
    detail:
      "Skip Sana (the opening praise), Ta'awwudh (a'oodhu…) and Tasmiyah (bismillah…); begin directly with Surah Fatiha and a short surah, then go to ruku.",
  },
  {
    id: 2,
    title: "3rd/4th rakat of fard: 3× Subhan Allah instead of Qir'at (recitation)",
    detail:
      "In the 3rd and 4th rakat of fard prayers, recite 'Subhan Allah' three times (covering the stand time of Fatiha) and proceed to ruku.",
  },
  {
    id: 3,
    title: "Shorten the durood at tashahhud",
    detail:
      "At the point of durood recite only 'Allahumma salli 'ala Muhammadin wa 'ala Aali Muhammad', skip full Durood-e-Ibrahimi (the durood of salah) and Dua-e-Masura (the dua after it), then turn salam.",
  },
  {
    id: 4,
    title: "Tasbihaat once each",
    detail:
      "Ruku: 'Subhana Rabbiyal-Azeem' once; rising: 'Rabbana lakal-hamd'; sujud: 'Subhana Rabbiyal-A'la' once. Ruku, sujud and jalsa stillness are WAJIB and never shortened.",
  },
  {
    id: 5,
    title: "Witr: replace Dua-e-Qunoot (the witr dua)",
    detail:
      "Say 'Allahumma-ghfir li' one time (valid) or three times (better) then go to ruku.",
  },
];

/** The three makruh windows — no ada and no qaza there. Basis: S5 (Alamgiri),
 *  videos 3,4,5. Minutes are classical practice-city variants; the app uses
 *  prayer-time APIs per-location where available. */
export const MAKRUH_WINDOWS = {
  sunrise: {
    label: "Sunrise (tulu-e-aftab)",
    detail: "From the moment the sun begins to rise until about 15 to 20 minutes later.",
  },
  zawal: {
    label: "Zawal / Jawaal-e-Kubra (sun at zenith)",
    detail: "About 20 to 30 minutes before dhuha, around midday, country-dependent.",
  },
  sunset: {
    label: "Sunset (ghurub-e-aftab)",
    detail:
      "The last 15 to 20 minutes of Asr, until the sun fully sets. Only today's pending Asr may be prayed then; delaying Asr this far is makruh (disliked) and a sin.",
  },
};

/** Myth warnings to debunk (S11, video 5). */
export const MYTH_WARNINGS = [
  {
    id: 1,
    text:
      "The claim that 4 rakats on the last Friday of Ramadan (Jumma-tul-Wida) or on Shab-e-Qadr (the Night of Power) wipes out a lifetime of qaza is baseless; there is no sahih source for it. A lapsed fard remains owed until it is actually prayed.",
  },
  {
    id: 2,
    text:
      "Fidya (money, food or any substitute) cannot replace salah. There is no exemption of any kind for a lapsed fard/wajib other than hayz/nifas; the only way to discharge it is to pray it.",
  },
  {
    id: 3,
    text:
      "The idea of 'one qaza per prayer, lifetime commit only' is wrong. The whole burden must be lifted as soon as possible.",
  },
];

/** The 5 source lectures the masail were extracted from (docs/shariah-basis.md
 *  §8). Shown as links in the Masail tab's sources card. */
export const SOURCE_VIDEOS = [
  {
    id: 1,
    title: "Qaza Namaz Ka Hisab Kaise Lagaye",
    speaker: "Maulana Ilyas Qadri",
    url: "https://youtu.be/FjFz1zdBPS4",
  },
  {
    id: 2,
    title: "Qaza-e-Umri Namaz Ki Niyyat Kese Karen",
    speaker: "Allama Tahir Madani",
    url: "https://youtu.be/4ogS2LTQCXg",
  },
  {
    id: 3,
    title: "Qaza Namaz Ka Asan Tariqa",
    speaker: "Maulana Ilyas Qadri",
    url: "https://youtu.be/L25xPDo7cbw",
  },
  {
    id: 4,
    title: "Qaza-e-Umri Ke 5 Zaroori Masail",
    speaker: "Allama Tahir Madani",
    url: "https://youtu.be/YyL5HvOXKuM",
  },
  {
    id: 5,
    title: "Qaza-e-Umri Ka Tareeqa",
    speaker: "Allama Azhar Saeed",
    url: "https://youtu.be/KTyzis5k4gc",
  },
] as const;

export const CITATIONS = {
  hadith:
    "Bukhari 1/84, Muslim 1/241: 'Whoever forgets a salah, let him pray it when he remembers it; its only kaffara is adaa (praying it).'",
  azalHazrat:
    "Method & lightening rulings attributed to Fatawa-e-Radhwiyya (Ala Hazrat Imam Ahmad Raza Khan رحمه الله) — cit: islamweb fatwa #95419.",
};

/** The two anchor references for why qaza is repaid, shown on the welcome
 *  page and in the Masail tab's "Why qaza?" card. Arabic kept short and
 *  exact; translations stay plain. */
export const WHY_QAZA = [
  {
    id: 1,
    source: "Quran, Surah An-Nisa 4:103",
    arabic: "إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا",
    text: "Indeed, prayer has been decreed upon the believers a decree of specified times.",
  },
  {
    id: 2,
    source: "Sahih al-Bukhari 597, narrated by Anas ibn Malik (may Allah be pleased with him)",
    arabic: "مَنْ نَسِيَ صَلَاةً فَلْيُصَلِّهَا إِذَا ذَكَرَهَا، لَا كَفَارَةَ لَهَا إِلَّا ذَلِكَ",
    text: "Whoever forgets a prayer, let him pray it when he remembers it; there is no expiation for it other than this.",
    note: "The same ruling is reported in Sahih Muslim 684.",
  },
] as const;

/** Full explanations behind the "i" info buttons (rendered by the TermInfo
 *  component). The concise bracket glosses stay inline in the copy; these
 *  carry the fuller fiqh for terms a user may want to actually understand. */
export const TERMS = {
  bulugh: {
    text: "Bulugh (puberty) is the point at which salah becomes fard (obligatory). For a boy the latest age is 12 lunar years, for a girl 9 lunar years, and both can begin earlier. If you do not remember, count from the fallback age; an over-count is safer than an under-count.",
  },
  hayz: {
    text: "Hayz (menstruation) is a woman's monthly bleeding. Salah is not prayed during it and is fully forgiven: no qaza is owed for those prayers. That is why the app subtracts your usual hayz days from every month of the counted years.",
  },
  nifas: {
    text: "Nifas (post-childbirth bleeding) is the bleeding after a delivery, up to 40 days. Like hayz, salah is excused during it and none of it is owed. The app does not ask for deliveries separately, so keep your monthly hayz estimate a little higher if you had births in these years.",
  },
  takhfeef: {
    text: "Takhfeef (lightening) is the sanctioned way to shorten a qaza rakat so a large backlog stays doable. The arkaan (essential acts) are never dropped: ruku (bowing), sujud (prostration) and jalsa (the sitting between) stay complete. What is eased is the recitation and the sunnah parts, as listed above.",
  },
  tarteeb: {
    text: "Tarteeb (order) means keeping the qazas in the order the salahs were missed: Fajr before Zuhr, Zuhr before Asr, and so on. While six classes of qaza are outstanding, the order is wajib (required). Once fewer than six remain, the requirement drops and any pending qaza may be prayed.",
  },
  yearsPrayedFully: {
    text: "Only a year of keeping all five salahs, every single day, counts as a fully prayed year. Example: your salah stayed regular from age 18 to 22, then slipped; enter 4. Each such year is subtracted from your count, wherever those years sit between bulugh and today. Never had a regular stretch? Enter 0. If you are unsure, enter fewer years; the count then leans heavier, which is the safe side.",
  },
} as const;

export type TermKey = keyof typeof TERMS;
