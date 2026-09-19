/* Scan the hero-to-bath handoff for the reported fault: the hero scene sitting
   lower than the top of the window with page ground above it, so its own top
   edge comes into frame.

   Runs a matrix of viewport sizes, because TJ's browser is zoomed and every
   number in the handoff is expressed in svh. Each size runs twice: once with
   the page as built, once with .act--voices removed from the DOM before boot,
   which is the control. If the fault is only in the first column it is the
   new section.
     node lab/heroscan.mjs */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import { existsSync } from 'node:fs';
import path from 'node:path';
const ROOT = "G:/My Drive/Rannie and Tj's Projects/The Post Partum Suit/postpartum-prototype";
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));
const b = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });

const SIZES = [[1920, 950], [1280, 670], [1097, 545], [1536, 730], [1366, 620], [1600, 900]];

async function run(w, h, control) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  if (control) {
    await p.addInitScript(() => {
      document.addEventListener('DOMContentLoaded', () => {
        const v = document.querySelector('.act--voices');
        if (v) v.remove();
      });
    });
  }
  await p.goto(pathToFileURL(path.join(ROOT, 'v1.html')).href, { waitUntil: 'load' });
  await p.waitForFunction(() => document.documentElement.classList.contains('sc-ready'), { timeout: 20000 });
  await p.waitForTimeout(900);

  let worst = 0, worstAt = 0;
  const read = async () => p.evaluate(() => {
    const st = document.querySelector('.act--hero .stage');
    const r = st.getBoundingClientRect();
    return { top: r.top, pos: getComputedStyle(st).position, y: window.scrollY,
             op: +getComputedStyle(st).opacity };
  });
  // Down through the handoff, then back up through it.
  const stops = [];
  for (let v = 0; v <= 2.6; v += 0.04) stops.push(v);
  for (let v = 2.6; v >= 0; v -= 0.04) stops.push(v);
  for (const v of stops) {
    await p.evaluate(y => window.scrollTo(0, window.innerHeight * y), v);
    await p.waitForTimeout(45);
    const r = await read();
    // Fault: the hero scene is still the thing on screen (visible, and the
    // bath has not covered it) but its top edge is below the top of the window.
    if (r.op > 0.02 && r.top > worst) { worst = r.top; worstAt = v; }
  }
  await p.close();
  return { worst: Math.round(worst), at: worstAt.toFixed(2) };
}

console.log('viewport      as built            control (no voices)');
for (const [w, h] of SIZES) {
  const a = await run(w, h, false);
  const c = await run(w, h, true);
  const flag = a.worst > 4 ? '  <-- FAULT' : '';
  console.log(`${(w + 'x' + h).padEnd(12)}  gap ${String(a.worst).padStart(5)}px @ ${a.at}vh    gap ${String(c.worst).padStart(5)}px @ ${c.at}vh${flag}`);
}
await b.close();
