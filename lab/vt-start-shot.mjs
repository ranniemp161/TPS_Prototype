/* Screenshots of A Day With Us as the line begins. node lab/vt-start-shot.mjs <outdir> */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(pathToFileURL(process.cwd() + '/index/what-we-do.html').href);
  await p.waitForLoadState('load'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(800);
  const top = await p.evaluate(() => document.querySelector('#day-with-us').getBoundingClientRect().top + scrollY);
  for (const f of [0.6, 0.9, 1.2, 1.6]) {
    await p.evaluate(y => scrollTo(0, y), top + f * h); await p.waitForTimeout(1200);
    const m = await p.evaluate(() => {
      const r = s => document.querySelector(s).getBoundingClientRect();
      return { photoBottom: Math.round(r('.vt__slot').bottom), cap: Math.round(r('.vt__cap').top), tip: Math.round(r('.vt__tip').top) };
    });
    console.log(w, f, JSON.stringify(m));
    await p.screenshot({ path: `${out}/vt-${w}-${f}.png` });
  }
  await p.close();
}
await b.close();
