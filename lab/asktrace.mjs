/* Traces the question's visibility and colour from well before the
   section arrives through to well after it has passed. Checks: visible in
   grey on the plain ground before the wipe starts, a hard flip to white
   partway through the wipe (not a gradual fade), and hidden again once the
   act has fully scrolled past. */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';

const out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
await p.goto(pathToFileURL('v1.html').href);
await p.waitForFunction(() => document.documentElement.classList.contains('sc-ready'));

const actTop = await p.evaluate(() =>
  document.querySelector('.act--peak').getBoundingClientRect().top + scrollY);
const figTop = await p.evaluate(() =>
  document.querySelector('.act--peak [data-reveal]').getBoundingClientRect().top + scrollY);

const read = () => p.evaluate(() => {
  const el = document.querySelector('[data-peak-ask]');
  const cs = getComputedStyle(el);
  return { opacity: +cs.opacity, color: cs.color, position: cs.position };
});

console.log('position check (should be fixed):', (await read()).position);

console.log('\n=== approach, well before the wipe ===');
for (let dy = -1400; dy <= -700; dy += 200) {
  await p.evaluate(v => scrollTo(0, v), Math.max(0, figTop + dy));
  await p.waitForTimeout(150);
  const r = await read();
  console.log('figTop'+String(dy).padStart(6), 'opacity='+r.opacity.toFixed(2), ' color='+r.color);
}

console.log('\n=== through the wipe, looking for a hard flip ===');
let flip = null, prevColor = null;
for (let dy = -700; dy <= 0; dy += 30) {
  await p.evaluate(v => scrollTo(0, v), figTop + dy);
  await p.waitForTimeout(90);
  const r = await read();
  if (prevColor && prevColor !== r.color && !flip) flip = dy;
  prevColor = r.color;
  console.log('figTop'+String(dy).padStart(6), 'opacity='+r.opacity.toFixed(2), ' color='+r.color);
}
console.log(flip !== null ? `\nflip detected at figTop+${flip}` : '\nno flip detected');

console.log('\n=== after the act has fully passed ===');
const actBottom = await p.evaluate(() => {
  const r = document.querySelector('.act--peak').getBoundingClientRect();
  return r.bottom + scrollY;
});
for (let dy = 0; dy <= 900; dy += 300) {
  await p.evaluate(v => scrollTo(0, v), actBottom + dy);
  await p.waitForTimeout(200);
  const r = await read();
  console.log('actBottom+'+String(dy).padStart(4), 'opacity='+r.opacity.toFixed(2));
}

for (const [label, dy] of [['approach', figTop - 1000], ['mid-wipe', figTop - 400], ['flip-point', figTop - 300], ['settled', figTop + 50]]) {
  await p.evaluate(v => scrollTo(0, v), Math.max(0, dy));
  await p.waitForTimeout(300);
  await p.screenshot({ path: `${out}/${label}.png` });
}
await b.close();
