// Adds the favicon link tag to dist/index.html after `expo export`.
// The SPA export template does not emit one, and browsers that miss
// /favicon.ico otherwise show a blank tab icon.
import { readFile, writeFile } from "node:fs/promises";

const file = new URL("../dist/index.html", import.meta.url);
let html = await readFile(file, "utf8");

if (html.includes('rel="icon"')) {
  console.log("favicon link already present");
} else {
  html = html.replace(
    "</head>",
    '    <link rel="icon" href="/favicon.ico" sizes="48x48" />\n  </head>'
  );
  await writeFile(file, html);
  console.log("patched favicon link into dist/index.html");
}
