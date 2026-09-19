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
console.log('actTop', actTop);

const shot = async (label, y, wait = 500) => {
  await p.evaluate(v => scrollTo(0, v), Math.max(0, y));
  await p.waitForTimeout(wait);
  await p.screenshot({ path: `${out}/${label}.png` });
  const r = await p.evaluate(() => ({
    say: getComputedStyle(document.querySelector('.act--peak [data-fade]')).opacity,
    clip: getComputedStyle(document.querySelector('.act--peak [data-reveal]')).clipPath,
    night: getComputedStyle(document.querySelector('.dissolve__night')).opacity,
    scrollY: window.scrollY,
  }));
  console.log(label, r);
};

await shot('1-title-approach', actTop - 400, 300);
await shot('2-title-settled', actTop + 200, 900);
await shot('3-wipe-opening', actTop + 700, 400);
await shot('4-wipe-open', actTop + 1300, 600);
await shot('5-crossfade-start', actTop + 1900, 600);
await shot('6-mid-crossfade', actTop + 2900, 600);
await shot('7-full-night', actTop + 3700, 600);

await b.close();
