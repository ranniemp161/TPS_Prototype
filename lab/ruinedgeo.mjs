import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));
const b = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });
const READ = () => {
  const g = s => { const e = document.querySelector(s); if (!e) return null;
    const r = e.getBoundingClientRect(); const cs = getComputedStyle(e);
    return [Math.round(r.top), Math.round(r.height), cs.position, Math.round(+cs.opacity*1000)]; };
  return { heroStage: g('.act--hero .stage'), bathAct: g('.act--bath'), bathBox: g('.bath'),
           bathImg: g('.bath__img'), veil: g('[data-fog-veil]'), ground: g('[data-bath-ground]') };
};
const trace = async file => {
  const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
  await p.goto(pathToFileURL(path.join(ROOT, file)).href, { waitUntil: 'load' });
  await p.waitForFunction(() => document.documentElement.classList.contains('sc-ready'), { timeout: 20000 });
  await p.waitForTimeout(900);
  await p.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
  const rows = [];
  for (let i = 0; i <= 29; i++) {
    const v = +(i * 0.1).toFixed(1);
    await p.evaluate(y => window.scrollTo(0, window.innerHeight * y), v);
    let prev = null, cur = null;
    for (let t = 0; t < 20; t++) {
      await p.waitForTimeout(105);
      cur = await p.evaluate(READ);
      if (prev && JSON.stringify(prev) === JSON.stringify(cur)) break;
      prev = cur;
    }
    rows.push([v, cur]);
  }
  await p.close();
  return rows;
};
const aft = await trace('v1-ruined.html');
const bef = await trace('lab/ruined-before/v1.html');
let faults = 0;
for (let i = 0; i < aft.length; i++) {
  const [v, A] = aft[i], B = bef[i][1];
  for (const k of Object.keys(A)) {
    const a = A[k], c = B[k];
    if (!a || !c) continue;
    if (a[2] !== c[2] || Math.abs(a[0]-c[0]) > 2 || Math.abs(a[1]-c[1]) > 2 || Math.abs(a[3]-c[3]) > 20) {
      faults++;
      console.log(`  ${v}vh ${k}: before ${JSON.stringify(c)}  after ${JSON.stringify(a)}`);
    }
  }
}
console.log(faults ? `\n${faults} geometry differences in the handoff.`
                   : '\nHandoff geometry identical at all 30 positions: hero, bath, image, veil, ground.');
await b.close();
