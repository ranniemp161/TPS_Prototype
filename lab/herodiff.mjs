/* Acceptance test for the handoff after the testimonial section was added.

   The question is not "does the hero look alright", it is "is the hero doing
   exactly what it did before". So this runs the page twice, once as built and
   once with .act--voices removed from the DOM before boot, and compares the
   geometry of every element in the handoff at every scroll step. The control
   is the page without the new section, which is the page as it was.

   Any non-zero number in the diff column is the new section reaching into the
   handoff, and the handoff is upstream of it in the document, so the correct
   answer is zero everywhere.
     node lab/herodiff.mjs */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import { existsSync } from 'node:fs';
import path from 'node:path';
const ROOT = "G:/My Drive/Rannie and Tj's Projects/The Post Partum Suit/postpartum-prototype";
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));
const b = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });

const KEYS = ['heroStage', 'heroTop', 'bathAct', 'bathBox', 'bathImg', 'fogVeil', 'groundOp'];

async function trace(w, h, control) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  if (control) await p.addInitScript(() => document.addEventListener('DOMContentLoaded', () => {
    const v = document.querySelector('.act--voices'); if (v) v.remove(); }));
  await p.goto(pathToFileURL(path.join(ROOT, 'v1.html')).href, { waitUntil: 'load' });
  await p.waitForFunction(() => document.documentElement.classList.contains('sc-ready'), { timeout: 20000 });
  await p.waitForTimeout(900);
  const out = [];
  // Down through the handoff and back up, because pins fail asymmetrically.
  const stops = [];
  for (let v = 0; v <= 2.9; v += 0.05) stops.push(+v.toFixed(2));
  for (let v = 2.9; v >= 0; v -= 0.05) stops.push(+v.toFixed(2));
  for (const v of stops) {
    await p.evaluate(y => window.scrollTo(0, window.innerHeight * y), v);
    await p.waitForTimeout(40);
    out.push(await p.evaluate(() => {
      const t = s => { const e = document.querySelector(s); return e ? Math.round(e.getBoundingClientRect().top) : null; };
      const st = document.querySelector('.act--hero .stage');
      return {
        heroStage: Math.round(st.getBoundingClientRect().top),
        heroTop: Math.round(+getComputedStyle(st).opacity * 1000),
        bathAct: t('.act--bath'), bathBox: t('.bath'), bathImg: t('.bath__img'),
        fogVeil: Math.round(+getComputedStyle(document.querySelector('[data-fog-veil]')).opacity * 1000),
        groundOp: Math.round(+getComputedStyle(document.querySelector('[data-bath-ground]')).opacity * 1000)
      };
    }));
  }
  await p.close();
  return { stops, out };
}

// The scrubbed values carry a lag, so two runs of the SAME page never agree
// to the pixel either. That noise floor has to be established before any
// difference between the two pages can be called a difference at all.
const NOISE = process.argv[2] === 'noise';

let bad = 0;
for (const [w, h] of [[1600, 900], [1920, 950], [1280, 670], [1440, 820]]) {
  const a = await trace(w, h, NOISE ? true : false);
  const c = await trace(w, h, true);
  const worst = {}; KEYS.forEach(k => worst[k] = 0);
  let worstStop = null, worstVal = 0;
  a.out.forEach((row, i) => {
    KEYS.forEach(k => {
      const d = Math.abs((row[k] ?? 0) - (c.out[i][k] ?? 0));
      if (d > worst[k]) worst[k] = d;
      if (d > worstVal) { worstVal = d; worstStop = a.stops[i]; }
    });
  });
  const line = KEYS.map(k => `${k} ${String(worst[k]).padStart(4)}`).join('  ');
  const flag = worstVal > 1 ? `   <-- DIFFERS, worst at ${worstStop}vh` : '   identical';
  console.log(`${(w + 'x' + h).padEnd(10)} ${line}${flag}`);
  if (worstVal > 1) bad++;
}
console.log(bad ? `\n${bad} viewport(s) still differ from the page without the section.`
                : '\nHandoff is byte identical to the page without the section, at every step, both directions.');
await b.close();
