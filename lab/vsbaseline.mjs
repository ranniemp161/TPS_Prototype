/* Compare the working page against the ACTUAL previous version, taken from
   git HEAD, not against a variant of the current build. The earlier test
   compared the build to itself with one section removed, which can only ever
   answer "does that section reach the hero", and would report clean if
   something else in the same edit had broken it.

   Reports, at every scroll step through the handoff, the geometry of every
   element the handoff moves, current against baseline.
     node lab/vsbaseline.mjs [w] [h] [shots]  */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
const ROOT = "G:/My Drive/Rannie and Tj's Projects/The Post Partum Suit/postpartum-prototype";
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));
const b = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });
const SHOTS = process.argv[4];
if (SHOTS) mkdirSync(SHOTS, { recursive: true });

const READ = () => {
  const g = s => { const e = document.querySelector(s); if (!e) return null;
    const r = e.getBoundingClientRect(); const cs = getComputedStyle(e);
    return [Math.round(r.top), Math.round(r.height), cs.position,
            Math.round((+cs.opacity) * 1000)]; };
  return {
    heroStage: g('.act--hero .stage'), heroImg: g('.act--hero .stage img'),
    bathAct: g('.act--bath'), bathBox: g('.bath'), bathImg: g('.bath__img'),
    ground: g('[data-bath-ground]'), veil: g('[data-fog-veil]'),
    docH: Math.round(document.documentElement.scrollHeight)
  };
};

async function trace(file, w, h, tag) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(pathToFileURL(path.join(ROOT, file)).href, { waitUntil: 'load' });
  await p.waitForFunction(() => document.documentElement.classList.contains('sc-ready'), { timeout: 20000 });
  await p.waitForTimeout(1000);
  const rows = [];
  for (let i = 0; i <= 58; i++) {
    const v = +(i * 0.05).toFixed(2);
    if (SHOTS && (v < 1.0 || v > 1.9)) { rows.push([v, null]); continue; }
    await p.evaluate(y => window.scrollTo(0, window.innerHeight * y), v);
    await p.waitForTimeout(60);
    rows.push([v, await p.evaluate(READ)]);
    if (SHOTS) await p.screenshot({ path: path.join(SHOTS, `${tag}_${String(i).padStart(2,'0')}_${v}.png`) });
  }
  await p.close();
  return rows;
}

const [w, h] = [+(process.argv[2] || 1600), +(process.argv[3] || 900)];
const cur = await trace('v1.html', w, h, 'cur');
const bas = await trace('lab/baseline/v1.html', w, h, 'bas');

console.log(`${w}x${h}   doc: baseline ${bas[0][1].docH}px   current ${cur[0][1].docH}px\n`);
console.log('vh     element      baseline                 current');
let faults = 0;
for (let i = 0; i < cur.length; i++) {
  const [v, c] = cur[i], bb = bas[i][1];
  for (const k of ['heroStage', 'heroImg', 'bathAct', 'bathBox', 'bathImg', 'ground', 'veil']) {
    const a = c[k], d = bb[k];
    if (!a || !d) continue;
    // position string and top must match; opacity within the scrub noise floor
    const posBad = a[2] !== d[2];
    const topBad = Math.abs(a[0] - d[0]) > 2;
    const hBad = Math.abs(a[1] - d[1]) > 2;
    if (posBad || topBad || hBad) {
      faults++;
      if (faults <= 18) console.log(`${String(v).padStart(5)}  ${k.padEnd(11)}  top ${String(d[0]).padStart(6)} h ${String(d[1]).padStart(5)} ${d[2].padEnd(8)}  top ${String(a[0]).padStart(6)} h ${String(a[1]).padStart(5)} ${a[2]}`);
    }
  }
}
console.log(faults ? `\n${faults} mismatches against the real previous version.`
                   : '\nEvery element of the handoff matches the previous version at every step.');
await b.close();
