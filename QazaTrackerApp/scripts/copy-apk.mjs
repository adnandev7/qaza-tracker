// Copies the hosted APK from ../releases into dist/ before `vercel deploy dist`.
// The APK lives OUTSIDE the app project (repo-root releases/) so EAS Build
// archives stay small; the website deploy is what needs it next to index.html.
import { copyFile, access, mkdir } from "node:fs/promises";
import { constants } from "node:fs";

const source = new URL("../../releases/qaza-tracker.apk", import.meta.url);
const targetDir = new URL("../dist", import.meta.url);
const target = new URL("../dist/qaza-tracker.apk", import.meta.url);

try {
  await access(source, constants.F_OK);
} catch {
  console.warn("no APK found at releases/qaza-tracker.apk, skipping copy");
  process.exit(0);
}

await mkdir(targetDir, { recursive: true });
await copyFile(source, target);
console.log("copied releases/qaza-tracker.apk into dist/");
