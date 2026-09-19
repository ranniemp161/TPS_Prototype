/* Render the card colour options against the live section without changing
   the site. Each option is injected as a stylesheet at runtime, screenshot,
   then thrown away. v1.css is never written to.
     node lab/cardladder.mjs <outdir> */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
const ROOT = "G:/My Drive/Rannie and Tj's Projects/The Post Partum Suit/postpartum-prototype";
const OUT = process.argv[2];
mkdirSync(OUT, { recursive: true });

const NOSHADOW = `.voices__card{box-shadow:none;}
                  .voices__card:hover{box-shadow:none;}`;

const OPTIONS = [
  ['0-now',        'Paper card on Canvas, with the shadow. What is there now.', ''],
  ['1-same',       'Canvas card on Canvas. Same colour as the ground, hairline only, no shadow.',
                   NOSHADOW + `.voices__card{background:var(--canvas);border-color:var(--hairline-firm);}`],
  ['2-haze',       'Haze card on Canvas. A real fill, warm, no shadow.',
                   NOSHADOW + `.voices__card{background:var(--haze);border-color:transparent;}`],
  ['3-paper-flat', 'Paper card on Canvas with the shadow removed and the hairline doing the work.',
                   NOSHADOW + `.voices__card{background:var(--paper);border-color:var(--hairline-firm);}`],
  ['4-band',       'Blush band section with Paper cards, the pairing the pan act already uses.',
                   NOSHADOW + `.act--voices{background:var(--blush);}
                    .voices__card{background:var(--paper);border-color:transparent;}`],
  ['5-invert',     'Paper ground with Canvas cards, the current pairing turned around.',
                   NOSHADOW + `.act--voices{background:var(--paper);}
                    .voices__card{background:var(--canvas);border-color:var(--hairline);}`]
];

const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));
const b = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });
b.on('disconnected', () => process.exit(1));
for (const [tag, note, css] of OPTIONS) {
  const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
  await p.goto(pathToFileURL(path.join(ROOT, 'v1.html')).href, { waitUntil: 'load' });
  await p.waitForFunction(() => document.documentElement.classList.contains('sc-ready'), { timeout: 20000 });
  await p.waitForTimeout(700);
  await p.evaluate(v => window.scrollTo(0, window.innerHeight * v), 3.02);
  await p.waitForTimeout(900);
  if (css) await p.addStyleTag({ content: css });
  await p.waitForTimeout(400);
  await p.screenshot({ path: path.join(OUT, tag + '.png') });
  console.log(tag.padEnd(14), note);
  await p.close();
}
await b.close();
