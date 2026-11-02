// Trial only, no file change: Programmes intro as two columns at the card's width (TJ, 2 Nov 2026; Opus).
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const OUT = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
for (const [w, h] of [[1440, 900], [1280, 720], [1920, 1080]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(pathToFileURL(path.join(process.cwd(), 'index', 'programmes.html')).href);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
  const m = () => p.evaluate(() => {
    const r = s => document.querySelector(s).getBoundingClientRect();
    const card = document.querySelector('[data-pg-card]').getBoundingClientRect();
    return { lookW: Math.round(r('.pg-look').width), lookH: Math.round(r('.pg-look').height), cardW: card && Math.round(card.width), cardBottom: card && Math.round(card.bottom) };
  });
  const before = await m();
  const cw = before.cardW;
  await p.addStyleTag({ content: `@media (min-width: 861px) {
    .pg-look { width: ${cw}px !important; max-width: none !important; margin-left: auto !important; margin-right: auto !important; transform: none !important;
      display: grid; grid-template-columns: 1.25fr 1fr; column-gap: 48px; text-align: left; margin-top: 14px !important; margin-bottom: 4px !important; }
    .pg-look .pg-look__p, .pg-look .pg-look__p + .pg-look__p { margin: 0 !important; }
  }` });
  await p.waitForTimeout(800);
  const after = await m();
  console.log(w + 'x' + h, 'before', JSON.stringify(before), 'after', JSON.stringify(after));
  await p.screenshot({ path: path.join(OUT, `cols-trial-c-${w}.png`) });
  await p.close();
}
await b.close();
