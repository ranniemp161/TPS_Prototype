/* As a person actually does it: open the page with the hash still in the
   address bar, then wheel back to the top. Nothing in this test touches
   scroll-behavior or calls scrollTo, so the page behaves exactly as it
   ships. Repeated, because the fault it is looking for was a race.
     node lab/humanhash.mjs [runs] */
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RUNS = +(process.argv[2] || 5);
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));
const b = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });

const READ = () => {
  const st = document.querySelector('.act--hero .stage');
  const r = st.getBoundingClientRect();
  return { y: Math.round(window.scrollY), top: Math.round(r.top),
           pos: getComputedStyle(st).position,
           op: +getComputedStyle(st).opacity,
           trig: ScrollTrigger.getAll().length };
};

let bad = 0;
for (let run = 1; run <= RUNS; run++) {
  const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
  const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto(pathToFileURL(path.join(ROOT, process.env.TPS_TARGET || 'v1.html')).href + '#programmes', { waitUntil: 'load' });
  await p.waitForFunction(() => document.documentElement.classList.contains('sc-ready'), { timeout: 20000 });
  await p.waitForTimeout(1500);
  const landed = await p.evaluate(() => Math.round(window.scrollY));

  // wheel all the way back up, like a person
  await p.mouse.move(800, 450);
  for (let i = 0; i < 200; i++) { await p.mouse.wheel(0, -900); await p.waitForTimeout(12); }
  await p.waitForTimeout(2500);

  const r = await p.evaluate(READ);
  const ok = r.y === 0 && r.top === 0 && r.pos === 'fixed' && r.op > 0.99;
  if (!ok) bad++;
  if (!ok || run === 1) await p.screenshot({ path: `C:/Users/LenoVo/AppData/Local/Temp/hh_run${run}.png` });
  console.log(`run ${run}  landed ${String(landed).padStart(6)}  back at top: scrollY ${r.y}  hero top ${r.top} ${r.pos} op ${r.op.toFixed(2)}  triggers ${r.trig}  ${ok ? 'OK' : '<<< HERO WRONG'}${errs.length ? '  errors: ' + errs.join('|') : ''}`);
  await p.close();
}
console.log(bad ? `\n${bad} of ${RUNS} runs left the hero wrong.` : `\nAll ${RUNS} runs: hero pinned and full at the top after a hash load.`);
await b.close();
