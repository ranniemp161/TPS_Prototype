// Jost rollout check (Fable, 1 Nov 2026): fonts resolved, then computed
// font-family on reading text, FAQ right side and prices, plus shots.
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = process.argv[2] || os.tmpdir();
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync);

const JOBS = [
  { page: 'index.html',      name: 'home',  probes: ['.act--turn .turn__standfirst', '.voices blockquote, .tv2__quote', '.cta .body, .act--cta p'], scrollTo: '.act--turn .turn__standfirst' },
  { page: 'faqs.html',       name: 'faqs',  probes: ['.page--faqs .faq__group > .wwd-h3', '.page--faqs .q summary', '.page--faqs .q p', '.faq__nav a'], scrollTo: '.faq__groups' },
  { page: 'programmes.html', name: 'prog',  probes: ['.pg-price, [class*="price"] b, .pg-card__price', '.pg-look .pg-h2'], scrollTo: null },
];

const b = await chromium.launch({ executablePath: exe });
for (const job of JOBS) {
  for (const w of [1440, 390]) {
    const p = await b.newPage({ viewport: { width: w, height: w > 800 ? 900 : 844 } });
    await p.goto(pathToFileURL(path.join(ROOT, 'index', job.page)).href, { waitUntil: 'load', timeout: 60000 });
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(900);
    const loaded = await p.evaluate(() => ['400','500','700'].map(wt => `${wt}: ${document.fonts.check(`${wt} 16px Jost`)}`).join(', '));
    console.log(`${job.name} ${w}  Jost loaded -> ${loaded}`);
    for (const sel of job.probes) {
      const r = await p.evaluate(s => {
        const el = document.querySelector(s);
        return el ? getComputedStyle(el).fontFamily : '(none)';
      }, sel);
      console.log(`  ${sel} -> ${r}`);
    }
    if (job.scrollTo) {
      // real wheel until the target is in view, per the fonts.ready lesson
      for (let y = 0; y < 30000; y += 160) {
        await p.mouse.wheel(0, 160); await p.waitForTimeout(40);
        const ok = await p.evaluate(s => {
          const el = document.querySelector(s); if (!el) return true;
          const r = el.getBoundingClientRect();
          return r.top > 0 && r.top < innerHeight * 0.6;
        }, job.scrollTo);
        if (ok) break;
      }
      await p.waitForTimeout(900);
    }
    await p.screenshot({ path: path.join(OUT, `jost-${job.name}-${w}.png`) });
    await p.close();
  }
}
await b.close();
console.log('shots in', OUT);
