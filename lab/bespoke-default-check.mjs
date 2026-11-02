// Bespoke opens on 30 days (TJ, 1 Nov 2026; Opus): on a fresh load the 30 day
// option is ticked, and the bar, Your programme and its summary line all read
// the 30 day figure. Shoots the How long screen. node lab/bespoke-default-check.mjs <out>
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import os from 'node:os';
import path from 'node:path';
const OUT = process.argv[2] || os.tmpdir();
const b = await chromium.launch({ channel: 'chrome' });
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(pathToFileURL(path.join(process.cwd(), 'index', 'build-your-programme.html')).href);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
  const r = await p.evaluate(() => ({
    ticked: document.querySelector('input[name="days"]:checked').value,
    bar: document.querySelector('.dk-fee__amount').textContent,
    summary: document.querySelector('.dk-decide .dk-sumfee').textContent,
    name: (document.querySelector('.dk-decide') || document.body).innerText.match(/\d+ day bespoke programme/i)?.[0] || '(name not found)',
  }));
  console.log(w, JSON.stringify(r));
  // shoot the How long screen: bring its page into view inside the deck
  await p.evaluate(() => {
    const pg = document.querySelector('input[name="days"]').closest('.dk-page');
    const box = document.createElement('div'); box.className = 'dk';
    box.style.cssText = 'position:fixed;inset:0;z-index:99999;background:var(--g-canvas);padding:40px 24px;overflow:auto';
    const c = pg.querySelector('.dk-in').cloneNode(true); box.appendChild(c); document.body.appendChild(box);
    box.querySelectorAll('*').forEach(n => { n.style.opacity = '1'; n.style.transform = 'none'; n.style.visibility = 'visible'; });
  });
  await p.waitForTimeout(400);
  await p.screenshot({ path: path.join(OUT, `bespoke-default-${w}.png`) });
  await p.close();
}
await b.close();
