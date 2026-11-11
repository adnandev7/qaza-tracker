/**
 * make-qr.mjs — branded QR codes for the Qaza Tracker APK download link.
 *
 * Produces two images in the workspace-root releases/ folder:
 *   qaza-tracker-qr.png        1080x1080, QR only, logo in the center
 *   qaza-tracker-qr-poster.png 1080x1350, status/poster card with title and link
 *
 * Design: rounded emerald modules on ivory, solid nested finder patterns,
 * mihrab app icon centered with a gold ring. Error correction H (30%), so
 * the covered center stays well within recovery limits. Every output is
 * decoded with jsQR afterwards; the script fails loudly if any image does
 * not scan back to the exact download URL.
 */
import QRCode from "qrcode";
import sharp from "sharp";
import jsQR from "jsqr";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.resolve(here, "..");
const outDir = path.resolve(appDir, "..", "releases");
fs.mkdirSync(outDir, { recursive: true });

const TARGET = "https://qaza-tracker-app.vercel.app/qaza-tracker.apk";
const IVORY = "#F7F5EE";
const EMERALD = "#0E5F4B";
const DEEP = "#123B31";
const GOLD = "#C9A227";
const ON_HERO_MUTED = "rgba(244, 241, 230, 0.75)";

const squarePath = path.join(outDir, "qaza-tracker-qr.png");
const posterPath = path.join(outDir, "qaza-tracker-qr-poster.png");

/** Build the QR matrix as an SVG: rounded modules, solid nested finders. */
function qrSvg(target, px) {
  const qr = QRCode.create(target, { errorCorrectionLevel: "H" });
  const n = qr.modules.size;
  const data = qr.modules.data;
  const quiet = 4;
  const cell = px / (n + quiet * 2);
  const total = px;
  const isDark = (x, y) => x >= 0 && y >= 0 && x < n && y < n && !!data[y * n + x];
  const inFinder = (x, y) =>
    (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7);

  const rects = [];
  const r = cell * 0.3;
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (!isDark(x, y) || inFinder(x, y)) continue;
      rects.push(
        `<rect x="${((quiet + x) * cell).toFixed(2)}" y="${((quiet + y) * cell).toFixed(2)}" width="${cell.toFixed(2)}" height="${cell.toFixed(2)}" rx="${r.toFixed(2)}"/>`,
      );
    }
  }

  const finder = (cx, cy) =>
    `<rect x="${(quiet + cx) * cell}" y="${(quiet + cy) * cell}" width="${7 * cell}" height="${7 * cell}" rx="${cell * 1.9}" fill="${EMERALD}"/>` +
    `<rect x="${(quiet + cx + 1) * cell}" y="${(quiet + cy + 1) * cell}" width="${5 * cell}" height="${5 * cell}" rx="${cell * 1.3}" fill="${IVORY}"/>` +
    `<rect x="${(quiet + cx + 2) * cell}" y="${(quiet + cy + 2) * cell}" width="${3 * cell}" height="${3 * cell}" rx="${cell * 0.9}" fill="${EMERALD}"/>`;

  return {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${total}" height="${total}" viewBox="0 0 ${total} ${total}">
<rect width="${total}" height="${total}" fill="${IVORY}"/>
<g fill="${EMERALD}">${rects.join("")}</g>
${finder(0, 0)}${finder(n - 7, 0)}${finder(0, n - 7)}
</svg>`,
    modules: n,
    version: qr.version,
  };
}

/** Rounded-corner mask (white shape on transparent) for dest-in compositing. */
function roundedMask(w, h, rx) {
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${rx}" fill="#fff"/></svg>`,
  );
}

