/* Sage across the site (Ami, 20 Oct 2026): every page from scroll zero with a
   real wheel, a shot every 1.2 screens, errors collected. node lab/sage-site-sweep.mjs <outdir> */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
const out = process.argv[2];
const PAGES = (process.argv[3] || 'index,what-we-do').split(',');
const b = await chromium.launch({ channel: 'chrome' });
for (const [w, h] of [[1440, 900], [390, 844]]) {
  for (const pg of PAGES) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto(pathToFileURL(process.cwd() + `/index/${pg}.html`).href, { waitUntil: 'load' });
    await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
    await p.mouse.move(w / 2, h / 2);
    let i = 0;
    while (i < 40) {
      await p.screenshot({ path: `${out}/${pg}-${w}-${String(i).padStart(2, '0')}.jpg`, quality: 60 }); i++;
      if (await p.evaluate(() => scrollY + innerHeight >= document.documentElement.scrollHeight - 2)) break;
      for (let k = 0; k < 12; k++) { await p.mouse.wheel(0, Math.round(h * 0.1)); await p.waitForTimeout(40); }
      await p.waitForTimeout(650);
    }
    console.log(pg, w, 'shots', i, errs.length ? 'ERRORS ' + JSON.stringify(errs.slice(0, 3)) : 'ok');
    await p.close();
  }
}
await b.close();
