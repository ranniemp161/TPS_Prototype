/* Traces the rebuilt dissolve: the question during the wipe (opacity and
   colour), the slowed motion, the end-of-motion hold, and the button's
   vertical relationship to the words row. */
import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';

const out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
await p.goto(pathToFileURL('v1.html').href);
await p.waitForFunction(() => document.documentElement.classList.contains('sc-ready'));

const figTop = await p.evaluate(() =>
  document.querySelector('.act--peak [data-reveal]').getBoundingClientRect().top + scrollY);

const read = () => p.evaluate(() => {
  const askEl = document.querySelector('[data-peak-ask]');
  const c = getComputedStyle(askEl).color;
  return {
    clip: getComputedStyle(document.querySelector('.act--peak [data-reveal]')).clipPath.match(/[\d.]+/)?.[0] || '0',
    askOpacity: +getComputedStyle(askEl).opacity,
    askColor: c,
    night: +getComputedStyle(document.querySelector('.dissolve__night')).opacity,
    answerOpacity: +getComputedStyle(document.querySelector('[data-peak-answer]')).opacity,
    lit: [...document.querySelectorAll('[data-peak-states] span')].map(s => +(+getComputedStyle(s).opacity).toFixed(2)),
  };
});

console.log('=== during the wipe (before the pin engages) ===');
console.log(' dy    clip%  ask-op  ask-color');
for (let dy = -700; dy <= 0; dy += 100) {
  await p.evaluate(v => scrollTo(0, v), figTop + dy);
  await p.waitForTimeout(150);
  const r = await read();
  console.log(String(dy).padStart(5), r.clip.padStart(7), r.askOpacity.toFixed(2).padStart(7), '  ' + r.askColor);
}

console.log('\n=== through the pin, motion then hold ===');
console.log(' dy    night   answer   ask-color                lit-words');
const rows = [];
for (let dy = 0; dy <= 3400; dy += 100) {
  await p.evaluate(v => scrollTo(0, v), figTop + dy);
  await p.waitForTimeout(120);
  const r = await read();
  rows.push({ dy, ...r });
  console.log(
    String(dy).padStart(5), r.night.toFixed(2).padStart(7), r.answerOpacity.toFixed(2).padStart(8),
    ('  ' + r.askColor).padEnd(24), r.lit.join(' ')
  );
}

// Find where night first reaches ~1 (motion complete) vs where scroll ends.
const nightDone = rows.find(r => r.night >= 0.999);
const lastRow = rows[rows.length - 1];
console.log(`\nnight reaches full opacity at dy=${nightDone?.dy}`);
console.log(`trace ends at dy=${lastRow.dy}, night=${lastRow.night}, answer=${lastRow.answerOpacity}`);
console.log(nightDone && lastRow.dy > nightDone.dy + 200
  ? 'PASS there is a real hold after night completes'
  : 'CHECK hold distance');

// Button vs words vertical position.
const geo = await p.evaluate(() => {
  const words = document.querySelector('[data-peak-states]').getBoundingClientRect();
  const btn = document.querySelector('.act--peak .peak__answer .btn').getBoundingClientRect();
  return { wordsBottom: Math.round(words.bottom), btnTop: Math.round(btn.top), gap: Math.round(btn.top - words.bottom) };
});
await p.evaluate(v => scrollTo(0, v), figTop + 3400);
await p.waitForTimeout(400);
console.log('\nwords vs button (at rest):', JSON.stringify(geo), geo.gap > 0 ? '  button is below words' : '  OVERLAP OR ABOVE');

await p.screenshot({ path: `${out}/final.png` });
await b.close();
