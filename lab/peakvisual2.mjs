import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';

const out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
await p.goto(pathToFileURL('v1.html').href);
await p.waitForFunction(() => document.documentElement.classList.contains('sc-ready'));

const headTop = await p.evaluate(() => document.querySelector('.act--peak .peak__head').offsetTop);

const shot = async (label, y, wait = 500) => {
  await p.evaluate(v => scrollTo(0, v), y);
  await p.waitForTimeout(wait);
  await p.screenshot({ path: `${out}/${label}.png` });
  const r = await p.evaluate(() => ({
    say: getComputedStyle(document.querySelector('.act--peak [data-fade]')).opacity,
    clip: getComputedStyle(document.querySelector('.act--peak [data-reveal]')).clipPath,
    night: getComputedStyle(document.querySelector('.dissolve__night')).opacity,
  }));
  console.log(label, r);
};

await shot('1-title-approach', headTop - 200, 300);
await shot('2-title-settled', headTop + 100, 900);
await shot('3-wipe-opening', headTop + 500, 300);
await shot('4-wipe-open-crossfade-start', headTop + 1400, 500);
await shot('5-mid-crossfade', headTop + 2600, 500);
await shot('6-full-night', headTop + 4200, 500);

await b.close();
