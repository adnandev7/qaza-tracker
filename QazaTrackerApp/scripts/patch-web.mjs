// Adds favicon link tags to dist/index.html after `expo export`.
// The PNG links use URLs browsers have never cached, so visitors whose
// browser cached a missing /favicon.ico still get the icon on reload.
import { readFile, writeFile } from "node:fs/promises";

const file = new URL("../dist/index.html", import.meta.url);
let html = await readFile(file, "utf8");

const tags = [
  '    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />',
  '    <link rel="icon" type="image/png" sizes="192x192" href="/favicon-192.png" />',
  '    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />',
];

let added = 0;
for (const tag of tags) {
  const href = /href="([^"]+)"/.exec(tag)[1];
  if (!html.includes(`href="${href}"`)) {
    html = html.replace("</head>", `${tag}\n  </head>`);
    added += 1;
  }
}

if (added > 0) {
  await writeFile(file, html);
  console.log(`patched ${added} favicon link(s) into dist/index.html`);
} else {
  console.log("favicon links already present");
}
