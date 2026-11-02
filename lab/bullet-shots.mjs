// Site wide bullet check (Opus, 1 Nov 2026): every live bullet list, in
// Coral and Cognac, at 1440 and 390. Reports dot size, colour and the first
// line's centre offset; shoots each list. node lab/bullet-shots.mjs <outdir>
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import os from 'node:os';
import path from 'node:path';
const OUT = process.argv[2] || os.tmpdir();
const b = await chromium.launch({ channel: 'chrome' });
const LISTS = [
  { page: 'index.html', sel: '.care__list', name: 'home-care' },
  { page: 'build-your-programme.html', sel: '.dk-decide__list', name: 'bespoke-summary' },
  { page: 'build-your-programme.html', sel: '.close__gets', name: 'bespoke-close' },
  { page: 'programmes.html', sel: '.pg-kind__list', name: 'programmes-ref' },
];
for (const pal of ['coral', 'cognac']) {
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    for (const L of LISTS) {
      const p = await b.newPage({ viewport: { width: w, height: h } });
      await p.goto(pathToFileURL(path.join(process.cwd(), 'index', L.page)).href + `?palette=${pal}`);
      await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1200);
      const info = await p.evaluate(sel => {
        const li = document.querySelector(sel + ' li'); if (!li) return 'no items';
        const d = getComputedStyle(li, '::before');
        const lh = parseFloat(getComputedStyle(li).lineHeight);
        const pt = parseFloat(getComputedStyle(li).paddingTop);
        const dotCentre = parseFloat(d.top) + parseFloat(d.height) / 2;
        return `${d.width}x${d.height} r=${d.borderRadius} ${d.backgroundColor} | dot centre ${dotCentre.toFixed(1)}px, line centre ${(pt + lh / 2).toFixed(1)}px | pad-left ${getComputedStyle(li).paddingLeft}`;
      }, L.sel);
      console.log(pal, w, L.name.padEnd(16), info);
      const el = p.locator(L.sel).first();
      try {
        await el.evaluate(n => { n.closest('section, .dk-page, article')?.scrollIntoView({ block: 'center' }); n.scrollIntoView({ block: 'center' }); });
        await p.waitForTimeout(700);
        await el.screenshot({ path: path.join(OUT, `bullets-${pal}-${w}-${L.name}.png`), timeout: 8000 });
      } catch (e) { console.log('   (no shot:', e.message.split('\n')[0], ')'); }
      await p.close();
    }
  }
}
await b.close();
