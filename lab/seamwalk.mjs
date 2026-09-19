/* Walks the seam between the title, the wipe-open, and the pin engaging, in
   small steps, so a rough transition can actually be located rather than
   guessed at from two or three screenshots. */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';

const out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
await p.goto(pathToFileURL('v1.html').href);
await p.waitForFunction(() => document.documentElement.classList.contains('sc-ready'));

const actTop = await p.evaluate(() =>
  document.querySelector('.act--peak').getBoundingClientRect().top + scrollY
);

const read = () => p.evaluate(() => {
  const stage = document.querySelector('.act--peak [data-stage]');
  const frame = document.querySelector('.act--peak [data-reveal]');
  const st = getComputedStyle(stage);
  return {
    scrollY: window.scrollY,
    stagePos: st.position,
    stageTop: st.top,
    clip: getComputedStyle(frame).clipPath,
    night: +getComputedStyle(document.querySelector('.dissolve__night')).opacity,
  };
});

console.log('scrollY relative to act top, every 60px from -600 to +1800:\n');
console.log('dy      scrollY   stagePos   stageTop   clip                night');
for (let dy = -600; dy <= 1800; dy += 60) {
  await p.evaluate(v => scrollTo(0, v), Math.max(0, actTop + dy));
  await p.waitForTimeout(90);
  const r = await read();
  console.log(
    String(dy).padStart(6), r.scrollY.toString().padStart(9),
    r.stagePos.padEnd(10), r.stageTop.padEnd(10),
    r.clip.slice(0, 22).padEnd(24), r.night.toFixed(2)
  );
}

// Screenshot every 200px through the same range for a visual walk.
for (let dy = -600; dy <= 1800; dy += 200) {
  await p.evaluate(v => scrollTo(0, v), Math.max(0, actTop + dy));
  await p.waitForTimeout(150);
  await p.screenshot({ path: `${out}/seam-${(dy + 600).toString().padStart(4, '0')}.png` });
}

await b.close();