/** Square QR with the mihrab logo centered under a gold ring. */
async function makeSquare() {
  const px = 1080;
  const { svg, modules, version } = qrSvg(TARGET, px);
  const base = await sharp(Buffer.from(svg)).png().toBuffer();

  const plate = Math.round(px * 0.225); // 22.5% of width, safe under ECC H
  const icon = await sharp(path.join(appDir, "assets", "icon.png"))
    .resize(plate, plate)
    .composite([
      {
        input: roundedMask(plate, plate, Math.round(plate * 0.26)),
        blend: "dest-in",
      },
    ])
    .png()
    .toBuffer();

  const gap = 12;
  const ringSide = plate + gap * 2;
  const ringSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}">
<rect x="${(px - ringSide) / 2}" y="${(px - ringSide) / 2}" width="${ringSide}" height="${ringSide}" rx="${(ringSide * 0.26).toFixed(1)}" fill="none" stroke="${GOLD}" stroke-width="7"/>
</svg>`;
  const ring = await sharp(Buffer.from(ringSvg)).png().toBuffer();

  const left = Math.round((px - plate) / 2);
  const ringLeft = Math.round((px - ringSide) / 2);
  const top = left;
  await sharp(base)
    .composite([
      { input: icon, top, left },
      { input: ring, top: ringLeft, left: ringLeft },
    ])
    .png()
    .toFile(squarePath);
  return { px, modules, version };
}

/** Poster card for WhatsApp status / sharing. */
async function makePoster(squarePng) {
  const W = 1080;
  const H = 1350;
  const qrB64 = (await sharp(squarePng).png().toBuffer()).toString("base64");
  const qrSide = 700;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<rect width="${W}" height="${H}" fill="${DEEP}"/>
<rect x="34" y="34" width="${W - 68}" height="${H - 68}" rx="30" fill="none" stroke="${GOLD}" stroke-width="2.5"/>
<text x="540" y="150" text-anchor="middle" font-family="Inter, Segoe UI, Arial, sans-serif" font-size="72" font-weight="700" fill="${IVORY}">Qaza Tracker</text>
<text x="540" y="212" text-anchor="middle" font-family="Inter, Segoe UI, Arial, sans-serif" font-size="30" font-weight="400" fill="${ON_HERO_MUTED}">A lifetime of qaza, counted fairly, completed step by step</text>
<image x="${(W - qrSide) / 2}" y="290" width="${qrSide}" height="${qrSide}" href="data:image/png;base64,${qrB64}"/>
<text x="540" y="1105" text-anchor="middle" font-family="Inter, Segoe UI, Arial, sans-serif" font-size="42" font-weight="600" fill="${IVORY}">Scan to download</text>
<text x="540" y="1165" text-anchor="middle" font-family="Inter, Segoe UI, Arial, sans-serif" font-size="28" font-weight="500" fill="${GOLD}">qaza-tracker-app.vercel.app/qaza-tracker.apk</text>
<text x="540" y="1268" text-anchor="middle" font-family="Inter, Segoe UI, Arial, sans-serif" font-size="24" font-weight="400" fill="${ON_HERO_MUTED}">For Android. Install once, updates arrive on their own.</text>
</svg>`;
  await sharp(Buffer.from(svg)).png().toFile(posterPath);
}

/** Decode an image and confirm it scans back to the exact target URL. */
async function verify(file) {
  const { data, info } = await sharp(file)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  if (info.channels !== 4) throw new Error(`${file}: expected RGBA, got ${info.channels} channels`);
  const res = jsQR(
    new Uint8ClampedArray(data.buffer, data.byteOffset, data.length),
    info.width,
    info.height,
  );
  return res ? res.data : null;
}

const { modules, version } = await makeSquare();
await makePoster(squarePath);

const squareScan = await verify(squarePath);
const posterScan = await verify(posterPath);

console.log(`qr matrix: ${modules} modules, version ${version}, ecc H`);
console.log(`square: ${squareScan === TARGET ? "SCANS OK" : `DECODE MISMATCH: ${squareScan}`} -> ${squarePath}`);
console.log(`poster: ${posterScan === TARGET ? "SCANS OK" : `DECODE MISMATCH: ${posterScan}`} -> ${posterPath}`);
if (squareScan !== TARGET || posterScan !== TARGET) process.exit(1);
