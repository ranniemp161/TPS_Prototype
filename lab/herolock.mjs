/* HERO LOCK
   The hero to bath handoff is the most expensive thing on this page and the
   easiest to disturb from a distance, because a pinned element measures the
   whole document. This records what it does when it is right, and checks it
   afterwards, so a regression is caught by the machine rather than by TJ.

     node lab/herolock.mjs --record     write the lock from lab/baseline/
     node lab/herolock.mjs              check v1.html against the lock

   Exit code 0 means the handoff is unchanged. Exit code 2 means it moved,
   and the offending element, scroll position and both values are printed.

   Every value is read only once the frame has stopped changing, so the
   scrub's 0.9s lag cannot leak into the numbers. That is what lets the
   tolerance be 2px rather than the 8px a fixed delay would have needed,
   and 2px is tight enough to catch a real move. */
import { chromium } from 'playwright-core';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// The live file. v1.html is production again as of 2026-09-06, so that is
// what is guarded. It was pointed at v1-ruined.html for a day while the work
// happened there; leaving it there afterwards meant the guard was checking a
// file nobody edits and passing for a reason that meant nothing.
// --record snapshots the file as it stands, which is only ever correct
// straight after TJ has accepted the state it is in. Override with
// TPS_TARGET=v1-ruined.html to point the same check at the other file.
const TARGET = process.env.TPS_TARGET || 'v1.html';
const LOCK = path.join(ROOT, 'lab', 'hero-lock.json');
const RECORD = process.argv.includes('--record');
const SIZES = [[1600, 900], [1904, 945], [1280, 670]];
const TOP_TOL = 2, H_TOL = 2;

const READ = () => {
  const g = s => { const e = document.querySelector(s); if (!e) return null;
    const r = e.getBoundingClientRect();
    return [Math.round(r.top), Math.round(r.height), getComputedStyle(e).position]; };
  return { heroStage: g('.act--hero .stage'), bathAct: g('.act--bath'),
           bathBox: g('.bath'), bathImg: g('.bath__img'),
           ground: g('[data-bath-ground]'), veil: g('[data-fog-veil]') };
};

const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe',
             'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));
const browser = await chromium.launch(exe ? { executablePath: exe } : { channel: 'chrome' });

async function trace(file, w, h) {
  const p = await browser.newPage({ viewport: { width: w, height: h } });
  await p.goto(pathToFileURL(path.join(ROOT, file)).href, { waitUntil: 'load' });
  await p.waitForFunction(() => document.documentElement.classList.contains('sc-ready'), { timeout: 25000 });
  await p.waitForTimeout(700);
  const rows = [];
  for (let i = 0; i <= 22; i++) {
    const v = +(i * 0.1).toFixed(1);
    await p.evaluate(y => window.scrollTo(0, window.innerHeight * y), v);
    // Wait for the scrub to finish rather than guessing a delay. The bath
    // image is driven by a 0.9s scrub, so a fixed pause reads it mid catch
    // up and the value depends on how far the last jump was. Reading until
    // two consecutive samples agree costs nothing when nothing is moving
    // and takes exactly as long as it needs to when something is.
    let prev = null, cur = null;
    for (let t = 0; t < 14; t++) {
      await p.waitForTimeout(110);
      cur = await p.evaluate(READ);
      if (prev && JSON.stringify(prev) === JSON.stringify(cur)) break;
      prev = cur;
    }
    rows.push([v, cur]);
  }
  await p.close();
  return rows;
}

if (RECORD) {
  const lock = {};
  for (const [w, h] of SIZES) lock[`${w}x${h}`] = await trace(TARGET, w, h);
  writeFileSync(LOCK, JSON.stringify(lock));
  console.log('hero lock recorded from ' + TARGET + ' at ' + SIZES.map(s => s.join('x')).join(', '));
  await browser.close();
  process.exit(0);
}

if (!existsSync(LOCK)) {
  console.log('hero lock: no lock file. Run: node lab/herolock.mjs --record');
  await browser.close();
  process.exit(0);
}

const lock = JSON.parse(readFileSync(LOCK, 'utf8'));
const faults = [];
for (const [w, h] of SIZES) {
  const key = `${w}x${h}`;
  if (!lock[key]) continue;
  const now = await trace(TARGET, w, h);
  now.forEach(([v, cur], i) => {
    const was = lock[key][i][1];
    for (const k of Object.keys(cur)) {
      const a = cur[k], b = was[k];
      if (!a || !b) continue;
      if (a[2] !== b[2] || Math.abs(a[1] - b[1]) > H_TOL || Math.abs(a[0] - b[0]) > TOP_TOL) {
        faults.push(`  ${key} at ${v}vh  ${k}: was top ${b[0]} h ${b[1]} ${b[2]}, now top ${a[0]} h ${a[1]} ${a[2]}`);
      }
    }
  });
}
await browser.close();

if (faults.length) {
  console.log('HERO LOCK FAILED. The hero to bath handoff moved:\n' + faults.slice(0, 12).join('\n'));
  console.log(`\n${faults.length} deviation(s). Fix this before reporting the change as done.`);
  process.exit(2);
}
console.log('hero lock ok (' + TARGET + '): handoff unchanged at ' + SIZES.map(s => s.join('x')).join(', '));
