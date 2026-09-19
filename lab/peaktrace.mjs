/* Traces the dissolve act's entrance in small steps: the title fading, the
   figure un-clipping, and the crossfade taking over. Watches for the two
   faults the earlier attempts had, a positional jump when the pin engages
   and a gap or overlap between the wipe ending and the night starting. */
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
  const fig = document.querySelector('.act--peak [data-reveal]');
  const hold = document.querySelector('.act--peak [data-stage]');
  const r = fig.getBoundingClientRect();
  const clip = getComputedStyle(fig).clipPath;
  const m = clip.match(/([\d.]+)%/);
  return {
    y: window.scrollY,
    figTop: Math.round(r.top),
    figH: Math.round(r.height),
    holdPos: getComputedStyle(hold).position,
    clipPct: m ? +m[1] : 0,
    say: +getComputedStyle(document.querySelector('.act--peak [data-fade]')).opacity,
    night: +getComputedStyle(document.querySelector('.dissolve__night')).opacity,
  };
});

console.log('  dy      y  figTop  figH  holdPos    clip%   say  night');
let prevTop = null, jumps = [];
for (let dy = -1000; dy <= 1200; dy += 50) {
  await p.evaluate(v => scrollTo(0, v), Math.max(0, actTop + dy));
  await p.waitForTimeout(120);
  const r = await read();
  if (prevTop !== null && r.holdPos !== 'static') {
    const moved = Math.abs(r.figTop - prevTop);
    if (moved > 60) jumps.push({ dy, from: prevTop, to: r.figTop });
  }
  prevTop = r.figTop;
  console.log(
    String(dy).padStart(5), String(r.y).padStart(7), String(r.figTop).padStart(7),
    String(r.figH).padStart(5), ' ' + r.holdPos.padEnd(9),
    r.clipPct.toFixed(1).padStart(6), r.say.toFixed(2).padStart(6), r.night.toFixed(2).padStart(6)
  );
}

console.log(jumps.length ? '\nJUMPS: ' + JSON.stringify(jumps) : '\nno positional jumps while pinned');

for (const dy of [-700, -300, -100, 0, 200, 600, 1100]) {
  await p.evaluate(v => scrollTo(0, v), Math.max(0, actTop + dy));
  await p.waitForTimeout(250);
  await p.screenshot({ path: `${out}/t${dy < 0 ? 'm' : 'p'}${Math.abs(dy)}.png` });
}
await b.close();
